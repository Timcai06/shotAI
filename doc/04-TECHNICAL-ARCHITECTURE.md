# ShotAI 技术架构文档

**版本**: v2.0 (9维度技术支撑版)  
**日期**: 2026-02-03  
**技术栈**: Next.js + Supabase + MediaPipe

---

## 🏗️ 系统架构概览

### 零运维架构 (Zero DevOps Stack)

```
用户浏览器
    ↓ HTTPS
Vercel Edge (Next.js 14 App Router)
    ├─ 前端: React + Tailwind + Three.js
    ├─ API: Next.js Serverless Functions
    └─ 边缘计算: 全球CDN，中国可访问
    ↓
Supabase (BaaS，零运维)
    ├─ PostgreSQL: 用户、订单、分析任务
    ├─ Storage: 视频文件存储
    ├─ Auth: Magic Link认证（无需密码）
    └─ Realtime: WebSocket实时更新
    ↓
客户端AI (用户设备算力)
    └─ MediaPipe Pose: 33关键点检测
    ↓
阿里云百炼 (按需调用)
    └─ 千问API: 报告生成（¥0.02/次）
```

### 为什么选择这个架构？

**Next.js 14 (App Router)**:
- 全栈框架（前端+API一体）
- 自动部署到Vercel（git push即可）
- 边缘计算（全球CDN，中国可访问）
- 免费托管（无限带宽）
- 学习曲线: React开发者1周上手

**Supabase**:
- PostgreSQL数据库（免费版足够到10万用户）
- 内置Auth（magic link，无需密码）
- 文件存储（视频存储）
- 实时订阅（WebSocket）
- 零运维（自动备份、扩展）
- 成本: 免费版到10万用户

**MediaPipe (Client-side)**:
- 在浏览器中运行（用户设备算力）
- 零后端AI成本
- 即时反馈（无需等待上传处理）
- 隐私友好（视频不上传到AI服务）

---

## 🛠️ 技术栈详情

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 14.x | 全栈框架 |
| React | 18.x | UI框架 |
| TypeScript | 5.x | 类型安全 |
| Tailwind CSS | 3.x | 样式系统 |
| Three.js | 0.160.x | 3D骨骼可视化 |
| Recharts | 2.x | 时序曲线图 |
| Zustand | 4.x | 状态管理 |
| Axios | 1.x | HTTP客户端 |

### 后端/服务

| 技术 | 提供商 | 用途 |
|------|--------|------|
| Supabase | Supabase | BaaS（数据库+存储+认证） |
| Vercel | Vercel | 部署托管（免费无限带宽） |
| MediaPipe | Google | 客户端姿态检测 |
| 千问API | 阿里云百炼 | AI报告生成 |

---

## 📊 数据库设计

### PostgreSQL Schema

#### 1. 用户表 (users)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    -- Magic Link认证，无需密码
    
    nickname VARCHAR(50),
    avatar_url TEXT,
    
    -- 身体数据（用于参考）
    height_cm INT CHECK (height_cm > 50 AND height_cm < 300),
    weight_kg INT CHECK (weight_kg > 20 AND weight_kg < 200),
    position VARCHAR(20), -- 'point_guard', 'shooting_guard', etc.
    
    -- 用户偏好
    preferred_language VARCHAR(10) DEFAULT 'zh-CN',
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. 分析任务表 (analysis_tasks)

```sql
CREATE TABLE analysis_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- 状态管理
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- pending, processing, completed, failed
    
    -- 输入数据
    video_url TEXT NOT NULL,
    video_duration FLOAT,
    camera_angle VARCHAR(20), -- 'side', 'front', 'other'
    lighting_condition VARCHAR(20), -- 'good', 'moderate', 'poor'
    
    -- 9维度分析结果（JSONB存储）
    results JSONB,
    
    -- 付费状态
    is_paid BOOLEAN DEFAULT false,
    paid_at TIMESTAMP,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_analysis_user_id ON analysis_tasks(user_id);
CREATE INDEX idx_analysis_status ON analysis_tasks(status);
CREATE INDEX idx_analysis_created_at ON analysis_tasks(created_at);
```

