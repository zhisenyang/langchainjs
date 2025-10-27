/**
 * Momento 缓存示例
 * 
 * 这个文件演示了如何使用 Momento 作为 LangChain 模型的高性能缓存后端。
 * 主要功能：
 * 
 * 1. Momento 客户端配置：
 *    - 使用 Momento SDK 创建缓存客户端
 *    - 配置适合笔记本电脑的性能配置
 *    - 设置环境变量身份验证
 * 
 * 2. 身份验证设置：
 *    - 使用 CredentialProvider.fromEnvironmentVariable
 *    - 从 MOMENTO_API_KEY 环境变量获取凭据
 *    - 安全的 API 密钥管理
 * 
 * 3. 缓存配置：
 *    - defaultTtlSeconds: 设置为 24 小时 (60 * 60 * 24)
 *    - cacheName: 指定缓存命名空间为 "langchain"
 *    - 支持多应用的缓存隔离
 * 
 * 4. 性能配置：
 *    - Configurations.Laptop.v1(): 适合开发环境的配置
 *    - 优化的网络和序列化设置
 *    - 平衡性能和资源使用
 * 
 * 5. LLM 模型集成：
 *    - 将 Momento 缓存集成到 OpenAI 模型
 *    - 自动缓存模型请求和响应
 *    - 透明的缓存层实现
 * 
 * 6. Momento 优势：
 *    - 超低延迟的内存缓存
 *    - 全托管的无服务器服务
 *    - 自动扩展和高可用性
 *    - 简单的 API 和集成
 * 
 * 使用场景：
 * - 高性能 LLM 应用缓存
 * - 实时应用的低延迟缓存
 * - 大规模分布式系统缓存
 * - 游戏和实时应用
 * - 边缘计算的缓存层
 * - 微服务架构的缓存方案
 */

import { OpenAI } from "@langchain/openai";
import {
  CacheClient,
  Configurations,
  CredentialProvider,
} from "@gomomento/sdk";
import { MomentoCache } from "@langchain/community/caches/momento";

// See https://github.com/momentohq/client-sdk-javascript for connection options
const client = new CacheClient({
  configuration: Configurations.Laptop.v1(),
  credentialProvider: CredentialProvider.fromEnvironmentVariable({
    environmentVariableName: "MOMENTO_API_KEY",
  }),
  defaultTtlSeconds: 60 * 60 * 24,
});
const cache = await MomentoCache.fromProps({
  // @ts-expect-error(@christian-bromann): outdated example needs to be updated
  client,
  cacheName: "langchain",
});

const model = new OpenAI({ cache });
