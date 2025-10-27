/**
 * 聊天机器人快速入门完整示例
 *
 * 这个文件提供了一个完整的聊天机器人构建教程，从基础对话到高级检索增强生成 (RAG)。
 * 主要功能模块：
 *
 * 1. 基础聊天功能：
 *    - 使用 OpenAI GPT 模型进行对话
 *    - 处理单轮和多轮对话
 *    - 消息历史管理
 *
 * 2. 提示模板和链式处理：
 *    - 创建系统提示模板
 *    - 使用消息占位符处理对话历史
 *    - 构建处理链 (chain)
 *
 * 3. 消息历史存储：
 *    - 内存中的消息历史管理
 *    - 添加和检索历史消息
 *    - 维护对话上下文
 *
 * 4. 文档检索和向量存储：
 *    - 网页内容加载和处理
 *    - 文档分割和向量化
 *    - 相似性搜索和检索
 *
 * 5. 检索增强生成 (RAG)：
 *    - 结合文档检索和生成模型
 *    - 基于上下文回答问题
 *    - 智能查询转换和优化
 *
 * 6. 高级对话检索：
 *    - 查询重写和优化
 *    - 条件分支处理
 *    - 上下文感知的检索策略
 *
 * 使用场景：
 * - 客服聊天机器人
 * - 知识问答系统
 * - 文档助手
 * - 智能搜索和推荐
 */

/* eslint-disable import/first */
/* eslint-disable arrow-body-style */
/* eslint-disable import/no-duplicates */

import { ChatOpenAI } from "@langchain/openai";

// 初始化 OpenAI 聊天模型（较低温度以提高确定性/可复现性）
const chat = new ChatOpenAI({
  model: "gpt-3.5-turbo-1106",
  temperature: 0.2,
});

import { HumanMessage } from "@langchain/core/messages";

// 单轮对话示例（未显式传入历史，模型本身不保留状态）
await chat.invoke([
  new HumanMessage(
    "Translate this sentence from English to French: I love programming."
  ),
]);

// 再次调用但仍未提供历史 → 视作全新请求
await chat.invoke([new HumanMessage("What did you just say?")]);

import { AIMessage } from "@langchain/core/messages";

// 显式提供历史消息来实现多轮对话（包含上一轮 AI 回复）
await chat.invoke([
  new HumanMessage(
    "Translate this sentence from English to French: I love programming."
  ),
  new AIMessage("J'adore la programmation."),
  new HumanMessage("What did you just say?"),
]);

import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

// 系统提示 + 对话历史占位符（"messages" 将在运行时注入）
const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a helpful assistant. Answer all questions to the best of your ability.",
  ],
  new MessagesPlaceholder("messages"),
]);

// 将提示与模型串接为一条链
const chain = prompt.pipe(chat);

// 通过占位符注入历史消息，复用同一条链
await chain.invoke({
  messages: [
    new HumanMessage(
      "Translate this sentence from English to French: I love programming."
    ),
    new AIMessage("J'adore la programmation."),
    new HumanMessage("What did you just say?"),
  ],
});

import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";

// 内存型消息历史（演示用途；生产可替换为 Redis、数据库等持久化存储）
const demoEphemeralChatMessageHistory = new ChatMessageHistory();

// 写入几条历史消息
await demoEphemeralChatMessageHistory.addMessage(new HumanMessage("hi!"));

await demoEphemeralChatMessageHistory.addMessage(new AIMessage("whats up?"));

// 查看当前历史
console.log(await demoEphemeralChatMessageHistory.getMessages());

// 将用户问题追加到历史
await demoEphemeralChatMessageHistory.addMessage(
  new HumanMessage(
    "Translate this sentence from English to French: I love programming."
  )
);

// 基于历史调用链，得到回复
const responseMessage = await chain.invoke({
  messages: await demoEphemeralChatMessageHistory.getMessages(),
});

// 将回复写回历史，便于后续追问
await demoEphemeralChatMessageHistory.addMessage(responseMessage);

// 追加追问
await demoEphemeralChatMessageHistory.addMessage(
  new HumanMessage("What did you just say?")
);

// 再次调用链，看到上下文生效
const responseMessage2 = await chain.invoke({
  messages: await demoEphemeralChatMessageHistory.getMessages(),
});

console.log(responseMessage2);

import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

// 加载网页文档（LangSmith 用户指南）以构建知识库
const loader = new CheerioWebBaseLoader(
  "https://docs.smith.langchain.com/user_guide"
);

// 拉取并解析网页为文档列表
const rawDocs = await loader.load();

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// 文档切块：控制每块大小与重叠，利于后续向量化与检索
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 0,
});

const allSplits = await textSplitter.splitDocuments(rawDocs);

