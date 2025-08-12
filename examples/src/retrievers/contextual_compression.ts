/**
 * 上下文压缩检索器示例
 * 
 * 这个文件演示了如何使用 ContextualCompressionRetriever 来压缩和提取检索文档中的相关信息。
 * 主要功能：
 * 
 * 1. 文档处理和向量化：
 *    - 从文件系统读取长文档（如国情咨文）
 *    - 使用递归字符分割器分割文档
 *    - 创建 HNSWLib 向量存储
 * 
 * 2. LLM 链式提取器：
 *    - 使用 OpenAI GPT 模型作为压缩器
 *    - 智能提取文档中的相关片段
 *    - 减少无关信息的干扰
 * 
 * 3. 上下文压缩检索：
 *    - 结合基础检索器和压缩器
 *    - 先检索相关文档，再压缩提取关键信息
 *    - 提高检索结果的精确性和可读性
 * 
 * 4. 智能信息提取：
 *    - 根据查询内容智能提取相关片段
 *    - 过滤掉不相关的文档内容
 *    - 保留最重要的上下文信息
 * 
 * 使用场景：
 * - 长文档问答系统
 * - 信息提取和摘要
 * - 精确检索和压缩
 * - 减少 token 使用和成本
 * - 提高检索质量
 */

import * as fs from "fs";

import { OpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { ContextualCompressionRetriever } from "langchain/retrievers/contextual_compression";
import { LLMChainExtractor } from "langchain/retrievers/document_compressors/chain_extract";

const model = new OpenAI({
  model: "gpt-3.5-turbo-instruct",
});
const baseCompressor = LLMChainExtractor.fromLLM(model);

const text = fs.readFileSync("state_of_the_union.txt", "utf8");

const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
const docs = await textSplitter.createDocuments([text]);

// Create a vector store from the documents.
const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

const retriever = new ContextualCompressionRetriever({
  baseCompressor,
  baseRetriever: vectorStore.asRetriever(),
});

const retrievedDocs = await retriever.invoke(
  "What did the speaker say about Justice Breyer?"
);

console.log({ retrievedDocs });

/*
  {
    retrievedDocs: [
      Document {
        pageContent: 'One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.',
        metadata: [Object]
      },
      Document {
        pageContent: '"Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service."',
        metadata: [Object]
      },
      Document {
        pageContent: 'The onslaught of state laws targeting transgender Americans and their families is wrong.',
        metadata: [Object]
      }
    ]
  }
*/
