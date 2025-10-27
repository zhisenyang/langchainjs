/**
 * 自定义回调处理器示例
 * 
 * 这个文件演示了如何创建自定义的回调处理器来监控和记录 LangChain 应用的执行过程。
 * 主要功能：
 * 
 * 1. 自定义回调处理器类：
 *    - 继承 BaseCallbackHandler 基类
 *    - 实现各种生命周期回调方法
 *    - 提供自定义的监控和日志功能
 * 
 * 2. 链式处理监控：
 *    - handleChainStart: 监控链开始执行
 *    - handleChainEnd: 监控链执行完成
 *    - 记录链的 ID 和执行状态
 * 
 * 3. 代理行为监控：
 *    - handleAgentAction: 监控代理动作执行
 *    - handleAgentEnd: 监控代理执行完成
 *    - 记录代理的决策和行为日志
 * 
 * 4. 工具调用监控：
 *    - handleToolEnd: 监控工具执行结果
 *    - 记录工具的输出和状态
 *    - 跟踪工具调用的性能
 * 
 * 5. 文本处理监控：
 *    - handleText: 监控文本处理过程
 *    - 记录中间文本输出
 *    - 调试文本生成流程
 * 
 * 6. 实际应用价值：
 *    - 调试和故障排除
 *    - 性能监控和优化
 *    - 执行流程可视化
 *    - 日志记录和审计
 * 
 * 使用场景：
 * - 应用调试和开发
 * - 性能监控和分析
 * - 执行流程跟踪
 * - 错误诊断和排查
 * - 用户行为分析
 * - 系统审计和合规
 */

import { Serialized } from "@langchain/core/load/serializable";
import { BaseCallbackHandler } from "@langchain/core/callbacks/base";
import { AgentAction, AgentFinish } from "@langchain/core/agents";
import { ChainValues } from "@langchain/core/utils/types";

export class MyCallbackHandler extends BaseCallbackHandler {
  name = "MyCallbackHandler";

  async handleChainStart(chain: Serialized) {
    console.log(`Entering new ${chain.id} chain...`);
  }

  async handleChainEnd(_output: ChainValues) {
    console.log("Finished chain.");
  }

  async handleAgentAction(action: AgentAction) {
    console.log(action.log);
  }

  async handleToolEnd(output: string) {
    console.log(output);
  }

  async handleText(text: string) {
    console.log(text);
  }

  async handleAgentEnd(action: AgentFinish) {
    console.log(action.log);
  }
}
