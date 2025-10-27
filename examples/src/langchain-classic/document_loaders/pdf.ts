/**
 * PDF 文档加载器示例
 * 
 * 这个文件演示了如何使用 LangChain 的 PDFLoader 来加载和处理 PDF 文档。
 * 主要功能：
 * 
 * 1. PDF 文档加载：
 *    - 使用 PDFLoader 读取本地 PDF 文件
 *    - 自动解析 PDF 内容和结构
 *    - 提取文本内容和元数据
 * 
 * 2. 文档处理：
 *    - 将 PDF 内容转换为 Document 对象
 *    - 保留文档的页面信息和格式
 *    - 支持多页 PDF 文档处理
 * 
 * 3. 内容提取：
 *    - 提取纯文本内容
 *    - 保留文档结构信息
 *    - 处理各种 PDF 格式和编码
 * 
 * 使用场景：
 * - 文档知识库构建
 * - PDF 内容搜索和分析
 * - 文档问答系统
 * - 内容索引和检索
 * - 文档数据挖掘
 */

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export const run = async () => {
  const loader = new PDFLoader("src/document_loaders/example_data/bitcoin.pdf");

  const docs = await loader.load();

  console.log({ docs });
};
