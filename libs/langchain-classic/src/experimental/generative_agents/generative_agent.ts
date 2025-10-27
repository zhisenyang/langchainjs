import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChainValues } from "@langchain/core/utils/types";
import {
  CallbackManagerForChainRun,
  Callbacks,
} from "@langchain/core/callbacks/manager";
import { LLMChain } from "../../chains/llm_chain.js";
import { GenerativeAgentMemory } from "./generative_agent_memory.js";
import { BaseChain } from "../../chains/base.js";

/**
 * GenerativeAgent 类的配置。定义角色的
 * 姓名、可选年龄、永久特征、状态、详细程度和摘要
 * 刷新秒数。
 */
export type GenerativeAgentConfig = {
  name: string;
  age?: number;
  traits: string;
  status: string;
  verbose?: boolean;
  summaryRefreshSeconds?: number;
  // dailySummaries?: string[];
};

/**
 * 生成式智能体的实现，能够随着时间学习并形成新的记忆。
 * 它继承了 BaseChain 类，这是一个通用的
 * 组件调用序列，包括其他链。
 * @example
 * ```typescript
 * const tommie: GenerativeAgent = new GenerativeAgent(
 *   new OpenAI({ temperature: 0.9, maxTokens: 1500 }),
 *   new GenerativeAgentMemory(
 *     new ChatOpenAI({ model: "gpt-4o-mini" }),
 *     new TimeWeightedVectorStoreRetriever({
 *       vectorStore: new MemoryVectorStore(new OpenAIEmbeddings()),
 *       otherScoreKeys: ["importance"],
 *       k: 15,
 *     }),
 *     { reflectionThreshold: 8 },
 *   ),
 *   {
 *     name: "Tommie",
 *     age: 25,
 *     traits: "anxious, likes design, talkative",
 *     status: "looking for a job",
 *   },
 * );
 *
 * await tommie.addMemory(
 *   "Tommie remembers his dog, Bruno, from when he was a kid",
 *   new Date(),
 * );
 * const summary = await tommie.getSummary({ forceRefresh: true });
 * const response = await tommie.generateDialogueResponse(
 *   "USER says Hello Tommie, how are you today?",
 * );
 * ```
 */
export class GenerativeAgent extends BaseChain {
  static lc_name() {
    return "GenerativeAgent";
  }

  // 具有记忆和天生特征的角色
  name: string; // 角色的姓名

  age?: number; // 角色的可选年龄

  traits: string; // 赋予角色的永久特征

  status: string; // 您希望不改变的角色特征

  longTermMemory: GenerativeAgentMemory;

  llm: BaseLanguageModelInterface; // 底层语言模型

  verbose: boolean; // false

  private summary: string; // 通过反思角色记忆生成的有状态自我摘要。

  private summaryRefreshSeconds = 3600;

  private lastRefreshed: Date; // 角色摘要最后一次重新生成的时间

  // TODO: 添加对每日摘要的支持
  // private dailySummaries: string[] = []; // 智能体执行计划中事件的摘要。

  _chainType(): string {
    return "generative_agent_executor";
  }

  get inputKeys(): string[] {
    return ["observation", "suffix", "now"];
  }

  get outputKeys(): string[] {
    return ["output", "continue_dialogue"];
  }

  constructor(
    llm: BaseLanguageModelInterface,
    longTermMemory: GenerativeAgentMemory,
    config: GenerativeAgentConfig
  ) {
    super();
    this.llm = llm;
    this.longTermMemory = longTermMemory;
    this.name = config.name;
    this.age = config.age;
    this.traits = config.traits;
    this.status = config.status;
    this.verbose = config.verbose ?? this.verbose;
    this.summary = "";
    this.summaryRefreshSeconds =
      config.summaryRefreshSeconds ?? this.summaryRefreshSeconds;
    this.lastRefreshed = new Date();
    // this.dailySummaries = config.dailySummaries ?? this.dailySummaries;
  }

