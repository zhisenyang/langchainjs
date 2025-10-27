/**
 * 对话链（Conversation Chain）示例
 * 
 * 这个文件演示了如何使用 ConversationChain 创建具有记忆功能的对话系统。
 * 主要功能：
 * 
 * 1. 对话记忆管理：
 *    - 自动维护对话历史
 *    - 上下文连续性保持
 *    - 多轮对话支持
 * 
 * 2. 简单对话接口：
 *    - 基于 OpenAI 的对话模型
 *    - 温度参数控制输出随机性
 *    - 直接的问答交互
 * 
 * 3. 链式处理：
 *    - 使用 ConversationChain 封装
 *    - 自动处理输入输出格式
 *    - 内置记忆缓冲区
 * 
 * 4. 实际应用场景：
 *    - 聊天机器人开发
 *    - 客服系统
 *    - 虚拟助手
 *    - 教育对话系统
 * 
 * 使用场景：
 * - 智能客服
 * - 对话式 AI 应用
 * - 教育辅导系统
 * - 个人助理开发
 * - 交互式问答系统
 */

import { OpenAI } from "@langchain/openai";
import { ConversationChain } from "@langchain/classic/chains";

const model = new OpenAI({});
const chain = new ConversationChain({ llm: model });
const res1 = await chain.invoke({ input: "Hi! I'm Jim." });
console.log({ res1 });
const res2 = await chain.invoke({ input: "What's my name?" });
console.log({ res2 });
