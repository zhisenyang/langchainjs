/**
 * LLM 链式处理示例
 * 
 * 这个文件演示了如何使用 LangChain 创建和使用基础的 LLM 链式处理。
 * 主要功能：
 * 
 * 1. LLM 模型配置：
 *    - 创建 OpenAI 模型实例
 *    - 设置温度参数为 0（确保输出一致性）
 *    - 配置模型的基础参数
 * 
 * 2. 提示模板创建：
 *    - 使用 PromptTemplate.fromTemplate 创建模板
 *    - 定义包含变量占位符的提示文本
 *    - 支持动态变量替换
 * 
 * 3. 链式处理构建：
 *    - 使用 pipe 方法连接提示模板和 LLM
 *    - 创建可重用的处理链
 *    - 简化复杂的处理流程
 * 
 * 4. 链式调用执行：
 *    - 使用 invoke 方法执行链式处理
 *    - 传入变量参数进行动态替换
 *    - 获取结构化的响应结果
 * 
 * 5. 实际应用场景：
 *    - 公司命名建议生成
 *    - 创意内容生成
 *    - 模板化文本处理
 * 
 * 使用场景：
 * - 模板化内容生成
 * - 批量文本处理
 * - 创意写作辅助
 * - 自动化内容创建
 * - 个性化推荐生成
 */

import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

// We can construct an LLMChain from a PromptTemplate and an LLM.
const model = new OpenAI({ temperature: 0 });
const prompt = PromptTemplate.fromTemplate(
  "What is a good name for a company that makes {product}?"
);

const chainA = prompt.pipe({ llm: model });

// The result is an object with a `text` property.
const resA = await chainA.invoke({ product: "colorful socks" });
console.log({ resA });
// { resA: { text: '\n\nSocktastic!' } }
