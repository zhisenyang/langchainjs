import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import { PromptTemplate } from "@langchain/core/prompts";
import { Document } from "@langchain/core/documents";
import { ChainValues } from "@langchain/core/utils/types";
import { BaseMemory, InputValues, OutputValues } from "@langchain/core/memory";
import {
  CallbackManagerForChainRun,
  Callbacks,
} from "@langchain/core/callbacks/manager";
import { TimeWeightedVectorStoreRetriever } from "../../retrievers/time_weighted.js";
import { BaseChain } from "../../chains/base.js";
import { LLMChain } from "../../chains/llm_chain.js";

export type GenerativeAgentMemoryConfig = {
  reflectionThreshold?: number;
  importanceWeight?: number;
  verbose?: boolean;
  maxTokensLimit?: number;
};

/**
 * 管理 LangChain 中生成式智能体记忆的类。它
 * 继承自 `BaseChain` 类，具有向智能体记忆中添加观察
 * 或记忆、评估记忆重要性、反思最近事件以添加合成记忆，
 * 以及基于相关记忆生成反思主题洞察的方法。
 */
class GenerativeAgentMemoryChain extends BaseChain {
  static lc_name() {
    return "GenerativeAgentMemoryChain";
  }

  reflecting = false;

  reflectionThreshold?: number;

  importanceWeight = 0.15;

  memoryRetriever: TimeWeightedVectorStoreRetriever;

  llm: BaseLanguageModelInterface;

  verbose = false;

  private aggregateImportance = 0.0;

  constructor(
    llm: BaseLanguageModelInterface,
    memoryRetriever: TimeWeightedVectorStoreRetriever,
    config: Omit<GenerativeAgentMemoryConfig, "maxTokensLimit">
  ) {
    super();
    this.llm = llm;
    this.memoryRetriever = memoryRetriever;
    this.reflectionThreshold = config.reflectionThreshold;
    this.importanceWeight = config.importanceWeight ?? this.importanceWeight;
    this.verbose = config.verbose ?? this.verbose;
  }

  _chainType(): string {
    return "generative_agent_memory";
  }

  get inputKeys(): string[] {
    return ["memory_content", "now", "memory_metadata"];
  }

  get outputKeys(): string[] {
    return ["output"];
  }

  /**
   * 使用给定提示创建新 LLMChain 的方法。
   * @param prompt 用于新 LLMChain 的 PromptTemplate。
   * @returns 新的 LLMChain 实例。
   */
  chain(prompt: PromptTemplate): LLMChain {
    const chain = new LLMChain({
      llm: this.llm,
      prompt,
      verbose: this.verbose,
      outputKey: "output",
    });
    return chain;
  }

  async _call(values: ChainValues, runManager?: CallbackManagerForChainRun) {
    const { memory_content: memoryContent, now } = values;
    // 向智能体的记忆中添加观察或记忆
    const importanceScore = await this.scoreMemoryImportance(
      memoryContent,
      runManager
    );
    this.aggregateImportance += importanceScore;
    const document = new Document({
      pageContent: memoryContent,
      metadata: {
        importance: importanceScore,
        ...values.memory_metadata,
      },
    });
    await this.memoryRetriever.addDocuments([document]);
    // 当智能体处理了一定数量的记忆后（通过累积重要性衡量），
    // 是时候暂停并反思最近的事件，以向智能体的
    // 记忆流中添加更多合成记忆。
    if (
      this.reflectionThreshold !== undefined &&
      this.aggregateImportance > this.reflectionThreshold &&
      !this.reflecting
    ) {
      console.log("Reflecting on current memories...");
      this.reflecting = true;
      await this.pauseToReflect(now, runManager);
      this.aggregateImportance = 0.0;
      this.reflecting = false;
    }
    return { output: importanceScore };
  }

  /**
   * 暂停智能体以反思最近事件并生成
   * 新洞察的方法。
   * @param now 当前日期。
   * @param runManager 用于反思的 CallbackManagerForChainRun。
   * @returns 作为字符串的新洞察数组。
   */
  async pauseToReflect(
    now?: Date,
    runManager?: CallbackManagerForChainRun
  ): Promise<string[]> {
    if (this.verbose) {
      console.log("Pausing to reflect...");
    }
    const newInsights: string[] = [];
    const topics = await this.getTopicsOfReflection(50, runManager);
    for (const topic of topics) {
      const insights = await this.getInsightsOnTopic(topic, now, runManager);
      for (const insight of insights) {
        // 添加记忆
        await this.call(
          {
            memory_content: insight,
            now,
            memory_metadata: {
              source: "reflection_insight",
            },
          },
          runManager?.getChild("reflection_insight_memory")
        );
      }
      newInsights.push(...insights);
    }
    return newInsights;
  }

