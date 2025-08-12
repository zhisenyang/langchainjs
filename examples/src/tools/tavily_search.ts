/**
 * Tavily 搜索工具与智能代理集成示例
 * 
 * 这个文件演示了如何将 Tavily 搜索工具集成到 LangChain 智能代理中。
 * 主要功能：
 * - 配置 Tavily 搜索工具，限制搜索结果数量
 * - 创建 OpenAI 函数调用代理
 * - 集成搜索工具到代理执行器中
 * - 演示实时网络搜索查询（如天气信息）
 * - 展示代理如何自动选择和使用搜索工具
 * 
 * 使用场景：
 * - 实时信息查询（天气、新闻、股价等）
 * - 为聊天机器人提供最新信息检索能力
 * - 构建需要网络搜索功能的智能助手
 */

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatOpenAI } from "@langchain/openai";
import type { ChatPromptTemplate } from "@langchain/core/prompts";

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
  input: "what is the weather in wailea?",
});

console.log(result);

/*
  {
    input: 'what is the weather in wailea?',
    output: "The current weather in Wailea, HI is 64°F with clear skies. The high for today is 82°F and the low is 66°F. If you'd like more detailed information, you can visit [The Weather Channel](https://weather.com/weather/today/l/Wailea+HI?canonicalCityId=ffa9df9f7220c7e22cbcca3dc0a6c402d9c740c755955db833ea32a645b2bcab)."
  }
*/