#### 3. 命中率记录表 (shooting_records)

```sql
CREATE TABLE shooting_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    analysis_id UUID REFERENCES analysis_tasks(id),
    
    -- 命中率数据（用户自报）
    session_date DATE NOT NULL,
    total_attempts INT NOT NULL,
    made_shots INT NOT NULL,
    shooting_percentage FLOAT,
    
    -- 关联分析数据（自动记录）
    mechanics_score INT,
    consistency_knee FLOAT,
    
    -- 备注
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. 订单表 (orders)

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    analysis_id UUID REFERENCES analysis_tasks(id),
    
    -- 金额（单位：分）
    amount_cny INT NOT NULL,
    
    -- 状态
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- pending, paid, refunded
    
    -- 支付信息
    payment_method VARCHAR(20), -- 'wechat_qr'
    paid_at TIMESTAMP,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🌐 API设计

### 基础信息

- **基础URL**: `/api/v1`
- **协议**: HTTPS only
- **数据格式**: JSON
- **认证**: Supabase Auth (JWT)

### 核心API端点

#### 1. 分析任务

```typescript
// 创建分析任务
POST /api/v1/analysis
Body: {
  video_url: string,
  camera_angle: 'side' | 'front',
  lighting_condition: 'good' | 'moderate' | 'poor'
}
Response: {
  id: string,
  status: 'pending',
  estimated_time: 45, // seconds
  message: "分析任务已创建"
}

// 查询分析状态
GET /api/v1/analysis/:id/status
Response: {
  id: string,
  status: 'processing',
  progress: 45,
  stage: 'pose_detecting',
  message: "正在识别关键点..."
}

// 获取分析结果（免费预览）
GET /api/v1/analysis/:id/preview
Response: {
  id: string,
  is_paid: false,
  preview: {
    overall_score: 72,
    score_confidence_interval: [65, 79],
    detection_confidence: 78,
    
    // 展示3个维度
    dimensions: [
      {
        name: 'consistency',
        score: 62,
        value: 18, // 膝关节波动
        unit: 'degrees',
        error_margin: '±15°'
      }
    ],
    
    locked_count: 6 // 还有6个维度未解锁
  },
  payment: {
    amount_cny: 990, // ¥9.9
    order_id: string
  }
}

// 获取完整分析结果（需付费）
GET /api/v1/analysis/:id/full
Headers: { Authorization: Bearer {token} }
Response: {
  id: string,
  is_paid: true,
  
  // 9维度完整数据
  dimensions: {
    consistency: { score: 62, details: {...} },
    joint_angles: { score: 75, details: {...} },
    symmetry: { score: 68, details: {...} },
    shooting_style: { score: 80, details: {...} },
    timing: { score: 72, details: {...} },
    stability: { score: 71, details: {...} },
    progress: { score: null, details: {...} },
    coordination: { score: 68, details: {...} },
    kinetic_chain: { score: 73, details: {...} }
  },
  
  ai_report: {
    overall_score: 72,
    problems: [...],
    recommendations: [...],
    training_plan: {...},
    disclaimer: string
  }
}
```

#### 2. 命中率记录

```typescript
// 记录命中率
POST /api/v1/shooting-records
Body: {
  analysis_id: string,
  session_date: string,
  total_attempts: number,
  made_shots: number,
  notes?: string
}

// 获取命中率历史
GET /api/v1/shooting-records?limit=30
Response: {
  total: 12,
  average_percentage: 62.5,
  trend: 'improving',
  items: [...],
  progress_analysis: {
    mechanics_improvement: "膝关节角度波动从22°改善到18°",
    percentage_improvement: "命中率从58%提升到64%"
  }
}
```

#### 3. 支付

```typescript
// 创建订单
POST /api/v1/orders
Body: {
  analysis_id: string,
  amount_cny: 990 // ¥9.9
}
Response: {
  order_id: string,
  amount_cny: 990,
  qr_code_url: string, // 微信收款码图片URL
  expires_at: timestamp
}

