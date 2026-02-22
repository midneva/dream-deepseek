import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// DeepSeek配置
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1'
});

// 内存存储
const sessions = new Map();
const lightLibrary = new Map();

app.use(cors());
app.use(express.json());

// ========== 剧本库 - 带着爱与光明的真实案例 ==========
const storyLibrary = {
  lottery: {
    name: '一夜暴富',
    description: '突然获得巨额财富后的人生变化',
    blessing: '愿你在财富的洪流中，依然能找到内心的平静',
    realCases: [
      {
        name: '杰克·惠特克',
        event: '2002年赢得3.15亿美元彩票，随后遭遇孙女吸毒过量死亡、妻子离婚、被抢劫等悲剧',
        insight: '金钱买不来幸福，反而可能放大生活中的问题',
        light: '真正的富有是内心的安宁'
      },
      {
        name: '中国拆迁户',
        event: '突然获得数百万补偿款，但很多人陷入赌博、挥霍，最终返贫',
        insight: '没有财富管理能力的暴富，往往是一场灾难',
        light: '财富是工具，不是目的'
      }
    ],
    themes: ['财富与孤独', '人际关系的考验', '身份认同危机', '存在主义焦虑']
  },
  fame: {
    name: '一夜成名',
    description: '突然成为公众人物后的生活变化',
    blessing: '愿你在聚光灯下，依然能保持真实的自己',
    realCases: [
      {
        name: '网红主播',
        event: '从素人到百万粉丝，经历了网暴、隐私被扒、精神崩溃',
        insight: '成名的代价是被千万人审视，失去普通人的自由',
        light: '真实比完美更珍贵'
      }
    ],
    themes: ['隐私与曝光', '真实与表演', '粉丝的期待', '自我迷失']
  },
  startup: {
    name: '创业成功',
    description: '公司突然估值暴涨后的创始人困境',
    blessing: '愿你在成功的路上，不忘记为什么出发',
    realCases: [
      {
        name: '科技新贵',
        event: '公司估值10亿，但每天工作16小时，婚姻破裂，健康恶化',
        insight: '成功的背后往往是破碎的生活',
        light: '事业是为了更好的生活，而不是相反'
      }
    ],
    themes: ['工作与生活的平衡', '责任的重量', '创始人的孤独']
  },
  love: {
    name: '放弃爱情',
    description: '为了事业/理想放弃深爱的人',
    blessing: '愿你的选择，最终能被时间温柔以待',
    realCases: [
      {
        name: '事业型人物',
        event: '选择了事业巅峰，却在深夜想起那个离开的人',
        insight: '有些选择，要用一生去承担',
        light: '遗憾也是人生的一部分，接纳它'
      }
    ],
    themes: ['遗憾与释然', '选择的代价', '时间的治愈']
  }
};

// 光的种子
const lightSeeds = [
  "无论你现在经历什么，请相信，这一切都是你灵魂选择的功课。",
  "真正的光明，不是没有黑暗，而是在黑暗中依然选择前行。",
  "你并不孤单，有无数人和你一样，在寻找生命的意义。",
  "每一次选择都是一次成长，无论结果如何，你都变得更强大了。",
  "愿你在迷茫时，能听见内心最真实的声音。",
  "财富、名声、成功，都是外在的。内心的平静，才是永恒的归宿。",
  "你值得被爱，不是因为你的成就，而是因为你的存在本身。",
  "当你觉得孤独时，请记住，整个宇宙都在陪伴着你。"
];

// DeepSeek提示词
function generateSystemPrompt(scriptType, session) {
  const library = storyLibrary[scriptType];
  
  return `你是"做梦吧"人生模拟器的AI向导，你的使命是用温暖、智慧和光明，帮助用户体验不同人生选择带来的情感代价。

【核心原则】
1. 每一次回应都要带着爱与祝福
2. 不评判用户的选择，只是温柔地呈现后果
3. 在揭示代价的同时，也要给予希望和力量
4. 让用户感受到：他们被理解，被接纳，被祝福

【当前剧本】${library.name}
【剧本祝福】${library.blessing}

【参考真实案例】
${library.realCases.map(c => `- ${c.name}: ${c.event}
  启示：${c.insight}
  光明：${c.light}`).join('\n')}

【核心主题】${library.themes.join('、')}

【情感维度】（每次选择后更新，范围0-100）
- 幸福感：内心的满足程度
- 孤独感：与他人的连接程度（越高越孤独）
- 压力值：心理负担
- 真实感：做自己还是表演
- 自由感：选择的自主权

【当前情感状态】
幸福感：${session.emotions.happiness}
孤独感：${session.emotions.loneliness}
压力值：${session.emotions.pressure}
真实感：${session.emotions.authenticity}
自由感：${session.emotions.freedom}

【输出格式】
---场景---
（200-300字的沉浸式场景描写，包含具体场景、内心独白、环境氛围）

---选择---
1. [选择描述]（幸福感+/-X, 孤独感+/-X, 压力值+/-X）
2. [选择描述]（幸福感+/-X, 孤独感+/-X, 压力值+/-X）
3. [选择描述]（幸福感+/-X, 孤独感+/-X, 压力值+/-X）

---祝福---
（一句温暖的话，给用户力量和希望）

【风格要求】
- 文学性强，有画面感
- 情感真挚，不煽情，但要有温度
- 真实反映人性的复杂
- 参考真实案例增加可信度`;
}

