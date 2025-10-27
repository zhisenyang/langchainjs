/**
 * 高级链式处理子类示例
 * 
 * 这个文件演示了如何创建自定义的链式处理基类和抽象方法。
 * 主要功能：
 * 
 * 1. 抽象基类定义：
 *    - 定义 BaseChain 抽象基类
 *    - 提供链式处理的基础结构
 *    - 支持内存管理功能
 * 
 * 2. 核心抽象方法：
 *    - _call: 执行链式处理的核心逻辑
 *    - _chainType: 返回链类型的唯一标识
 *    - inputKeys: 定义输入参数键列表
 *    - outputKeys: 定义输出参数键列表
 * 
 * 3. 回调管理集成：
 *    - 支持 CallbackManagerForChainRun 回调管理
 *    - 提供异步处理能力
 *    - 支持运行时监控和调试
 * 
 * 4. 内存管理支持：
 *    - 可选的 BaseMemory 内存组件
 *    - 支持对话历史记录
 *    - 提供状态持久化能力
 * 
 * 使用场景：
 * - 自定义链式处理逻辑
 * - 复杂业务流程封装
 * - 可重用组件开发
 * - 框架扩展和定制
 */

import { CallbackManagerForChainRun } from "@langchain/core/callbacks/manager";
import { BaseMemory } from "@langchain/core/memory";
import { ChainValues } from "@langchain/core/utils/types";

abstract class BaseChain {
  memory?: BaseMemory;

  /**
   * 运行此链的核心逻辑并返回输出
   */
  abstract _call(
    values: ChainValues,
    runManager?: CallbackManagerForChainRun
  ): Promise<ChainValues>;

  /**
   * 返回唯一标识此链类的字符串类型键
   */
  abstract _chainType(): string;

  /**
   * 返回此链在调用时期望接收的输入键列表
   */
  abstract get inputKeys(): string[];

  /**
   * 返回此链在调用时将产生的输出键列表
   */
  abstract get outputKeys(): string[];
}
