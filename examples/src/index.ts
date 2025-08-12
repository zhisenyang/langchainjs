/**
 * LangChain.js 示例运行器
 * 
 * 这个文件是 LangChain.js 示例项目的主入口点，用于动态加载和运行指定的示例文件。
 * 主要功能：
 * - 解析命令行参数，获取要运行的示例文件路径
 * - 处理各种路径格式（相对路径、绝对路径等）
 * - 动态导入并执行指定的示例文件
 * - 处理异步执行和错误捕获
 * - 确保所有回调函数执行完毕
 */

import path from "path";
import url from "url";
import { awaitAllCallbacks } from "@langchain/core/callbacks/promises";

const [exampleName, ...args] = process.argv.slice(2);

if (!exampleName) {
  console.error("Please provide path to example to run");
  process.exit(1);
}

// Allow people to pass all possible variations of a path to an example
// ./src/foo.ts, ./dist/foo.js, src/foo.ts, dist/foo.js, foo.ts
let exampleRelativePath = exampleName;

if (exampleRelativePath.startsWith("./examples/")) {
  exampleRelativePath = exampleName.slice(11);
} else if (exampleRelativePath.startsWith("examples/")) {
  exampleRelativePath = exampleName.slice(9);
}

if (exampleRelativePath.startsWith("./src/")) {
  exampleRelativePath = exampleRelativePath.slice(6);
} else if (exampleRelativePath.startsWith("./dist/")) {
  exampleRelativePath = exampleRelativePath.slice(7);
} else if (exampleRelativePath.startsWith("src/")) {
  exampleRelativePath = exampleRelativePath.slice(4);
} else if (exampleRelativePath.startsWith("dist/")) {
  exampleRelativePath = exampleRelativePath.slice(5);
}

let runExample;
try {
  ({ run: runExample } = await import(
    path.join(
      path.dirname(url.fileURLToPath(import.meta.url)),
      exampleRelativePath
    )
  ));
} catch (e) {
  console.log(e);
  throw new Error(`Could not load example ${exampleName}: ${e}`);
}

if (runExample) {
  const maybePromise = runExample(args);

  if (maybePromise instanceof Promise) {
    maybePromise
      .catch((e) => {
        console.error(`Example failed with:`);
        console.error(e);
      })
      .finally(() => awaitAllCallbacks());
  }
}
