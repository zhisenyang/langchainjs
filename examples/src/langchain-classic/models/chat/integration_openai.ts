/**
 * OpenAI 聊天模型集成示例
 * 
 * 这个文件演示了如何使用 LangChain 集成 OpenAI 的聊天模型，包括基础对话、函数调用和 JSON 模式。
 * 主要功能：
 * 
 * 1. 基础聊天模型配置：
 *    - 配置 GPT-4o-mini 模型
 *    - 设置温度参数控制创造性
 *    - 配置 API 密钥认证
 * 
 * 2. 函数调用功能：
 *    - 使用 GPT-4 模型进行函数调用
 *    - 定义天气查询函数的 schema
 *    - 强制模型使用特定函数
 *    - 处理结构化函数调用响应
 * 
 * 3. JSON 模式输出：
 *    - 使用 GPT-4-1106-preview 的 JSON 模式
 *    - 强制模型输出有效的 JSON 格式
 *    - 配置响应格式和 token 限制
 * 
 * 4. 实际应用场景：
 *    - 天气信息查询
 *    - 结构化数据生成
 *    - API 集成和函数调用
 * 
 * 使用场景：
 * - 智能对话系统
 * - 函数调用和工具集成
 * - 结构化数据生成
 * - API 服务集成
 * - 多模态应用开发
 */

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.9,
  apiKey: "YOUR-API-KEY", // In Node.js defaults to process.env.OPENAI_API_KEY
});

// You can also pass tools or functions to the model, learn more here
// https://platform.openai.com/docs/guides/gpt/function-calling

const modelForFunctionCalling = new ChatOpenAI({
  model: "gpt-4",
  temperature: 0,
});

await modelForFunctionCalling.invoke(
  [new HumanMessage("What is the weather in New York?")],
  {
    functions: [
      {
        name: "get_current_weather",
        description: "Get the current weather in a given location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and state, e.g. San Francisco, CA",
            },
            unit: { type: "string", enum: ["celsius", "fahrenheit"] },
          },
          required: ["location"],
        },
      },
    ],
    // You can set the `function_call` arg to force the model to use a function
    function_call: {
      name: "get_current_weather",
    },
  }
);
/*
AIMessage {
  text: '',
  name: undefined,
  additional_kwargs: {
    function_call: {
      name: 'get_current_weather',
      arguments: '{\n  "location": "New York"\n}'
    }
  }
}
*/

// Coerce response type with JSON mode.
// Requires "gpt-4-1106-preview" or later
const jsonModeModel = new ChatOpenAI({
  model: "gpt-4-1106-preview",
  maxTokens: 128,
}).withConfig({
  response_format: {
    type: "json_object",
  },
});

// Must be invoked with a system message containing the string "JSON":
// https://platform.openai.com/docs/guides/text-generation/json-mode
const res = await jsonModeModel.invoke([
  ["system", "Only return JSON"],
  ["human", "Hi there!"],
]);
console.log(res);

/*
  AIMessage {
    content: '{\n  "response": "How can I assist you today?"\n}',
    name: undefined,
    additional_kwargs: { function_call: undefined, tool_calls: undefined }
  }
*/