// 查询订单状态
GET /api/v1/orders/:id
Response: {
  id: string,
  amount_cny: 990,
  status: 'pending' | 'paid',
  qr_code_url: string
}

// 标记为已支付（用户扫码后手动标记）
POST /api/v1/orders/:id/mark-paid
// 注意：实际支付验证需要更严谨的方案（如 webhook 或轮询）
```

---

## 🔧 核心算法设计

### 9维度分析算法

#### 1. 一致性计算

```typescript
function calculateConsistency(poseData: PoseData): ConsistencyMetrics {
  // 1. 提取关键帧（起跳到出手）
  const keyFrames = extractKeyFrames(poseData);
  
  // 2. 计算关节角度时序
  const kneeAngles = keyFrames.map(f => calculateKneeAngle(f));
  const elbowAngles = keyFrames.map(f => calculateElbowAngle(f));
  
  // 3. 计算波动范围（一致性核心指标）
  const kneeVariance = Math.max(...kneeAngles) - Math.min(...kneeAngles);
  const elbowVariance = Math.max(...elbowAngles) - Math.min(...elbowAngles);
  
  // 4. 计算标准差
  const kneeStdDev = calculateStdDev(kneeAngles);
  
  // 5. 计算综合评分
  const consistencyScore = calculateConsistencyScore([
    { metric: 'knee_variance', value: kneeVariance, weight: 0.4 },
    { metric: 'elbow_variance', value: elbowVariance, weight: 0.3 },
    { metric: 'timing_consistency', value: timingStdDev, weight: 0.3 }
  ]);
  
  return {
    knee_angle_variance: kneeVariance,
    knee_angle_std_dev: kneeStdDev,
    elbow_angle_variance: elbowVariance,
    overall_consistency_score: consistencyScore,
    elite_benchmark: 10, // 精英球员标准
    assessment: consistencyScore > 80 ? 'elite' : consistencyScore > 60 ? 'advanced' : 'intermediate'
  };
}
```

#### 2. 关节角度计算（含误差标注）

```typescript
function calculateJointAngles(poseData: PoseData, cameraAngle: string): JointAngles {
  const angles = {
    left_knee: {
      value: calculateAngle(poseData.left_hip, poseData.left_knee, poseData.left_ankle),
      error_margin: cameraAngle === 'side' ? '±15°' : '±20-25°',
      measurement_confidence: cameraAngle === 'side' ? 'high' : 'medium',
      reference_range: { min: 106, max: 119 }, // 职业球员范围
      status: 'warning' // 基于一致性评估，不是绝对值
    },
    // ... 其他关节
  };
  
  return angles;
}
```

#### 3. 动作协调性计算

```typescript
function calculateCoordination(poseData: PoseData): CoordinationMetrics {
  // 1. 计算关节同步系数（相关系数）
  const kneeHipCorrelation = calculateCorrelation(
    kneeAngleTimeline,
    hipAngleTimeline
  );
  
  // 2. 计算动作流畅度（加速度变化率）
  const accelerations = calculateAccelerations(poseData);
  const smoothnessScore = 100 - (calculateStdDev(accelerations) * 100);
  
  // 3. 计算时序过渡平滑度
  const phaseTransitions = calculatePhaseTransitions(poseData);
  const transitionSmoothness = calculateTransitionSmoothness(phaseTransitions);
  
  return {
    joint_synchronization: {
      knee_hip_correlation: kneeHipCorrelation,
      hip_elbow_correlation: hipElbowCorrelation,
      elbow_wrist_correlation: elbowWristCorrelation
    },
    movement_smoothness: smoothnessScore,
    phase_transition_smoothness: transitionSmoothness,
    overall_coordination_score: calculateWeightedScore([...])
  };
}
```

#### 4. 动力链协调性计算

```typescript
function calculateKineticChain(poseData: PoseData): KineticChainMetrics {
  // ⚠️ 重要：只能计算时序，不能计算力量
  
  // 1. 检测各环节激活时间点
  const activationTimings = {
    knee_extension: detectActivation(poseData, 'knee'),
    hip_extension: detectActivation(poseData, 'hip'),
    core_rotation: detectActivation(poseData, 'core'),
    shoulder_flexion: detectActivation(poseData, 'shoulder'),
    elbow_extension: detectActivation(poseData, 'elbow'),
    wrist_flexion: detectActivation(poseData, 'wrist')
  };
  
  // 2. 计算环节间延迟
  const delays = {
    knee_to_hip: activationTimings.hip - activationTimings.knee,
    hip_to_core: activationTimings.core - activationTimings.hip,
    core_to_shoulder: activationTimings.shoulder - activationTimings.core,
    shoulder_to_elbow: activationTimings.elbow - activationTimings.shoulder,
    elbow_to_wrist: activationTimings.wrist - activationTimings.elbow
  };
  
  // 3. 评估理想顺序匹配度
  const sequenceCorrectness = evaluateSequenceCorrectness(activationTimings);
  
  // 4. 计算环节贡献度（角度变化比例）
  const segmentContributions = calculateSegmentContributions(poseData);
  
  return {
    activation_timings: activationTimings,
    segment_delays: delays,
    sequence_correctness: sequenceCorrectness,
    segment_contributions: segmentContributions,
    
    // ⚠️ 重要声明：这不是发力效率
    disclaimer: "本分析基于关节角度变化时序，评估'动力链协调性'。无法测量力量大小或'发力效率'（需要测力台）。"
  };
}
```

---

## 📦 部署方案

### Vercel部署

```bash
# 1. 项目初始化
npx create-next-app@latest shotai --typescript --tailwind --eslint --app --src-dir