  // LLM 方法
  /**
   * 将换行符分隔的字符串解析为字符串列表。
   * @param text 要解析的字符串。
   * @returns 从输入文本解析出的字符串数组。
   */
  parseList(text: string): string[] {
    // 将换行符分隔的字符串解析为字符串列表
    const lines: string[] = text.trim().split("\n");
    const result: string[] = lines.map((line: string) =>
      line.replace(/^\s*\d+\.\s*/, "").trim()
    );
    return result;
  }

  /**
   * 使用给定的提示和智能体的语言模型、详细程度、输出键和记忆
   * 创建一个新的 LLMChain。
   * @param prompt 用于 LLMChain 的提示。
   * @returns 新的 LLMChain 实例。
   */
  chain(prompt: PromptTemplate): LLMChain {
    const chain = new LLMChain({
      llm: this.llm,
      prompt,
      verbose: this.verbose,
      outputKey: "output", // 新增
      memory: this.longTermMemory,
    });
    return chain;
  }

  /**
   * 从给定的观察中提取观察到的实体。
   * @param observation 要从中提取实体的观察。
   * @param runManager 可选的 CallbackManagerForChainRun 实例。
   * @returns 提取的实体字符串。
   */
  async getEntityFromObservations(
    observation: string,
    runManager?: CallbackManagerForChainRun
  ): Promise<string> {
    const prompt = PromptTemplate.fromTemplate(
      "What is the observed entity in the following observation? {observation}" +
        "\nEntity="
    );

    const result = await this.chain(prompt).call(
      {
        observation,
      },
      runManager?.getChild("entity_extractor")
    );

    return result.output;
  }

  /**
   * 从给定的观察中提取给定实体的动作。
   * @param observation 要从中提取动作的观察。
   * @param entityName 要提取动作的实体名称。
   * @param runManager 可选的 CallbackManagerForChainRun 实例。
   * @returns 提取的动作字符串。
   */
  async getEntityAction(
    observation: string,
    entityName: string,
    runManager?: CallbackManagerForChainRun
  ): Promise<string> {
    const prompt = PromptTemplate.fromTemplate(
      "What is the {entity} doing in the following observation? {observation}" +
        "\nThe {entity} is"
    );

    const result = await this.chain(prompt).call(
      {
        entity: entityName,
        observation,
      },
      runManager?.getChild("entity_action_extractor")
    );
    const trimmedResult = result.output.trim();
    return trimmedResult;
  }

  /**
   * 总结与观察最相关的记忆。
   * @param observation 要为其总结相关记忆的观察。
   * @param runManager 可选的 CallbackManagerForChainRun 实例。
   * @returns 总结的记忆字符串。
   */
  async summarizeRelatedMemories(
    observation: string,
    runManager?: CallbackManagerForChainRun
  ): Promise<string> {
    // 总结与观察最相关的记忆
    const prompt = PromptTemplate.fromTemplate(
      `
{q1}?
Context from memory:
{relevant_memories}
Relevant context:`
    );
    const entityName = await this.getEntityFromObservations(
      observation,
      runManager
    );
    const entityAction = await this.getEntityAction(
      observation,
      entityName,
      runManager
    );
    const q1 = `What is the relationship between ${this.name} and ${entityName}`;
    const q2 = `${entityName} is ${entityAction}`;
    const response = await this.chain(prompt).call(
      {
        q1,
        queries: [q1, q2],
      },
      runManager?.getChild("entity_relationships")
    );

    return response.output.trim(); // 添加了输出
  }

