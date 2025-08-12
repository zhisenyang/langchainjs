/**
 * XML 代理示例
 *
 * 这个文件演示了如何使用 LangChain 创建基于 XML 格式的智能代理系统。
 * 主要功能：
 *
 * 1. XML 代理架构：
 *    - 使用 createXmlAgent 创建 XML 格式代理
 *    - 支持结构化的 XML 输入输出
 *    - 适合需要格式化响应的应用场景
 *
 * 2. Anthropic Claude 集成：
 *    - 使用 ChatAnthropic 和 Claude-3-Opus 模型
 *    - 设置温度为 0 确保输出一致性
 *    - 利用 Claude 的强大推理能力
 *
 * 3. 工具配置：
 *    - 集成 Tavily 搜索工具
 *    - 限制搜索结果数量为 1 个
 *    - 支持实时信息检索
 *
 * 4. XML 提示模板：
 *    - 从 LangChain Hub 获取 XML 对话提示
 *    - 使用 "hwchase17/xml-agent-convo" 模板
 *    - 专门优化的 XML 格式提示
 *
 * 5. 结构化输出：
 *    - 生成 XML 格式的响应
 *    - 支持复杂的数据结构表示
 *    - 便于程序化处理和解析
 *
 * 6. 对话历史处理：
 *    - 支持无历史的单轮查询
 *    - 支持字符串格式的对话历史
 *    - 适合 LLM 而非聊天模型的格式
 *
 * 7. 实际应用示例：
 *    - 查询 "什么是 LangChain？"
 *    - 基于对话历史回答个人信息
 *    - 展示 XML 格式的智能回答
 *
 * 8. XML 格式优势：
 *    - 结构化的数据表示
 *    - 易于解析和处理
 *    - 支持复杂的嵌套结构
 *    - 标准化的数据交换格式
 *
 * 使用场景：
 * - 需要结构化输出的应用
 * - API 集成和数据交换
 * - 企业级系统集成
 * - 配置文件生成
 * - 报告和文档生成
 * - 数据转换和处理
 */

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { AgentExecutor, createXmlAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import type { PromptTemplate } from "@langchain/core/prompts";

import { ChatAnthropic } from "@langchain/anthropic";

// Define the tools the agent will have access to.
const tools = [new TavilySearchResults({ maxResults: 1 })];

// Get the prompt to use - you can modify this!
// If you want to see the prompt in full, you can at:
// https://smith.langchain.com/hub/hwchase17/xml-agent-convo
const prompt = await pull<PromptTemplate>("hwchase17/xml-agent-convo");

const llm = new ChatAnthropic({
  model: "claude-3-opus-20240229",
  temperature: 0,
});

const agent = await createXmlAgent({
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
  // Notice that chat_history is a string, since this prompt is aimed at LLMs, not chat models
  chat_history: "Human: Hi! My name is Cob\nAI: Hello Cob! Nice to meet you",
});

console.log(result2);
