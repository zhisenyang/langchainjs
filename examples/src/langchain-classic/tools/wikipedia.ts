/**
 * Wikipedia 查询工具示例
 * 
 * 这个文件演示了如何使用 LangChain 的 Wikipedia 查询工具。
 * 主要功能：
 * - 配置 Wikipedia 查询工具的参数
 * - 设置返回结果数量限制（topKResults）
 * - 设置文档内容长度限制（maxDocContentLength）
 * - 执行 Wikipedia 搜索查询
 * - 展示查询结果的处理方式
 * 
 * 使用场景：
 * - 获取百科知识信息
 * - 为智能代理提供知识检索能力
 * - 集成到问答系统中
 */

import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";

const tool = new WikipediaQueryRun({
  topKResults: 3,
  maxDocContentLength: 4000,
});

const res = await tool.invoke("Langchain");

console.log(res);
