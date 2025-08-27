/**
 * LLM 链流式输出示例
 * 
 * 这个文件演示了如何使用 LLMChain 实现流式文本生成和实时输出。
 * 主要功能：
 * 
 * 1. 流式 LLM 配置：
 *    - 创建支持流式输出的 OpenAI 模型
 *    - 设置温度参数为 0.9（增加创造性）
 *    - 启用 streaming 模式
 * 
 * 2. 实时文本输出：
 *    - 使用 handleLLMNewToken 回调
 *    - 逐个 token 实时显示
 *    - 直接输出到控制台
 * 
 * 3. 链式流式处理：
 *    - 结合 PromptTemplate 和流式 LLM
 *    - 支持动态变量替换
 *    - 保持完整的链式处理能力
 * 
 * 4. 回调机制：
 *    - 自定义 token 处理逻辑
 *    - 支持多个回调函数
 *    - 灵活的事件处理
 * 
 * 5. 实际应用场景：
 *    - 实时聊天界面
 *    - 打字机效果展示
 *    - 长文本生成进度显示
 * 
 * 使用场景：
 * - 实时对话系统
 * - 流式内容生成
 * - 交互式文本创建
 * - 用户体验优化
 * - 响应式 AI 应用
 */

import { OpenAI } from "@langchain/openai";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";

// 从 PromptTemplate 和流式模式的 LLM 创建一个新的 LLMChain。
const model = new OpenAI({ temperature: 0.9, streaming: true });
const prompt = PromptTemplate.fromTemplate(
  "What is a good name for a company that makes {product}?"
);
const chain = new LLMChain({ llm: model, prompt });

// 使用输入和流式 token 的回调调用链
const res = await chain.invoke(
  { product: "colorful socks" },
  {
    callbacks: [
      {
        handleLLMNewToken(token: string) {
          process.stdout.write(token);
        },
      },
    ],
  }
);
console.log({ res });
// { res: { text: '\n\nKaleidoscope Socks' } }