  /**
   * 评估给定记忆重要性的方法。
   * @param memoryContent 要评分的记忆内容。
   * @param runManager 用于评分的 CallbackManagerForChainRun。
   * @returns 记忆的重要性分数（数字）。
   */
  async scoreMemoryImportance(
    memoryContent: string,
    runManager?: CallbackManagerForChainRun
  ): Promise<number> {
    // 评估给定记忆的绝对重要性
    const prompt = PromptTemplate.fromTemplate(
      "On the scale of 1 to 10, where 1 is purely mundane" +
        " (e.g., brushing teeth, making bed) and 10 is" +
        " extremely poignant (e.g., a break up, college" +
        " acceptance), rate the likely poignancy of the" +
        " following piece of memory. Respond with a single integer." +
        "\nMemory: {memory_content}" +
        "\nRating: "
    );
    const score = await this.chain(prompt).run(
      memoryContent,
      runManager?.getChild("determine_importance")
    );

    const strippedScore = score.trim();

    if (this.verbose) {
      console.log("Importance score:", strippedScore);
    }
    const match = strippedScore.match(/^\D*(\d+)/);
    if (match) {
      const capturedNumber = parseFloat(match[1]);
      const result = (capturedNumber / 10) * this.importanceWeight;
      return result;
    } else {
      return 0.0;
    }
  }

  /**
   * 基于最后 K 个记忆检索反思主题的方法。
   * @param lastK 用于生成主题的最近记忆数量。
   * @param runManager 用于检索主题的 CallbackManagerForChainRun。
   * @returns 作为字符串的反思主题数组。
   */
  /**
   * 获取反思主题的方法。
   * @param lastK 要考虑的最近记忆数量。
   * @param runManager 用于获取反思主题的 CallbackManagerForChainRun。
   * @returns 反思主题字符串数组。
   */
  async getTopicsOfReflection(
    lastK: number,
    runManager?: CallbackManagerForChainRun
  ): Promise<string[]> {
    const prompt = PromptTemplate.fromTemplate(
      "{observations}\n\n" +
        "Given only the information above, what are the 3 most salient" +
        " high-level questions we can answer about the subjects in" +
        " the statements? Provide each question on a new line.\n\n"
    );

    const observations = this.memoryRetriever.getMemoryStream().slice(-lastK);
    const observationStr = observations
      .map((o: { pageContent: string }) => o.pageContent)
      .join("\n");
    const result = await this.chain(prompt).run(
      observationStr,
      runManager?.getChild("reflection_topics")
    );
    return GenerativeAgentMemoryChain.parseList(result);
  }

  /**
   * 基于相关记忆生成给定反思主题洞察的方法。
   * @param topic 反思主题。
   * @param now 当前日期。
   * @param runManager 用于生成洞察的 CallbackManagerForChainRun。
   * @returns 作为字符串的洞察数组。
   */
  async getInsightsOnTopic(
    topic: string,
    now?: Date,
    runManager?: CallbackManagerForChainRun
  ): Promise<string[]> {
    // 基于相关记忆生成反思主题的洞察
    const prompt = PromptTemplate.fromTemplate(
      "Statements about {topic}\n" +
        "{related_statements}\n\n" +
        "What 5 high-level insights can you infer from the above statements?" +
        " (example format: insight (because of 1, 5, 3))"
    );

    const relatedMemories = await this.fetchMemories(topic, now, runManager);
    const relatedStatements: string = relatedMemories
      .map((memory, index) => `${index + 1}. ${memory.pageContent}`)
      .join("\n");
    const result = await this.chain(prompt).call(
      {
        topic,
        related_statements: relatedStatements,
      },
      runManager?.getChild("reflection_insights")
    );
    return GenerativeAgentMemoryChain.parseList(result.output); // 添加了 output
  }

