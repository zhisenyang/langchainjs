/**
 * 代理工具基础示例
 * 
 * 这个文件演示了如何在 LangChain 代理系统中使用和配置工具的基础概念。
 * 主要功能：
 * 
 * 1. 工具实例化：
 *    - 创建 WikipediaQueryRun 工具实例
 *    - 配置工具的基本参数
 *    - 设置结果数量和内容长度限制
 * 
 * 2. 工具配置参数：
 *    - topKResults: 限制返回的搜索结果数量为 1
 *    - maxDocContentLength: 限制文档内容长度为 100 字符
 *    - 优化性能和响应速度
 * 
 * 3. 工具属性检查：
 *    - name: 工具的名称标识
 *    - description: 工具的功能描述
 *    - returnDirect: 是否直接返回结果
 * 
 * 4. 工具调用演示：
 *    - 使用 invoke 方法调用工具
 *    - 传入查询参数 "Langchain"
 *    - 获取 Wikipedia 搜索结果
 * 
 * 5. 工具元数据：
 *    - 自动生成的工具名称和描述
 *    - 工具行为配置信息
 *    - 便于代理系统理解和使用
 * 
 * 6. 实际应用价值：
 *    - 为代理提供外部知识访问
 *    - 扩展代理的信息检索能力
 *    - 支持实时信息查询
 * 
 * 使用场景：
 * - 代理工具开发和测试
 * - 工具配置和优化
 * - 知识检索系统
 * - 教育和学习助手
 * - 研究和分析工具
 * - 信息验证和核查
 */

import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query_run";

const tool = new WikipediaQueryRun({
  topKResults: 1,
  maxDocContentLength: 100,
});

console.log(tool.name);

console.log(tool.description);

console.log(tool.returnDirect);

const res = await tool.invoke("Langchain");

console.log(res);
