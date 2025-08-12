/**
 * YouTube 视频文档加载器示例
 * 
 * 这个文件演示了如何使用 LangChain 的 YoutubeLoader 来加载和处理 YouTube 视频内容。
 * 主要功能：
 * 
 * 1. YouTube 视频加载：
 *    - 从 YouTube URL 创建加载器实例
 *    - 自动获取视频字幕和转录内容
 *    - 支持多种语言的字幕提取
 * 
 * 2. 内容配置选项：
 *    - 设置字幕语言 (language: "en")
 *    - 添加视频元信息 (addVideoInfo: true)
 *    - 包含视频标题、描述、发布时间等
 * 
 * 3. 文档对象生成：
 *    - 将视频内容转换为 Document 对象
 *    - 保留视频元数据和时间戳信息
 *    - 支持后续的文本分析和搜索
 * 
 * 4. 实际应用场景：
 *    - 视频内容索引和搜索
 *    - 教育内容分析
 *    - 会议记录处理
 *    - 多媒体知识库构建
 * 
 * 使用场景：
 * - 视频内容分析和摘要
 * - 教育资源处理
 * - 会议和讲座记录
 * - 多媒体搜索引擎
 * - 内容审核和分类
 */

import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";

const loader = YoutubeLoader.createFromUrl("https://youtu.be/bZQun8Y4L2A", {
  language: "en",
  addVideoInfo: true,
});

const docs = await loader.load();

console.log(docs);
