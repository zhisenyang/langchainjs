/**
 * OpenAI 函数提取链示例
 * 
 * 这个文件演示了如何使用 OpenAI Functions 和 Zod 模式进行结构化数据提取。
 * 主要功能：
 * 
 * 1. Zod 模式定义：
 *    - 定义结构化数据模式
 *    - 支持可选字段（optional）
 *    - 类型安全的数据验证
 * 
 * 2. 智能数据提取：
 *    - 从自然语言文本中提取结构化信息
 *    - 自动识别人物和宠物信息
 *    - 支持多实体提取
 * 
 * 3. OpenAI Functions 集成：
 *    - 使用 gpt-3.5-turbo-0613 模型
 *    - 利用函数调用能力
 *    - 确保输出格式一致性
 * 
 * 4. 提取链创建：
 *    - createExtractionChainFromZod 自动生成链
 *    - 基于模式的智能提取
 *    - 返回结构化 JSON 数据
 * 
 * 5. 实际应用场景：
 *    - 简历信息提取
 *    - 客户信息整理
 *    - 文档数据结构化
 *    - 表单自动填充
 * 
 * 使用场景：
 * - 文档信息提取
 * - 数据结构化处理
 * - 智能表单填充
 * - 客户信息管理
 * - 自动化数据录入
 */

import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { createExtractionChainFromZod } from "langchain/chains";

const zodSchema = z.object({
  "person-name": z.string().optional(),
  "person-age": z.number().optional(),
  "person-hair_color": z.string().optional(),
  "dog-name": z.string().optional(),
  "dog-breed": z.string().optional(),
});
const chatModel = new ChatOpenAI({
  model: "gpt-3.5-turbo-0613",
  temperature: 0,
});
const chain = createExtractionChainFromZod(zodSchema, chatModel);

console.log(
  await chain.run(`Alex is 5 feet tall. Claudia is 4 feet taller Alex and jumps higher than him. Claudia is a brunette and Alex is blonde.
Alex's dog Frosty is a labrador and likes to play hide and seek.`)
);
/*
[
  {
    'person-name': 'Alex',
    'person-age': 0,
    'person-hair_color': 'blonde',
    'dog-name': 'Frosty',
    'dog-breed': 'labrador'
  },
  {
    'person-name': 'Claudia',
    'person-age': 0,
    'person-hair_color': 'brunette',
    'dog-name': '',
    'dog-breed': ''
  }
]
*/
