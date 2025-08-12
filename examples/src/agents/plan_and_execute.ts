/**
 * 计划与执行代理示例
 * 
 * 这个文件演示了如何使用 LangChain 的计划与执行代理来处理复杂的多步骤任务。
 * 主要功能：
 * 
 * 1. 计划与执行架构：
 *    - 使用 PlanAndExecuteAgentExecutor 创建代理
 *    - 将复杂任务分解为多个子任务
 *    - 按计划顺序执行各个步骤
 * 
 * 2. 双阶段处理模式：
 *    - 计划阶段：分析任务并制定执行计划
 *    - 执行阶段：按计划逐步执行各个子任务
 *    - 动态调整和优化执行策略
 * 
 * 3. 多工具协作：
 *    - Calculator：提供数学计算功能
 *    - SerpAPI：提供实时搜索引擎查询
 *    - 自动选择合适的工具完成子任务
 * 
 * 4. 智能任务分解：
 *    - 自动识别任务的依赖关系
 *    - 将复杂问题拆分为简单步骤
 *    - 确保执行顺序的逻辑性
 * 
 * 5. ChatOpenAI 集成：
 *    - 使用 GPT-3.5-turbo 模型
 *    - 启用详细模式显示执行过程
 *    - 温度设为 0 确保计划的一致性
 * 
 * 6. 实际应用示例：
 *    - 查询 "美国现任总统是谁？"
 *    - 计算 "其年龄的平方"
 *    - 展示搜索+计算的组合任务
 * 
 * 7. 复杂任务处理：
 *    - 处理需要多步推理的问题
 *    - 自动协调不同工具的使用
 *    - 确保任务完成的准确性
 * 
 * 8. 实验性功能：
 *    - 属于 LangChain 的实验性模块
 *    - 展示先进的代理架构设计
 *    - 适合复杂的自动化场景
 * 
 * 使用场景：
 * - 复杂的研究和分析任务
 * - 多步骤的数据处理流程
 * - 自动化的工作流程
 * - 智能项目管理
 * - 复杂问题的系统性解决
 * - 教育和培训中的问题分解
 */

import { Calculator } from "@langchain/community/tools/calculator";
import { ChatOpenAI } from "@langchain/openai";
import { PlanAndExecuteAgentExecutor } from "langchain/experimental/plan_and_execute";
import { SerpAPI } from "@langchain/community/tools/serpapi";

const tools = [new Calculator(), new SerpAPI()];
const model = new ChatOpenAI({
  temperature: 0,
  model: "gpt-3.5-turbo",
  verbose: true,
});
const executor = await PlanAndExecuteAgentExecutor.fromLLMAndTools({
  llm: model,
  tools,
});

const result = await executor.invoke({
  input: `Who is the current president of the United States? What is their current age raised to the second power?`,
});

console.log({ result });
