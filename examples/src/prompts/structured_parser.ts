/**
 * 结构化输出解析器示例
 * 
 * 这个文件演示了如何使用 StructuredOutputParser 来确保 LLM 输出符合预定义的 JSON 结构。
 * 主要功能：
 * 
 * 1. 结构化解析器配置：
 *    - 定义输出字段的名称和描述
 *    - 自动生成 JSON Schema
 *    - 创建格式化指令
 * 
 * 2. 提示模板集成：
 *    - 将格式化指令嵌入到提示模板中
 *    - 使用部分变量预填充格式指令
 *    - 确保 LLM 理解输出要求
 * 
 * 3. 结构化输出生成：
 *    - LLM 根据 JSON Schema 生成结构化响应
 *    - 包含 answer 和 source 字段
 *    - 符合预定义的数据格式
 * 
 * 4. 输出解析和验证：
 *    - 解析 LLM 的 JSON 响应
 *    - 类型检查和格式验证
 *    - 转换为 JavaScript 对象
 * 
 * 使用场景：
 * - 需要结构化数据的问答系统
 * - API 响应格式标准化
 * - 数据提取和信息结构化
 * - 确保输出格式一致性
 * - 下游系统集成
 */

import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

// With a `StructuredOutputParser` we can define a schema for the output.
const parser = StructuredOutputParser.fromNamesAndDescriptions({
  answer: "answer to the user's question",
  source: "source used to answer the user's question, should be a website.",
});

const formatInstructions = parser.getFormatInstructions();

const prompt = new PromptTemplate({
  template:
    "Answer the users question as best as possible.\n{format_instructions}\n{question}",
  inputVariables: ["question"],
  partialVariables: { format_instructions: formatInstructions },
});

const model = new OpenAI({ temperature: 0 });

const input = await prompt.format({
  question: "What is the capital of France?",
});
const response = await model.invoke(input);

console.log(input);
/*
Answer the users question as best as possible.
You must format your output as a JSON value that adheres to a given "JSON Schema" instance.

"JSON Schema" is a declarative language that allows you to annotate and validate JSON documents.

For example, the example "JSON Schema" instance {{"properties": {{"foo": {{"description": "a list of test words", "type": "array", "items": {{"type": "string"}}}}}}, "required": ["foo"]}}}}
would match an object with one required property, "foo". The "type" property specifies "foo" must be an "array", and the "description" property semantically describes it as "a list of test words". The items within "foo" must be strings.
Thus, the object {{"foo": ["bar", "baz"]}} is a well-formatted instance of this example "JSON Schema". The object {{"properties": {{"foo": ["bar", "baz"]}}}} is not well-formatted.

Your output will be parsed and type-checked according to the provided schema instance, so make sure all fields in your output match the schema exactly and there are no trailing commas!

Here is the JSON Schema instance your output must adhere to. Include the enclosing markdown codeblock:
```json
{"type":"object","properties":{"answer":{"type":"string","description":"answer to the user's question"},"source":{"type":"string","description":"source used to answer the user's question, should be a website."}},"required":["answer","source"],"additionalProperties":false,"$schema":"http://json-schema.org/draft-07/schema#"}
```

What is the capital of France?
*/

console.log(response);
/*
{"answer": "Paris", "source": "https://en.wikipedia.org/wiki/Paris"}
*/

console.log(await parser.parse(response));
// { answer: 'Paris', source: 'https://en.wikipedia.org/wiki/Paris' }
