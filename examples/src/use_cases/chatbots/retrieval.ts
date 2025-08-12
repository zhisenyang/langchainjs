/**
 * 检索增强聊天机器人示例
 * 
 * 这个文件演示了如何构建一个基于检索增强生成 (RAG) 的聊天机器人系统。
 * 主要功能模块：
 * 
 * 1. 文档加载和处理：
 *    - 使用 CheerioWebBaseLoader 加载网页内容
 *    - 文档分割和预处理
 *    - 创建可搜索的文档集合
 * 
 * 2. 向量存储和检索：
 *    - 使用 OpenAI 嵌入模型创建向量表示
 *    - 构建内存向量存储
 *    - 配置相似性检索器
 * 
 * 3. 文档链和问答：
 *    - 创建基于上下文的问答链
 *    - 处理无相关信息的情况
 *    - 生成准确和有用的回答
 * 
 * 4. 查询转换和优化：
 *    - 解析用户消息和对话历史
 *    - 生成优化的搜索查询
 *    - 提高检索的相关性
 * 
 * 5. 对话式检索链：
 *    - 条件分支处理不同查询类型
 *    - 上下文感知的检索策略
 *    - 多轮对话支持
 * 
 * 6. 流式处理：
 *    - 实时响应生成
 *    - 流式输出处理
 *    - 改善用户体验
 * 
 * 使用场景：
 * - 知识库问答系统
 * - 文档助手和搜索
 * - 客服聊天机器人
 * - 智能信息检索
 */

/* eslint-disable import/first */
/* eslint-disable arrow-body-style */
/* eslint-disable import/no-duplicates */

import { ChatOpenAI } from "@langchain/openai";

const chat = new ChatOpenAI({
  model: "gpt-3.5-turbo-1106",
  temperature: 0.2,
});

import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

const loader = new CheerioWebBaseLoader(
  "https://docs.smith.langchain.com/user_guide"
);

const rawDocs = await loader.load();

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 0,
});

const allSplits = await textSplitter.splitDocuments(rawDocs);

import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

const vectorstore = await MemoryVectorStore.fromDocuments(
  allSplits,
  new OpenAIEmbeddings()
);

const retriever = vectorstore.asRetriever(4);

const docs = await retriever.invoke("how can langsmith help with testing?");

console.log(docs);

import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

const SYSTEM_TEMPLATE = `Answer the user's questions based on the below context. 
If the context doesn't contain any relevant information to the question, don't make something up and just say "I don't know":

<context>
{context}
</context>
`;

const questionAnsweringPrompt = ChatPromptTemplate.fromMessages([
  ["system", SYSTEM_TEMPLATE],
  new MessagesPlaceholder("messages"),
]);

const documentChain = await createStuffDocumentsChain({
  llm: chat,
  prompt: questionAnsweringPrompt,
});

import { HumanMessage, AIMessage } from "@langchain/core/messages";

console.log(
  await documentChain.invoke({
    messages: [
      new HumanMessage("Can LangSmith help test my LLM applications?"),
    ],
    context: docs,
  })
);

console.log(
  await documentChain.invoke({
    messages: [
      new HumanMessage("Can LangSmith help test my LLM applications?"),
    ],
    context: [],
  })
);

import type { BaseMessage } from "@langchain/core/messages";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";

const parseRetrieverInput = (params: { messages: BaseMessage[] }) => {
  return params.messages[params.messages.length - 1].content;
};

const retrievalChain = RunnablePassthrough.assign({
  context: RunnableSequence.from([parseRetrieverInput, retriever]),
}).assign({
  answer: documentChain,
});

console.log(
  await retrievalChain.invoke({
    messages: [
      new HumanMessage("Can LangSmith help test my LLM applications?"),
    ],
  })
);

console.log(await retriever.invoke("Tell me more!"));

const queryTransformPrompt = ChatPromptTemplate.fromMessages([
  new MessagesPlaceholder("messages"),
  [
    "user",
    "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation. Only respond with the query, nothing else.",
  ],
]);

const queryTransformationChain = queryTransformPrompt.pipe(chat);

console.log(
  await queryTransformationChain.invoke({
    messages: [
      new HumanMessage("Can LangSmith help test my LLM applications?"),
      new AIMessage(
        "Yes, LangSmith can help test and evaluate your LLM applications. It allows you to quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs. Additionally, LangSmith can be used to monitor your application, log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise."
      ),
      new HumanMessage("Tell me more!"),
    ],
  })
);

import { RunnableBranch } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

const queryTransformingRetrieverChain = RunnableBranch.from([
  [
    (params: { messages: BaseMessage[] }) => params.messages.length === 1,
    RunnableSequence.from([parseRetrieverInput, retriever]),
  ],
  queryTransformPrompt
    .pipe(chat)
    .pipe(new StringOutputParser())
    .pipe(retriever),
]).withConfig({ runName: "chat_retriever_chain" });

const conversationalRetrievalChain = RunnablePassthrough.assign({
  context: queryTransformingRetrieverChain,
}).assign({
  answer: documentChain,
});

console.log(
  await conversationalRetrievalChain.invoke({
    messages: [
      new HumanMessage("Can LangSmith help test my LLM applications?"),
    ],
  })
);

console.log(
  await conversationalRetrievalChain.invoke({
    messages: [
      new HumanMessage("Can LangSmith help test my LLM applications?"),
      new AIMessage(
        "Yes, LangSmith can help test and evaluate your LLM applications. It allows you to quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs. Additionally, LangSmith can be used to monitor your application, log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise."
      ),
      new HumanMessage("Tell me more!"),
    ],
  })
);

const stream = await conversationalRetrievalChain.stream({
  messages: [
    new HumanMessage("Can LangSmith help test my LLM applications?"),
    new AIMessage(
      "Yes, LangSmith can help test and evaluate your LLM applications. It allows you to quickly edit examples and add them to datasets to expand the surface area of your evaluation sets or to fine-tune a model for improved quality or reduced costs. Additionally, LangSmith can be used to monitor your application, log all traces, visualize latency and token usage statistics, and troubleshoot specific issues as they arise."
    ),
    new HumanMessage("Tell me more!"),
  ],
});

for await (const chunk of stream) {
  console.log(chunk);
}
