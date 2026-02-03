# ✅ Vercel 部署检查清单

**问题**: 500 INTERNAL_SERVER_ERROR - MIDDLEWARE_INVOCATION_FAILED  
**原因**: 中间件在 Vercel 上运行时环境变量未正确加载  
**解决**: 已修复 middleware.ts，添加了错误处理和环保变量检查

---

## 🔧 已完成的修复

### 1. 中间件错误处理
- ✅ 添加环境变量检查
- ✅ 添加 try-catch 错误处理
- ✅ 即使出错也返回响应（不中断请求）
- ✅ 添加日志输出便于调试

### 2. 修改的文件
- `middleware.ts` - 添加了错误处理和环境变量检查

---

## 📋 部署前检查清单

### 1. 环境变量配置 ✅

在 Vercel Dashboard 中确认以下环境变量已配置：

```
NEXT_PUBLIC_SUPABASE_URL = https://jysufktrfwviehurkwiz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
QWEN_API_KEY = sk-xxx...
```

**检查方法**:
1. 访问 https://vercel.com/dashboard
2. 选择 `shotAI` 项目
3. Settings → Environment Variables
4. 确认所有 4 个变量都已配置

### 2. 代码修复 ✅

- ✅ middleware.ts 已修复
- ✅ 添加了环境变量检查
- ✅ 添加了错误处理

### 3. 重新部署

修复后需要重新部署：

**方式1：自动部署（推荐）**
```bash
git add middleware.ts
git commit -m "fix: 修复中间件错误处理"
git push origin main
```
Vercel 会自动检测到更新并重新部署。

**方式2：手动重新部署**
1. 访问 https://vercel.com/dashboard
2. 选择 `shotAI` 项目
3. Deployments → 最新部署 → ... → Redeploy

---

## 🧪 部署后测试

### 1. 检查部署状态
- 访问 https://vercel.com/dashboard
- 确认最新部署状态为 ✅ Ready（绿色）

### 2. 访问网站
- 打开 https://shotai.vercel.app
- 应该看到首页，不再出现 500 错误

### 3. 查看日志
如果仍然出现错误：
1. Vercel Dashboard → Deployments → 最新部署
2. 点击 "Function Logs" 查看详细错误信息

### 4. 测试功能
- [ ] 首页加载正常
- [ ] 上传页面可访问
- [ ] 拍摄引导页面可访问
- [ ] 其他页面可访问

---

## 🔍 故障排除

### 问题1：仍然出现 500 错误

**检查步骤**:
1. 确认环境变量已配置
2. 查看 Vercel 函数日志
3. 检查 Supabase 连接是否正常

**解决方案**:
```bash
# 本地测试
npm run dev

# 访问 http://localhost:3000
# 检查是否有错误信息
```

### 问题2：环境变量未生效

**原因**: Vercel 缓存了旧的部署

**解决方案**:
1. 在 Vercel Dashboard 中重新配置环境变量
2. 手动重新部署（Redeploy）
3. 等待 1-2 分钟

### 问题3：Supabase 连接失败

**检查**:
1. API Key 是否正确
2. Supabase 项目是否暂停
3. 网络连接是否正常

**测试**:
```bash
# 本地测试 Supabase 连接
node -r dotenv/config setup/test-upload-api.js dotenv_config_path=.env.local
```

---

## 📊 部署信息

| 项目 | 值 |
|------|-----|
| GitHub 仓库 | https://github.com/Timcai06/shotAI |
| Vercel 项目 | shotAI |
| 网站 URL | https://shotai.vercel.app |
| 部署平台 | Vercel |
| 数据库 | Supabase |

---

## 🚀 下一步

1. ✅ 修复中间件错误
2. ⏳ 重新部署到 Vercel
3. ⏳ 测试网站功能
4. ⏳ 继续开发 Week 7-8 功能

---

## 📞 需要帮助？

如果问题仍未解决：

1. **查看 Vercel 日志**
   - Deployments → 最新部署 → Function Logs

2. **查看浏览器控制台**
   - F12 → Console 标签
   - 查看是否有错误信息

3. **检查 Supabase 状态**
   - https://supabase.com/dashboard
   - 确认项目状态正常

4. **本地测试**
   ```bash
   npm run dev
   # 访问 http://localhost:3000
   ```

---

**修复已完成，现在重新部署吧！** 🚀
