/**
 * 结构化聊天代理示例
 * 
 * 这个文件演示了如何使用 LangChain 创建结构化聊天代理，支持复杂的工具调用和对话管理。
 * 主要功能：
 * 
 * 1. 结构化聊天代理：
 *    - 使用 createStructuredChatAgent 创建代理
 *    - 支持结构化的输入和输出格式
 *    - 适合复杂的多工具协作场景
 * 
 * 2. 聊天模型集成：
 *    - 使用 ChatOpenAI GPT-3.5-turbo-1106 模型
 *    - 设置温度为 0 确保输出一致性
 *    - 支持聊天格式的交互
 * 
 * 3. 工具配置：
 *    - 集成 Tavily 搜索工具
 *    - 限制搜索结果数量为 1 个
 *    - 支持实时信息检索
 * 
 * 4. 提示模板管理：
 *    - 从 LangChain Hub 获取结构化聊天代理提示
 *    - 使用预配置的专业提示模板
 *    - 支持自定义提示优化
 * 
 * 5. 对话历史处理：
 *    - 支持无历史的单轮查询
 *    - 支持带有聊天历史的多轮对话
 *    - 自动维护对话上下文和连续性
 * 
 * 6. 结构化输出：
 *    - 生成格式化的响应结构
 *    - 支持复杂的数据类型处理
 *    - 便于下游系统集成
 * 
 * 7. 实际应用示例：
 *    - 查询 "什么是 LangChain？"
 *    - 基于对话历史回答个人信息
 *    - 演示上下文感知的智能回答
 * 
 * 使用场景：
 * - 企业级聊天机器人
 * - 复杂的客服自动化
 * - 多工具协作系统
 * - 结构化数据查询
 * - 智能助手平台
 * - API 集成和自动化
 */

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { AgentExecutor, createStructuredChatAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import type { ChatPromptTemplate } from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

import { ChatOpenAI } from "@langchain/openai";

// Define the tools the agent will have access to.
const tools = [new TavilySearchResults({ maxResults: 1 })];

// Get the prompt to use - you can modify this!
// If you want to see the prompt in full, you can at:
// https://smith.langchain.com/hub/hwchase17/structured-chat-agent
const prompt = await pull<ChatPromptTemplate>(
  "hwchase17/structured-chat-agent"
);

const llm = new ChatOpenAI({
  model: "gpt-3.5-turbo-1106",
  temperature: 0,
});

const agent = await createStructuredChatAgent({
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
