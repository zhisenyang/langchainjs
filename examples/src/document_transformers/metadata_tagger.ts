/**
 * 元数据标记器示例
 * 
 * 这个文件演示了如何使用 LangChain 的元数据标记器自动为文档添加结构化元数据。
 * 主要功能：
 * 
 * 1. Zod 模式定义：
 *    - 使用 Zod 库定义元数据结构
 *    - 指定字段类型和约束条件
 *    - 包含电影标题、评论者、语调、评分等字段
 * 
 * 2. 元数据标记器创建：
 *    - 使用 createMetadataTaggerFromZod 创建标记器
 *    - 集成 ChatOpenAI 模型进行智能分析
 *    - 基于 OpenAI 函数调用功能
 * 
 * 3. 文档结构化分析：
 *    - 自动分析文档内容
 *    - 提取关键信息（电影名、评论者、情感等）
 *    - 生成结构化的元数据
 * 
 * 4. 智能信息提取：
 *    - movie_title: 自动识别电影标题
 *    - critic: 提取评论者姓名
 *    - tone: 分析情感倾向（正面/负面）
 *    - rating: 提取数字评分
 * 
 * 5. 元数据合并：
 *    - 保留原有的元数据字段
 *    - 添加新提取的结构化信息
 *    - 支持元数据的增量更新
 * 
 * 6. 实际应用示例：
 *    - 电影评论的自动分类
 *    - 情感分析和评分提取
 *    - 内容标签化和组织
 * 
 * 使用场景：
 * - 内容管理系统的自动标记
 * - 文档分类和组织
 * - 情感分析和内容理解
 * - 搜索引擎的内容索引
 * - 推荐系统的特征提取
 * - 数据挖掘和分析
 */

import { z } from "zod";
import { createMetadataTaggerFromZod } from "langchain/document_transformers/openai_functions";
import { ChatOpenAI } from "@langchain/openai";
import { Document } from "@langchain/core/documents";

const zodSchema = z.object({
  movie_title: z.string(),
  critic: z.string(),
  tone: z.enum(["positive", "negative"]),
  rating: z
    .optional(z.number())
    .describe("The number of stars the critic rated the movie"),
});

const metadataTagger = createMetadataTaggerFromZod(zodSchema, {
  llm: new ChatOpenAI({ model: "gpt-3.5-turbo" }),
});

const documents = [
  new Document({
    pageContent:
      "Review of The Bee Movie\nBy Roger Ebert\nThis is the greatest movie ever made. 4 out of 5 stars.",
  }),
  new Document({
    pageContent:
      "Review of The Godfather\nBy Anonymous\n\nThis movie was super boring. 1 out of 5 stars.",
    metadata: { reliable: false },
  }),
];
const taggedDocuments = await metadataTagger.transformDocuments(documents);

console.log(taggedDocuments);

/*
  [
    Document {
      pageContent: 'Review of The Bee Movie\n' +
        'By Roger Ebert\n' +
        'This is the greatest movie ever made. 4 out of 5 stars.',
      metadata: {
        movie_title: 'The Bee Movie',
        critic: 'Roger Ebert',
        tone: 'positive',
        rating: 4
      }
    },
    Document {
      pageContent: 'Review of The Godfather\n' +
        'By Anonymous\n' +
        '\n' +
        'This movie was super boring. 1 out of 5 stars.',
      metadata: {
        movie_title: 'The Godfather',
        critic: 'Anonymous',
        tone: 'negative',
        rating: 1,
        reliable: false
      }
    }
  ]
*/
