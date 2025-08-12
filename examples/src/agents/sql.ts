/**
 * SQL 代理示例
 *
 * 这个文件演示了如何使用 LangChain 创建能够与 SQL 数据库交互的智能代理。
 * 主要功能：
 *
 * 1. SQL 数据库集成：
 *    - 使用 TypeORM DataSource 连接 SQLite 数据库
 *    - 集成 Chinook 示例数据库
 *    - 支持多种数据库类型（SQLite、MySQL、PostgreSQL 等）
 *
 * 2. SQL 工具包：
 *    - 使用 SqlToolkit 创建 SQL 操作工具集
 *    - 提供数据库查询、表结构分析等功能
 *    - 自动生成和执行 SQL 查询
 *
 * 3. SQL 代理创建：
 *    - 使用 createSqlAgent 创建专用 SQL 代理
 *    - 集成 OpenAI 模型进行智能 SQL 生成
 *    - 自动理解自然语言并转换为 SQL
 *
 * 4. 智能查询功能：
 *    - 自然语言转 SQL 查询
 *    - 自动分析表结构和关系
 *    - 生成复杂的聚合和分析查询
 *
 * 5. 数据库操作：
 *    - 自动连接和管理数据库连接
 *    - 执行查询并返回结果
 *    - 安全的数据库访问和清理
 *
 * 6. 实际应用示例：
 *    - 查询 "每个国家的总销售额"
 *    - 分析 "哪个国家的客户消费最多"
 *    - 展示复杂的业务分析查询
 *
 * 7. 中间步骤跟踪：
 *    - 记录 SQL 生成和执行过程
 *    - 显示代理的推理步骤
 *    - 便于调试和优化查询
 *
 * 8. 资源管理：
 *    - 自动清理数据库连接
 *    - 防止资源泄漏
 *    - 确保应用程序的稳定性
 *
 * 使用场景：
 * - 商业智能和数据分析
 * - 自然语言数据查询
 * - 报表生成和自动化
 * - 数据库管理工具
 * - 客服和支持系统
 * - 教育和培训工具
 */

import { OpenAI } from "@langchain/openai";
import { SqlDatabase } from "langchain/sql_db";
import { createSqlAgent, SqlToolkit } from "langchain/agents/toolkits/sql";
import { DataSource } from "typeorm";

/** This example uses Chinook database, which is a sample database available for SQL Server, Oracle, MySQL, etc.
 * To set it up follow the instructions on https://database.guide/2-sample-databases-sqlite/, placing the .db file
 * in the examples folder.
 */
export const run = async () => {
  const datasource = new DataSource({
    type: "sqlite",
    database: "Chinook.db",
  });
  const db = await SqlDatabase.fromDataSourceParams({
    appDataSource: datasource,
  });
  const model = new OpenAI({ temperature: 0 });
  const toolkit = new SqlToolkit(db, model);
  const executor = createSqlAgent(model, toolkit);

  const input = `List the total sales per country. Which country's customers spent the most?`;

  console.log(`Executing with input "${input}"...`);

  const result = await executor.invoke({ input });

  console.log(`Got output ${result.output}`);

  console.log(
    `Got intermediate steps ${JSON.stringify(
      result.intermediateSteps,
      null,
      2
    )}`
  );

  await datasource.destroy();
};