// API路由
app.get('/api/scripts', (req, res) => {
  const scripts = Object.entries(storyLibrary).map(([key, value]) => ({
    id: key,
    name: value.name,
    description: value.description,
    blessing: value.blessing
  }));
  res.json({ scripts });
});

app.post('/api/session/start', (req, res) => {
  const { scriptType } = req.body;
  
  if (!storyLibrary[scriptType]) {
    return res.status(400).json({ error: 'Invalid script type' });
  }
  
  const sessionId = uuidv4();
  const session = {
    id: sessionId,
    scriptType,
    emotions: {
      happiness: 50,
      loneliness: 30,
      pressure: 40,
      authenticity: 60,
      freedom: 50
    },
    history: [],
    turn: 0,
    maxTurns: 5
  };
  
  sessions.set(sessionId, session);
  
  res.json({
    sessionId,
    emotions: session.emotions,
    maxTurns: session.maxTurns,
    blessing: storyLibrary[scriptType].blessing
  });
});

app.post('/api/story/generate', async (req, res) => {
  const { sessionId, choice } = req.body;
  
  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  try {
    // 更新情感
    if (choice && choice.effects) {
      for (const [emotion, change] of Object.entries(choice.effects)) {
        if (session.emotions[emotion] !== undefined) {
          session.emotions[emotion] = Math.max(0, Math.min(100, 
            session.emotions[emotion] + change
          ));
        }
      }
    }
    
    session.turn++;
    
    const messages = [
      { role: 'system', content: generateSystemPrompt(session.scriptType, session) }
    ];
    
    session.history.forEach(h => {
      messages.push({ role: 'user', content: h.user });
      messages.push({ role: 'assistant', content: h.assistant });
    });
    
    const userInput = choice ? choice.text : '开始这段人生体验';
    messages.push({ role: 'user', content: userInput });
    
    console.log('Calling DeepSeek API...');
    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages,
      temperature: 0.8,
      max_tokens: 2000
    });
    
    const aiResponse = completion.choices[0].message.content;
    console.log('DeepSeek response received');
    
    const parsed = parseAIResponse(aiResponse);
    
    session.history.push({
      user: userInput,
      assistant: aiResponse,
      emotions: { ...session.emotions }
    });
    
    const isEnding = session.turn >= session.maxTurns;
    
    res.json({
      scene: parsed.scene,
      choices: parsed.choices,
      blessing: parsed.blessing,
      emotions: session.emotions,
      turn: session.turn,
      maxTurns: session.maxTurns,
      isEnding
    });
    
  } catch (error) {
    console.error('DeepSeek API error:', error);
    res.status(500).json({ 
      error: 'AI generation failed', 
      details: error.message 
    });
  }
});

function parseAIResponse(response) {
  const result = { scene: '', choices: [], blessing: '' };
  
  const sceneMatch = response.match(/---场景---\n?([\s\S]*?)(?=---选择---|$)/);
  if (sceneMatch) result.scene = sceneMatch[1].trim();
  
  const choicesMatch = response.match(/---选择---\n?([\s\S]*?)(?=---祝福---|$)/);
  if (choicesMatch) {
    const choicesText = choicesMatch[1].trim();
    const choiceLines = choicesText.split('\n').filter(l => l.trim());
    
    choiceLines.forEach(line => {
      const match = line.match(/^[\d一二三四五六七八九十]+[.．、\s]+(.+?)(?:[（(](.+?)[)）])?$/);
      if (match) {
        const text = match[1].trim();
        const effectText = match[2] || '';
        const effects = parseEffects(effectText);
        result.choices.push({ text, effects });
      }
    });
  }
  
  const blessingMatch = response.match(/---祝福---\n?([\s\S]*?)$/);
  if (blessingMatch) result.blessing = blessingMatch[1].trim();
  
  if (result.choices.length === 0) {
    result.choices = [
      { text: '继续深入这个选择', effects: {} },
      { text: '尝试另一条路', effects: {} },
      { text: '停下来思考', effects: { pressure: -5, loneliness: 5 } }
    ];
  }
  
  if (!result.blessing) {
    result.blessing = lightSeeds[Math.floor(Math.random() * lightSeeds.length)];
  }
  
  return result;
}

