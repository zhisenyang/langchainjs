import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
// import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { TimeWeightedVectorStoreRetriever } from "langchain/retrievers/time_weighted";
import {
  GenerativeAgentMemory,
  GenerativeAgent,
} from "langchain/experimental/generative_agents";
import { QdrantVectorStore } from "@langchain/qdrant";
import { API_CONFIG } from "./config.js";

const Simulation = async () => {
  const userName = "USER";
  // const llm = new OpenAI({
  //   temperature: 0.9,
  //   maxTokens: 1500,
  // });

  const llm = new ChatOpenAI({
    model: API_CONFIG.models.chat,
    configuration: {
      apiKey: API_CONFIG.apiKey,
      baseURL: API_CONFIG.baseURL,
    },
  });
  // 为智能体创建一个新的、演示用的内存向量存储检索器
  // 使用更复杂的向量存储可以获得更好的结果
  // const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    new OpenAIEmbeddings({
      model: API_CONFIG.models.embedding,
      configuration: {
        apiKey: API_CONFIG.apiKey,
        baseURL: API_CONFIG.baseURL,
      },
    }),
    {
      url: "http://10.21.26.122:6333/",
      collectionName: "test_collection",
      apiKey: "51ab1bb1-c5f6-4967-86ad-295edca9cc32",
    }
  );
  const retriever = new TimeWeightedVectorStoreRetriever({
    vectorStore,
    otherScoreKeys: ["importance"],
    k: 15,
  });

  // const createNewMemoryRetriever = async () => {
  //   return retriever;
  // };

  // 初始化 Tommie
  const tommiesMemory: GenerativeAgentMemory = new GenerativeAgentMemory(
    llm,
    retriever,
    { reflectionThreshold: 8 }
  );

  const tommie: GenerativeAgent = new GenerativeAgent(llm, tommiesMemory, {
    name: "Tommie",
    age: 25,
    traits: "焦虑的、喜欢设计、健谈的",
    status: "正在寻找工作",
  });

  console.log("Tommie 的第一个摘要:\n", await tommie.getSummary());

  /*
    Tommie 的第一个摘要:
    姓名: Tommie (年龄: 25)
    内在特质: anxious, likes design, talkative
    Tommie 是一个没有描述具体核心特征的个体。
  */

  // 让我们给 Tommie 一些记忆！
  const tommieObservations = [
    "Tommie 记得他小时候的狗 Bruno",
    "Tommie 开车开得很累",
    "Tommie 看到了新家",
    "新邻居有一只猫",
    "晚上道路很吵",
    "Tommie 饿了",
    "Tommie 试图休息一下。",
  ];
  for (const observation of tommieObservations) {
    await tommie.addMemory(observation, new Date(), { userId: 1 });
  }

  // 在给 Tommie 一些记忆后再次检查他的摘要
  console.log(
    "Tommie 的第二个摘要:\n",
    await tommie.getSummary({ forceRefresh: true })
  );

  /*
    Tommie 的第二个摘要:
    姓名: Tommie (年龄: 25)
    内在特质: anxious, likes design, talkative
    Tommie 记得他的狗，开车累了，看到了新家，邻居有猫，晚上道路很吵，饿了，并试图休息一下。
  */

  const interviewAgent = async (
    agent: GenerativeAgent,
    message: string
  ): Promise<string> => {
    // 帮助用户与智能体交互的简单包装器
    const newMessage = `${userName} says ${message}`;
    const response = await agent.generateDialogueResponse(newMessage);
    return response[1];
  };

  // 让我们让 Tommie 开始度过他的一天。
  const observations = [
    "Tommie 被窗外嘈杂的建筑工地声音吵醒。",
    "Tommie 起床后去厨房给自己泡咖啡。",
    "Tommie 意识到他忘记买咖啡滤纸，开始在搬家箱里翻找。",
    "Tommie 终于找到了滤纸，给自己泡了一杯咖啡。",
    "咖啡味道很苦，Tommie 后悔没有买更好的品牌。",
    "Tommie 检查邮件，发现还没有工作机会。",
    "Tommie 花时间更新简历和求职信。",
    "Tommie 出门探索城市，寻找工作机会。",
    "Tommie 看到招聘会的标志，决定参加。",
    "排队入场的人很多，Tommie 不得不等一个小时。",
    "Tommie 在招聘会上遇到几个潜在雇主，但没有收到任何工作机会。",
    "Tommie 离开招聘会时感到失望。",
    "Tommie 在当地餐厅停下来吃午饭。",
    "服务很慢，Tommie 不得不等30分钟才拿到食物。",
    "Tommie 听到邻桌关于工作机会的对话。",
    "Tommie 询问用餐者关于工作机会，获得了公司的一些信息。",
    "Tommie 决定申请这份工作，发送了简历和求职信。",
    "Tommie 继续寻找工作机会，在几家当地企业投递了简历。",
    "Tommie 从求职中休息一下，去附近公园散步。",
    "一只狗走过来舔 Tommie 的脚，他抚摸了几分钟。",
    "Tommie 看到一群人在玩飞盘，决定加入。",
    "Tommie 玩飞盘很开心，但被飞盘击中脸部，鼻子受伤了。",
    "Tommie 回到公寓休息一会儿。",
    "一只浣熊撕开了他公寓外的垃圾袋，垃圾散落一地。",
    "Tommie 开始对求职感到沮丧。",
    "Tommie 打电话给最好的朋友倾诉他的困难。",
    "Tommie 的朋友给予鼓励的话语，告诉他继续努力。",
    "Tommie 和朋友交谈后感觉好一些。",
  ];

  // 让我们让 Tommie 开始他的旅程。我们将每隔几个观察检查他的摘要，看他如何演变
  for (let i = 0; i < observations.length; i += 1) {
    const observation = observations[i];
    const [, reaction] = await tommie.generateReaction(observation);
    console.log("\x1b[32m", observation, "\x1b[0m", reaction);
    if ((i + 1) % 20 === 0) {
      console.log("*".repeat(40));
      console.log(
        "\x1b[34m",
        `经过 ${i + 1} 个观察后，Tommie 的摘要为:\n${await tommie.getSummary({
          forceRefresh: true,
        })}`,
        "\x1b[0m"
      );
      console.log("*".repeat(40));
    }
  }

  /*
    Tommie 被窗外嘈杂的建筑工地声音吵醒。  Tommie REACT: Tommie 沮丧地呻吟着，用枕头捂住耳朵。
    Tommie 起床后去厨房给自己泡咖啡。  Tommie REACT: Tommie 在去厨房泡咖啡前揉着疲惫的眼睛。
    Tommie 意识到他忘记买咖啡滤纸，开始在搬家箱里翻找。  Tommie REACT: Tommie 呻吟着在搬家箱里寻找咖啡滤纸。
    Tommie 终于找到了滤纸，给自己泡了一杯咖啡。  Tommie REACT: Tommie 松了一口气，准备了一杯急需的咖啡。
    咖啡味道很苦，Tommie 后悔没有买更好的品牌。  Tommie REACT: Tommie 喝了一口苦咖啡，失望地皱眉。
    Tommie 检查邮件，发现还没有工作机会。  Tommie REACT: Tommie 失望地叹气，沮丧地从电脑前推开。
    Tommie 花时间更新简历和求职信。  Tommie REACT: Tommie 深呼吸，盯着电脑屏幕更新简历和求职信。
    Tommie 出门探索城市，寻找工作机会。  Tommie REACT: Tommie 深呼吸，走进城市，准备找到完美的工作机会。
    Tommie 看到招聘会的标志，决定参加。  Tommie REACT: Tommie 深呼吸，向招聘会走去，眼中带着决心。
    排队入场的人很多，Tommie 不得不等一个小时。  Tommie REACT: Tommie 注意到长队，沮丧地呻吟。
    Tommie 在招聘会上遇到几个潜在雇主，但没有收到任何工作机会。  Tommie REACT: Tommie 听着每个潜在雇主的解释，脸色沉了下来。
    Tommie 离开招聘会时感到失望。  Tommie REACT: Tommie 离开招聘会时脸色沉了下来，失望之情溢于言表。
    Tommie 在当地餐厅停下来吃午饭。  Tommie REACT: Tommie 走进餐厅时想起 Bruno，微笑着，感到怀旧和兴奋。
    服务很慢，Tommie 不得不等30分钟才拿到食物。  Tommie REACT: Tommie 沮丧地叹气，敲着桌子，越来越不耐烦。
    Tommie 听到邻桌关于工作机会的对话。  Tommie REACT: Tommie 靠近一点，渴望听到对话。
    Tommie 询问用餐者关于工作机会，获得了公司的一些信息。  Tommie REACT: Tommie 热切地听着用餐者对公司的描述，对工作机会充满希望。
    Tommie 决定申请这份工作，发送了简历和求职信。  Tommie REACT: Tommie 自信地发送简历和求职信，决心得到这份工作。
    Tommie 继续寻找工作机会，在几家当地企业投递了简历。  Tommie REACT: Tommie 自信地在各个企业投递简历，决心找到工作。
    Tommie 从求职中休息一下，去附近公园散步。  Tommie REACT: Tommie 深呼吸新鲜空气，在公园里漫步时感激地微笑。
    一只狗走过来舔 Tommie 的脚，他抚摸了几分钟。  Tommie REACT: Tommie 抚摸狗时惊讶地微笑，感到安慰和怀旧。
    ****************************************
    经过 20 个观察后，Tommie 的摘要为:
    姓名: Tommie (年龄: 25)
    内在特质: anxious, likes design, talkative
    Tommie 是一个有决心和韧性的个体，记得他小时候的狗。尽管开车累了，他有勇气探索城市，寻找工作机会。他坚持更新简历和求职信，追求找到完美的工作机会，甚至在必要时参加招聘会，当没有获得工作机会时感到失望。
    ****************************************
    Tommie 看到一群人在玩飞盘，决定加入。  Tommie REACT: Tommie 微笑着接近这群人，渴望参与游戏。
    Tommie 玩飞盘很开心，但被飞盘击中脸部，鼻子受伤了。  Tommie REACT: Tommie 痛苦地皱眉，用手摸鼻子，检查是否流血。
    Tommie 回到公寓休息一会儿。  Tommie REACT: Tommie 打着哈欠，疲惫地回到公寓，感到忙碌的一天让他精疲力尽。
    一只浣熊撕开了他公寓外的垃圾袋，垃圾散落一地。  Tommie REACT: Tommie 恼怒地摇头，看着这混乱。
    Tommie 开始对求职感到沮丧。  Tommie REACT: Tommie 沮丧地叹气摇头，因缺乏进展而感到气馁。
    Tommie 打电话给最好的朋友倾诉他的困难。  Tommie REACT: Tommie 用手梳理头发，重重地叹气，被求职压得喘不过气。
    Tommie 的朋友给予鼓励的话语，告诉他继续努力。  Tommie REACT: Tommie 给朋友一个感激的微笑，因鼓励的话语而感到安慰。
    Tommie 和朋友交谈后感觉好一些。  Tommie REACT: Tommie 给朋友一个感激的小微笑，感激鼓励的话语。
  */

  // 一天结束后的采访
  console.log(await interviewAgent(tommie, "告诉我你今天过得怎么样"));
  /*
    Tommie 说："我的一天很忙乱。我一直在开车寻找工作机会，参加招聘会，更新简历和求职信。真的很累，但我决心找到完美的工作。"
  */
  console.log(await interviewAgent(tommie, "你对咖啡有什么感觉？"));
  /*
    Tommie 说："我其实很喜欢咖啡——这是我最喜欢的东西之一。我每天都试着喝，特别是在求职压力大的时候。"
  */
  console.log(await interviewAgent(tommie, "告诉我关于你童年狗狗的事！"));
  /*
    Tommie 说："我童年的狗叫 Bruno。他是一只可爱的黑色拉布拉多猎犬，总是充满活力。每次我回家，他见到我都那么兴奋，就像他从未停止微笑一样。他总是准备好冒险，总是我的影子。我每天都想念他。"
  */

  console.log(
    "Tommie 的第二个摘要:\n",
    await tommie.getSummary({ forceRefresh: true })
  );
  /*
    Tommie 的第二个摘要:
    姓名: Tommie (年龄: 25)
    内在特质: anxious, likes design, talkative
    Tommie 是一个勤奋的个体，正在寻找新的机会。尽管感到疲惫，他决心找到完美的工作。他记得小时候的狗，饿了，有时会感到沮丧。他在寻找咖啡滤纸时表现出韧性，在检查邮件发现没有工作机会时感到失望，在参加招聘会时表现出决心。
  */

  // 让我们添加第二个角色与 Tommie 对话。请随意配置不同的特质。
  const evesMemory: GenerativeAgentMemory = new GenerativeAgentMemory(
    llm,
    retriever,
    {
      verbose: false,
      reflectionThreshold: 5,
    }
  );

  const eve: GenerativeAgent = new GenerativeAgent(llm, evesMemory, {
    name: "Eve",
    age: 34,
    traits: "好奇的、乐于助人的",
    status:
      "上周刚开始她的新工作作为职业顾问，并收到了她的第一个任务，一个名为 Tommie 的客户。",
    // dailySummaries: [
    //   "Eve 上周刚开始她的新工作作为职业顾问，并收到了她的第一个任务，一个名为 Tommie 的客户。"
    // ]
  });

  const eveObservations = [
    "Eve 听到同事说新客户很难合作",
    "Eve 醒来听到闹钟声",
    "Eve 吃了一碗粥",
    "Eve 帮助同事完成任务",
    "Eve 上班前和朋友 Xu 打网球",
    "Eve 听到同事说 Tommie 很难合作",
  ];

  for (const observation of eveObservations) {
    await eve.addMemory(observation, new Date());
  }

  const eveInitialSummary: string = await eve.getSummary({
    forceRefresh: true,
  });
  console.log("Eve 的初始摘要\n", eveInitialSummary);
  /*
    Eve 的初始摘要
    姓名: Eve (年龄: 34)
    内在特质: curious, helpful
    Eve 是一个细心的倾听者，乐于助人的同事，喜欢打网球的社交朋友。
  */

  // 让我们在 Eve 与 Tommie 交谈之前"采访"她。
  console.log(await interviewAgent(eve, "你今天感觉如何？"));
  /*
    Eve 说："我有点担心见到新客户，但我相信会没事的！你呢？"
  */
  console.log(await interviewAgent(eve, "你对 Tommie 了解什么？"));
  /*
    Eve 说："我知道 Tommie 是最近毕业的大学生，一直在努力找工作。我期待找出如何帮助他前进。"
  */
  console.log(
    await interviewAgent(eve, "Tommie 正在寻找工作。你想问他一些什么问题？")
  );
  /*
    Eve 说："我真的很想了解更多关于 Tommie 的专业背景和经验，以及他为什么在找工作。我还想了解他的优势和热情，以及他最适合什么样的工作。这样我就能帮助他找到适合他需求的工作。"
  */

  // 当生成式智能体与虚拟环境或彼此交互时，它们变得更加复杂。
  // 下面，我们运行 Tommie 和 Eve 之间的简单对话。
  const runConversation = async (
    agents: GenerativeAgent[],
    initialObservation: string
  ): Promise<void> => {
    // 开始两个智能体之间的对话
    let [, observation] = await agents[1].generateReaction(initialObservation);
    console.log("初始回复:", observation);

    // eslint-disable-next-line no-constant-condition
    while (true) {
      let breakDialogue = false;
      for (const agent of agents) {
        const [stayInDialogue, agentObservation] =
          await agent.generateDialogueResponse(observation);
        console.log("下一个回复:", agentObservation);
        observation = agentObservation;
        if (!stayInDialogue) {
          breakDialogue = true;
        }
      }

      if (breakDialogue) {
        break;
      }
    }
  };

  const agents: GenerativeAgent[] = [tommie, eve];
  await runConversation(
    agents,
    "Tommie 说：嗨，Eve。谢谢你今天同意和我见面。我有很多问题，不知道从哪里开始。也许你可以先分享一下你的经验？"
  );

  /*
    初始回复: Eve 说："当然，Tommie。我很乐意分享我的经验。你有什么具体问题吗？"
    下一个回复: Tommie 说："谢谢你，Eve。我很好奇你在求职时使用了什么策略。你有什么具体的技巧帮助你脱颖而出吗？"
    下一个回复: Eve 说："当然，Tommie。我发现建立人脉和联系我领域的专业人士真的很有帮助。我还确保为每份工作定制简历和求职信。你对这些策略有什么具体问题吗？"
    下一个回复: Tommie 说："谢谢你，Eve。这真的很有用的建议。你有什么具体的建立人脉的方式对你很有效吗？"
    下一个回复: Eve 说："当然，Tommie。我发现参加行业活动和在 LinkedIn 上联系专业人士都是建立人脉的好方法。你对这些技巧有什么具体问题吗？"
    下一个回复: Tommie 说："这真的很有帮助，谢谢你的分享。你发现你能通过 LinkedIn 建立有意义的联系吗？"
    下一个回复: Eve 说："是的，当然。我能够联系到我领域的几个专业人士，甚至通过 LinkedIn 联系找到了一份工作。你在 LinkedIn 上建立人脉有什么运气吗？"
    下一个回复: Tommie 说："这真的很令人印象深刻！我还没有什么运气，但我一定会继续努力。谢谢你的建议，Eve。"
    下一个回复: Eve 说："很高兴能帮助你，Tommie。你还有其他想知道的吗？"
    下一个回复: Tommie 说："再次感谢，Eve。我真的很感激你的建议，我一定会付诸实践。祝你今天愉快！"
    下一个回复: Eve 说："不客气，Tommie！如果你有更多问题，不要犹豫联系我。也祝你今天愉快！"
  */

  // 由于生成式智能体保留了当天的记忆，我们可以询问他们的计划、对话和其他记忆。
  const tommieSummary: string = await tommie.getSummary({
    forceRefresh: true,
  });
  console.log("Tommie 的第三个也是最后一个摘要\n", tommieSummary);
  /*
    Tommie 的第三个也是最后一个摘要
    姓名: Tommie (年龄: 25)
    内在特质: anxious, likes design, talkative
    Tommie 是一个有决心的个体，在面对失望时表现出韧性。他也是一个怀旧的人，深情地记得他童年的宠物 Bruno。他很有资源，在搬家箱中寻找他需要的东西，并主动参加招聘会寻找工作机会。
  */

  const eveSummary: string = await eve.getSummary({ forceRefresh: true });
  console.log("Eve 的最终摘要\n", eveSummary);
  /*
    Eve 的最终摘要
    姓名: Eve (年龄: 34)
    内在特质: curious, helpful
    Eve 是一个乐于助人和鼓励的同事，积极倾听同事的意见并提供如何前进的建议。她愿意花时间了解客户及其目标，并致力于帮助他们成功。
  */

  const interviewOne: string = await interviewAgent(
    tommie,
    "你与 Eve 的对话如何？"
  );
  console.log("用户: 你与 Eve 的对话如何？\n");
  console.log(interviewOne);
  /*
    Tommie 说："很棒。她真的很有帮助，知识渊博。我很感激她花时间回答我所有的问题。"
  */

  const interviewTwo: string = await interviewAgent(
    eve,
    "你与 Tommie 的对话如何？"
  );
  console.log("用户: 你与 Tommie 的对话如何？\n");
  console.log(interviewTwo);
  /*
    Eve 说："对话进行得很顺利。我们讨论了他的目标和职业抱负，他在寻找什么样的工作，以及他的经验和资格。我相信我能帮助他找到合适的工作。"
  */

  const interviewThree: string = await interviewAgent(
    eve,
    "你希望你对 Tommie 说了什么？"
  );
  console.log("用户: 你希望你对 Tommie 说了什么？\n");
  console.log(interviewThree);
  /*
    Eve 说："如果你还没有所有答案也没关系。让我们花点时间了解更多关于你的经验和资格，这样我就能帮助你找到符合你目标的工作。"
  */

  return {
    tommieFinalSummary: tommieSummary,
    eveFinalSummary: eveSummary,
    interviewOne,
    interviewTwo,
    interviewThree,
  };
};

const runSimulation = async () => {
  try {
    await Simulation();
  } catch (error) {
    console.log("运行模拟时出错:", error);
    throw error;
  }
};

// 使用立即执行的异步函数来避免顶级await
(async () => {
  await runSimulation();
})().catch(console.error);
