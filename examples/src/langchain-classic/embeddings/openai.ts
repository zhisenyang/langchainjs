/**
 * OpenAI 嵌入模型示例
 * 
 * 这个文件演示了如何使用 LangChain 的 OpenAI 嵌入模型来生成文本的向量表示。
 * 主要功能：
 * 
 * 1. 嵌入模型初始化：
 *    - 创建 OpenAIEmbeddings 实例
 *    - 使用默认的 text-embedding-ada-002 模型
 *    - 自动配置 API 密钥和参数
 * 
 * 2. 文本向量化：
 *    - 使用 embedQuery 方法生成单个查询的嵌入向量
 *    - 将自然语言文本转换为数值向量
 *    - 支持语义相似性计算
 * 
 * 3. 向量表示特性：
 *    - 生成高维度的数值向量（通常 1536 维）
 *    - 捕获文本的语义信息
 *    - 支持相似性搜索和聚类
 * 
 * 4. 实际应用场景：
 *    - 公司命名相关查询的向量化
 *    - 为后续的相似性搜索做准备
 *    - 语义理解和匹配
 * 
 * 使用场景：
 * - 语义搜索和相似性匹配
 * - 文档聚类和分类
 * - 推荐系统构建
 * - 知识图谱构建
 * - 内容去重和相似性检测
 * - 向量数据库构建
 */

import { OpenAIEmbeddings } from "@langchain/openai";

const model = new OpenAIEmbeddings();
const res = await model.embedQuery(
  "What would be a good company name a company that makes colorful socks?"
);
console.log({ res });
