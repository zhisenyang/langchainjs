/**
 * OpenAI 函数标记链示例
 *
 * 这个文件演示了如何使用 OpenAI Functions 进行文本标记和分类。
 * 主要功能：
 *
 * 1. 函数参数模式定义：
 *    - 定义标记属性（情感、语调、语言）
 *    - 设置必需字段和可选字段
 *    - 类型安全的参数验证
 *
 * 2. 智能文本分析：
 *    - 自动识别文本情感（sentiment）
 *    - 分析文本语调（tone）
 *    - 检测文本语言（language）
 *
 * 3. OpenAI Functions 集成：
 *    - 使用 gpt-4-0613 模型
 *    - 利用函数调用进行结构化输出
 *    - 确保标记结果的一致性
 *
 * 4. 标记链创建：
 *    - createTaggingChain 自动生成标记链
 *    - 基于模式的智能标记
 *    - 返回结构化标记结果
 *
 * 5. 多语言支持：
 *    - 自动检测输入文本语言
 *    - 支持多种语言的情感分析
 *    - 跨语言的语调识别
 *
 * 6. 实际应用场景：
 *    - 社交媒体情感监控
 *    - 客户反馈分析
 *    - 内容分类系统
 *    - 多语言文本处理
 *
 * 使用场景：
 * - 情感分析系统
 * - 文本分类应用
 * - 内容审核平台
 * - 客户服务分析
 * - 多语言处理系统
 */
import { createTaggingChain } from "@langchain/classic/chains";
import { ChatOpenAI } from "@langchain/openai";
import { FunctionParameters } from "@langchain/core/output_parsers/openai_functions";

const schema: FunctionParameters = {
  type: "object",
  properties: {
    sentiment: { type: "string" },
    tone: { type: "string" },
    language: { type: "string" },
  },
  required: ["tone"],
};

const chatModel = new ChatOpenAI({ model: "gpt-4-0613", temperature: 0 });

const chain = createTaggingChain(schema, chatModel);

console.log(
  await chain.run(
    `Estoy increiblemente contento de haberte conocido! Creo que seremos muy buenos amigos!`
  )
);
/*
{ tone: 'positive', language: 'Spanish' }
*/
