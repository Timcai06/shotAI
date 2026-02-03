# 🚀 快速开始指南

5 分钟内启动 ShotAI 项目！

---

## 📋 前置要求

- Node.js 18+ ([下载](https://nodejs.org))
- Git ([下载](https://git-scm.com))
- GitHub 账号（可选，用于部署）

---

## ⚡ 快速开始（本地开发）

### 1️⃣ 克隆项目

```bash
git clone https://github.com/Timcai06/shotAI.git
cd shotAI
```

### 2️⃣ 安装依赖

```bash
npm install
```

### 3️⃣ 配置环境变量

```bash
# 复制示例文件
cp .env.local.example .env.local

# 编辑 .env.local，填入你的 Supabase 凭证
# 需要填入：
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
```

### 4️⃣ 启动开发服务器

```bash
npm run dev
```

### 5️⃣ 打开浏览器

访问 http://localhost:3000

---

## 🌐 部署到 Vercel（线上）

### 1️⃣ 推送到 GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2️⃣ 连接 Vercel

1. 访问 https://vercel.com
2. 用 GitHub 账号登录
3. 点击 "Add New Project"
4. 选择 `shotAI` 仓库
5. 点击 "Import"

### 3️⃣ 配置环境变量

在 Vercel 中：
1. Settings → Environment Variables
2. 添加以下变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `QWEN_API_KEY`（可选）

### 4️⃣ 部署

点击 "Deploy"，等待 1-2 分钟

### 5️⃣ 访问网站

https://shotai.vercel.app

---

## 📁 项目结构速览

```
shotai/
├── app/              # 页面和 API
├── lib/              # 工具库和分析引擎
├── types/            # TypeScript 类型
├── doc/              # 📚 项目文档
├── setup/            # 🔧 开发文档
└── supabase/         # 数据库迁移
```

详细结构见 [setup/PROJECT_STRUCTURE_CLEANUP.md](setup/PROJECT_STRUCTURE_CLEANUP.md)

---

## 🧪 测试功能

### 本地测试

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
# 点击"上传视频"按钮测试功能
```

### 测试 API

```bash
# 测试上传 API
node -r dotenv/config setup/test-upload-api.js dotenv_config_path=.env.local
```

---

## 🔧 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器

# 构建
npm run build            # 构建生产版本
npm start                # 启动生产服务器

# 代码检查
npm run lint             # 运行 ESLint

# 数据库
npx supabase migration list --linked    # 查看迁移状态
npx supabase db push --linked           # 推送迁移
npx supabase gen types typescript --linked > types/supabase-generated.ts  # 生成类型
```

---

## 📚 文档导航

| 文档 | 用途 |
|------|------|
| [README.md](README.md) | 项目介绍 |
| [USAGE.md](USAGE.md) | 使用说明 |
| [DOCS_GUIDE.md](DOCS_GUIDE.md) | 文档导航 |
| [doc/](doc/) | 核心项目文档 |
| [setup/](setup/) | 开发文档和工具 |

---

## ❓ 常见问题

### Q: 如何获取 Supabase 凭证？

A: 
1. 访问 https://supabase.com/dashboard
2. 选择你的项目
3. Settings → API
4. 复制 URL 和 API Key

### Q: 如何修改项目名称？

A:
1. 编辑 `package.json` 中的 `name` 字段
2. 编辑 `.env.local` 中的 `NEXT_PUBLIC_APP_NAME`

### Q: 如何添加新页面？

A:
```bash
# 在 app/ 文件夹中创建新文件夹
mkdir app/my-page
echo "export default function Page() { return <div>My Page</div> }" > app/my-page/page.tsx
```

### Q: 如何调试问题？

A:
1. 查看浏览器控制台（F12）
2. 查看终端输出
3. 查看 Vercel 日志（如果是部署问题）

---

## 🚀 下一步

1. ✅ 项目已启动
2. 📖 阅读 [USAGE.md](USAGE.md) 了解功能
3. 📚 查看 [doc/](doc/) 了解项目设计
4. 🔧 查看 [setup/](setup/) 了解开发工具

---

## 💡 提示

- 使用 VS Code 的 [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) 扩展
- 使用 [Prettier](https://prettier.io) 格式化代码
- 定期运行 `npm run lint` 检查代码质量

---

**准备好开始了吗？** 🎉

```bash
npm run dev
```

访问 http://localhost:3000 开始开发！
