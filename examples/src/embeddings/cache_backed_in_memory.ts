/**
 * 缓存支持的嵌入模型示例（内存存储）
 * 
 * 这个文件演示了如何使用缓存机制来优化嵌入模型的性能，避免重复计算相同文本的向量。
 * 主要功能：
 * 
 * 1. 缓存嵌入配置：
 *    - 使用 CacheBackedEmbeddings 包装 OpenAI 嵌入模型
 *    - 配置内存存储作为缓存后端
 *    - 设置命名空间以区分不同模型的缓存
 * 
 * 2. 文档处理流程：
 *    - 使用 TextLoader 加载文本文件
 *    - 使用 RecursiveCharacterTextSplitter 分割文档
 *    - 创建适合向量化的文档块
 * 
 * 3. 向量存储构建：
 *    - 使用 FaissStore 创建向量数据库
 *    - 第一次创建时计算并缓存所有嵌入向量
 *    - 后续创建时直接使用缓存的向量
 * 
 * 4. 性能优化效果：
 *    - 首次创建：约 1905ms（需要计算嵌入）
 *    - 缓存创建：约 8ms（使用缓存向量）
 *    - 显著提升处理速度
 * 
 * 5. 缓存管理：
 *    - 自动生成基于内容哈希的缓存键
 *    - 支持缓存键的遍历和管理
 *    - 内存高效的存储机制
 * 
 * 使用场景：
 * - 大规模文档处理优化
 * - 重复文本的向量化加速
 * - 开发和测试环境性能提升
 * - 成本控制和 API 调用优化
 * - 实时应用的响应速度优化
 */

import { OpenAIEmbeddings } from "@langchain/openai";
import { CacheBackedEmbeddings } from "langchain/embeddings/cache_backed";
import { InMemoryStore } from "@langchain/core/stores";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { TextLoader } from "langchain/document_loaders/fs/text";

const underlyingEmbeddings = new OpenAIEmbeddings();

const inMemoryStore = new InMemoryStore();

const cacheBackedEmbeddings = CacheBackedEmbeddings.fromBytesStore(
  underlyingEmbeddings,
  inMemoryStore,
  {
    namespace: underlyingEmbeddings.model,
  }
);

const loader = new TextLoader("./state_of_the_union.txt");
const rawDocuments = await loader.load();
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 0,
});
const documents = await splitter.splitDocuments(rawDocuments);

// No keys logged yet since the cache is empty
for await (const key of inMemoryStore.yieldKeys()) {
  console.log(key);
}

let time = Date.now();
const vectorstore = await FaissStore.fromDocuments(
  documents,
  cacheBackedEmbeddings
);
console.log(`Initial creation time: ${Date.now() - time}ms`);
/*
  Initial creation time: 1905ms
*/

// The second time is much faster since the embeddings for the input docs have already been added to the cache
time = Date.now();
const vectorstore2 = await FaissStore.fromDocuments(
  documents,
  cacheBackedEmbeddings
);
console.log(`Cached creation time: ${Date.now() - time}ms`);
/*
  Cached creation time: 8ms
*/

// Many keys logged with hashed values
const keys = [];
for await (const key of inMemoryStore.yieldKeys()) {
  keys.push(key);
}

console.log(keys.slice(0, 5));
/*
  [
    'text-embedding-ada-002ea9b59e760e64bec6ee9097b5a06b0d91cb3ab64',
    'text-embedding-ada-0023b424f5ed1271a6f5601add17c1b58b7c992772e',
    'text-embedding-ada-002fec5d021611e1527297c5e8f485876ea82dcb111',
    'text-embedding-ada-00262f72e0c2d711c6b861714ee624b28af639fdb13',
    'text-embedding-ada-00262d58882330038a4e6e25ea69a938f4391541874'
  ]
*/
