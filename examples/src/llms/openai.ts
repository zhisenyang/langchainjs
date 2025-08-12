/**
 * OpenAI LLM 模型示例
 * 
 * 这个文件演示了如何使用 LangChain 的 OpenAI LLM 模型进行文本生成。
 * 主要功能：
 * 
 * 1. OpenAI 模型配置：
 *    - 使用 GPT-4 模型进行文本生成
 *    - 设置温度参数为 0.7（平衡创造性和一致性）
 *    - 配置最大 token 数量为 1000
 *    - 设置最大重试次数为 5
 * 
 * 2. 模型参数说明：
 *    - model: 指定使用的 GPT 模型版本
 *    - temperature: 控制输出的随机性和创造性
 *    - maxTokens: 限制生成文本的最大长度
 *    - maxRetries: 设置 API 调用失败时的重试次数
 * 
 * 3. 文本生成调用：
 *    - 使用 invoke 方法发送提示文本
 *    - 采用问答格式的提示结构
 *    - 获取模型生成的回答
 * 
 * 4. 实际应用场景：
 *    - 公司命名建议生成
 *    - 创意文本生成
 *    - 问答系统构建
 * 
 * 使用场景：
 * - 内容创作和生成
 * - 智能问答系统
 * - 创意写作辅助
 * - 文本补全和续写
 * - 语言翻译和转换
 * - 代码生成和解释
 */

import { OpenAI } from "@langchain/openai";

export const run = async () => {
  const model = new OpenAI({
    model: "gpt-4",
    temperature: 0.7,
    maxTokens: 1000,
    maxRetries: 5,
  });
  const res = await model.invoke(
    "Question: What would be a good company name a company that makes colorful socks?\nAnswer:"
  );
  console.log({ res });
};
