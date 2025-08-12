/**
 * 缓冲内存对话链示例
 * 
 * 这个文件演示了如何使用 BufferMemory 创建具有记忆功能的对话链。
 * 主要功能：
 * 
 * 1. 缓冲内存配置：
 *    - 创建 BufferMemory 实例
 *    - 设置 memoryKey 为 "chat_history"
 *    - 自动存储完整的对话历史
 * 
 * 2. LLM 模型设置：
 *    - 使用 OpenAI 模型，温度设为 0.9
 *    - 提高回答的创造性和多样性
 *    - 平衡一致性和创新性
 * 
 * 3. 对话提示模板：
 *    - 定义友好的 AI 助手角色
 *    - 包含对话历史的占位符
 *    - 指导 AI 提供详细和诚实的回答
 * 
 * 4. 链式对话处理：
 *    - 将 LLM、提示和内存组合成链
 *    - 自动管理对话上下文
 *    - 支持连续的多轮对话
 * 
 * 5. 记忆功能演示：
 *    - 第一轮：介绍姓名 "Jim"
 *    - 第二轮：询问姓名，测试记忆能力
 *    - 验证 AI 能否记住之前的信息
 * 
 * 使用场景：
 * - 个性化聊天机器人
 * - 客服对话系统
 * - 教育辅导助手
 * - 长期对话伙伴
 * - 上下文相关的问答
 */

import { OpenAI } from "@langchain/openai";
import { BufferMemory } from "langchain/memory";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";

const memory = new BufferMemory({ memoryKey: "chat_history" });
const model = new OpenAI({ temperature: 0.9 });
const prompt =
  PromptTemplate.fromTemplate(`The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

Current conversation:
{chat_history}
Human: {input}
AI:`);
const chain = new LLMChain({ llm: model, prompt, memory });

const res1 = await chain.invoke({ input: "Hi! I'm Jim." });
console.log({ res1 });

const res2 = await chain.invoke({ input: "What's my name?" });
console.log({ res2 });
