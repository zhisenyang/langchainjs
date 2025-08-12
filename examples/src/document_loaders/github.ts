/**
 * GitHub 仓库文档加载器示例
 * 
 * 这个文件演示了如何使用 LangChain 的 GithubRepoLoader 来加载和处理 GitHub 仓库内容。
 * 主要功能：
 * 
 * 1. GitHub 仓库加载：
 *    - 从 GitHub 仓库 URL 创建加载器
 *    - 自动获取仓库中的文件内容
 *    - 支持公开和私有仓库访问
 * 
 * 2. 加载配置选项：
 *    - 指定分支 (branch: "main")
 *    - 控制递归加载 (recursive: false)
 *    - 处理未知文件类型 (unknown: "warn")
 *    - 设置并发数量 (maxConcurrency: 5)
 * 
 * 3. 文件内容处理：
 *    - 自动识别和处理各种文件类型
 *    - 提取代码、文档和配置文件
 *    - 保留文件路径和元数据信息
 * 
 * 4. 性能优化：
 *    - 并发加载多个文件
 *    - 可配置的并发限制
 *    - 高效的网络请求管理
 * 
 * 使用场景：
 * - 代码库分析和索引
 * - 项目文档生成
 * - 代码搜索和理解
 * - 开源项目研究
 * - 代码质量评估
 * - 技术文档整理
 */

import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";

export const run = async () => {
  const loader = new GithubRepoLoader(
    "https://github.com/langchain-ai/langchainjs",
    {
      branch: "main",
      recursive: false,
      unknown: "warn",
      maxConcurrency: 5, // Defaults to 2
    }
  );
  const docs = await loader.load();
  console.log({ docs });
};