  async _call(
    values: ChainValues,
    runManager?: CallbackManagerForChainRun
  ): Promise<ChainValues> {
    const { observation, suffix, now } = values;
    // 对给定的观察或对话行为做出反应
    const prompt = PromptTemplate.fromTemplate(
      `{agent_summary_description}` +
        `\nIt is {current_time}.` +
        `\n{agent_name}'s status: {agent_status}` +
        `\nSummary of relevant context from {agent_name}'s memory:` +
        "\n{relevant_memories}" +
        `\nMost recent observations: {most_recent_memories}` +
        `\nObservation: {observation}` +
        `\n\n${suffix}`
    );

    const agentSummaryDescription = await this.getSummary({}, runManager); // now = 参数中的 now
    const relevantMemoriesStr = await this.summarizeRelatedMemories(
      observation,
      runManager
    );
    const currentTime = (now || new Date()).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    const chainInputs: ChainValues = {
      agent_summary_description: agentSummaryDescription,
      current_time: currentTime,
      agent_name: this.name,
      observation,
      agent_status: this.status,
      most_recent_memories: "",
    };

    chainInputs[this.longTermMemory.getRelevantMemoriesKey()] =
      relevantMemoriesStr;

    const consumedTokens = await this.llm.getNumTokens(
      await prompt.format({ ...chainInputs })
    );

    chainInputs[this.longTermMemory.getMostRecentMemoriesTokenKey()] =
      consumedTokens;
    const response = await this.chain(prompt).call(
      chainInputs,
      runManager?.getChild("reaction_from_summary")
    );

    const rawOutput = response.output;
    let output = rawOutput;
    let continue_dialogue = false;

    if (rawOutput.includes("REACT:")) {
      const reaction = this._cleanResponse(rawOutput.split("REACT:").pop());
      await this.addMemory(
        `${this.name} observed ${observation} and reacted by ${reaction}`,
        now,
        {},
        runManager?.getChild("memory")
      );
      output = `${reaction}`;
      continue_dialogue = false;
    } else if (rawOutput.includes("SAY:")) {
      const saidValue = this._cleanResponse(rawOutput.split("SAY:").pop());
      await this.addMemory(
        `${this.name} observed ${observation} and said ${saidValue}`,
        now,
        {},
        runManager?.getChild("memory")
      );
      output = `${this.name} said ${saidValue}`;
      continue_dialogue = true;
    } else if (rawOutput.includes("GOODBYE:")) {
      const farewell = this._cleanResponse(
        rawOutput.split("GOODBYE:").pop() ?? ""
      );
      await this.addMemory(
        `${this.name} observed ${observation} and said ${farewell}`,
        now,
        {},
        runManager?.getChild("memory")
      );
      output = `${this.name} said ${farewell}`;
      continue_dialogue = false;
    }

    return { output, continue_dialogue };
  }

  private _cleanResponse(text: string | undefined): string {
    if (text === undefined) {
      return "";
    }
    const regex = new RegExp(`^${this.name} `);
    return text.replace(regex, "").trim();
  }

  /**
   * 对给定的观察生成反应。
   * @param observation 要为其生成反应的观察。
   * @param now 可选的当前日期。
   * @returns 指示是否继续对话的布尔值和输出字符串。
   */
  async generateReaction(
    observation: string,
    now?: Date
  ): Promise<[boolean, string]> {
    const callToActionTemplate: string =
      `Should {agent_name} react to the observation, and if so,` +
      ` what would be an appropriate reaction? Respond in one line.` +
      ` If the action is to engage in dialogue, write:\nSAY: "what to say"` +
      ` \notherwise, write:\nREACT: {agent_name}'s reaction (if anything).` +
      ` \nEither do nothing, react, or say something but not both.\n\n`;

    const { output, continue_dialogue } = await this.call({
      observation,
      suffix: callToActionTemplate,
      now,
    });
    return [continue_dialogue, output];
  }

