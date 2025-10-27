/**
 * SQL 数据库问答系统快速入门
 * 
 * 这个文件演示了如何构建一个完整的 SQL 数据库问答系统，能够将自然语言问题转换为 SQL 查询并返回答案。
 * 主要功能：
 * 
 * 1. 数据库连接和配置：
 *    - 使用 TypeORM 连接 SQLite 数据库
 *    - 配置 Chinook 示例数据库
 *    - 创建 SQL 数据库抽象层
 * 
 * 2. SQL 查询生成：
 *    - 使用 LLM 将自然语言转换为 SQL 查询
 *    - 支持 SQLite 方言
 *    - 智能查询构建和优化
 * 
 * 3. 查询执行：
 *    - 安全的 SQL 查询执行
 *    - 结果获取和处理
 *    - 错误处理和验证
 * 
 * 4. 答案生成：
 *    - 基于查询结果生成自然语言答案
 *    - 结合问题、查询和结果的上下文
 *    - 用户友好的回答格式
 * 
 * 5. 完整处理链：
 *    - 问题 → SQL 查询 → 执行 → 答案生成
 *    - 流水线式处理
 *    - 可扩展的架构设计
 * 
 * 使用场景：
 * - 商业智能问答
 * - 数据分析助手
 * - 自然语言数据查询
 * - 报表生成系统
 */

import { ChatOpenAI } from "@langchain/openai";
import { createSqlQueryChain } from "@langchain/classic/chains/sql_db";
import { SqlDatabase } from "@langchain/classic/sql_db";
import { DataSource } from "typeorm";
import { QuerySqlTool } from "@langchain/classic/tools/sql";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";

const datasource = new DataSource({
  type: "sqlite",
  database: "../../../../Chinook.db",
});
const db = await SqlDatabase.fromDataSourceParams({
  appDataSource: datasource,
});
const llm = new ChatOpenAI({ model: "gpt-4", temperature: 0 });

const executeQuery = new QuerySqlTool(db);
const writeQuery = await createSqlQueryChain({
  llm,
  db,
  dialect: "sqlite",
});

const answerPrompt =
  PromptTemplate.fromTemplate(`Given the following user question, corresponding SQL query, and SQL result, answer the user question.

Question: {question}
SQL Query: {query}
SQL Result: {result}
Answer: `);

const answerChain = answerPrompt.pipe(llm).pipe(new StringOutputParser());

const chain = RunnableSequence.from([
  RunnablePassthrough.assign({ query: writeQuery }).assign({
    result: (i: { query: string }) => executeQuery.invoke(i.query),
  }),
  answerChain,
]);
console.log(await chain.invoke({ question: "How many employees are there" }));
/**
There are 8 employees.
 */
