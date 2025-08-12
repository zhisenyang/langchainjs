/**
 * 缓冲窗口内存示例
 * 
 * 这个文件演示了如何使用 LangChain 的 BufferWindowMemory 来管理固定窗口大小的对话记忆。
 * 主要功能：
 * 
 * 1. 缓冲窗口内存：
 *    - 使用 BufferWindowMemory 维护固定大小的对话窗口
 *    - 设置 k=1 只保留最近 1 轮对话
 *    - 自动丢弃超出窗口的旧对话
 * 
 * 2. 窗口大小控制：
 *    - k 参数控制保留的对话轮数
 *    - 滑动窗口机制，先进先出
 *    - 有效控制内存使用和 token 消耗
 * 
 * 3. LLM 模型配置：
 *    - 使用 OpenAI 模型，温度设为 0.9
 *    - 提高回答的创造性和多样性
 *    - 适合友好对话场景
 * 
 * 4. 对话提示模板：
 *    - 定义友好的 AI 助手角色
 *    - 包含对话历史的占位符
 *    - 指导 AI 提供详细和诚实的回答
 * 
 * 5. 内存变量管理：
 *    - 设置 memoryKey 为 "chat_history"
 *    - 自动管理窗口内的对话历史
 *    - 与提示模板无缝集成
 * 
 * 6. 实际应用演示：
 *    - 第一轮：介绍姓名 "Jim"
 *    - 第二轮：询问姓名，测试窗口记忆效果
 *    - 由于 k=1，只保留最近一轮对话
 * 
 * 7. 窗口记忆特点：
 *    - 内存使用可预测和控制
 *    - 适合长时间运行的应用
 *    - 防止 token 限制问题
 *    - 保持最新的对话上下文
 * 
 * 使用场景：
 * - 资源受限的对话系统
 * - 短期上下文对话
 * - 实时聊天应用
 * - 移动端聊天机器人
 * - 成本敏感的应用
 * - 简单的问答系统
 */

import { OpenAI } from "@langchain/openai";
import { BufferWindowMemory } from "langchain/memory";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";

export const run = async () => {
  const memory = new BufferWindowMemory({ memoryKey: "chat_history", k: 1 });
  const model = new OpenAI({ temperature: 0.9 });
  const template = `The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

    Current conversation:
    {chat_history}
    Human: {input}
    AI:`;

  const prompt = PromptTemplate.fromTemplate(template);
  const chain = new LLMChain({ llm: model, prompt, memory });
  const res1 = await chain.invoke({ input: "Hi! I'm Jim." });
  console.log({ res1 });
  const res2 = await chain.invoke({ input: "What's my name?" });
  console.log({ res2 });
};
