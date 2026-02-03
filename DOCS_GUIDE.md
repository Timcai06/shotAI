# 📚 文档导航指南

快速找到你需要的文档！

---

## 🎯 按用途查找

### 我想了解项目
- **项目愿景和商业模式** → `doc/01-PROJECT-VISION.md`
- **产品功能和需求** → `doc/03-PRODUCT-REQUIREMENTS.md`
- **技术架构** → `doc/04-TECHNICAL-ARCHITECTURE.md`
- **快速开始** → `QUICKSTART.md`

### 我想了解开发进度
- **12周开发计划** → `doc/06-DEVELOPMENT-PLAN.md`
- **当前完成情况** → `setup/DAY_31-32_COMPLETED.md`
- **Supabase 配置状态** → `setup/SUPABASE_STATUS_REPORT.md`

### 我想解决问题
- **401 错误解决方案** → `setup/PROBLEM_SOLVED.md`
- **Supabase 使用示例** → `setup/SUPABASE_POWER_EXAMPLE.md`
- **测试上传 API** → `setup/test-upload-api.js`

### 我想学习运动科学
- **科学基础** → `doc/02-SCIENTIFIC-BASIS.md`
- **训练系统** → `doc/05-TRAINING-SYSTEM.md`

### 我想使用项目
- **使用说明** → `USAGE.md`
- **快速开始** → `QUICKSTART.md`

---

## 📁 文件夹说明

### `doc/` - 核心项目文档
**用途**: 产品设计、技术架构、开发计划  
**特点**: 长期保留，项目核心文档  
**更新频率**: 低（仅在重大决策时更新）

**包含文件**:
- 01-PROJECT-VISION.md
- 02-SCIENTIFIC-BASIS.md
- 03-PRODUCT-REQUIREMENTS.md
- 04-TECHNICAL-ARCHITECTURE.md
- 05-TRAINING-SYSTEM.md
- 06-DEVELOPMENT-PLAN.md

### `setup/` - 开发设置和临时文档
**用途**: 开发过程中的配置、测试、进度报告  
**特点**: 临时文档，可随时更新或删除  
**更新频率**: 高（开发过程中频繁更新）

**包含文件**:
- README.md - setup 文件夹说明
- PROBLEM_SOLVED.md - 问题解决方案
- DAY_31-32_COMPLETED.md - 开发进度
- SUPABASE_STATUS_REPORT.md - 配置状态
- SUPABASE_POWER_EXAMPLE.md - 使用示例
- test-upload-api.js - 测试脚本

### 根目录 - 项目文档
**用途**: 项目介绍、快速开始、使用说明  
**特点**: 面向用户和开发者  
**更新频率**: 中等

**包含文件**:
- README.md - 项目介绍
- QUICKSTART.md - 快速开始
- USAGE.md - 使用说明
- DOCS_GUIDE.md - 本文件

---

## 🔍 按文件名查找

| 文件名 | 位置 | 用途 |
|--------|------|------|
| PROJECT-VISION.md | doc/ | 项目愿景 |
| SCIENTIFIC-BASIS.md | doc/ | 科学基础 |
| PRODUCT-REQUIREMENTS.md | doc/ | 产品需求 |
| TECHNICAL-ARCHITECTURE.md | doc/ | 技术架构 |
| TRAINING-SYSTEM.md | doc/ | 训练系统 |
| DEVELOPMENT-PLAN.md | doc/ | 开发计划 |
| PROBLEM_SOLVED.md | setup/ | 问题解决 |
| DAY_31-32_COMPLETED.md | setup/ | 进度报告 |
| SUPABASE_STATUS_REPORT.md | setup/ | 配置状态 |
| SUPABASE_POWER_EXAMPLE.md | setup/ | 使用示例 |
| README.md | 根目录 | 项目介绍 |
| QUICKSTART.md | 根目录 | 快速开始 |
| USAGE.md | 根目录 | 使用说明 |

---

## 💡 建议

### 第一次接触项目？
1. 阅读 `README.md` - 了解项目概况
2. 阅读 `QUICKSTART.md` - 快速开始
3. 阅读 `doc/01-PROJECT-VISION.md` - 了解愿景

### 想参与开发？
1. 阅读 `doc/06-DEVELOPMENT-PLAN.md` - 了解计划
2. 阅读 `setup/DAY_31-32_COMPLETED.md` - 了解进度
3. 查看 `setup/PROBLEM_SOLVED.md` - 了解已解决的问题

### 想了解技术细节？
1. 阅读 `doc/04-TECHNICAL-ARCHITECTURE.md` - 技术架构
2. 查看 `setup/SUPABASE_STATUS_REPORT.md` - 配置状态
3. 运行 `setup/test-upload-api.js` - 测试 API

### 想学习运动科学？
1. 阅读 `doc/02-SCIENTIFIC-BASIS.md` - 科学基础
2. 阅读 `doc/03-PRODUCT-REQUIREMENTS.md` - 9维度体系
3. 阅读 `doc/05-TRAINING-SYSTEM.md` - 训练系统

---

## 🚀 快速命令

```bash
# 查看项目介绍
cat README.md

# 快速开始
cat QUICKSTART.md

# 查看开发计划
cat doc/06-DEVELOPMENT-PLAN.md

# 查看当前进度
cat setup/DAY_31-32_COMPLETED.md

# 测试上传 API
node -r dotenv/config setup/test-upload-api.js dotenv_config_path=.env.local

# 查看所有文档
ls -la doc/
ls -la setup/
```

---

## 📝 文档维护规则

### `doc/` 文件夹
- ✅ 长期保留
- ✅ 项目核心文档
- ✅ 定期审查和更新
- ❌ 不删除过时文档

### `setup/` 文件夹
- ✅ 临时文档
- ✅ 开发过程中频繁更新
- ✅ 可随时删除或重组
- ✅ 用于记录开发进度和问题解决

### 根目录
- ✅ 面向用户的文档
- ✅ 保持简洁
- ✅ 定期更新
- ❌ 不放置临时文档

---

**需要帮助？查看相关文档或运行测试脚本！** 🚀