import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

// 使用 OpenAI Embeddings 对文档切块进行向量化并存入内存向量库（演示环境）
const vectorstore = await MemoryVectorStore.fromDocuments(
  allSplits,
  new OpenAIEmbeddings()
);

// 构建检索器：每次返回相似度最高的 4 个文档块
const retriever = vectorstore.asRetriever(4);

// 检索一次示例问题
const docs = await retriever.invoke("how can langsmith help with testing?");

console.log(docs);

import { createStuffDocumentsChain } from "@langchain/classic/chains/combine_documents";

// 基于 context 作答的提示词（Stuff 策略会把文档内容直接拼接进提示）
const questionAnsweringPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "Answer the user's questions based on the below context:\n\n{context}",
  ],
  new MessagesPlaceholder("messages"),
]);

// 生成问答链：把文档上下文“塞入”提示，再交给模型生成答案
const documentChain = await createStuffDocumentsChain({
  llm: chat,
  prompt: questionAnsweringPrompt,
});

const demoEphemeralChatMessageHistory2 = new ChatMessageHistory();

// 新会话：提出与文档相关的问题
await demoEphemeralChatMessageHistory2.addMessage(
  new HumanMessage("how can langsmith help with testing?")
);

console.log(
  // 将检索到的文档作为 context 传入问答链
  await documentChain.invoke({
    messages: await demoEphemeralChatMessageHistory2.getMessages(),
    context: docs,
  })
);

import type { BaseMessage } from "@langchain/core/messages";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";

// 从参数中提取最新一条用户消息，作为检索查询
const parseRetrieverInput = (params: { messages: BaseMessage[] }) => {
  return params.messages[params.messages.length - 1].content as string;
};

// 组合链：
// 1) 先基于用户最新消息通过检索器得到 context
// 2) 再把 context 与消息一起交给问答链得到 answer
const retrievalChain = RunnablePassthrough.assign({
  context: RunnableSequence.from([parseRetrieverInput, retriever]),
}).assign({
  answer: documentChain,
});

const response3 = await retrievalChain.invoke({
  messages: await demoEphemeralChatMessageHistory2.getMessages(),
});

console.log(response3);

// 把答案写回历史，便于后续“追问”获得更好的上下文
await demoEphemeralChatMessageHistory2.addMessage(
  new AIMessage(response3.answer)
);

// 追加追问
await demoEphemeralChatMessageHistory2.addMessage(
  new HumanMessage("tell me more about that!")
);

console.log(
  await retrievalChain.invoke({
    messages: await demoEphemeralChatMessageHistory2.getMessages(),
  })
);

// 精简版本：只关心答案字符串，不需要返回中间 context
const retrievalChainWithOnlyAnswer = RunnablePassthrough.assign({
  context: RunnableSequence.from([parseRetrieverInput, retriever]),
}).pipe(documentChain);

console.log(
  await retrievalChainWithOnlyAnswer.invoke({
    messages: await demoEphemeralChatMessageHistory2.getMessages(),
  })
);

// 直接检索以对比（不经问答链）
console.log(await retriever.invoke("how can langsmith help with testing?"));

console.log(await retriever.invoke("tell me more about that!"));

import { RunnableBranch } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

// 查询重写提示：根据对话历史生成更好的检索查询（仅返回查询字符串）
const queryTransformPrompt = ChatPromptTemplate.fromMessages([
  new MessagesPlaceholder("messages"),
  [
    "user",
    "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation. Only respond with the query, nothing else.",
  ],
]);

// 条件分支：
// - 如果是首轮（只有一条消息），直接用原始查询检索；
// - 否则先做查询重写，再检索。
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

// 最终对话式检索链：自动选择是否重写查询，然后把检索到的 context 送入问答链
const conversationalRetrievalChain = RunnablePassthrough.assign({
  context: queryTransformingRetrieverChain,
}).assign({
  answer: documentChain,
});

const demoEphemeralChatMessageHistory3 = new ChatMessageHistory();

// 演示对话式检索的首轮问答
await demoEphemeralChatMessageHistory3.addMessage(
  new HumanMessage("how can langsmith help with testing?")
);

const response4 = await conversationalRetrievalChain.invoke({
  messages: await demoEphemeralChatMessageHistory3.getMessages(),
});

await demoEphemeralChatMessageHistory3.addMessage(
  new AIMessage(response4.answer)
);

console.log(response4);

// 追加追问并再次调用，以展示查询重写带来的上下文延续能力
await demoEphemeralChatMessageHistory3.addMessage(
  new HumanMessage("tell me more about that!")
);

console.log(
  await conversationalRetrievalChain.invoke({
    messages: await demoEphemeralChatMessageHistory3.getMessages(),
  })
);
