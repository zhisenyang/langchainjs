/**
 * OpenAI 函数调用代理示例
 * 
 * 这个文件演示了如何使用 LangChain 创建基于 OpenAI 函数调用的智能代理系统。
 * 主要功能：
 * 
 * 1. OpenAI 函数代理配置：
 *    - 使用 createOpenAIFunctionsAgent 创建函数调用代理
 *    - 集成 ChatOpenAI 模型支持函数调用
 *    - 从 LangChain Hub 获取预配置的提示模板
 * 
 * 2. 工具集成：
 *    - 集成 Tavily 搜索工具进行实时信息检索
 *    - 限制搜索结果数量为 1 个
 *    - 支持自动工具选择和调用
 * 
 * 3. 模型配置：
 *    - 使用 GPT-3.5-turbo-1106 模型
 *    - 设置温度为 0 确保输出一致性
 *    - 支持函数调用和工具使用
 * 
 * 4. 代理执行器：
 *    - 创建 AgentExecutor 管理代理和工具
 *    - 自动处理工具调用和结果整合
 *    - 支持复杂的多步骤推理
 * 
 * 5. 对话历史支持：
 *    - 支持无历史的单轮查询
 *    - 支持带有聊天历史的多轮对话
 *    - 自动维护对话上下文
 * 
 * 6. 实际应用示例：
 *    - 查询 "什么是 LangChain？"
 *    - 基于对话历史回答个人信息
 *    - 演示上下文感知的回答能力
 * 
 * 使用场景：
 * - 智能问答系统
 * - 实时信息检索助手
 * - 多轮对话机器人
 * - 知识库查询系统
 * - 客服自动化
 * - 研究和学习助手
 */

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatOpenAI } from "@langchain/openai";
import type { ChatPromptTemplate } from "@langchain/core/prompts";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

import { pull } from "langchain/hub";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";

// Define the tools the agent will have access to.
const tools = [new TavilySearchResults({ maxResults: 1 })];

// Get the prompt to use - you can modify this!
// If you want to see the prompt in full, you can at:
// https://smith.langchain.com/hub/hwchase17/openai-functions-agent
const prompt = await pull<ChatPromptTemplate>(
  "hwchase17/openai-functions-agent"
);

const llm = new ChatOpenAI({
  model: "gpt-3.5-turbo-1106",
  temperature: 0,
});

const agent = await createOpenAIFunctionsAgent({
  llm,
  tools,
  prompt,
});

const agentExecutor = new AgentExecutor({
  agent,
  tools,
});

const result = await agentExecutor.invoke({
  input: "what is LangChain?",
});

console.log(result);

const result2 = await agentExecutor.invoke({
  input: "what's my name?",
  chat_history: [
    new HumanMessage("hi! my name is cob"),
    new AIMessage("Hello Cob! How can I assist you today?"),
  ],
});

console.log(result2);