  /**
   * 将换行符分隔的字符串解析为字符串列表的方法。
   * @param text 要解析的换行符分隔字符串。
   * @returns 字符串数组。
   */
  static parseList(text: string): string[] {
    // 将换行符分隔的字符串解析为字符串列表
    return text.split("\n").map((s) => s.trim());
  }

  // TODO: 模拟 "now" 以模拟不同时间
  /**
   * 获取与给定观察相关的记忆的方法。
   * @param observation 要获取记忆的观察。
   * @param _now 当前日期。
   * @param runManager 用于获取记忆的 CallbackManagerForChainRun。
   * @returns 表示获取的记忆的 Document 实例数组。
   */
  async fetchMemories(
    observation: string,
    _now?: Date,
    runManager?: CallbackManagerForChainRun
  ): Promise<Document[]> {
    return this.memoryRetriever.getRelevantDocuments(
      observation,
      runManager?.getChild("memory_retriever")
    );
  }
}

/**
 * 管理 LangChain 中生成式智能体记忆的类。它
 * 继承自 `BaseMemory` 类，具有添加记忆、
 * 格式化记忆、获取记忆直到达到令牌限制、
 * 加载记忆变量、将模型运行的上下文保存到记忆中
 * 以及清除记忆内容的方法。
 * @example
 * ```typescript
 * const createNewMemoryRetriever = async () => {
 *   const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());
 *   const retriever = new TimeWeightedVectorStoreRetriever({
 *     vectorStore,
 *     otherScoreKeys: ["importance"],
 *     k: 15,
 *   });
 *   return retriever;
 * };
 * const tommiesMemory = new GenerativeAgentMemory(
 *   llm,
 *   await createNewMemoryRetriever(),
 *   { reflectionThreshold: 8 },
 * );
 * const summary = await tommiesMemory.getSummary();
 * ```
 */
export class GenerativeAgentMemory extends BaseMemory {
  llm: BaseLanguageModelInterface;

  memoryRetriever: TimeWeightedVectorStoreRetriever;

  verbose: boolean;

  reflectionThreshold?: number;

  private maxTokensLimit = 1200;

  queriesKey = "queries";

  mostRecentMemoriesTokenKey = "recent_memories_token";

  addMemoryKey = "addMemory";

  relevantMemoriesKey = "relevant_memories";

  relevantMemoriesSimpleKey = "relevant_memories_simple";

  mostRecentMemoriesKey = "most_recent_memories";

  nowKey = "now";

  memoryChain: GenerativeAgentMemoryChain;

  constructor(
    llm: BaseLanguageModelInterface,
    memoryRetriever: TimeWeightedVectorStoreRetriever,
    config?: GenerativeAgentMemoryConfig
  ) {
    super();
    this.llm = llm;
    this.memoryRetriever = memoryRetriever;
    this.verbose = config?.verbose ?? this.verbose;
    this.reflectionThreshold =
      config?.reflectionThreshold ?? this.reflectionThreshold;
    this.maxTokensLimit = config?.maxTokensLimit ?? this.maxTokensLimit;
    this.memoryChain = new GenerativeAgentMemoryChain(llm, memoryRetriever, {
      reflectionThreshold: config?.reflectionThreshold,
      importanceWeight: config?.importanceWeight,
    });
  }

  /**
   * 返回相关记忆键的方法。
   * @returns 作为字符串的相关记忆键。
   */
  getRelevantMemoriesKey(): string {
    return this.relevantMemoriesKey;
  }

  /**
   * 返回最近记忆令牌键的方法。
   * @returns 作为字符串的最近记忆令牌键。
   */
  getMostRecentMemoriesTokenKey(): string {
    return this.mostRecentMemoriesTokenKey;
  }

  /**
   * 返回添加记忆键的方法。
   * @returns 作为字符串的添加记忆键。
   */
  getAddMemoryKey(): string {
    return this.addMemoryKey;
  }

  /**
   * 返回当前时间键的方法。
   * @returns 作为字符串的当前时间键。
   */
  getCurrentTimeKey(): string {
    return this.nowKey;
  }

  get memoryKeys(): string[] {
    // 返回记忆键数组
    return [this.relevantMemoriesKey, this.mostRecentMemoriesKey];
  }