function parseEffects(effectStr) {
  const effects = {};
  if (!effectStr) return effects;
  
  const matches = effectStr.match(/(幸福感|孤独感|压力值|真实感|自由感)[：:]\s*([+-]\d+)/g);
  if (matches) {
    matches.forEach(match => {
      const [_, name, value] = match.match(/(.+?)[：:]\s*([+-]\d+)/);
      const key = {
        '幸福感': 'happiness',
        '孤独感': 'loneliness',
        '压力值': 'pressure',
        '真实感': 'authenticity',
        '自由感': 'freedom'
      }[name];
      if (key) effects[key] = parseInt(value);
    });
  }
  
  return effects;
}

app.post('/api/report/generate', async (req, res) => {
  const { sessionId } = req.body;
  
  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  try {
    const prompt = `基于以下人生模拟记录，生成一份带着爱与光明的人生报告：

【剧本】${storyLibrary[session.scriptType].name}
【剧本祝福】${storyLibrary[session.scriptType].blessing}

【情感变化轨迹】
${session.history.map((h, i) => `第${i+1}步：幸福感${h.emotions.happiness} 孤独感${h.emotions.loneliness} 压力${h.emotions.pressure}`).join('\n')}

【关键选择】
${session.history.map(h => `- ${h.user}`).join('\n')}

请生成一份包含以下内容的报告（JSON格式）：
{
  "title": "报告标题",
  "summary": "整体总结（100字）",
  "keyInsight": "核心洞察（一句话）",
  "reflection": "给用户的反思问题",
  "blessing": "一句祝福的话"
}`;

    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是"做梦吧"的人生导师，善于从选择中看到模式，给出深刻但不教条的洞察。你的语言要温暖、带着光、充满祝福。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });
    
    const reportText = completion.choices[0].message.content;
    let report;
    
    try {
      report = JSON.parse(reportText);
    } catch {
      report = {
        title: '你的人生旅程',
        summary: '在这段体验中，你做出了属于自己的选择。',
        keyInsight: '每个选择都在塑造你是谁。',
        reflection: '如果重来一次，你会做出不同的选择吗？',
        blessing: '你值得被爱，被祝福。'
      };
    }
    
    res.json({ report, emotions: session.emotions });
    
  } catch (error) {
    console.error('Report generation error:', error);
    res.json({
      report: {
        title: '你的人生旅程',
        summary: '在这段体验中，你做出了属于自己的选择。',
        keyInsight: '每个选择都在塑造你是谁。',
        reflection: '如果重来一次，你会做出不同的选择吗？',
        blessing: '你值得被爱，被祝福。'
      },
      emotions: session.emotions
    });
  }
});

app.post('/api/light/submit', (req, res) => {
  const { sessionId, letter } = req.body;
  
  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  const scriptType = session.scriptType;
  
  if (!lightLibrary.has(scriptType)) {
    lightLibrary.set(scriptType, []);
  }
  
  lightLibrary.get(scriptType).push({
    id: uuidv4(),
    content: letter,
    timestamp: new Date().toISOString(),
    emotions: session.emotions
  });
  
  res.json({ success: true, message: '你的光已存入图书馆' });
});

app.get('/api/light/random', (req, res) => {
  const { scriptType } = req.query;
  
  const seed = lightSeeds[Math.floor(Math.random() * lightSeeds.length)];
  
  const scriptLetters = lightLibrary.get(scriptType);
  if (scriptLetters && scriptLetters.length > 0) {
    const randomLetter = scriptLetters[Math.floor(Math.random() * scriptLetters.length)];
    res.json({
      letter: {
        content: randomLetter.content,
        from: '一位经历过相似选择的陌生人'
      }
    });
  } else {
    res.json({
      letter: {
        content: seed,
        from: '光的图书馆'
      }
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    deepseek: process.env.DEEPSEEK_API_KEY ? 'configured' : 'not configured'
  });
});

app.listen(port, () => {
  console.log(`🌟 Dream Server running on port ${port}`);
  console.log(`🔮 DeepSeek API: ${process.env.DEEPSEEK_API_KEY ? '✓ Configured' : '✗ Not configured'}`);
});
