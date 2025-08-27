/**
 * LLM 链取消操作示例
 * 
 * 这个文件演示了如何在 LLM 链式处理中实现取消操作和流式输出。
 * 主要功能：
 * 
 * 1. 流式 LLM 配置：
 *    - 创建支持流式输出的 OpenAI 模型
 *    - 设置较高的温度参数（0.9）增加创造性
 *    - 启用 streaming 模式
 * 
 * 2. 取消控制机制：
 *    - 使用 AbortController 控制请求取消
 *    - 设置超时自动取消（3秒）
 *    - 通过 signal 参数传递取消信号
 * 
 * 3. 流式输出处理：
 *    - 实时接收和显示 token
 *    - 使用 handleLLMNewToken 回调
 *    - 直接输出到控制台
 * 
 * 4. 错误处理：
 *    - 捕获取消操作异常
 *    - 处理网络中断情况
 *    - 优雅的错误恢复
 * 
 * 5. 实际应用场景：
 *    - 长文本生成的用户控制
 *    - 实时聊天系统
 *    - 可中断的内容生成
 * 
 * 使用场景：
 * - 交互式文本生成
 * - 用户可控的 AI 对话
 * - 长时间运行的生成任务
 * - 实时流式应用
 * - 响应式用户界面
 */

import { OpenAI } from "@langchain/openai";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";

// 从 PromptTemplate 和流式模式的 LLM 创建一个新的 LLMChain。
const model = new OpenAI({ temperature: 0.9, streaming: true });
const prompt = PromptTemplate.fromTemplate(
  "Give me a long paragraph about {product}?"
);
const chain = new LLMChain({ llm: model, prompt });
const controller = new AbortController();

// 在某处调用 `controller.abort()` 来取消请求。
setTimeout(() => {
  controller.abort();
}, 3000);

try {
  // 使用输入和流式 token 的回调调用链
  const res = await chain.invoke(
    { product: "colorful socks", signal: controller.signal },
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
} catch (e) {
  console.log(e);
  // 错误：取消：已取消
}
