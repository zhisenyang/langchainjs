/**
 * 文档分析链摘要示例
 * 
 * 这个文件演示了如何使用 AnalyzeDocumentChain 来分析和摘要大型文本文档。
 * 主要功能：
 * 
 * 1. 大型文档处理：
 *    - 使用 AnalyzeDocumentChain 处理长文档
 *    - 自动分割和处理超长文本
 *    - 支持文件系统读取文档
 * 
 * 2. 摘要链集成：
 *    - 结合 loadSummarizationChain 进行摘要
 *    - 使用 OpenAI 模型生成摘要
 *    - 设置温度参数确保输出一致性
 * 
 * 3. 文档链组合：
 *    - combineDocumentsChain 组合多个文档片段
 *    - 自动处理文档分割和合并
 *    - 生成综合性摘要结果
 * 
 * 4. 实际应用场景：
 *    - 政府文件摘要（如国情咨文）
 *    - 长篇报告分析
 *    - 学术论文摘要
 * 
 * 使用场景：
 * - 大型文档自动摘要
 * - 政策文件分析
 * - 研究报告处理
 * - 新闻文章摘要
 * - 法律文档分析
 */

import { OpenAI } from "@langchain/openai";
import {
  loadSummarizationChain,
  AnalyzeDocumentChain,
} from "@langchain/classic/chains";
import * as fs from "fs";

// 在此示例中，我们使用 `AnalyzeDocumentChain` 来摘要一个大型文本文档。
const text = fs.readFileSync("state_of_the_union.txt", "utf8");
const model = new OpenAI({ temperature: 0 });
const combineDocsChain = loadSummarizationChain(model);
const chain = new AnalyzeDocumentChain({
  combineDocumentsChain: combineDocsChain,
});
const res = await chain.invoke({
  input_document: text,
});
console.log({ res });
/*
{
  res: {
    text: ' President Biden is taking action to protect Americans from the COVID-19 pandemic and Russian aggression, providing economic relief, investing in infrastructure, creating jobs, and fighting inflation.
    He is also proposing measures to reduce the cost of prescription drugs, protect voting rights, and reform the immigration system. The speaker is advocating for increased economic security, police reform, and the Equality Act, as well as providing support for veterans and military families.
    The US is making progress in the fight against COVID-19, and the speaker is encouraging Americans to come together and work towards a brighter future.'
  }
}
*/
