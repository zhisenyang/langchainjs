/**
 * Google Calendar 工具集成智能代理示例
 * 
 * 这个文件演示了如何将 Google Calendar 工具集成到 LangChain 智能代理中，实现日历自动化管理。
 * 主要功能：
 * 
 * 1. 日历工具配置：
 *    - 配置 Google Calendar API 认证
 *    - 设置服务账户凭据
 *    - 指定日历权限范围
 * 
 * 2. 工具集成：
 *    - GoogleCalendarCreateTool: 创建日历事件
 *    - GoogleCalendarViewTool: 查看日历事件
 *    - Calculator: 数学计算工具
 * 
 * 3. 智能代理功能：
 *    - 使用 React 代理架构
 *    - 自然语言处理日历操作
 *    - 多工具协同工作
 * 
 * 4. 实际应用场景：
 *    - 创建会议并添加计算结果到议程
 *    - 查询本周会议安排
 *    - 智能日程管理
 * 
 * 使用场景：
 * - 智能日历助手
 * - 会议安排自动化
 * - 日程管理机器人
 * - 企业办公自动化
 */

import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { Calculator } from "@langchain/community/tools/calculator";
import {
  GoogleCalendarCreateTool,
  GoogleCalendarViewTool,
} from "@langchain/community/tools/google_calendar";

export async function run() {
  const model = new ChatOpenAI({
    temperature: 0,
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
  });

  const googleCalendarParams = {
    credentials: {
      clientEmail: process.env.GOOGLE_CALENDAR_CLIENT_EMAIL,
      privateKey: process.env.GOOGLE_CALENDAR_PRIVATE_KEY,
      calendarId: process.env.GOOGLE_CALENDAR_CALENDAR_ID,
    },
    scopes: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ],
    model,
  };

  const tools = [
    new Calculator(),
    new GoogleCalendarCreateTool(googleCalendarParams),
    new GoogleCalendarViewTool(googleCalendarParams),
  ];

  const calendarAgent = createReactAgent({
    llm: model,
    tools,
  });

  const createInput = `Create a meeting with John Doe next Friday at 4pm - adding to the agenda of it the result of 99 + 99`;

  const createResult = await calendarAgent.invoke({
    messages: [{ role: "user", content: createInput }],
  });
  //   Create Result {
  //     output: 'A meeting with John Doe on 29th September at 4pm has been created and the result of 99 + 99 has been added to the agenda.'
  //   }
  console.log("Create Result", createResult);

  const viewInput = `What meetings do I have this week?`;

  const viewResult = await calendarAgent.invoke({
    messages: [{ role: "user", content: viewInput }],
  });
  //   View Result {
  //     output: "You have no meetings this week between 8am and 8pm."
  //   }
  console.log("View Result", viewResult);
}
