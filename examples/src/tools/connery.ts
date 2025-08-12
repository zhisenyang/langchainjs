/**
 * Connery 自动化工具集成示例
 * 
 * 这个文件演示了如何使用 Connery 服务集成外部自动化工具到 LangChain 智能代理中。
 * 主要功能：
 * 
 * 1. Connery 服务配置：
 *    - 配置 Connery Runner 连接
 *    - 设置 API 密钥认证
 *    - 连接到自动化服务
 * 
 * 2. 动作获取和执行：
 *    - 通过 ID 获取特定动作（如发送邮件）
 *    - 手动执行动作
 *    - 验证动作执行结果
 * 
 * 3. 智能代理集成：
 *    - 将 Connery 动作集成到 OpenAI 函数代理
 *    - 使用自然语言控制自动化任务
 *    - 智能任务调度和执行
 * 
 * 4. 实际应用场景：
 *    - 自动发送邮件通知
 *    - 会议延迟通知
 *    - 工作流自动化
 * 
 * 使用场景：
 * - 企业自动化集成
 * - 工作流程优化
 * - 智能任务调度
 * - 外部服务连接
 * - 业务流程自动化
 */

import { ConneryService } from "@langchain/community/tools/connery";
import { ChatOpenAI } from "@langchain/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";

// Specify your Connery Runner credentials.
process.env.CONNERY_RUNNER_URL = "";
process.env.CONNERY_RUNNER_API_KEY = "";

// Specify OpenAI API key.
process.env.OPENAI_API_KEY = "";

// Specify your email address to receive the emails from examples below.
const recepientEmail = "test@example.com";

// Get the SendEmail action from the Connery Runner by ID.
const conneryService = new ConneryService();
const sendEmailAction = await conneryService.getAction(
  "CABC80BB79C15067CA983495324AE709"
);

// Run the action manually.
const manualRunResult = await sendEmailAction.invoke({
  recipient: recepientEmail,
  subject: "Test email",
  body: "This is a test email sent by Connery.",
});
console.log(manualRunResult);

// Run the action using the OpenAI Functions agent.
const llm = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 });
const agent = await initializeAgentExecutorWithOptions([sendEmailAction], llm, {
  agentType: "openai-functions",
  verbose: true,
});
const agentRunResult = await agent.invoke({
  input: `Send an email to the ${recepientEmail} and say that I will be late for the meeting.`,
});
console.log(agentRunResult);
