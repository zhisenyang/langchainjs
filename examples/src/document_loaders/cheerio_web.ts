/**
 * Cheerio 网页文档加载器示例
 * 
 * 这个文件演示了如何使用 LangChain 的 CheerioWebBaseLoader 来加载和解析网页内容。
 * 主要功能：
 * 
 * 1. 网页内容加载：
 *    - 使用 Cheerio 库解析 HTML 内容
 *    - 从指定 URL 获取网页数据
 *    - 自动处理 HTTP 请求和响应
 * 
 * 2. HTML 解析和提取：
 *    - 解析 HTML 结构和标签
 *    - 提取纯文本内容
 *    - 过滤掉 HTML 标记和样式
 * 
 * 3. 文档对象生成：
 *    - 将网页内容转换为 Document 对象
 *    - 保留页面元数据信息
 *    - 支持后续的文本处理和分析
 * 
 * 4. 实际应用示例：
 *    - 加载 Hacker News 讨论页面
 *    - 提取讨论内容和评论
 *    - 用于内容分析和索引
 * 
 * 使用场景：
 * - 网页内容抓取和分析
 * - 新闻和文章收集
 * - 网站内容索引
 * - 在线文档处理
 * - 网络数据挖掘
 */

import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

export const run = async () => {
  const loader = new CheerioWebBaseLoader(
    "https://news.ycombinator.com/item?id=34817881"
  );
  const docs = await loader.load();
  console.log({ docs });
};
