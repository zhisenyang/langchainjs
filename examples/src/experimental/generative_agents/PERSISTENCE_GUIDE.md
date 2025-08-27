# 生成式智能体记忆持久化指南

## 概述

本指南说明如何修改生成式智能体代码以支持记忆持久化，使智能体能够在程序重启后保留之前的经历和学习成果。

## 主要修改

### 1. 依赖更新

将原来的内存向量存储替换为FAISS向量存储：

```typescript
// 原来的导入
import { MemoryVectorStore } from "langchain/vectorstores/memory";

// 修改为
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import * as fs from "fs/promises";
import * as path from "path";
```

### 2. 记忆检索器创建函数

修改 `createNewMemoryRetriever` 函数以支持持久化：

```typescript
const createNewMemoryRetriever = async (agentName: string) => {
  const storageDir = path.join(process.cwd(), "agent_memories", agentName);
  let vectorStore: FaissStore;

  try {
    // 尝试加载已存在的记忆
    await fs.access(storageDir);
    console.log(`正在加载 ${agentName} 的记忆...`);
    vectorStore = await FaissStore.load(storageDir, new OpenAIEmbeddings());
    console.log(`成功加载 ${agentName} 的记忆`);
  } catch (error) {
    // 创建新的记忆存储
    console.log(`为 ${agentName} 创建新的记忆存储...`);
    vectorStore = await FaissStore.fromTexts(
      ["初始化记忆"],
      [{ type: "initialization" }],
      new OpenAIEmbeddings()
    );
  }

  const retriever = new TimeWeightedVectorStoreRetriever({
    vectorStore,
    otherScoreKeys: ["importance"],
    k: 15,
  });

  return {
    retriever,
    saveMemory: async () => {
      await fs.mkdir(path.dirname(storageDir), { recursive: true });
      await vectorStore.save(storageDir);
      console.log(`已保存 ${agentName} 的记忆到 ${storageDir}`);
    }
  };
};
```

### 3. 智能体初始化

更新智能体的初始化代码：

```typescript
// Tommie
const tommieMemorySetup = await createNewMemoryRetriever("Tommie");
const tommiesMemory = new GenerativeAgentMemory(
  llm,
  tommieMemorySetup.retriever,
  { reflectionThreshold: 8 }
);

// Eve
const eveMemorySetup = await createNewMemoryRetriever("Eve");
const evesMemory = new GenerativeAgentMemory(
  llm,
  eveMemorySetup.retriever,
  { reflectionThreshold: 5 }
);
```

### 4. 定期保存

在观察循环中添加定期保存：

```typescript
for (let i = 0; i < observations.length; i += 1) {
  const observation = observations[i];
  const [, reaction] = await tommie.generateReaction(observation);
  console.log("\x1b[32m", observation, "\x1b[0m", reaction);
  
  if ((i + 1) % 20 === 0) {
    // 显示摘要
    console.log("*".repeat(40));
    console.log(`经过 ${i + 1} 个观察后，Tommie 的摘要为:\n${await tommie.getSummary({ forceRefresh: true })}`);
    console.log("*".repeat(40));
    
    // 定期保存记忆
    console.log("正在保存 Tommie 的记忆...");
    await tommieMemorySetup.saveMemory();
  }
}
```

### 5. 最终保存

在程序结束时保存所有记忆：

```typescript
// 保存智能体的记忆到本地文件
console.log("正在保存智能体记忆...");
await tommieMemorySetup.saveMemory();
await eveMemorySetup.saveMemory();
console.log("记忆保存完成！");
```

## 文件结构

运行程序后会创建以下目录结构：

```
agent_memories/
├── Tommie/
│   ├── faiss.index      # FAISS索引文件
│   ├── docstore.json    # 文档存储
│   └── args.json        # 配置参数
└── Eve/
    ├── faiss.index
    ├── docstore.json
    └── args.json
```

## 使用方法

### 首次运行
```bash
cd examples
npm run start
# 或者直接运行特定文件
npx tsx src/experimental/generative_agents/generative_agents.ts
```

### 后续运行
再次运行相同命令，智能体会自动加载之前保存的记忆。

### 重置记忆
删除记忆文件夹来重置智能体：
```bash
rm -rf agent_memories
```

## 优势

1. **持久性**: 智能体记忆在程序重启后保持
2. **性能**: FAISS提供高效的向量搜索
3. **可扩展性**: 支持大量记忆数据
4. **独立性**: 每个智能体有独立的记忆存储
5. **备份**: 可以轻松备份和恢复记忆文件

## 注意事项

1. **API密钥**: 确保设置了有效的OpenAI API密钥
2. **存储空间**: 记忆文件会随时间增长
3. **兼容性**: 保持LangChain版本一致性
4. **权限**: 确保程序有文件读写权限

## 故障排除

### 常见问题

1. **模块找不到错误**: 确保安装了所有依赖
   ```bash
   npm install @langchain/community @langchain/openai
   ```

2. **文件权限错误**: 检查目录写入权限
   ```bash
   chmod 755 agent_memories
   ```

3. **记忆加载失败**: 删除损坏的记忆文件重新开始
   ```bash
   rm -rf agent_memories/AgentName
   ```

### 调试技巧

1. 检查记忆文件是否存在：
   ```bash
   ls -la agent_memories/
   ```

2. 查看记忆文件大小：
   ```bash
   du -sh agent_memories/*
   ```

3. 启用详细日志输出来跟踪记忆操作

## 扩展功能

可以进一步添加的功能：

1. **记忆压缩**: 定期清理旧的或不重要的记忆
2. **版本控制**: 为记忆文件添加版本管理
3. **云存储**: 将记忆同步到云端
4. **记忆分析**: 分析智能体的记忆模式
5. **记忆共享**: 允许智能体之间共享某些记忆