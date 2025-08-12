/**
 * 字符文本分割器示例
 * 
 * 这个文件演示了如何使用 LangChain 的 CharacterTextSplitter 来分割文本内容。
 * 主要功能：
 * 
 * 1. 字符分割器配置：
 *    - 使用 CharacterTextSplitter 进行文本分割
 *    - 设置分隔符为空格 (" ")
 *    - 配置块大小为 7 个字符
 *    - 设置块重叠为 3 个字符
 * 
 * 2. 分割参数说明：
 *    - separator: 指定文本分割的分隔符
 *    - chunkSize: 每个文本块的最大字符数
 *    - chunkOverlap: 相邻文本块之间的重叠字符数
 * 
 * 3. 文本分割功能：
 *    - createDocuments: 将原始文本分割成 Document 对象数组
 *    - 保持文本的连续性和上下文
 *    - 自动处理分割边界
 * 
 * 4. 文档分割功能：
 *    - splitDocuments: 分割已有的 Document 对象
 *    - 保留原始文档的元数据
 *    - 支持批量文档处理
 * 
 * 5. 重叠机制优势：
 *    - 保持上下文连续性
 *    - 避免重要信息在分割边界丢失
 *    - 提高后续处理的准确性
 * 
 * 6. 实际应用场景：
 *    - 长文档的分块处理
 *    - 向量化前的文本预处理
 *    - 搜索索引的构建
 * 
 * 使用场景：
 * - 大文档的分块处理
 * - 向量数据库的文档准备
 * - 搜索引擎的内容索引
 * - 文本分析的预处理
 * - 机器学习的数据准备
 * - 内容管理系统的文档处理
 */

import { CharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

export const run = async () => {
  /* Split text */
  const text = "foo bar baz 123";
  const splitter = new CharacterTextSplitter({
    separator: " ",
    chunkSize: 7,
    chunkOverlap: 3,
  });
  const output = await splitter.createDocuments([text]);
  console.log({ output });
  /* Split documents */
  const docOutput = await splitter.splitDocuments([
    new Document({ pageContent: text }),
  ]);
  console.log({ docOutput });
};
