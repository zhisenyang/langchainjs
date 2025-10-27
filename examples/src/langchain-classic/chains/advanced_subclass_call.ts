/**
 * 自定义链式处理调用示例
 * 
 * 这个文件演示了如何实现一个完整的自定义链式处理类。
 * 主要功能：
 * 
 * 1. 自定义链类实现：
 *    - 继承 BaseChain 基类
 *    - 实现所有必需的抽象方法
 *    - 提供完整的链式处理功能
 * 
 * 2. 接口定义和类型安全：
 *    - 定义 MyCustomChainInputs 接口
 *    - 扩展 ChainInputs 基础接口
 *    - 确保类型安全和参数验证
 * 
 * 3. 提示模板集成：
 *    - 支持自定义提示模板字符串
 *    - 使用 PromptTemplate.fromTemplate 创建模板
 *    - 动态格式化提示内容
 * 
 * 4. 回调管理和监控：
 *    - 集成 CallbackManagerForChainRun
 *    - 支持嵌套回调管理
 *    - 提供运行时日志记录
 * 
 * 5. LLM 模型集成：
 *    - 支持任意 BaseLanguageModelInterface 实现
 *    - 异步生成提示响应
 *    - 处理生成结果和错误
 * 
 * 使用场景：
 * - 自定义业务逻辑链
 * - 复杂提示处理流程
 * - 可重用组件开发
 * - 企业级应用集成
 */

import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import { BaseChain, ChainInputs } from "@langchain/classic/chains";
import { BasePromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { CallbackManagerForChainRun } from "@langchain/core/callbacks/manager";
import { ChainValues } from "@langchain/core/utils/types";

export interface MyCustomChainInputs extends ChainInputs {
  llm: BaseLanguageModelInterface;
  promptTemplate: string;
}

export class MyCustomChain extends BaseChain implements MyCustomChainInputs {
  llm: BaseLanguageModelInterface;

  promptTemplate: string;

  prompt: BasePromptTemplate;

  constructor(fields: MyCustomChainInputs) {
    super(fields);
    this.llm = fields.llm;
    this.promptTemplate = fields.promptTemplate;
    this.prompt = PromptTemplate.fromTemplate(this.promptTemplate);
  }

  async _call(
    values: ChainValues,
    runManager?: CallbackManagerForChainRun
  ): Promise<ChainValues> {
    // 您的自定义链逻辑在这里
    // 这只是一个模仿 LLMChain 的示例
    const promptValue = await this.prompt.formatPromptValue(values);

    // 每当您调用语言模型或另一个链时，您应该向其传递
    // 一个回调管理器。这允许内部运行被外部运行上注册的
    // 任何回调跟踪。
    // 您总是可以通过调用 `runManager?.getChild()` 来获取
    // 回调管理器，如下所示。
    const result = await this.llm.generatePrompt(
      [promptValue],
      {},
      // 此标签 "a-tag" 将附加到此内部 LLM 调用
      runManager?.getChild("a-tag")
    );

    // 如果您想记录有关此运行的某些内容，可以通过调用
    // runManager 上的方法来实现，如下所示。这将触发为该事件
    // 注册的任何回调。
    runManager?.handleText("Log something about this run");

    return { output: result.generations[0][0].text };
  }

  _chainType(): string {
    return "my_custom_chain";
  }

  get inputKeys(): string[] {
    return ["input"];
  }

  get outputKeys(): string[] {
    return ["output"];
  }
}
