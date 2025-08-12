/**
 * Wolfram Alpha 计算工具示例
 * 
 * 这个文件演示了如何使用 LangChain 的 Wolfram Alpha 工具进行数学计算和知识查询。
 * 主要功能：
 * - 配置 Wolfram Alpha API 工具
 * - 执行数学计算查询
 * - 获取计算结果和知识信息
 * - 处理复杂的数学和科学问题
 * 
 * 使用场景：
 * - 数学计算和公式求解
 * - 科学数据查询
 * - 单位转换和换算
 * - 为智能代理提供计算能力
 * - 教育和研究辅助
 */

import { WolframAlphaTool } from "@langchain/community/tools/wolframalpha";

const tool = new WolframAlphaTool({
  appid: "YOUR_APP_ID",
});

const res = await tool.invoke("What is 2 * 2?");

console.log(res);
