/**
 * 相似度阈值检索器示例
 * 
 * 这个文件演示了如何使用 ScoreThresholdRetriever 基于相似度分数过滤检索结果。
 * 主要功能：
 * 
 * 1. 向量存储构建：
 *    - 创建包含建筑材料信息的文档集合
 *    - 使用 OpenAI 嵌入模型生成向量表示
 *    - 构建内存向量存储
 * 
 * 2. 阈值检索配置：
 *    - 设置最小相似度分数阈值 (minSimilarityScore)
 *    - 配置最大返回结果数量 (maxK)
 *    - 设置递增步长 (kIncrement)
 * 
 * 3. 智能过滤机制：
 *    - 只返回超过相似度阈值的结果
 *    - 动态调整检索数量
 *    - 确保结果质量和相关性
 * 
 * 4. 渐进式检索：
 *    - 从小数量开始检索
 *    - 根据需要逐步增加检索数量
 *    - 平衡性能和完整性
 * 
 * 使用场景：
 * - 高质量信息检索
 * - 精确匹配搜索
 * - 噪声过滤和结果优化
 * - 相关性保证的问答系统
 */

import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ScoreThresholdRetriever } from "langchain/retrievers/score_threshold";

const vectorStore = await MemoryVectorStore.fromTexts(
  [
    "Buildings are made out of brick",
    "Buildings are made out of wood",
    "Buildings are made out of stone",
    "Buildings are made out of atoms",
    "Buildings are made out of building materials",
    "Cars are made out of metal",
    "Cars are made out of plastic",
  ],
  [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
  new OpenAIEmbeddings()
);

const retriever = ScoreThresholdRetriever.fromVectorStore(vectorStore, {
  minSimilarityScore: 0.9, // Finds results with at least this similarity score
  maxK: 100, // The maximum K value to use. Use it based to your chunk size to make sure you don't run out of tokens
  kIncrement: 2, // How much to increase K by each time. It'll fetch N results, then N + kIncrement, then N + kIncrement * 2, etc.
});

const result = await retriever.invoke("What are buildings made out of?");

console.log(result);

/*
  [
    Document {
      pageContent: 'Buildings are made out of building materials',
      metadata: { id: 5 }
    },
    Document {
      pageContent: 'Buildings are made out of wood',
      metadata: { id: 2 }
    },
    Document {
      pageContent: 'Buildings are made out of brick',
      metadata: { id: 1 }
    },
    Document {
      pageContent: 'Buildings are made out of stone',
      metadata: { id: 3 }
    },
    Document {
      pageContent: 'Buildings are made out of atoms',
      metadata: { id: 4 }
    }
  ]
*/
