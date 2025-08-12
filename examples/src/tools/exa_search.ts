/**
 * Exa 搜索工具与智能代理集成示例
 * 
 * 这个文件演示了如何将 Exa 搜索工具集成到 LangChain 智能代理中。
 * 主要功能：
 * 
 * 1. Exa 搜索配置：
 *    - 配置 Exa 搜索 API 客户端
 *    - 设置 API 密钥认证
 *    - 创建搜索结果工具
 * 
 * 2. 智能代理集成：
 *    - 使用 OpenAI 函数调用代理
 *    - 从 LangChain Hub 获取提示模板
 *    - 配置代理执行器
 * 
 * 3. 搜索功能：
 *    - 执行高质量的网络搜索
 *    - 获取相关和准确的搜索结果
 *    - 智能筛选和排序结果
 * 
 * 4. 实际应用：
 *    - 天气信息查询
 *    - 实时信息检索
 *    - 网络内容搜索
 * 
 * 使用场景：
 * - 高质量信息检索
 * - 智能搜索助手
 * - 实时数据查询
 * - 研究和分析工具
 */

import { ExaSearchResults } from "@langchain/exa";
import { ChatOpenAI } from "@langchain/openai";
import type { ChatPromptTemplate } from "@langchain/core/prompts";
import Exa from "exa-js";
import { pull } from "langchain/hub";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";

// Define the tools the agent will have access to.
const tools = [
  new ExaSearchResults({
    // @ts-expect-error Some TS Config's will cause this to give a TypeScript error, even though it works.
    client: new Exa(process.env.EXASEARCH_API_KEY),
  }),
];

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
  output: 'I found a weather forecast for Wailea-Makena on Windfinder.com. You can check the forecast [here](https://www.windfinder.com/forecast/wailea-makena).'
}
*/
