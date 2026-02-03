# 🔧 Setup 文件夹

这个文件夹包含项目设置和开发过程中的临时文档。

## 📋 文件说明

### Supabase 相关
- `SUPABASE_STATUS_REPORT.md` - Supabase 项目状态检查报告
- `SUPABASE_POWER_EXAMPLE.md` - Supabase Power 使用示例
- `SETUP_AUTH.md` - 认证配置指南（已过时，参考 PROBLEM_SOLVED.md）
- `MANUAL_SETUP_STEPS.md` - 手动配置步骤（已过时）

### 开发进度
- `DAY_31-32_COMPLETED.md` - Day 31-32 任务完成报告
- `PROBLEM_SOLVED.md` - 401 错误解决方案

### 测试脚本
- `test-upload-api.js` - 上传 API 测试脚本

---

## 📚 项目文档位置

**核心文档** (在 `doc/` 文件夹):
- `01-PROJECT-VISION.md` - 项目愿景
- `02-SCIENTIFIC-BASIS.md` - 科学基础
- `03-PRODUCT-REQUIREMENTS.md` - 产品需求
- `04-TECHNICAL-ARCHITECTURE.md` - 技术架构
- `05-TRAINING-SYSTEM.md` - 训练系统
- `06-DEVELOPMENT-PLAN.md` - 开发计划

**项目根目录**:
- `README.md` - 项目介绍
- `QUICKSTART.md` - 快速开始
- `USAGE.md` - 使用说明

---

## 🚀 快速参考

### 测试上传 API
```bash
node -r dotenv/config setup/test-upload-api.js dotenv_config_path=.env.local
```

### 查看项目状态
```bash
cat setup/SUPABASE_STATUS_REPORT.md
```

### 了解解决方案
```bash
cat setup/PROBLEM_SOLVED.md
```
