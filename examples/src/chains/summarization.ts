/**
 * 文档摘要链式处理示例
 * 
 * 这个文件演示了如何使用 LangChain 的摘要链来自动生成文档摘要。
 * 主要功能：
 * 
 * 1. 摘要链配置：
 *    - 使用 loadSummarizationChain 加载预配置的摘要链
 *    - 设置摘要类型为 "stuff"（适合短文档）
 *    - 集成 OpenAI 模型进行摘要生成
 * 
 * 2. 文档对象创建：
 *    - 创建 Document 实例包含页面内容
 *    - 支持多个文档的批量处理
 *    - 保持文档结构和元数据
 * 
 * 3. 摘要处理类型：
 *    - "stuff" 类型：将所有文档内容合并后一次性摘要
 *    - 适合较短的文档集合
 *    - 高效的单次处理模式
 * 
 * 4. 链式调用执行：
 *    - 使用 invoke 方法传入文档数组
 *    - 自动处理多个文档的摘要生成
 *    - 返回综合摘要结果
 * 
 * 5. 实际应用场景：
 *    - 学术背景信息摘要
 *    - 多文档内容整合
 *    - 信息提取和概括
 * 
 * 使用场景：
 * - 文档自动摘要
 * - 信息提取和整理
 * - 内容概括和总结
 * - 多文档分析
 * - 知识库构建
 * - 研究资料整理
 */

import { OpenAI } from "@langchain/openai";
import { loadSummarizationChain } from "langchain/chains";
import { Document } from "@langchain/core/documents";

export const run = async () => {
  const model = new OpenAI({});
  const chain = loadSummarizationChain(model, { type: "stuff" });
  const docs = [
    new Document({ pageContent: "harrison went to harvard" }),
    new Document({ pageContent: "ankush went to princeton" }),
  ];
  const res = await chain.invoke({
    input_documents: docs,
  });
  console.log(res);
};
