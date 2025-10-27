import { BaseRetriever, BaseRetrieverInput } from "@langchain/core/retrievers";
import type { VectorStoreInterface } from "@langchain/core/vectorstores";
import type { DocumentInterface } from "@langchain/core/documents";
import { CallbackManagerForRetrieverRun } from "@langchain/core/callbacks/manager";

/**
 * 初始化 TimeWeightedVectorStoreRetriever 实例所需字段的接口。
 */
export interface TimeWeightedVectorStoreRetrieverFields
  extends BaseRetrieverInput {
  vectorStore: VectorStoreInterface;
  searchKwargs?: number;
  memoryStream?: DocumentInterface[];
  decayRate?: number;
  k?: number;
  otherScoreKeys?: string[];
  defaultSalience?: number;
}

export const LAST_ACCESSED_AT_KEY = "last_accessed_at";
export const BUFFER_IDX = "buffer_idx";

/**
 * TimeWeightedVectorStoreRetriever 基于时间加权相关性检索文档。
 * 参考: https://github.com/langchain-ai/langchain/blob/master/libs/langchain/langchain/retrievers/time_weighted_retriever.py
 * @example
 * ```typescript
 * const retriever = new TimeWeightedVectorStoreRetriever({
 *   vectorStore: new MemoryVectorStore(new OpenAIEmbeddings()),
 *   memoryStream: [],
 *   searchKwargs: 2,
 * });
 * await retriever.addDocuments([
 *   { pageContent: "My name is John.", metadata: {} },
 *   { pageContent: "My favourite food is pizza.", metadata: {} },
 *
 * ]);
 * const results = await retriever.invoke(
 *   "What is my favourite food?",
 * );
 * ```
 */
export class TimeWeightedVectorStoreRetriever extends BaseRetriever {
  static lc_name() {
    return "TimeWeightedVectorStoreRetriever";
  }

  get lc_namespace() {
    return ["langchain", "retrievers", "time_weighted"];
  }

  /**
   * 用于存储文档和确定显著性的向量存储。
   */
  private vectorStore: VectorStoreInterface;

  /**
   * 搜索时考虑的最相关文档的前 K 个数量。
   */
  private searchKwargs: number;

  /**
   * 要搜索的文档内存流。
   */
  private memoryStream: DocumentInterface[];

  /**
   * 指数衰减因子，计算公式为 (1.0-decay_rate)**(hrs_passed)。
   */
  private decayRate: number;

  /**
   * 单次调用中检索的最大文档数量。
   */
  private k: number;

  /**
   * 元数据中要纳入评分的其他键，例如 'importance'。
   */
  private otherScoreKeys: string[];

  /**
   * 分配给未从向量存储中检索到的记忆的显著性。
   */
  private defaultSalience: number | null;

  /**
   * 构造函数，用于初始化必需的字段
   * @param fields - 初始化 TimeWeightedVectorStoreRetriever 所需的字段
   */
  constructor(fields: TimeWeightedVectorStoreRetrieverFields) {
    super(fields);
    this.vectorStore = fields.vectorStore;
    this.searchKwargs = fields.searchKwargs ?? 100;
    this.memoryStream = fields.memoryStream ?? [];
    this.decayRate = fields.decayRate ?? 0.01;
    this.k = fields.k ?? 4;
    this.otherScoreKeys = fields.otherScoreKeys ?? [];
    this.defaultSalience = fields.defaultSalience ?? null;
  }

  /**
   * 获取文档的内存流。
   * @returns 文档的内存流。
   */
  getMemoryStream(): DocumentInterface[] {
    return this.memoryStream;
  }

  /**
   * 设置文档的内存流。
   * @param memoryStream 新的文档内存流。
   */
  setMemoryStream(memoryStream: DocumentInterface[]) {
    this.memoryStream = memoryStream;
  }

  /**
   * 基于时间加权相关性获取相关文档
   * @param query - 要搜索的查询
   * @returns 相关文档
   */
  async _getRelevantDocuments(
    query: string,
    runManager?: CallbackManagerForRetrieverRun
  ): Promise<DocumentInterface[]> {
    const now = Math.floor(Date.now() / 1000);
    const memoryDocsAndScores = this.getMemoryDocsAndScores();

    const salientDocsAndScores = await this.getSalientDocuments(
      query,
      runManager
    );
    const docsAndScores = { ...memoryDocsAndScores, ...salientDocsAndScores };

    return this.computeResults(docsAndScores, now);
  }

  /**
   * 注意：向向量存储添加文档时，请通过检索器使用 addDocuments
   * 而不是直接添加到向量存储。
   * 这是因为需要在 prepareDocuments 中处理文档。
   *
   * @param docs - 要添加到检索器中向量存储的文档
   */
  async addDocuments(docs: DocumentInterface[]): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    const savedDocs = this.prepareDocuments(docs, now);

