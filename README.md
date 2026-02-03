# 🏀 ShotAI - AI驱动的篮球投篮动作分析工具

> 使用 AI 和运动科学，提供 9 维度的投篮动作分析

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://shotai.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)](https://supabase.com)

---

## 🎯 项目概述

ShotAI 是一个基于 AI 的篮球投篮动作分析工具，使用 MediaPipe 进行姿态检测，通过 9 个维度的科学分析，帮助篮球运动员改进投篮技术。

### ✨ 核心功能

- 📹 **视频上传** - 支持 MP4, MOV, WebM 等格式
- 🤖 **AI 分析** - 基于 MediaPipe 的 33 关键点检测
- 📊 **9 维度分析**
  - 关节角度 (Joint Angles)
  - 一致性 (Consistency)
  - 对称性 (Symmetry)
  - 投篮风格 (Shooting Style)
  - 时序分析 (Timing)
  - 稳定性 (Stability)
  - 动作协调性 (Coordination)
  - 动力链协调性 (Kinetic Chain)
- 📈 **可视化报告** - 3D 骨骼模型、曲线图、雷达图
- 💾 **历史追踪** - 记录进步曲线

---

## 🚀 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn
- Git

### 安装

```bash
# 克隆仓库
git clone https://github.com/Timcai06/shotAI.git
cd shotAI

# 安装依赖
npm install

# 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local，填入你的 Supabase 凭证
```

### 开发

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 部署

```bash
# 推送到 GitHub
git push origin main

# Vercel 会自动部署
# 访问 https://shotai.vercel.app
```

详细部署指南见 `setup/DEPLOYMENT_GUIDE.md`

---

## 📁 项目结构

```
shotai/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── analysis/          # 分析页面
│   ├── upload/            # 上传页面
│   └── ...
├── lib/                   # 工具库
│   ├── analysis/          # 分析引擎
│   ├── queue/             # 任务队列
│   └── supabase/          # 数据库客户端
├── types/                 # TypeScript 类型
├── doc/                   # 📚 核心项目文档
├── setup/                 # 🔧 开发设置和临时文档
└── supabase/              # 数据库迁移
```

详细结构说明见 `setup/PROJECT_STRUCTURE_CLEANUP.md`

---

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| **Next.js 14** | 前端框架 |
| **TypeScript** | 类型安全 |
| **Tailwind CSS** | 样式框架 |
| **Supabase** | 后端 + 数据库 |
| **MediaPipe** | 姿态检测 |
| **Three.js** | 3D 可视化 |
| **Recharts** | 数据可视化 |
| **Vercel** | 部署平台 |

---

## 📚 文档

### 核心文档 (`doc/` 文件夹)
- [01-PROJECT-VISION.md](doc/01-PROJECT-VISION.md) - 项目愿景和商业模式
- [02-SCIENTIFIC-BASIS.md](doc/02-SCIENTIFIC-BASIS.md) - 运动科学基础
- [03-PRODUCT-REQUIREMENTS.md](doc/03-PRODUCT-REQUIREMENTS.md) - 产品需求和 9 维度体系
- [04-TECHNICAL-ARCHITECTURE.md](doc/04-TECHNICAL-ARCHITECTURE.md) - 技术架构
- [05-TRAINING-SYSTEM.md](doc/05-TRAINING-SYSTEM.md) - 训练系统
- [06-DEVELOPMENT-PLAN.md](doc/06-DEVELOPMENT-PLAN.md) - 12 周开发计划

### 开发文档 (`setup/` 文件夹)
- [DEPLOYMENT_GUIDE.md](setup/DEPLOYMENT_GUIDE.md) - 部署指南
- [VERCEL_DEPLOYMENT_CHECKLIST.md](setup/VERCEL_DEPLOYMENT_CHECKLIST.md) - 部署检查清单
- [PROBLEM_SOLVED.md](setup/PROBLEM_SOLVED.md) - 问题解决方案
- [PROJECT_STRUCTURE_CLEANUP.md](setup/PROJECT_STRUCTURE_CLEANUP.md) - 项目结构说明

### 快速参考
- [QUICKSTART.md](QUICKSTART.md) - 快速开始指南
- [USAGE.md](USAGE.md) - 使用说明
- [DOCS_GUIDE.md](DOCS_GUIDE.md) - 文档导航

---

## 🔧 环境变量

创建 `.env.local` 文件：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# 千问 API (可选)
QWEN_API_KEY=sk-xxx

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=ShotAI
```

---

## 📊 开发进度

### Week 5-6: 核心架构 ✅
- ✅ Next.js 项目初始化
- ✅ Supabase 配置
- ✅ 视频上传功能
- ✅ 数据库表设计
- ✅ API 路由

### Week 7-8: 分析引擎 ⏳
- ⏳ MediaPipe 集成
- ⏳ 9 维度分析算法
- ⏳ AI 报告生成

### Week 9-10: 可视化 ⏳
- ⏳ 3D 骨骼模型
- ⏳ 数据可视化
- ⏳ 报告展示

### Week 11-12: 支付系统 ⏳
- ⏳ 微信支付集成
- ⏳ 订单管理
- ⏳ 命中率追踪

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📞 联系方式

- GitHub: [@Timcai06](https://github.com/Timcai06)
- 项目地址: https://github.com/Timcai06/shotAI

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

感谢以下开源项目的支持：
- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [MediaPipe](https://mediapipe.dev)
- [Three.js](https://threejs.org)
- [Tailwind CSS](https://tailwindcss.com)

---

**准备好改进你的投篮了吗？** 🚀

[立即开始](https://shotai.vercel.app) | [查看文档](doc/) | [快速开始](QUICKSTART.md)
