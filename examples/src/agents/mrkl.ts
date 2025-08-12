/**
 * MRKL 代理示例
 *
 * 这个文件演示了如何使用 LangChain 创建 MRKL（Modular Reasoning, Knowledge and Language）代理系统。
 * 主要功能：
 *
 * 1. MRKL 代理架构：
 *    - 使用 initializeAgentExecutorWithOptions 创建代理
 *    - 采用 "zero-shot-react-description" 代理类型
 *    - 支持模块化推理和知识整合
 *
 * 2. 多工具集成：
 *    - SerpAPI：提供实时搜索引擎查询功能
 *    - Calculator：提供数学计算能力
 *    - 自动选择合适的工具解决问题
 *
 * 3. 搜索引擎配置：
 *    - 配置地理位置为德克萨斯州奥斯汀
 *    - 设置语言为英语，地区为美国
 *    - 支持本地化的搜索结果
 *
 * 4. Zero-Shot ReAct 模式：
 *    - 无需示例即可理解任务
 *    - 推理-行动-观察的循环模式
 *    - 基于工具描述自动选择工具
 *
 * 5. 复杂查询处理：
 *    - 多步骤问题分解和解决
 *    - 结合搜索和计算的复合任务
 *    - 自动协调不同工具的使用
 *
 * 6. 实际应用示例：
 *    - 查询 "Olivia Wilde 的男朋友是谁？"
 *    - 计算其年龄的 0.23 次方
 *    - 展示搜索+计算的组合应用
 *
 * 7. 详细执行跟踪：
 *    - 启用 verbose 模式显示详细过程
 *    - 跟踪每个推理和行动步骤
 *    - 便于理解代理的决策过程
 *
 * 使用场景：
 * - 复杂的研究和分析任务
 * - 需要多种工具协作的问题
 * - 实时信息查询和计算
 * - 智能助手和问答系统
 * - 数据收集和分析
 * - 教育和学习辅助
 */

import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { OpenAI } from "@langchain/openai";
import { Calculator } from "@langchain/community/tools/calculator";
import { SerpAPI } from "@langchain/community/tools/serpapi";

const model = new OpenAI({ temperature: 0 });
const tools = [
  new SerpAPI(process.env.SERPAPI_API_KEY, {
    location: "Austin,Texas,United States",
    hl: "en",
    gl: "us",
  }),
  new Calculator(),
];

const executor = await initializeAgentExecutorWithOptions(tools, model, {
  agentType: "zero-shot-react-description",
  verbose: true,
});

const input = `Who is Olivia Wilde's boyfriend? What is his current age raised to the 0.23 power?`;

const result = await executor.invoke({ input });

console.log(result);

/*
  { output: '2.2800773226742175' }
*/
