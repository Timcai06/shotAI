# ShotAI - Week 5-6 核心架构 MVP

## 项目概述
ShotAI 是一个基于AI的篮球投篮动作分析工具，使用 Next.js + Supabase + MediaPipe 技术栈。

## Week 5-6 完成内容

### 前端架构
- Next.js 14 项目初始化 (App Router)
- Tailwind CSS 配置 (自定义主题色彩)
- 首页UI (上传按钮 + AI边界提示)
- 拍摄引导页 (3步引导 + 误差说明)
- 视频上传组件 (拖拽上传 + 进度显示)
- AI能力边界教育页面
- 分析等待页 (实时进度显示)
- 分析报告预览页面

### 后端架构
- Supabase 连接配置 (客户端 + 服务端)
- 数据库表设计 (4个核心表)
- 视频上传 API (Supabase Storage)
- 分析任务队列系统
- 检测质量预估 API
- 分析任务状态查询 API

### 数据库表
1. **users** - 用户信息
2. **analysis_tasks** - 分析任务
3. **shooting_records** - 命中率记录
4. **orders** - 订单信息

### API 端点
- `POST /api/upload` - 视频上传
- `POST /api/analysis` - 创建分析任务
- `GET /api/analysis/:id/status` - 查询任务状态
- `GET /api/analysis/:id` - 获取分析结果
- `POST /api/quality-estimate` - 质量预估

## 项目结构
```
shotai/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 首页
│   ├── layout.tsx         # 根布局
│   ├── globals.css        # 全局样式
│   ├── guide/             # 拍摄引导页
│   ├── upload/            # 视频上传页
│   ├── about/             # AI能力边界页
│   ├── analysis/          # 分析相关页面
│   │   └── [task_id]/
│   │       ├── waiting/   # 分析等待页
│   │       └── result/    # 分析报告页
│   └── api/               # API路由
│       ├── upload/
│       ├── analysis/
│       └── quality-estimate/
├── components/            # 组件目录
├── lib/                   # 工具库
│   ├── supabase/         # Supabase客户端
│   ├── queue/            # 任务队列
│   └── utils.ts          # 工具函数
├── types/                # TypeScript类型
│   ├── index.ts          # 业务类型
│   └── database.ts       # 数据库类型
├── supabase/             # 数据库迁移
│   └── migrations/
├── doc/                  # 📚 核心项目文档
│   ├── 01-PROJECT-VISION.md
│   ├── 02-SCIENTIFIC-BASIS.md
│   ├── 03-PRODUCT-REQUIREMENTS.md
│   ├── 04-TECHNICAL-ARCHITECTURE.md
│   ├── 05-TRAINING-SYSTEM.md
│   └── 06-DEVELOPMENT-PLAN.md
├── setup/                # 🔧 开发设置和临时文档
│   ├── README.md
│   ├── PROBLEM_SOLVED.md
│   ├── DAY_31-32_COMPLETED.md
│   ├── SUPABASE_STATUS_REPORT.md
│   ├── SUPABASE_POWER_EXAMPLE.md
│   ├── test-upload-api.js
│   └── ...
└── public/               # 静态资源
```

## 📚 文档说明

### 核心项目文档 (`doc/` 文件夹)
这些是项目的核心文档，记录了产品设计、技术架构和开发计划：
- `01-PROJECT-VISION.md` - 项目愿景和商业模式
- `02-SCIENTIFIC-BASIS.md` - 运动科学文献基础
- `03-PRODUCT-REQUIREMENTS.md` - 9维度分析体系
- `04-TECHNICAL-ARCHITECTURE.md` - 技术架构设计
- `05-TRAINING-SYSTEM.md` - 系统性训练指南
- `06-DEVELOPMENT-PLAN.md` - 12周开发计划

### 开发设置文档 (`setup/` 文件夹)
这些是开发过程中的临时文档和工具：
- `README.md` - setup 文件夹说明
- `PROBLEM_SOLVED.md` - 401 错误解决方案
- `DAY_31-32_COMPLETED.md` - 开发进度报告
- `SUPABASE_STATUS_REPORT.md` - Supabase 配置状态
- `SUPABASE_POWER_EXAMPLE.md` - Supabase 使用示例
- `test-upload-api.js` - API 测试脚本

### 项目根目录文档
- `README.md` - 项目介绍（本文件）
- `QUICKSTART.md` - 快速开始指南
- `USAGE.md` - 项目使用说明

## 环境变量
复制 `.env.local.example` 为 `.env.local` 并填写：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `QWEN_API_KEY`

## 安装和运行
```bash
npm install
npm run dev
```

## Week 5-6 里程碑
- 可上传视频，显示分析进度
- 基础架构完整，可扩展到完整9维度分析

## 下一步 (Week 7-8)
- MediaPipe 33关键点集成
- 9维度分析算法实现
- AI报告生成集成
