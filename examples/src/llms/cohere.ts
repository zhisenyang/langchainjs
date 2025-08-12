/**
 * Cohere LLM 模型示例
 * 
 * 这个文件演示了如何使用 LangChain 的 Cohere LLM 模型进行文本生成。
 * 主要功能：
 * 
 * 1. Cohere 模型配置：
 *    - 使用 Cohere 的语言模型进行文本生成
 *    - 设置温度参数为 0.7（平衡创造性和一致性）
 *    - 配置最大 token 数量为 20（短文本生成）
 *    - 设置最大重试次数为 5
 * 
 * 2. 模型参数特点：
 *    - temperature: 控制输出的随机性，0.7 提供适度的创造性
 *    - maxTokens: 限制为 20 tokens，适合简短回答
 *    - maxRetries: 提高 API 调用的可靠性
 * 
 * 3. Cohere 模型优势：
 *    - 多语言支持能力强
 *    - 文本理解和生成质量高
 *    - API 调用稳定可靠
 *    - 成本效益良好
 * 
 * 4. 文本生成调用：
 *    - 使用 invoke 方法发送提示
 *    - 采用结构化的问答格式
 *    - 获取简洁的生成结果
 * 
 * 5. 实际应用场景：
 *    - 公司命名建议
 *    - 简短文本生成
 *    - 创意灵感提供
 * 
 * 使用场景：
 * - 多语言文本生成
 * - 简短内容创作
 * - 智能建议系统
 * - 文本摘要生成
 * - 创意写作辅助
 * - 问答系统构建
 */

import { Cohere } from "@langchain/cohere";

export const run = async () => {
  const model = new Cohere({
    temperature: 0.7,
    maxTokens: 20,
    maxRetries: 5,
  });
  const res = await model.invoke(
    "Question: What would be a good company name a company that makes colorful socks?\nAnswer:"
  );
  console.log({ res });
};
