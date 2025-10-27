/**
 * Token 缓冲内存示例
 * 
 * 这个文件演示了如何使用 LangChain 的 ConversationTokenBufferMemory 来基于 token 数量管理对话记忆。
 * 主要功能：
 * 
 * 1. Token 缓冲内存：
 *    - 使用 ConversationTokenBufferMemory 基于 token 限制管理内存
 *    - 设置 maxTokenLimit 为 10 个 token
 *    - 自动计算和控制对话历史的 token 使用量
 * 
 * 2. Token 限制机制：
 *    - 根据 LLM 的 token 计算方式精确控制
 *    - 自动丢弃超出限制的旧对话
 *    - 确保不超过模型的上下文限制
 * 
 * 3. LLM 集成：
 *    - 使用 OpenAI 模型进行 token 计算
 *    - 利用模型的 tokenizer 准确计算 token 数量
 *    - 与模型的 token 限制保持一致
 * 
 * 4. 内存操作：
 *    - saveContext: 保存对话上下文到内存
 *    - loadMemoryVariables: 加载符合 token 限制的历史
 *    - 自动管理内存的增删操作
 * 
 * 5. 对话历史管理：
 *    - 输入输出格式：{input: "...", output: "..."}
 *    - 自动格式化为 "Human: ... AI: ..." 格式
 *    - 保持对话的自然流畅性
 * 
 * 6. 实际应用演示：
 *    - 保存两轮对话到内存
 *    - 由于 token 限制，只保留最新的对话
 *    - 展示 token 管理的实际效果
 * 
 * 7. Token 管理优势：
 *    - 精确控制 API 成本
 *    - 避免超出模型上下文限制
 *    - 自动优化内存使用
 *    - 适合生产环境部署
 * 
 * 使用场景：
 * - 成本敏感的生产应用
 * - 长时间运行的对话系统
 * - API 调用优化
 * - 大规模部署的聊天机器人
 * - 资源受限的环境
 * - 精确的 token 预算管理
 */

import { OpenAI } from "@langchain/openai";
import { ConversationTokenBufferMemory } from "@langchain/classic/memory";

const model = new OpenAI({});
const memory = new ConversationTokenBufferMemory({
  llm: model,
  maxTokenLimit: 10,
});

await memory.saveContext({ input: "hi" }, { output: "whats up" });
await memory.saveContext({ input: "not much you" }, { output: "not much" });

const result1 = await memory.loadMemoryVariables({});
console.log(result1);

/*
  { history: 'Human: not much you\nAI: not much' }
*/
