/**
 * DuckDuckGo 搜索工具简单示例
 * 
 * 这个文件演示了如何使用 LangChain 的 DuckDuckGo 搜索工具进行网络搜索。
 * 主要功能：
 * - 配置 DuckDuckGo 搜索工具
 * - 设置搜索结果数量限制
 * - 执行搜索查询并获取结果
 * - 展示搜索结果的格式和内容
 * 
 * 搜索结果包含：
 * - 标题 (title)
 * - 链接 (link)  
 * - 摘要片段 (snippet)
 * 
 * 使用场景：
 * - 实时信息检索
 * - 为智能代理提供搜索能力
 * - 获取最新的网络信息
 * - 事实核查和信息验证
 */

import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";

// Instantiate the DuckDuckGoSearch tool.
const tool = new DuckDuckGoSearch({ maxResults: 1 });

// Get the results of a query by calling .invoke on the tool.
const result = await tool.invoke(
  "What is Anthropic's estimated revenue for 2024?"
);

console.log(result);
/*
[{
  "title": "Anthropic forecasts more than $850 mln in annualized revenue rate by ...",
  "link": "https://www.reuters.com/technology/anthropic-forecasts-more-than-850-mln-annualized-revenue-rate-by-2024-end-report-2023-12-26/",
  "snippet": "Dec 26 (Reuters) - Artificial intelligence startup <b>Anthropic</b> has projected it will generate more than $850 million in annualized <b>revenue</b> by the end of <b>2024</b>, the Information reported on Tuesday ..."
}]
*/
