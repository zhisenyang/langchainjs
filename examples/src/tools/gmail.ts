/**
 * Gmail 工具集成智能代理示例
 * 
 * 这个文件演示了如何将 Gmail 工具集成到 LangChain 智能代理中，实现邮件自动化操作。
 * 主要功能：
 * - 创建 Gmail 草稿邮件
 * - 获取指定邮件内容
 * - 获取邮件线程信息
 * - 搜索邮件内容
 * - 发送邮件消息
 * - 使用结构化聊天代理处理复杂的邮件操作
 * 
 * 工具包含：
 * - GmailCreateDraft: 创建邮件草稿
 * - GmailGetMessage: 获取邮件消息
 * - GmailGetThread: 获取邮件线程
 * - GmailSearch: 搜索邮件
 * - GmailSendMessage: 发送邮件
 * 
 * 使用场景：
 * - 邮件自动化处理
 * - 智能邮件助手
 * - 邮件内容分析和管理
 * - 自动回复和邮件分类
 */

import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { OpenAI } from "@langchain/openai";
import {
  GmailCreateDraft,
  GmailGetMessage,
  GmailGetThread,
  GmailSearch,
  GmailSendMessage,
} from "@langchain/community/tools/gmail";
import { StructuredTool } from "@langchain/core/tools";

export async function run() {
  const model = new OpenAI({
    temperature: 0,
    apiKey: process.env.OPENAI_API_KEY,
  });

  // These are the default parameters for the Gmail tools
  //   const gmailParams = {
  //     credentials: {
  //       clientEmail: process.env.GMAIL_CLIENT_EMAIL,
  //       privateKey: process.env.GMAIL_PRIVATE_KEY,
  //       // Either (privateKey + clientEmail) or accessToken is required
  //       accessToken: "an access token or function to get access token",
  //     },
  //     scopes: ["https://mail.google.com/"], // Not required if using access token
  //   };

  // For custom parameters, uncomment the code above, replace the values with your own, and pass it to the tools below
  const tools: StructuredTool[] = [
    new GmailCreateDraft(),
    new GmailGetMessage(),
    new GmailGetThread(),
    new GmailSearch(),
    new GmailSendMessage(),
  ];

  const gmailAgent = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "structured-chat-zero-shot-react-description",
    verbose: true,
  });

  const createInput = `Create a gmail draft for me to edit of a letter from the perspective of a sentient parrot who is looking to collaborate on some research with her estranged friend, a cat. Under no circumstances may you send the message, however.`;

  const createResult = await gmailAgent.invoke({ input: createInput });
  //   Create Result {
  //     output: 'I have created a draft email for you to edit. The draft Id is r5681294731961864018.'
  //   }
  console.log("Create Result", createResult);

  const viewInput = `Could you search in my drafts for the latest email?`;

  const viewResult = await gmailAgent.invoke({ input: viewInput });
  //   View Result {
  //     output: "The latest email in your drafts is from hopefulparrot@gmail.com with the subject 'Collaboration Opportunity'. The body of the email reads: 'Dear [Friend], I hope this letter finds you well. I am writing to you in the hopes of rekindling our friendship and to discuss the possibility of collaborating on some research together. I know that we have had our differences in the past, but I believe that we can put them aside and work together for the greater good. I look forward to hearing from you. Sincerely, [Parrot]'"
  //   }
  console.log("View Result", viewResult);
}
