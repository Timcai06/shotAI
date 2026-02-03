# 🔐 Supabase 认证配置指南

## 需要在 Supabase Dashboard 完成的配置

### 步骤 1: 启用匿名认证

1. 打开浏览器，访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目：**Timcai06's Project** (jysufktrfwviehurkwiz)
3. 在左侧菜单中点击 **Authentication** → **Providers**
4. 找到 **Anonymous Sign-ins** 选项
5. 点击右侧的开关，**启用匿名登录**
6. 点击 **Save** 保存设置

### 步骤 2: 配置 Site URL（可选但推荐）

1. 在 Authentication 页面，点击 **URL Configuration**
2. 设置 **Site URL** 为：`http://localhost:3000`（开发环境）
3. 生产环境时改为你的实际域名

### 步骤 3: 验证配置

完成上述步骤后，回到终端运行：

```bash
npm run dev
```

然后访问 `http://localhost:3000/upload`，尝试上传视频。

---

## 已完成的配置

✅ **Storage Bucket 创建**
- Bucket 名称: `videos`
- 大小限制: 50MB
- 允许的文件类型: MP4, MOV, WebM, M4V
- 访问策略: 已配置

✅ **数据库表**
- users
- analysis_tasks
- shooting_records
- orders

✅ **API 代码更新**
- 支持匿名用户自动创建
- 视频上传逻辑完善
- 错误处理优化

---

## 配置完成后的工作流程

1. 用户访问上传页面
2. 系统自动创建匿名会话
3. 用户上传视频
4. 视频存储到 Supabase Storage
5. 创建分析任务记录
6. 跳转到等待页面

---

## 故障排除

### 如果仍然出现 401 错误：

1. **检查环境变量**
   ```bash
   # 确认 .env.local 中的配置正确
   cat .env.local | grep SUPABASE
   ```

2. **清除浏览器缓存和 Cookie**
   - 按 Cmd+Shift+Delete (Mac) 或 Ctrl+Shift+Delete (Windows)
   - 清除所有 localhost 的数据

3. **重启开发服务器**
   ```bash
   # 停止当前服务器 (Ctrl+C)
   # 重新启动
   npm run dev
   ```

4. **检查 Supabase 项目状态**
   ```bash
   npx supabase projects list
   ```

---

## 下一步

配置完成后，你就可以：
- ✅ 上传视频
- ✅ 创建分析任务
- ⏳ 开发分析算法（Week 7-8 的任务）
- ⏳ 实现结果展示页面

**现在去 Supabase Dashboard 启用匿名认证吧！** 🚀
