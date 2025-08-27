// API配置文件
export const API_CONFIG = {
  // 基础配置
  baseURL: 'https://api.siliconflow.cn/v1',
  apiKey: 'sk-fklomryoqfwwahhdjtadyndyuuqvisykjmhdcsprvqgyyusk',

  // 模型配置
  models: {
    chat: 'moonshotai/Kimi-K2-Instruct',
    embedding: 'Qwen/Qwen3-Embedding-4B',
  },

  // 网络配置
  network: {
    timeout: 30000,
    maxRetries: 3,
    retryDelay: 2000,
    maxConcurrency: 1,
  },

  // 重试配置
  retry: {
    retries: 3,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 10000,
  },
};

// 网络检查配置
export const NETWORK_CONFIG = {
  checkEndpoint: '/models',
  checkTimeout: 10000,
  maxRetries: 3,
};

// 错误处理配置
export const ERROR_CONFIG = {
  maxRetries: 3,
  retryDelay: 2000,
  logErrors: true,
};