# 2. 安装依赖
npm install three @react-three/fiber recharts zustand @supabase/supabase-js

# 3. 环境变量配置
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
QWEN_API_KEY=your_qwen_api_key

# 4. 部署
git push
# Vercel自动部署
```

### Supabase配置

```sql
-- 1. 创建项目
-- 在Supabase Dashboard创建新项目

-- 2. 运行迁移
-- 执行上面的SQL建表语句

-- 3. 配置Storage
-- 创建bucket: videos
-- 设置RLS策略

-- 4. 配置Auth
-- 启用Magic Link认证
-- 配置邮件模板
```

---

## 💰 成本控制

### 月度成本估算（MVP阶段）

| 项目 | 用量 | 单价 | 月度成本 |
|------|------|------|---------|
| **Vercel** | 无限带宽 | 免费 | ¥0 |
| **Supabase** | 免费额度 | 免费 | ¥0 |
| **千问API** | 1000次分析 | 0.02元/千token | ¥60 |
| **域名** | 1个 | 50元/年 | ¥4 |
| **总计** | | | **~¥64/月** |

**成本优势**：
- Vercel免费版：无限带宽，自动CDN
- Supabase免费版：足够到10万用户
- 客户端AI：零后端AI成本
- 月运营成本<¥100，5-10个用户即可覆盖

---

## 🔗 相关文档

- [01-PROJECT-VISION.md](./01-PROJECT-VISION.md) - 项目愿景和商业模式
- [02-SCIENTIFIC-BASIS.md](./02-SCIENTIFIC-BASIS.md) - 运动科学文献
- [03-PRODUCT-REQUIREMENTS.md](./03-PRODUCT-REQUIREMENTS.md) - 9维度分析体系
- [05-TRAINING-SYSTEM.md](./05-TRAINING-SYSTEM.md) - 系统性训练指南
- [06-DEVELOPMENT-PLAN.md](./06-DEVELOPMENT-PLAN.md) - 开发路线图

---

*文档版本: v2.0 - 9维度技术支撑版*  
*更新日期: 2026-02-03*
