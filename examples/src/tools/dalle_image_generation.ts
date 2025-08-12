/**
 * DALL-E 图像生成工具示例
 * 
 * 这个文件演示了如何使用 LangChain 的 DALL-E API 包装器生成图像。
 * 主要功能：
 * - 配置 DALL-E 3 模型进行图像生成
 * - 设置生成图像的数量参数
 * - 使用环境变量配置 OpenAI API 密钥
 * - 根据文本描述生成图像
 * - 返回生成图像的 URL 地址
 * 
 * 使用场景：
 * - 内容创作和设计
 * - 自动化图像生成
 * - 为聊天机器人添加图像生成能力
 * - 创意写作和视觉化辅助
 */

/* eslint-disable no-process-env */
import { DallEAPIWrapper } from "@langchain/openai";

const tool = new DallEAPIWrapper({
  n: 1, // Default
  model: "dall-e-3", // Default
  apiKey: process.env.OPENAI_API_KEY, // Default
});

const imageURL = await tool.invoke("a painting of a cat");

console.log(imageURL);