    this.memoryStream.push(...savedDocs);
    await this.vectorStore.addDocuments(savedDocs);
  }

  /**
   * 获取内存文档及其评分
   * @returns 包含内存文档及其评分的对象
   */
  private getMemoryDocsAndScores(): Record<
    number,
    { doc: DocumentInterface; score: number }
  > {
    const memoryDocsAndScores: Record<
      number,
      { doc: DocumentInterface; score: number }
    > = {};
    for (const doc of this.memoryStream.slice(-this.k)) {
      const bufferIdx = doc.metadata[BUFFER_IDX];
      if (bufferIdx === undefined) {
        throw new Error(
          `Found a document in the vector store that is missing required metadata. This retriever only supports vector stores with documents that have been added through the "addDocuments" method on a TimeWeightedVectorStoreRetriever, not directly added or loaded into the backing vector store.`
        );
      }
      memoryDocsAndScores[bufferIdx] = {
        doc,
        score: this.defaultSalience ?? 0,
      };
    }
    return memoryDocsAndScores;
  }

  /**
   * 基于查询获取显著文档及其评分
   * @param query - 要搜索的查询
   * @returns 包含显著文档及其评分的对象
   */
  private async getSalientDocuments(
    query: string,
    runManager?: CallbackManagerForRetrieverRun
  ): Promise<Record<number, { doc: DocumentInterface; score: number }>> {
    const docAndScores: [DocumentInterface, number][] =
      await this.vectorStore.similaritySearchWithScore(
        query,
        this.searchKwargs,
        undefined,
        runManager?.getChild()
      );
    const results: Record<number, { doc: DocumentInterface; score: number }> =
      {};
    for (const [fetchedDoc, score] of docAndScores) {
      const bufferIdx = fetchedDoc.metadata[BUFFER_IDX];
      if (bufferIdx === undefined) {
        throw new Error(
          `Found a document in the vector store that is missing required metadata. This retriever only supports vector stores with documents that have been added through the "addDocuments" method on a TimeWeightedVectorStoreRetriever, not directly added or loaded into the backing vector store.`
        );
      }
      const doc = this.memoryStream[bufferIdx];
      results[bufferIdx] = { doc, score };
    }
    return results;
  }

  /**
   * 基于综合评分计算最终的文档结果集
   * @param docsAndScores - 包含文档及其评分的对象
   * @param now - 当前时间戳
   * @returns 最终的文档集合
   */
  private computeResults(
    docsAndScores: Record<number, { doc: DocumentInterface; score: number }>,
    now: number
  ): DocumentInterface[] {
    const recordedDocs = Object.values(docsAndScores)
      .map(({ doc, score }) => ({
        doc,
        score: this.getCombinedScore(doc, score, now),
      }))
      .sort((a, b) => b.score - a.score);

    const results: DocumentInterface[] = [];
    for (const { doc } of recordedDocs) {
      const bufferedDoc = this.memoryStream[doc.metadata[BUFFER_IDX]];
      bufferedDoc.metadata[LAST_ACCESSED_AT_KEY] = now;
      results.push(bufferedDoc);
      if (results.length > this.k) {
        break;
      }
    }
    return results;
  }

  /**
   * 在保存前为文档准备必要的元数据
   * @param docs - 要准备的文档
   * @param now - 当前时间戳
   * @returns 准备好的文档
   */
  private prepareDocuments(
    docs: DocumentInterface[],
    now: number
  ): DocumentInterface[] {
    return docs.map((doc, i) => ({
      ...doc,
      metadata: {
        ...doc.metadata,
        [LAST_ACCESSED_AT_KEY]: doc.metadata[LAST_ACCESSED_AT_KEY] ?? now,
        created_at: doc.metadata.created_at ?? now,
        [BUFFER_IDX]: this.memoryStream.length + i,
      },
    }));
  }

  /**
   * 基于向量相关性和其他因素计算综合评分
   * @param doc - 要计算评分的文档
   * @param vectorRelevance - 来自向量存储的相关性评分
   * @param nowMsec - 当前时间戳（毫秒）
   * @returns 文档的综合评分
   */
  private getCombinedScore(
    doc: DocumentInterface,
    vectorRelevance: number | null,
    nowMsec: number
  ): number {
    const hoursPassed = this.getHoursPassed(
      nowMsec,
      doc.metadata[LAST_ACCESSED_AT_KEY]
    );
    let score = (1.0 - this.decayRate) ** hoursPassed;
    for (const key of this.otherScoreKeys) {
      score += doc.metadata[key];
    }
    if (vectorRelevance !== null) {
      score += vectorRelevance;
    }
    return score;
  }

  /**
   * 计算两个时间点之间经过的小时数
   * @param time - 当前时间（秒）
   * @param refTime - 参考时间（秒）
   * @returns 两个时间点之间经过的小时数
   */
  private getHoursPassed(time: number, refTime: number): number {
    return (time - refTime) / 3600;
  }
}
