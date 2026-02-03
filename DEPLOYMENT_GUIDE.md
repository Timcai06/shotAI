# 🚀 部署指南 - ShotAI

本文档指导你将 ShotAI 部署到线上，让用户可以访问。

---

## ✅ 已完成

1. ✅ Git 仓库已初始化
2. ✅ 代码已提交到本地仓库（69 个文件，18,462 行代码）
3. ✅ .gitignore 已配置（避免提交敏感文件）

---

## 📝 下一步：推送到 GitHub

### 1. 在 GitHub 创建新仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - Repository name: `shotai`（或你喜欢的名称）
   - Description: `AI驱动的篮球投篮动作分析工具 - 9维度科学分析`
   - Public: ✅ 选择公开（方便用户访问）
   - ❌ **不要**初始化 README、.gitignore、license（因为我们已经有了）
3. 点击 "Create repository"

### 2. 关联远程仓库并推送

在终端（项目目录）执行：

```bash
# 添加远程仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/shotai.git

# 重命名分支为 main
git branch -M main

# 推送到 GitHub
git push -u origin main
```

**如果推送失败（需要身份验证）**：

使用 Personal Access Token：
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → 选择 `repo` 权限 → 生成 token
3. 复制 token，推送时使用：
```bash
git push -u origin main
# 用户名：你的 GitHub 用户名
# 密码：刚才生成的 token（不是 GitHub 密码！）
```

或者使用 SSH（如果你已配置）：
```bash
git remote set-url origin git@github.com:YOUR_USERNAME/shotai.git
git push -u origin main
```

### 3. 验证推送成功

访问你的 GitHub 仓库，应该看到所有文件已上传。

---

## 🌐 部署到 Vercel

### 方式一：网页部署（推荐，最简单）

1. 访问 https://vercel.com
2. 用 GitHub 账号登录（或邮箱注册）
3. 点击 "Add New Project"
4. 找到 `shotai` 仓库，点击 "Import"
5. Vercel 会自动检测 Next.js 项目，点击 "Deploy"
6. 等待 1-2 分钟，部署完成！

### 方式二：命令行部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录（会打开浏览器）
vercel login

# 部署到生产环境
vercel --prod
```

---

## ⚙️ 配置环境变量

部署前需要在 Vercel 配置环境变量：

### 获取 Supabase 凭证

1. 访问 https://supabase.com/dashboard
2. 选择你的项目：**Timcai06's Project**
3. Settings → API

| 变量名 | 位置 | 复制值 |
|--------|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon/public key | `eyJhbG...` |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key | `eyJhbG...` |

### 获取千问 API Key

1. 访问 https://qwen.console.aliyun.com/
2. 登录并创建 API Key
3. 复制 API Key

### 在 Vercel 中配置

1. 进入你的 Vercel 项目
2. Settings → Environment Variables
3. 添加以下4个变量：

```
NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbG...
SUPABASE_SERVICE_ROLE_KEY = eyJhbG...
QWEN_API_KEY = sk-xxx
```

4. 选择 Environment: `Production`, `Preview`, `Development`（全部勾选）
5. 点击 "Save"
6. 重新部署项目：Deployments → ... → Redeploy

---

## 🌍 配置域名（可选）

### 使用免费域名

Vercel 自动提供免费域名：
```
https://shotai-xxx.vercel.app
```
直接可以访问！

### 使用自己的域名

1. 购买域名（推荐域名商：阿里云、腾讯云、Namecheap 等）
2. Vercel 项目 → Settings → Domains
3. 添加你的域名（如 `shotai.xyz`）
4. 按提示配置 DNS 记录：

```
类型: CNAME
名称: @
值: cname.vercel-dns.com

或（如果有子域名）
类型: CNAME
名称: www
值: cname.vercel-dns.com
```

5. 等待 DNS 生效（几分钟到24小时）
6. SSL 证书会自动生成

---

## 🧪 测试部署

部署完成后，访问你的网站：

1. **首页测试**
   - 访问你的域名
   - 检查页面是否正常显示
   - 点击上传按钮

2. **功能测试**
   - [ ] 上传视频功能
   - [ ] 分析等待页面
   - [ ] 分析结果展示

3. **环境变量检查**
   - 如果 Supabase 连接失败，检查环境变量是否正确
   - 查看 Vercel 日志：Deployments → Latest → Function Logs

---

## 📊 项目统计

- **文件数**: 69 个
- **代码行数**: 18,462 行
- **技术栈**: Next.js 14 + TypeScript + Supabase + MediaPipe
- **状态**: Week 7-8 完成，准备部署

---

## 🎯 后续计划

1. ✅ 部署到 Vercel
2. ⏳ MediaPipe 真实检测集成
3. ⏳ AI 报告集成（千问）
4. ⏳ 3D 可视化
5. ⏳ 支付系统

---

## 🆘 故障排除

### 问题1：部署失败
- 检查 `package.json` 是否正确
- 查看 Vercel 部署日志
- 确保所有依赖都已安装

### 问题2：环境变量未生效
- 确认在 Vercel 项目中配置，不是本地 .env.local
- 配置后需要重新部署

### 问题3：Supabase 连接失败
- 检查 API Key 是否正确
- 确认 Supabase 项目状态（不是暂停）
- 查看 Supabase Dashboard 的 Logs

### 问题4：TypeScript 错误
- 部署时 TypeScript 错误不会阻止构建（生产版）
- 但建议修复这些错误：
  ```bash
  npm run lint
  ```

---

## 📞 需要帮助？

如果遇到问题：
1. 检查 Vercel 日志
2. 检查 Supabase Dashboard
3. 查看浏览器控制台错误

祝部署顺利！🚀
