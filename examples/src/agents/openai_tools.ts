/**
 * OpenAI 工具代理示例
 * 
 * 这个文件演示了如何使用 LangChain 创建基于 OpenAI 工具调用的智能代理系统。
 * 主要功能：
 * 
 * 1. OpenAI 工具代理：
 *    - 使用 createOpenAIToolsAgent 创建工具代理
 *    - 支持 OpenAI 的原生工具调用功能
 *    - 更高效的工具集成和调用
 * 
 * 2. 工具配置：
 *    - 集成 Tavily 搜索工具
 *    - 限制搜索结果数量为 1 个
 *    - 支持实时信息检索
 * 
 * 3. 模型配置：
 *    - 使用 ChatOpenAI GPT-3.5-turbo-1106 模型
 *    - 设置温度为 0 确保输出一致性
 *    - 支持原生工具调用功能
 * 
 * 4. 提示模板管理：
 *    - 从 LangChain Hub 获取专用工具代理提示
 *    - 使用 "hwchase17/openai-tools-agent" 模板
 *    - 优化的工具调用提示结构
 * 
 * 5. 代理执行器：
 *    - 创建 AgentExecutor 管理代理和工具
 *    - 自动处理工具调用和结果整合
 *    - 支持复杂的多步骤推理
 * 
 * 6. 对话历史支持：
 *    - 支持无历史的单轮查询
 *    - 支持带有聊天历史的多轮对话
 *    - 自动维护对话上下文
 * 
 * 7. 实际应用示例：
 *    - 查询 "什么是 LangChain？"
 *    - 基于对话历史回答个人信息
 *    - 演示上下文感知的回答能力
 * 
 * 8. 工具调用优势：
 *    - 更快的工具调用响应
 *    - 更准确的工具选择
 *    - 更好的错误处理
 *    - 原生 OpenAI 集成
 * 
 * 使用场景：
 * - 高性能智能助手
 * - 实时信息查询系统
 * - 多轮对话机器人
 * - 企业级问答系统
 * - 客服自动化
 * - 研究和分析工具
 */

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatOpenAI } from "@langchain/openai";
import type { ChatPromptTemplate } from "@langchain/core/prompts";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

import { pull } from "langchain/hub";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";

// Define the tools the agent will have access to.
const tools = [new TavilySearchResults({ maxResults: 1 })];

// Get the prompt to use - you can modify this!
// If you want to see the prompt in full, you can at:
// https://smith.langchain.com/hub/hwchase17/openai-tools-agent
const prompt = await pull<ChatPromptTemplate>("hwchase17/openai-tools-agent");

const llm = new ChatOpenAI({
  model: "gpt-3.5-turbo-1106",
  temperature: 0,
});

const agent = await createOpenAIToolsAgent({
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
