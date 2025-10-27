/**
 * 控制台回调处理器示例
 *
 * 这个文件演示了如何使用 LangChain 内置的 ConsoleCallbackHandler 来监控和调试应用执行。
 * 主要功能：
 *
 * 1. 控制台回调处理器：
 *    - 使用内置的 ConsoleCallbackHandler
 *    - 自动输出执行过程到控制台
 *    - 提供标准化的日志格式
 *
 * 2. LLM 模型集成：
 *    - 在 OpenAI 模型初始化时添加回调
 *    - 监控模型的调用和响应
 *    - 跟踪 API 请求的执行状态
 *
 * 3. 链式处理监控：
 *    - 在 LLMChain 中集成回调处理器
 *    - 监控整个链的执行流程
 *    - 记录链的开始和结束状态
 *
 * 4. 执行跟踪功能：
 *    - 自动生成运行 ID (runId)
 *    - 跟踪每次执行的唯一标识
 *    - 支持分布式系统的调用追踪
 *
 * 5. 调试信息输出：
 *    - 显示链的进入和退出信息
 *    - 输出执行结果和状态
 *    - 提供详细的执行日志
 *
 * 6. 实际应用示例：
 *    - 简单的数学计算提示
 *    - 演示完整的执行流程
 *    - 展示回调的实际效果
 *
 * 使用场景：
 * - 开发阶段的调试和测试
 * - 生产环境的监控和日志
 * - 性能分析和优化
 * - 错误追踪和诊断
 * - 执行流程的可视化
 * - 系统健康状态监控
 */
import { LLMChain } from "@langchain/classic/chains";
import { OpenAI } from "@langchain/openai";
import { ConsoleCallbackHandler } from "@langchain/core/tracers/console";
import { PromptTemplate } from "@langchain/core/prompts";

export const run = async () => {
  const handler = new ConsoleCallbackHandler();
  const llm = new OpenAI({ temperature: 0, callbacks: [handler] });
  const prompt = PromptTemplate.fromTemplate("1 + {number} =");
  const chain = new LLMChain({ prompt, llm, callbacks: [handler] });

  const output = await chain.invoke({ number: 2 });
  /*
  Entering new llm_chain chain...
  Finished chain.
  */

  console.log(output);
  /*
  { text: ' 3\n\n3 - 1 = 2' }
   */

  // The non-enumerable key `__run` contains the runId.
  console.log(output.__run);
  /*
  { runId: '90e1f42c-7cb4-484c-bf7a-70b73ef8e64b' }
  */
};
