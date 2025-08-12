/**
 * 自定义代理构建示例
 *
 * 这个文件演示了如何使用 LangChain 的底层组件构建完全自定义的智能代理系统。
 * 主要功能：
 *
 * 1. 自定义工具创建：
 *    - 使用 DynamicTool 创建自定义工具
 *    - 实现单词长度计算功能
 *    - 支持异步工具函数
 *
 * 2. 自定义提示模板：
 *    - 使用 ChatPromptTemplate 构建提示结构
 *    - 集成 MessagesPlaceholder 处理代理记录
 *    - 支持系统消息和用户输入
 *
 * 3. 可运行代理序列：
 *    - 使用 RunnableSequence 构建代理流水线
 *    - 格式化代理步骤为 OpenAI 函数消息
 *    - 集成输出解析器处理响应
 *
 * 4. 工具绑定和集成：
 *    - 将工具绑定到 LLM 模型
 *    - 支持函数调用和工具选择
 *    - 自动处理工具调用结果
 *
 * 5. 代理执行器：
 *    - 创建 AgentExecutor 管理代理和工具
 *    - 支持复杂的多步骤推理
 *    - 自动处理工具调用循环
 *
 * 6. 内存集成代理：
 *    - 构建带有对话记忆的代理
 *    - 使用聊天历史维护上下文
 *    - 支持多轮对话和上下文引用
 *
 * 7. 双模式演示：
 *    - 基础模式：单轮工具调用
 *    - 内存模式：多轮对话和上下文记忆
 *    - 展示不同的代理行为模式
 *
 * 8. 实际应用场景：
 *    - 单词长度计算工具调用
 *    - 基于对话历史的后续问题
 *    - 演示上下文感知的回答能力
 *
 * 使用场景：
 * - 自定义代理开发
 * - 复杂工具集成
 * - 多轮对话系统
 * - 专业领域助手
 * - 工作流自动化
 * - 教育和培训工具
 */

import { ChatOpenAI } from "@langchain/openai";
import { RunnableSequence } from "@langchain/core/runnables";
import { AgentExecutor } from "langchain/agents";
import { formatToOpenAIFunctionMessages } from "langchain/agents/format_scratchpad";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { OpenAIFunctionsAgentOutputParser } from "langchain/agents/openai/output_parser";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { DynamicTool } from "@langchain/core/tools";
import { AgentStep } from "@langchain/core/agents";

/**
 * Define your chat model to use.
 */
// 初始化 OpenAI 聊天模型（零温度确保确定性输出）
const model = new ChatOpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

// 自定义工具：计算输入单词的长度（演示如何注入任意业务能力）
const customTool = new DynamicTool({
  name: "get_word_length",
  description: "Returns the length of a word.",
  func: async (input: string) => input.length.toString(),
});

/** Define your list of tools. */
// 工具列表（可扩展为多个工具）
const tools = [customTool];

/**
 * Define your prompt for the agent to follow
 * Here we're using `MessagesPlaceholder` to contain our agent scratchpad
 * This is important as later we'll use a util function which formats the agent
 * steps into a list of `BaseMessages` which can be passed into `MessagesPlaceholder`
 */
// 代理提示模板：包含系统信息、用户输入与 agent_scratchpad 占位符
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are very powerful assistant, but don't know current events"],
  ["human", "{input}"],
  new MessagesPlaceholder("agent_scratchpad"),
]);

/**
 * Bind the tools to the LLM.
 */
// 将工具绑定到 LLM，启用函数/工具调用能力
const modelWithFunctions = model.bindTools(tools);

/**
 * Construct the runnable agent.
 *
 * We're using a `RunnableSequence` which takes two inputs:
 * - input --> the users input
 * - agent_scratchpad --> the previous agent steps
 *
 * We're using the `formatForOpenAIFunctions` util function to format the agent
 * steps into a list of `BaseMessages` which can be passed into `MessagesPlaceholder`
 */
// 构建可运行代理：将步骤格式化为 OpenAI 函数消息，然后交由模型与解析器处理
const runnableAgent = RunnableSequence.from([
  {
    // 从输入对象中取出用户输入与步骤记录
    input: (i: { input: string; steps: AgentStep[] }) => i.input,
    agent_scratchpad: (i: { input: string; steps: AgentStep[] }) =>
      formatToOpenAIFunctionMessages(i.steps),
  },
  prompt,
  modelWithFunctions,
  new OpenAIFunctionsAgentOutputParser(),
]);
/** Pass the runnable along with the tools to create the Agent Executor */
// 创建执行器：自动处理工具调用循环与中间状态
const executor = AgentExecutor.fromAgentAndTools({
  agent: runnableAgent,
  tools,
});

console.log("Loaded agent executor");

// 示例 1：基础模式（无记忆）
const input = "How many letters in the word educa?";
console.log(`Calling agent executor with query: ${input}`);
const result = await executor.invoke({
  input,
});
console.log(result);
/*
  {
    input: 'How many letters in the word educa?',
    output: 'There are 5 letters in the word "educa".'
  }
*/

// 启用对话记忆的键名（与 MessagesPlaceholder 对应）
const MEMORY_KEY = "chat_history";
// 记忆模式的提示模板：把历史对话注入，模拟“有记忆”的助手
const memoryPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are very powerful assistant, but bad at calculating lengths of words.",
  ],
  new MessagesPlaceholder(MEMORY_KEY),
  ["user", "{input}"],
  new MessagesPlaceholder("agent_scratchpad"),
]);

// 简单的内存容器（在真实应用中可替换为更持久的存储）
const chatHistory: BaseMessage[] = [];

// 构建带记忆的代理：显式传入 chat_history 供提示模板使用
const agentWithMemory = RunnableSequence.from([
  {
    input: (i: {
      input: string;
      steps: AgentStep[];
      chat_history: BaseMessage[];
    }) => i.input,
    agent_scratchpad: (i: {
      input: string;
      steps: AgentStep[];
      chat_history: BaseMessage[];
    }) => formatToOpenAIFunctionMessages(i.steps),
    chat_history: (i: {
      input: string;
      steps: AgentStep[];
      chat_history: BaseMessage[];
    }) => i.chat_history,
  },
  memoryPrompt,
  modelWithFunctions,
  new OpenAIFunctionsAgentOutputParser(),
]);
/** Pass the runnable along with the tools to create the Agent Executor */
// 创建带记忆的执行器
const executorWithMemory = AgentExecutor.fromAgentAndTools({
  agent: agentWithMemory,
  tools,
});

// 示例 2：记忆模式（多轮对话）
const input1 = "how many letters in the word educa?";
const result1 = await executorWithMemory.invoke({
  input: input1,
  chat_history: chatHistory,
});

console.log(result1);

chatHistory.push(new HumanMessage(input1));
// 注意：这里应使用上一轮记忆模式的输出 result1.output，而非基础模式的 result.output
chatHistory.push(new AIMessage(result1.output));

const result2 = await executorWithMemory.invoke({
  input: "is that a real English word?",
  chat_history: chatHistory,
});

console.log(result2);