  /**
   * 向智能体记忆中添加记忆的方法。
   * @param memoryContent 要添加的记忆内容。
   * @param now 当前日期。
   * @param metadata 记忆的元数据。
   * @param callbacks 用于添加记忆的回调。
   * @returns 记忆添加的结果。
   */
  async addMemory(
    memoryContent: string,
    now?: Date,
    metadata?: Record<string, unknown>,
    callbacks?: Callbacks
  ) {
    return this.memoryChain.call(
      { memory_content: memoryContent, now, memory_metadata: metadata },
      callbacks
    );
  }

  /**
   * 详细格式化给定相关记忆的方法。
   * @param relevantMemories 要格式化的相关记忆。
   * @returns 作为字符串的格式化记忆。
   */
  formatMemoriesDetail(relevantMemories: Document[]): string {
    if (!relevantMemories.length) {
      return "No relevant information.";
    }
    const contentStrings = new Set();
    const content = [];
    for (const memory of relevantMemories) {
      if (memory.pageContent in contentStrings) {
        continue;
      }
      contentStrings.add(memory.pageContent);
      const createdTime = memory.metadata.created_at.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
      content.push(`${createdTime}: ${memory.pageContent.trim()}`);
    }
    const joinedContent = content.map((mem) => `${mem}`).join("\n");
    return joinedContent;
  }

  /**
   * 以简单方式格式化给定相关记忆的方法。
   * @param relevantMemories 要格式化的相关记忆。
   * @returns 作为字符串的格式化记忆。
   */
  formatMemoriesSimple(relevantMemories: Document[]): string {
    const joinedContent = relevantMemories
      .map((mem) => `${mem.pageContent}`)
      .join("; ");
    return joinedContent;
  }

  /**
   * 检索记忆直到达到令牌限制的方法。
   * @param consumedTokens 到目前为止消耗的令牌数量。
   * @returns 作为字符串的记忆。
   */
  async getMemoriesUntilLimit(consumedTokens: number): Promise<string> {
    // 减少文档中的令牌数量
    const result = [];
    for (const doc of this.memoryRetriever
      .getMemoryStream()
      .slice()
      .reverse()) {
      if (consumedTokens >= this.maxTokensLimit) {
        if (this.verbose) {
          console.log("Exceeding max tokens for LLM, filtering memories");
        }
        break;
      }
      // eslint-disable-next-line no-param-reassign
      consumedTokens += await this.llm.getNumTokens(doc.pageContent);
      if (consumedTokens < this.maxTokensLimit) {
        result.push(doc);
      }
    }
    return this.formatMemoriesSimple(result);
  }

  get memoryVariables(): string[] {
    // 此记忆类将动态加载的输入键
    return [];
  }

  /**
   * 基于给定输入加载记忆变量的方法。
   * @param inputs 用于加载记忆变量的输入。
   * @returns 包含已加载记忆变量的对象。
   */
  async loadMemoryVariables(
    inputs: InputValues
  ): Promise<Record<string, string>> {
    const queries = inputs[this.queriesKey];
    const now = inputs[this.nowKey];
    if (queries !== undefined) {
      const relevantMemories = (
        await Promise.all(
          queries.map((query: string) =>
            this.memoryChain.fetchMemories(query, now)
          )
        )
      ).flat();
      return {
        [this.relevantMemoriesKey]: this.formatMemoriesDetail(relevantMemories),
        [this.relevantMemoriesSimpleKey]:
          this.formatMemoriesSimple(relevantMemories),
      };
    }
    const mostRecentMemoriesToken = inputs[this.mostRecentMemoriesTokenKey];
    if (mostRecentMemoriesToken !== undefined) {
      return {
        [this.mostRecentMemoriesKey]: await this.getMemoriesUntilLimit(
          mostRecentMemoriesToken
        ),
      };
    }
    return {};
  }

  /**
   * 将模型运行的上下文保存到记忆中的方法。
   * @param _inputs 模型运行的输入。
   * @param outputs 模型运行的输出。
   * @returns 无返回值。
   */
  async saveContext(
    _inputs: InputValues,
    outputs: OutputValues
  ): Promise<void> {
    // 将此模型运行的上下文保存到记忆中
    const mem = outputs[this.addMemoryKey];
    const now = outputs[this.nowKey];
    if (mem) {
      await this.addMemory(mem, now, {});
    }
  }

  /**
   * 清除记忆内容的方法。
   * @returns 无返回值。
   */
  clear(): void {
    // TODO: 清除记忆内容
  }
}
