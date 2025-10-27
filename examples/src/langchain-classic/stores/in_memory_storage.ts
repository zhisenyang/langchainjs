/**
 * 内存存储示例
 * 
 * 这个文件演示了如何使用 LangChain 的 InMemoryStore 来存储和管理消息数据。
 * 主要功能：
 * 
 * 1. 内存存储初始化：
 *    - 创建 InMemoryStore 实例
 *    - 配置存储 BaseMessage 类型数据
 *    - 提供快速的内存访问
 * 
 * 2. 消息数据管理：
 *    - 创建 AI 和人类消息的示例数据
 *    - 使用循环生成交替的消息类型
 *    - 模拟真实的对话场景
 * 
 * 3. 批量存储操作：
 *    - 使用 mset 方法批量设置多个键值对
 *    - 采用前缀命名规范 (message:id:index)
 *    - 高效的批量数据写入
 * 
 * 4. 数据检索功能：
 *    - 使用 mget 方法批量获取指定键的数据
 *    - 支持部分键的选择性检索
 *    - 保持数据类型和结构完整性
 * 
 * 5. 键管理和遍历：
 *    - 使用 yieldKeys 方法遍历所有键
 *    - 支持前缀过滤功能
 *    - 异步迭代器模式
 * 
 * 6. 数据清理：
 *    - 使用 mdelete 方法批量删除数据
 *    - 完整的生命周期管理
 * 
 * 使用场景：
 * - 对话历史缓存
 * - 临时数据存储
 * - 会话状态管理
 * - 快速原型开发
 * - 测试和开发环境
 */

import { InMemoryStore } from "@langchain/core/stores";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";

// Instantiate the store using the `fromPath` method.
const store = new InMemoryStore<BaseMessage>();
/**
 * Here you would define your LLM and chat chain, call
 * the LLM and eventually get a list of messages.
 * For this example, we'll assume we already have a list.
 */
const messages = Array.from({ length: 5 }).map((_, index) => {
  if (index % 2 === 0) {
    return new AIMessage("ai stuff...");
  }
  return new HumanMessage("human stuff...");
});
// Set your messages in the store
// The key will be prefixed with `message:id:` and end
// with the index.
await store.mset(
  messages.map((message, index) => [`message:id:${index}`, message])
);
// Now you can get your messages from the store
const retrievedMessages = await store.mget(["message:id:0", "message:id:1"]);
console.log(retrievedMessages.map((v) => v));
/**
[
  AIMessage {
    lc_kwargs: { content: 'ai stuff...', additional_kwargs: {} },
    content: 'ai stuff...',
    ...
  },
  HumanMessage {
    lc_kwargs: { content: 'human stuff...', additional_kwargs: {} },
    content: 'human stuff...',
    ...
  }
]
 */
// Or, if you want to get back all the keys you can call
// the `yieldKeys` method.
// Optionally, you can pass a key prefix to only get back
// keys which match that prefix.
const yieldedKeys = [];
for await (const key of store.yieldKeys("message:id:")) {
  yieldedKeys.push(key);
}
// The keys are not encoded, so no decoding is necessary
console.log(yieldedKeys);
/**
[
  'message:id:0',
  'message:id:1',
  'message:id:2',
  'message:id:3',
  'message:id:4'
]
 */
// Finally, let's delete the keys from the store
await store.mdelete(yieldedKeys);
