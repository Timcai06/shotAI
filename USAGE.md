# ShotAI 使用指南

## 快速开始

### 1. 环境准备

确保您已安装：
- **Node.js** 18+ 
- **npm** 或 **yarn**

### 2. 安装依赖

```bash
cd /Users/justin/Desktop/运动科学力传导可视化
npm install
```

### 3. 配置环境变量

1. 复制环境变量模板：
```bash
cp .env.local.example .env.local
```

2. 编辑 `.env.local` 文件，填写您的 Supabase 信息：
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Qwen API (可选，用于AI报告生成)
QWEN_API_KEY=your-qwen-api-key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**获取 Supabase 凭证：**
1. 访问 [supabase.com](https://supabase.com) 创建项目
2. 在 Project Settings > API 中找到 URL 和 Anon Key
3. 在 Project Settings > Service Role 中获取 Service Role Key

### 4. 设置数据库

在 Supabase Dashboard 的 SQL Editor 中依次执行：

1. `supabase/migrations/000001_create_users_table.sql`
2. `supabase/migrations/000002_create_analysis_tasks_table.sql`
3. `supabase/migrations/000003_create_shooting_records_table.sql`
4. `supabase/migrations/000004_create_orders_table.sql`
5. `supabase/migrations/000005_create_storage_policies.sql`

### 5. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问：**http://localhost:3000**

---

## 使用流程

### 第一步：了解AI能力边界

首次使用建议先访问 **AI能力边界页面**：
- 点击首页的 "了解更多" 或导航到 `/about`
- 了解系统能做什么（角度测量、一致性分析）
- 了解不能做什么（力量测量、命中率预测）

### 第二步：查看拍摄指南

点击 **"拍摄指南"** 或访问 `/guide`：
1. **选择侧面视角**（推荐，误差±15°）
2. **确保全身可见**（头顶到脚底）
3. **光线充足**，避免逆光
4. **稳定拍摄**，画面不抖动

### 第三步：上传视频

1. 点击首页大按钮 **"上传视频开始分析"**
2. 拖拽视频文件到上传区域，或点击选择文件
3. **选择拍摄角度**：
   - 侧面视角（推荐）- 误差最小
   - 正面视角 - 误差较大
   - 其他角度 - 不推荐
4. **选择光线条件**：良好/中等/较差
5. 点击 **"开始分析"**

**支持格式：** MP4, MOV, WebM  
**文件大小：** 最大 50MB  
**拍摄时长：** 5-10秒，包含1-3次投篮动作

### 第四步：等待分析完成

上传后会自动跳转到 **分析等待页面**：
- 实时显示分析进度（0-100%）
- 展示当前处理阶段：上传→检测→分析→生成报告
- 显示预估检测质量
- 阅读篮球小知识

分析通常需要 **30-60秒**

### 第五步：查看分析报告

分析完成后自动跳转到 **报告页面**：

**免费预览包含3个维度：**
1. **动作一致性**（最重要维度）
   - 膝关节角度波动
   - 肘关节角度波动
   - 评分：0-100

2. **关节角度**
   - 各关节角度测量值
   - 误差范围标注（±15°）
   - 与职业球员范围对比

3. **左右对称性**
   - 左右关节角度差异
   - 不对称性评估

**解锁完整报告（¥9.9）：**
- 全部9维度分析
- AI个性化训练计划
- 3D骨骼可视化
- 时序曲线图
- 动力链协调性分析

---

## 页面导航

| 页面 | 路径 | 功能 |
|------|------|------|
| 首页 | `/` | 上传入口、功能介绍 |
| 拍摄指南 | `/guide` | 3步拍摄教程、角度对比 |
| AI能力边界 | `/about` | 科学诚实说明、能做什么 |
| 视频上传 | `/upload` | 拖拽上传、选项选择 |
| 分析等待 | `/analysis/[id]/waiting` | 实时进度、趣味知识 |
| 分析报告 | `/analysis/[id]/result` | 9维度评分、训练建议 |

---

## 核心功能说明

### 9维度分析体系

1. **动作一致性** ⭐ 最重要
   - 命中率最强预测因子（r=-0.96）
   - 评估多次投篮的动作重复性

2. **关节角度**
   - 测量膝、髋、肩、肘、腕角度
   - 标注误差范围（±15°）

3. **左右对称性**
   - 比较左右侧动作差异

4. **投篮风格**
   - One-motion vs Two-motion识别

5. **时序节奏**
   - 各阶段时长分析

6. **稳定性**
   - 质心和肢体稳定性评估

7. **进步追踪**
   - 多次分析历史对比

8. **动作协调性** ⭐ 新增
   - 关节同步性分析

9. **动力链协调性** ⭐ 新增
   - 发力顺序评估

### 科学诚实原则

**能做（基于视频）：**
- 关节角度测量（误差±15°）
- 动作一致性分析
- 时序分析
- 动力链协调性（角度变化时序）

**不能做（需额外设备）：**
- 力量测量（需测力台）
- 神经肌肉协调（需EMG）
- 命中率预测（心理因素影响）
- 绝对准确保证（个体差异大）

---

## 故障排除

### 无法上传视频
- 检查文件格式（MP4/MOV/WebM）
- 检查文件大小（< 50MB）
- 检查网络连接

### 分析失败
- 检查拍摄角度是否为侧面
- 确保全身可见
- 检查光线是否充足
- 重新上传尝试

### 页面显示异常
- 检查是否正确配置环境变量
- 检查 Supabase 数据库表是否创建
- 检查 Storage bucket 是否配置

---

## 部署上线

### 部署到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel

# 配置环境变量（在 Vercel Dashboard）
# Project Settings > Environment Variables
```

### 配置自定义域名
1. 在 Vercel Dashboard 添加域名
2. 在域名服务商配置 DNS 记录
3. 更新 `NEXT_PUBLIC_APP_URL` 环境变量

---

## 技术栈

- **前端**: Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes + Supabase
- **数据库**: PostgreSQL (Supabase)
- **存储**: Supabase Storage
- **认证**: Supabase Auth (Magic Link)
- **状态管理**: Zustand
- **图标**: Lucide React

---

## 开发计划

- **Week 5-6** ✅ 核心架构MVP（当前完成）
- **Week 7-8**: MediaPipe姿态检测 + 9维度算法
- **Week 9-10**: AI报告生成 + 3D可视化
- **Week 11-12**: 支付系统 + 命中率追踪
- **Week 13-16**: 测试优化 + 内测发布

---

**有问题？** 查看项目文档 `doc/` 目录获取更多信息。
