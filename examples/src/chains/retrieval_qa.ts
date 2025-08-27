/**
 * 检索问答（Retrieval QA）示例
 * 
 * 这个文件演示了如何构建基于文档检索的问答系统。
 * 主要功能：
 * 
 * 1. 文档处理和分割：
 *    - 读取大型文本文件（如国情咨文）
 *    - 使用 RecursiveCharacterTextSplitter 分割文档
 *    - 设置合适的块大小（1000字符）
 * 
 * 2. 向量存储和检索：
 *    - 使用 OpenAI Embeddings 生成文档向量
 *    - 创建 MemoryVectorStore 存储向量
 *    - 配置向量检索器进行相似性搜索
 * 
 * 3. 检索增强生成（RAG）：
 *    - 结合文档检索和语言模型
 *    - 基于检索到的上下文回答问题
 *    - 确保答案基于实际文档内容
 * 
 * 4. 链式处理流程：
 *    - 使用 RunnableSequence 构建处理链
 *    - 并行处理上下文检索和问题传递
 *    - 集成提示模板、模型和输出解析
 * 
 * 5. 智能问答机制：
 *    - 基于上下文的准确回答
 *    - 不知道答案时诚实回应
 *    - 避免编造不存在的信息
 * 
 * 6. 实际应用场景：
 *    - 文档问答系统
 *    - 知识库查询
 *    - 智能客服
 *    - 研究助手
 * 
 * 使用场景：
 * - 企业知识管理
 * - 文档智能问答
 * - 学术研究助手
 * - 法律文档查询
 * - 技术文档问答
 */

import * as fs from "node:fs";

import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { Document } from "@langchain/core/documents";

const formatDocumentsAsString = (documents: Document[]) => {
  return documents.map((document) => document.pageContent).join("\n\n");
};

// 初始化用于回答问题的 LLM。
const model = new ChatOpenAI({
  model: "gpt-4o-mini",
});
const text = fs.readFileSync("state_of_the_union.txt", "utf8");
const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
const docs = await textSplitter.createDocuments([text]);
// 从文档创建向量存储。
const vectorStore = await MemoryVectorStore.fromDocuments(
  docs,
  new OpenAIEmbeddings()
);

// 初始化围绕向量存储的检索器包装器
const vectorStoreRetriever = vectorStore.asRetriever();

// 为聊天模型创建系统和人类提示
const SYSTEM_TEMPLATE = `Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
----------------
{context}`;

const prompt = ChatPromptTemplate.fromMessages([
  ["system", SYSTEM_TEMPLATE],
  ["human", "{question}"],
]);

const chain = RunnableSequence.from([
  {
    context: vectorStoreRetriever.pipe(formatDocumentsAsString),
    question: new RunnablePassthrough(),
  },
  prompt,
  model,
  new StringOutputParser(),
]);

const answer = await chain.invoke(
  "What did the president say about Justice Breyer?"
);

console.log({ answer });

/*
  {
    answer: 'The president honored Justice Stephen Breyer by recognizing his dedication to serving the country as an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. He thanked Justice Breyer for his service.'
  }
*/
