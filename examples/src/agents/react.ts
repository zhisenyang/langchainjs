/**
 * ReAct 代理示例
 * 
 * 这个文件演示了如何使用 LangChain 创建基于 ReAct（Reasoning and Acting）模式的智能代理。
 * 主要功能：
 * 
 * 1. ReAct 代理架构：
 *    - 使用 createReactAgent 创建推理-行动代理
 *    - 结合推理和行动的循环模式
 *    - 支持多步骤问题解决
 * 
 * 2. LLM 模型配置：
 *    - 使用 OpenAI GPT-3.5-turbo-instruct 模型
 *    - 设置温度为 0 确保推理的一致性
 *    - 适合文本生成和推理任务
 * 
 * 3. 工具集成：
 *    - 集成 Tavily 搜索工具
 *    - 限制搜索结果为 1 个
 *    - 支持实时信息检索
 * 
 * 4. 提示模板管理：
 *    - 从 LangChain Hub 获取标准 ReAct 提示
 *    - 支持基础 ReAct 模式和聊天模式
 *    - 可自定义提示模板
 * 
 * 5. 双模式支持：
 *    - 基础模式：适用于单轮查询
 *    - 聊天模式：支持对话历史和上下文
 *    - 灵活的交互方式
 * 
 * 6. ReAct 工作流程：
 *    - Thought（思考）：分析问题和制定计划
 *    - Action（行动）：执行工具调用
 *    - Observation（观察）：分析工具结果
 *    - 循环直到得出最终答案
 * 
 * 7. 实际应用示例：
 *    - 查询 LangChain 相关信息
 *    - 基于对话历史的个人信息查询
 *    - 演示推理和行动的结合
 * 
 * 使用场景：
 * - 复杂问题解决
 * - 多步骤推理任务
 * - 研究和分析助手
 * - 智能搜索和总结
 * - 决策支持系统
 * - 教育和学习辅助
 */

import { OpenAI } from "@langchain/openai";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import type { PromptTemplate } from "@langchain/core/prompts";

import { pull } from "langchain/hub";
import { AgentExecutor, createReactAgent } from "langchain/agents";

// Define the tools the agent will have access to.
const tools = [new TavilySearchResults({ maxResults: 1 })];

const llm = new OpenAI({
  model: "gpt-3.5-turbo-instruct",
  temperature: 0,
});

// Get the prompt to use - you can modify this!
// If you want to see the prompt in full, you can at:
// https://smith.langchain.com/hub/hwchase17/react
const prompt = await pull<PromptTemplate>("hwchase17/react");

const agent = await createReactAgent({
  llm,
  tools,
  prompt,
});

const agentExecutor = new AgentExecutor({
  agent,
  tools,
});

// See public LangSmith trace here: https://smith.langchain.com/public/d72cc476-e88f-46fa-b768-76b058586cc1/r
const result = await agentExecutor.invoke({
  input: "what is LangChain?",
});

console.log(result);

// Get the prompt to use - you can modify this!
// If you want to see the prompt in full, you can at:
// https://smith.langchain.com/hub/hwchase17/react-chat
const promptWithChat = await pull<PromptTemplate>("hwchase17/react-chat");

const agentWithChat = await createReactAgent({
  llm,
  tools,
  prompt: promptWithChat,
});

const agentExecutorWithChat = new AgentExecutor({
  agent: agentWithChat,
  tools,
});

const result2 = await agentExecutorWithChat.invoke({
  input: "what's my name?",
  // Notice that chat_history is a string, since this prompt is aimed at LLMs, not chat models
  chat_history: "Human: Hi! My name is Cob\nAI: Hello Cob! Nice to meet you",
});

console.log(result2);
