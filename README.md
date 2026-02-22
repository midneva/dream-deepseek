# 做梦吧 / 梦与岛

> 一场关于"看见自己"的人生实验

一个让人在安全的虚拟空间中，提前体验"梦想实现之后"的情感代价与生命顿悟的人生实验室。

## ✨ 项目简介

**做梦吧**是一个由 DeepSeek AI 驱动的人生模拟体验。在这里，你可以选择不同的人生剧本——一夜暴富、一夜成名、创业成功、放弃爱情——然后跟随 AI 的引导，体验这些选择带来的情感代价。

每一次体验都是独一无二的，因为 DeepSeek 会根据你的选择，实时生成下一段剧情。

## 🎮 剧本选择

| 剧本 | 描述 | 祝福 |
|------|------|------|
| 💰 一夜暴富 | 突然获得巨额财富后的人生变化 | 愿你在财富的洪流中，依然能找到内心的平静 |
| ⭐ 一夜成名 | 突然成为公众人物后的生活变化 | 愿你在聚光灯下，依然能保持真实的自己 |
| 🚀 创业成功 | 公司突然估值暴涨后的创始人困境 | 愿你在成功的路上，不忘记为什么出发 |
| 💔 放弃爱情 | 为了事业/理想放弃深爱的人 | 愿你的选择，最终能被时间温柔以待 |

## 🌟 核心功能

- **AI 动态剧情生成** - DeepSeek 根据你的选择实时生成场景
- **情感代价可视化** - 实时追踪幸福感、孤独感、压力值、真实感、自由感
- **光的传递** - 给"曾经的自己"写信，传递给需要的人
- **人生报告** - 生成个性化的人生洞察

## 🚀 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/yourusername/dream-island.git
cd dream-island
```

### 2. 配置后端

```bash
cd server
cp .env.example .env
# 编辑 .env，填入你的 DeepSeek API Key
npm install
npm start
```

### 3. 配置前端

前端是纯 HTML，可以直接用任何静态服务器：

```bash
cd client
# 使用 Python
python -m http.server 8080
# 或使用 Node.js
npx serve .
```

然后访问 http://localhost:8080

## 🔑 获取 DeepSeek API Key

1. 访问 https://platform.deepseek.com/
2. 注册账号
3. 创建 API Key
4. 复制到 `server/.env` 文件中

## 📁 项目结构

```
dream-island/
├── client/          # 前端
│   ├── index.html   # 主页面
│   └── images/      # 图片资源
├── server/          # 后端
│   ├── server.js    # 主服务
│   ├── package.json
│   └── .env.example # 配置模板
└── README.md
```

## 💡 设计理念

这个项目的核心不是"玩游戏"，而是"看见自己"。

每一次选择，都是一次自我对话。  
每一次情感波动，都是内心的回响。  
每一份光的传递，都是陌生人的祝福。

愿你在模拟中，找到真实的自己。

## 🙏 致谢

Powered by [DeepSeek AI](https://deepseek.com/) · 带着爱与光明

---

**许可证**: MIT