  /**
   * 对给定的观察生成对话响应。
   * @param observation 要为其生成对话响应的观察。
   * @param now 可选的当前日期。
   * @returns 指示是否继续对话的布尔值和输出字符串。
   */
  async generateDialogueResponse(
    observation: string,
    now?: Date
  ): Promise<[boolean, string]> {
    const callToActionTemplate = `What would ${this.name} say? To end the conversation, write: GOODBYE: "what to say". Otherwise to continue the conversation, write: SAY: "what to say next"\n\n`;
    const { output, continue_dialogue } = await this.call({
      observation,
      suffix: callToActionTemplate,
      now,
    });
    return [continue_dialogue, output];
  }

  // 智能体有状态的摘要方法
  // 每个对话或响应提示都包含一个标题
  // 总结智能体的自我描述。这通过
  // 定期探测其记忆来更新
  /**
   * 获取智能体的摘要，包括智能体的姓名、年龄、特征
   * 和智能体核心特征的摘要。摘要通过
   * 定期探测智能体的记忆来更新。
   * @param config 可选的配置对象，包含当前日期和强制刷新的布尔值。
   * @param runManager 可选的 CallbackManagerForChainRun 实例。
   * @returns 智能体的摘要字符串。
   */
  async getSummary(
    config?: {
      now?: Date;
      forceRefresh?: boolean;
    },
    runManager?: CallbackManagerForChainRun
  ): Promise<string> {
    const { now = new Date(), forceRefresh = false } = config ?? {};

    const sinceRefresh = Math.floor(
      (now.getTime() - this.lastRefreshed.getTime()) / 1000
    );

    if (
      !this.summary ||
      sinceRefresh >= this.summaryRefreshSeconds ||
      forceRefresh
    ) {
      this.summary = await this.computeAgentSummary(runManager);
      this.lastRefreshed = now;
    }

    let age;
    if (this.age) {
      age = this.age;
    } else {
      age = "N/A";
    }

    return `Name: ${this.name} (age: ${age})
Innate traits: ${this.traits}
${this.summary}`;
  }

  /**
   * 通过总结智能体的核心特征来计算智能体的摘要，
   * 基于智能体的相关记忆。
   * @param runManager 可选的 CallbackManagerForChainRun 实例。
   * @returns 计算出的摘要字符串。
   */
  async computeAgentSummary(
    runManager?: CallbackManagerForChainRun
  ): Promise<string> {
    const prompt = PromptTemplate.fromTemplate(
      "How would you summarize {name}'s core characteristics given the following statements:\n" +
        "----------" +
        "{relevant_memories}" +
        "----------" +
        "Do not embellish." +
        "\n\nSummary: "
    );
    // 智能体试图思考其核心特征
    const result = await this.chain(prompt).call(
      {
        name: this.name,
        queries: [`${this.name}'s core characteristics`],
      },
      runManager?.getChild("compute_agent_summary")
    );
    return result.output.trim();
  }

  /**
   * 返回智能体状态、摘要和当前时间的完整标题。
   * @param config 可选的配置对象，包含当前日期和强制刷新的布尔值。
   * @returns 完整标题字符串。
   */
  getFullHeader(
    config: {
      now?: Date;
      forceRefresh?: boolean;
    } = {}
  ): string {
    const { now = new Date(), forceRefresh = false } = config;
    // 返回智能体状态、摘要和当前时间的完整标题。
    const summary = this.getSummary({ now, forceRefresh });
    const currentTimeString = now.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    return `${summary}\nIt is ${currentTimeString}.\n${this.name}'s status: ${this.status}`;
  }

  /**
   * 向智能体的长期记忆中添加记忆。
   * @param memoryContent 要添加的记忆内容。
   * @param now 可选的当前日期。
   * @param metadata 记忆的可选元数据。
   * @param callbacks 可选的 Callbacks 实例。
   * @returns 向智能体长期记忆添加记忆的结果。
   */
  async addMemory(
    memoryContent: string,
    now?: Date,
    metadata?: Record<string, unknown>,
    callbacks?: Callbacks
  ) {
    return this.longTermMemory.addMemory(
      memoryContent,
      now,
      metadata,
      callbacks
    );
  }
}
