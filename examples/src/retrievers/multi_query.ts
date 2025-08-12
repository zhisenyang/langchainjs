/**
 * 多查询检索器示例
 * 
 * 这个文件演示了如何使用 MultiQueryRetriever 来改善检索效果。
 * 主要功能：
 * 
 * 1. 向量存储构建：
 *    - 使用内存向量存储保存示例文档
 *    - 集成 Cohere 嵌入模型
 *    - 创建可搜索的文档集合
 * 
 * 2. 多查询生成：
 *    - 使用 LLM 从原始查询生成多个相关查询
 *    - 自动扩展查询范围和角度
 *    - 提高检索的召回率和准确性
 * 
 * 3. 智能检索：
 *    - 对多个生成的查询分别执行检索
 *    - 合并和去重检索结果
 *    - 返回更全面的相关文档
 * 
 * 4. 结果优化：
 *    - 通过多角度查询减少遗漏
 *    - 提高检索系统的鲁棒性
 *    - 处理查询表达的多样性
 * 
 * 使用场景：
 * - 提高搜索质量和覆盖率
 * - 处理模糊或不完整的查询
 * - 知识库检索优化
 * - 问答系统增强
 */

import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { CohereEmbeddings } from "@langchain/cohere";
import { MultiQueryRetriever } from "langchain/retrievers/multi_query";
import { ChatAnthropic } from "@langchain/anthropic";

const vectorstore = await MemoryVectorStore.fromTexts(
  [
    "Buildings are made out of brick",
    "Buildings are made out of wood",
    "Buildings are made out of stone",
    "Cars are made out of metal",
    "Cars are made out of plastic",
    "mitochondria is the powerhouse of the cell",
    "mitochondria is made of lipids",
  ],
  [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
  new CohereEmbeddings({ model: "embed-english-v3.0" })
);
const model = new ChatAnthropic({});
const retriever = MultiQueryRetriever.fromLLM({
  llm: model,
  retriever: vectorstore.asRetriever(),
  verbose: true,
});

const query = "What are mitochondria made of?";
const retrievedDocs = await retriever.invoke(query);

/*
  Generated queries: What are the components of mitochondria?,What substances comprise the mitochondria organelle?  ,What is the molecular composition of mitochondria?
*/

console.log(retrievedDocs);

/*
  [
    Document {
      pageContent: 'mitochondria is the powerhouse of the cell',
      metadata: {}
    },
    Document {
      pageContent: 'mitochondria is made of lipids',
      metadata: {}
    },
    Document {
      pageContent: 'Buildings are made out of brick',
      metadata: { id: 1 }
    },
    Document {
      pageContent: 'Buildings are made out of wood',
      metadata: { id: 2 }
    }
  ]
*/
