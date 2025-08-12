/**
 * JSON 代理示例
 * 
 * 这个文件演示了如何使用 LangChain 创建专门处理 JSON 数据的智能代理。
 * 主要功能：
 * 
 * 1. JSON 规范处理：
 *    - 加载 YAML 格式的 OpenAPI 规范文件
 *    - 使用 JsonSpec 解析 JSON 结构
 *    - 支持复杂的 API 规范分析
 * 
 * 2. JSON 工具包：
 *    - 使用 JsonToolkit 创建 JSON 操作工具集
 *    - 提供 JSON 查询、导航、提取功能
 *    - 支持复杂 JSON 结构的智能分析
 * 
 * 3. JSON 代理创建：
 *    - 使用 createJsonAgent 创建专用代理
 *    - 集成 OpenAI 模型进行智能推理
 *    - 自动选择合适的 JSON 操作工具
 * 
 * 4. 文件系统集成：
 *    - 从文件系统读取 YAML 配置
 *    - 支持 OpenAPI 规范文件解析
 *    - 错误处理和异常管理
 * 
 * 5. 智能查询功能：
 *    - 自然语言查询 JSON 结构
 *    - 自动理解和导航复杂数据
 *    - 提取特定字段和参数信息
 * 
 * 6. 实际应用示例：
 *    - 查询 OpenAPI 端点的必需参数
 *    - 分析 /completions 端点的请求体
 *    - 展示 API 规范的智能分析
 * 
 * 7. 中间步骤跟踪：
 *    - 记录代理的推理过程
 *    - 显示工具调用的详细步骤
 *    - 便于调试和优化
 * 
 * 使用场景：
 * - API 文档分析和查询
 * - JSON 数据的智能探索
 * - 配置文件的自动分析
 * - 数据结构的智能导航
 * - 开发工具和 IDE 集成
 * - 自动化测试和验证
 */

import * as fs from "fs";
import * as yaml from "js-yaml";
import { OpenAI } from "@langchain/openai";
import { JsonSpec, JsonObject } from "langchain/tools";
import { JsonToolkit, createJsonAgent } from "langchain/agents";

export const run = async () => {
  let data: JsonObject;
  try {
    const yamlFile = fs.readFileSync("openai_openapi.yaml", "utf8");
    data = yaml.load(yamlFile) as JsonObject;
    if (!data) {
      throw new Error("Failed to load OpenAPI spec");
    }
  } catch (e) {
    console.error(e);
    return;
  }

  const toolkit = new JsonToolkit(new JsonSpec(data));
  const model = new OpenAI({ temperature: 0 });
  const executor = createJsonAgent(model, toolkit);

  const input = `What are the required parameters in the request body to the /completions endpoint?`;

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
};
