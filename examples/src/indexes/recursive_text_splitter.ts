/**
 * 递归字符文本分割器示例
 * 
 * 这个文件演示了如何使用 LangChain 的 RecursiveCharacterTextSplitter 进行智能文本分割。
 * 主要功能：
 * 
 * 1. 递归分割器特点：
 *    - 使用 RecursiveCharacterTextSplitter 进行智能分割
 *    - 按照字符优先级递归尝试分割
 *    - 优先保持文本的自然结构
 * 
 * 2. 分割参数配置：
 *    - chunkSize: 设置为 10 个字符的小块
 *    - chunkOverlap: 设置 1 个字符的重叠
 *    - 适合演示分割效果
 * 
 * 3. 智能分割策略：
 *    - 优先按段落分割（\n\n）
 *    - 其次按句子分割（\n）
 *    - 再按空格分割
 *    - 最后按字符分割
 * 
 * 4. 文本结构保持：
 *    - 尽量保持文本的自然边界
 *    - 避免在单词中间分割
 *    - 保持语义的完整性
 * 
 * 5. 实际测试文本：
 *    - 包含多种文本结构（问候、介绍、问题、结尾）
 *    - 测试不同长度的句子和段落
 *    - 验证分割器的智能处理能力
 * 
 * 6. 输出文档对象：
 *    - 生成 Document 对象数组
 *    - 每个对象包含分割后的文本块
 *    - 保持原始文本的元数据信息
 * 
 * 使用场景：
 * - 自然语言文档的智能分割
 * - 保持语义完整性的文本处理
 * - 多语言文档的结构化分割
 * - 聊天记录和对话的分块
 * - 代码文档的智能分割
 * - 学术论文的段落分割
 */

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const run = async () => {
  const text = `Hi.\n\nI'm Harrison.\n\nHow? Are? You?\nOkay then f f f f.
    This is a weird text to write, but gotta test the splittingggg some how.\n\n
    Bye!\n\n-H.`;
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 10,
    chunkOverlap: 1,
  });
  const output = await splitter.createDocuments([text]);
  console.log(output);
};
