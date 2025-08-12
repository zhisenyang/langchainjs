/**
 * 流式代理与回调处理示例
 * 
 * 这个文件演示了如何在 LangChain 代理系统中实现流式处理和自定义回调处理器。
 * 主要功能：
 * 
 * 1. 自定义回调处理器：
 *    - 继承 BaseCallbackHandler 创建自定义处理器
 *    - 实现多种回调方法监控代理执行
 *    - 支持实时 token 流式输出
 * 
 * 2. 回调方法实现：
 *    - handleLLMNewToken: 处理流式 token 输出
 *    - handleLLMStart: 监控 LLM 开始执行
 *    - handleChainStart: 监控链开始执行
 *    - handleAgentAction: 监控代理动作
 *    - handleToolStart: 监控工具开始执行
 * 
 * 3. 多种回调创建方式：
 *    - 类继承方式：完整的自定义回调类
 *    - fromMethods 方式：快速创建回调处理器
 *    - 支持多个回调处理器同时工作
 * 
 * 4. 流式处理配置：
 *    - 启用 ChatOpenAI 的流式模式
 *    - 实时输出 token 生成过程
 *    - 提供更好的用户体验
 * 
 * 5. Zero-Shot 代理：
 *    - 使用 ZeroShotAgent 创建代理
 *    - 集成计算器工具
 *    - 支持数学计算任务
 * 
 * 6. 回调作用域管理：
 *    - 对象级别的回调绑定
 *    - 执行级别的回调传递
 *    - 灵活的回调管理策略
 * 
 * 7. 实际应用演示：
 *    - 计算 "2 的 8 次方"
 *    - 展示完整的执行流程
 *    - 实时监控每个执行步骤
 * 
 * 使用场景：
 * - 实时代理监控和调试
 * - 流式用户界面开发
 * - 性能分析和优化
 * - 用户体验改进
 * - 系统日志和审计
 * - 开发和测试工具
 */

import { LLMChain } from "langchain/chains";
import { AgentExecutor, ZeroShotAgent } from "langchain/agents";
import { ChatOpenAI } from "@langchain/openai";
import { Calculator } from "@langchain/community/tools/calculator";
import { Serialized } from "@langchain/core/load/serializable";
import { BaseCallbackHandler } from "@langchain/core/callbacks/base";
import { AgentAction } from "@langchain/core/agents";

export const run = async () => {
  // You can implement your own callback handler by extending BaseCallbackHandler
  class CustomHandler extends BaseCallbackHandler {
    name = "custom_handler";

    handleLLMNewToken(token: string) {
      console.log("token", { token });
    }

    handleLLMStart(llm: Serialized, _prompts: string[]) {
      console.log("handleLLMStart", { llm });
    }

    handleChainStart(chain: Serialized) {
      console.log("handleChainStart", { chain });
    }

    handleAgentAction(action: AgentAction) {
      console.log("handleAgentAction", action);
    }

    handleToolStart(tool: Serialized) {
      console.log("handleToolStart", { tool });
    }
  }

  const handler1 = new CustomHandler();

  // Additionally, you can use the `fromMethods` method to create a callback handler
  const handler2 = BaseCallbackHandler.fromMethods({
    handleLLMStart(llm, _prompts: string[]) {
      console.log("handleLLMStart: I'm the second handler!!", { llm });
    },
    handleChainStart(chain) {
      console.log("handleChainStart: I'm the second handler!!", { chain });
    },
    handleAgentAction(action) {
      console.log("handleAgentAction", action);
    },
    handleToolStart(tool) {
      console.log("handleToolStart", { tool });
    },
  });

  // You can restrict callbacks to a particular object by passing it upon creation
  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
    callbacks: [handler2], // this will issue handler2 callbacks related to this model
    streaming: true, // needed to enable streaming, which enables handleLLMNewToken
  });

  const tools = [new Calculator()];
  const agentPrompt = ZeroShotAgent.createPrompt(tools);

  const llmChain = new LLMChain({
    llm: model,
    prompt: agentPrompt,
    callbacks: [handler2], // this will issue handler2 callbacks related to this chain
  });
  const agent = new ZeroShotAgent({
    llmChain,
    allowedTools: ["search"],
  });

  const agentExecutor = AgentExecutor.fromAgentAndTools({
    agent,
    tools,
  });

  /*
   * When we pass the callback handler to the agent executor, it will be used for all
   * callbacks related to the agent and all the objects involved in the agent's
   * execution, in this case, the Tool, LLMChain, and LLM.
   *
   * The `handler2` callback handler will only be used for callbacks related to the
   * LLMChain and LLM, since we passed it to the LLMChain and LLM objects upon creation.
   */
  const result = await agentExecutor.invoke(
    {
      input: "What is 2 to the power of 8",
    },
    { callbacks: [handler1] }
  ); // this is needed to see handleAgentAction
  /*
  handleChainStart { chain: { name: 'agent_executor' } }
  handleChainStart { chain: { name: 'llm_chain' } }
  handleChainStart: I'm the second handler!! { chain: { name: 'llm_chain' } }
  handleLLMStart { llm: { name: 'openai' } }
  handleLLMStart: I'm the second handler!! { llm: { name: 'openai' } }
  token { token: '' }
  token { token: 'I' }
  token { token: ' can' }
  token { token: ' use' }
  token { token: ' the' }
  token { token: ' calculator' }
  token { token: ' tool' }
  token { token: ' to' }
  token { token: ' solve' }
  token { token: ' this' }
  token { token: '.\n' }
  token { token: 'Action' }
  token { token: ':' }
  token { token: ' calculator' }
  token { token: '\n' }
  token { token: 'Action' }
  token { token: ' Input' }
  token { token: ':' }
  token { token: ' ' }
  token { token: '2' }
  token { token: '^' }
  token { token: '8' }
  token { token: '' }
  handleAgentAction {
    tool: 'calculator',
    toolInput: '2^8',
    log: 'I can use the calculator tool to solve this.\n' +
      'Action: calculator\n' +
      'Action Input: 2^8'
  }
  handleToolStart { tool: { name: 'calculator' } }
  handleChainStart { chain: { name: 'llm_chain' } }
  handleChainStart: I'm the second handler!! { chain: { name: 'llm_chain' } }
  handleLLMStart { llm: { name: 'openai' } }
  handleLLMStart: I'm the second handler!! { llm: { name: 'openai' } }
  token { token: '' }
  token { token: 'That' }
  token { token: ' was' }
  token { token: ' easy' }
  token { token: '!\n' }
  token { token: 'Final' }
  token { token: ' Answer' }
  token { token: ':' }
  token { token: ' ' }
  token { token: '256' }
  token { token: '' }
  */

  console.log(result);
  /*
  {
    output: '256',
    __run: { runId: '26d481a6-4410-4f39-b74d-f9a4f572379a' }
  }
  */
};
