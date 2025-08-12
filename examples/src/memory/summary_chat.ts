/**
 * 对话摘要内存示例
 * 
 * 这个文件演示了如何使用 LangChain 的 ConversationSummaryMemory 来智能管理长对话的记忆。
 * 主要功能：
 * 
 * 1. 对话摘要内存：
 *    - 使用 ConversationSummaryMemory 自动总结对话历史
 *    - 通过 LLM 生成对话的简洁摘要
 *    - 避免长对话历史导致的 token 限制问题
 * 
 * 2. 双 LLM 配置：
 *    - 摘要 LLM：使用 GPT-3.5-turbo 生成对话摘要
 *    - 主 LLM：使用 GPT-4o-mini 进行对话生成
 *    - 分工明确，优化成本和性能
 * 
 * 3. 智能摘要机制：
 *    - 自动将对话历史压缩为简洁摘要
 *    - 保留关键信息和上下文
 *    - 减少 token 使用量
 * 
 * 4. 内存变量管理：
 *    - 设置 memoryKey 为 "chat_history"
 *    - 自动加载和更新摘要内容
 *    - 与提示模板无缝集成
 * 
 * 5. 对话链集成：
 *    - 将摘要内存集成到 LLMChain 中
 *    - 自动维护对话上下文
 *    - 支持连续的多轮对话
 * 
 * 6. 实际应用演示：
 *    - 第一轮：介绍姓名 "Jim"
 *    - 第二轮：询问姓名，测试摘要记忆效果
 *    - 展示摘要如何保留关键信息
 * 
 * 7. 摘要效果展示：
 *    - 原始对话被压缩为简洁描述
 *    - 保留人名等关键信息
 *    - 维护对话的连贯性
 * 
 * 使用场景：
 * - 长时间对话系统
 * - 客服聊天机器人
 * - 个人助手应用
 * - 教育辅导系统
 * - 心理咨询机器人
 * - 企业知识助手
 */

import { ChatOpenAI } from "@langchain/openai";
import { ConversationSummaryMemory } from "langchain/memory";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";

export const run = async () => {
  const memory = new ConversationSummaryMemory({
    memoryKey: "chat_history",
    llm: new ChatOpenAI({ model: "gpt-3.5-turbo", temperature: 0 }),
  });

  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
  });
  const prompt =
    PromptTemplate.fromTemplate(`The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

  Current conversation:
  {chat_history}
  Human: {input}
  AI:`);
  const chain = new LLMChain({ llm: model, prompt, memory });

  const res1 = await chain.invoke({ input: "Hi! I'm Jim." });
  console.log({ res1, memory: await memory.loadMemoryVariables({}) });
  /*
  {
    res1: {
      text: "Hello Jim! It's nice to meet you. My name is AI. How may I assist you today?"
    },
    memory: {
      chat_history: 'Jim introduces himself to the AI and the AI greets him and offers assistance.'
    }
  }
  */

  const res2 = await chain.invoke({ input: "What's my name?" });
  console.log({ res2, memory: await memory.loadMemoryVariables({}) });
  /*
  {
    res2: {
      text: "Your name is Jim. It's nice to meet you, Jim. How can I assist you today?"
    },
    memory: {
      chat_history: 'Jim introduces himself to the AI and the AI greets him and offers assistance. The AI addresses Jim by name and asks how it can assist him.'
    }
  }
  */
};
