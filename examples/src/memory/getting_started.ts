/**
 * 内存管理入门示例
 * 
 * 这个文件演示了 LangChain 中各种内存管理机制的基础用法，包括缓冲内存和对话链集成。
 * 主要功能：
 * 
 * 1. 基础缓冲内存：
 *    - 创建 BufferMemory 实例存储对话历史
 *    - 添加人类和 AI 消息到聊天历史
 *    - 加载内存变量获取历史对话
 * 
 * 2. 自定义内存键：
 *    - 配置 memoryKey 为 "chat_history"
 *    - 与提示模板中的变量名保持一致
 *    - 支持灵活的变量命名
 * 
 * 3. 消息格式返回：
 *    - 设置 returnMessages: true 返回消息对象
 *    - 保持消息的原始结构和类型
 *    - 适用于聊天模型的消息格式
 * 
 * 4. LLM 链集成（字符串模式）：
 *    - 将内存集成到 LLMChain 中
 *    - 使用字符串格式的对话历史
 *    - 支持传统的文本生成模型
 * 
 * 5. 聊天模型集成（消息模式）：
 *    - 使用 ChatOpenAI 和 ChatPromptTemplate
 *    - 通过 MessagesPlaceholder 插入历史消息
 *    - 支持现代的聊天模型格式
 * 
 * 6. 对话连续性：
 *    - 自动维护对话上下文
 *    - 支持多轮对话记忆
 *    - 实现上下文感知的回答
 * 
 * 使用场景：
 * - 聊天机器人对话记忆
 * - 多轮对话系统
 * - 上下文感知的问答
 * - 个性化对话体验
 * - 会话状态管理
 */

/* eslint-disable import/first */
/* eslint-disable import/no-duplicates */
import { BufferMemory } from "langchain/memory";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

const memory = new BufferMemory();

await memory.chatHistory.addMessage(new HumanMessage("Hi!"));
await memory.chatHistory.addMessage(new AIMessage("What's up?"));

console.log(await memory.loadMemoryVariables({}));

const memory2 = new BufferMemory({
  memoryKey: "chat_history",
});

await memory2.chatHistory.addMessage(new HumanMessage("Hi!"));
await memory2.chatHistory.addMessage(new AIMessage("What's up?"));

console.log(await memory2.loadMemoryVariables({}));

const messageMemory = new BufferMemory({
  returnMessages: true,
});

await messageMemory.chatHistory.addMessage(new HumanMessage("Hi!"));
await messageMemory.chatHistory.addMessage(new AIMessage("What's up?"));

console.log(await messageMemory.loadMemoryVariables({}));

import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";

const llm = new OpenAI({ temperature: 0 });

// Notice that a "chat_history" variable is present in the prompt template
const template = `You are a nice chatbot having a conversation with a human.

Previous conversation:
{chat_history}

New human question: {question}
Response:`;
const prompt = PromptTemplate.fromTemplate(template);
// Notice that we need to align the `memoryKey` with the variable in the prompt
const stringPromptMemory = new BufferMemory({ memoryKey: "chat_history" });
const conversationChain = new LLMChain({
  llm,
  prompt,
  verbose: true,
  memory: stringPromptMemory,
});

console.log(await conversationChain.invoke({ question: "What is your name?" }));
console.log(
  await conversationChain.invoke({ question: "What did I just ask you?" })
);

import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

const chatModel = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 });
const chatPrompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a nice chatbot having a conversation with a human."],
  new MessagesPlaceholder("chat_history"),
  ["human", "{question}"],
]);

const chatPromptMemory = new BufferMemory({
  memoryKey: "chat_history",
  returnMessages: true,
});

const chatConversationChain = new LLMChain({
  llm: chatModel,
  prompt: chatPrompt,
  verbose: true,
  memory: chatPromptMemory,
});

console.log(
  await chatConversationChain.invoke({ question: "What is your name?" })
);
console.log(
  await chatConversationChain.invoke({ question: "What did I just ask you?" })
);
