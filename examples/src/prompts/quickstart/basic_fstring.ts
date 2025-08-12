/**
 * 基础 F-String 提示模板示例
 * 
 * 这个文件演示了如何使用 LangChain 的 PromptTemplate 创建基础的 f-string 风格提示模板。
 * 主要功能：
 * 
 * 1. 模板创建：
 *    - 使用 fromTemplate 方法创建提示模板
 *    - 支持 f-string 风格的变量插值语法 {variable}
 *    - 自动推断输入变量
 * 
 * 2. 变量替换：
 *    - 动态替换模板中的占位符
 *    - 支持多个变量的同时替换
 *    - 生成最终的格式化提示
 * 
 * 3. 实际应用场景：
 *    - 公司命名咨询助手
 *    - 根据产品类型生成公司名称建议
 *    - 可扩展到其他创意生成任务
 * 
 * 使用场景：
 * - 动态提示生成
 * - 模板化对话系统
 * - 创意生成和建议
 * - 个性化内容创建
 */

import { PromptTemplate } from "@langchain/core/prompts";

// If a template is passed in, the input variables are inferred automatically from the template.
const prompt = PromptTemplate.fromTemplate(
  `You are a naming consultant for new companies.
What is a good name for a company that makes {product}?`
);

const formattedPrompt = await prompt.format({
  product: "colorful socks",
});

/*
You are a naming consultant for new companies.
What is a good name for a company that makes colorful socks?
*/
