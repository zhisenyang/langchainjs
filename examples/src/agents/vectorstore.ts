/**
 * 向量存储代理示例
 *
 * 这个文件演示了如何使用 LangChain 创建基于向量存储的智能问答代理。
 * 主要功能：
 *
 * 1. 向量存储构建：
 *    - 使用 HNSWLib 创建高效的向量数据库
 *    - 集成 OpenAI Embeddings 进行文本向量化
 *    - 支持大规模文档的相似性搜索
 *
 * 2. 文档处理流程：
 *    - 从文件系统读取文本文档
 *    - 使用 RecursiveCharacterTextSplitter 分割文档
 *    - 设置 1000 字符的块大小优化检索
 *
 * 3. 向量存储代理：
 *    - 使用 createVectorStoreAgent 创建专用代理
 *    - 集成 VectorStoreToolkit 工具包
 *    - 自动进行语义搜索和问答
 *
 * 4. 语义搜索功能：
 *    - 基于向量相似性的智能检索
 *    - 理解查询的语义含义
 *    - 返回最相关的文档片段
 *
 * 5. 向量存储信息配置：
 *    - 设置存储名称和描述
 *    - 定义存储的用途和内容
 *    - 便于代理理解和使用
 *
 * 6. 实际应用示例：
 *    - 基于国情咨文文档的问答
 *    - 查询 "拜登对 Ketanji Brown Jackson 说了什么"
 *    - 展示文档级别的智能问答
 *
 * 7. 中间步骤跟踪：
 *    - 记录向量搜索和推理过程
 *    - 显示检索到的相关文档
 *    - 便于理解代理的决策过程
 *
 * 8. 高效检索架构：
 *    - HNSW 算法提供快速近似搜索
 *    - 支持大规模文档库的实时查询
 *    - 优化的内存使用和查询性能
 *
 * 使用场景：
 * - 企业知识库问答系统
 * - 文档检索和分析
 * - 智能客服和支持
 * - 研究和学术查询
 * - 法律文档分析
 * - 技术文档助手
 */

import { OpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import * as fs from "fs";
import {
  VectorStoreToolkit,
  createVectorStoreAgent,
  VectorStoreInfo,
} from "langchain/agents";

const model = new OpenAI({ temperature: 0 });
/* Load in the file we want to do question answering over */
const text = fs.readFileSync("state_of_the_union.txt", "utf8");
/* Split the text into chunks using character, not token, size */
const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
const docs = await textSplitter.createDocuments([text]);
/* Create the vectorstore */
const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

/* Create the agent */
const vectorStoreInfo: VectorStoreInfo = {
  name: "state_of_union_address",
  description: "the most recent state of the Union address",
  vectorStore,
};

const toolkit = new VectorStoreToolkit(vectorStoreInfo, model);
const agent = createVectorStoreAgent(model, toolkit);

const input =
  "What did biden say about Ketanji Brown Jackson is the state of the union address?";
console.log(`Executing: ${input}`);

const result = await agent.invoke({ input });
console.log(`Got output ${result.output}`);
console.log(
  `Got intermediate steps ${JSON.stringify(result.intermediateSteps, null, 2)}`
);
