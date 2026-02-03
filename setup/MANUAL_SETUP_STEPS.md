# 🔐 手动配置 Supabase 匿名认证

由于浏览器自动化遇到了一些问题，请按照以下步骤手动完成配置：

## 📋 操作步骤（2分钟）

### 1. 登录 Supabase Dashboard

1. 打开浏览器，访问：https://supabase.com/dashboard
2. 使用你的 GitHub 账号登录（cairentian932@gmail.com 关联的 GitHub）

### 2. 选择项目

1. 在 Dashboard 中找到并点击项目：**Timcai06's Project**
2. 或者直接访问：https://supabase.com/dashboard/project/jysufktrfwviehurkwiz

### 3. 进入认证设置

1. 在左侧菜单中，点击 **Authentication** (认证图标 🔐)
2. 点击 **Providers** (提供商)

### 4. 启用匿名登录

1. 在 Providers 列表中，找到 **Anonymous Sign-ins**
2. 点击右侧的 **开关按钮**，将其设置为 **启用** (绿色)
3. 点击页面底部的 **Save** 按钮

### 5. 验证配置

完成后，回到终端运行测试：

```bash
node -r dotenv/config test-auth-setup.js dotenv_config_path=.env.local
```

如果看到 ✅ 所有测试通过，说明配置成功！

---

## 🎯 配置位置截图参考

```
Dashboard 左侧菜单：
├── 🏠 Home
├── 📊 Table Editor
├── 🔐 Authentication  ← 点击这里
│   ├── Users
│   ├── Providers      ← 然后点击这里
│   ├── Policies
│   └── ...
├── 💾 Storage
└── ...

Providers 页面：
┌─────────────────────────────────────┐
│ Authentication Providers            │
├─────────────────────────────────────┤
│ Email                    [Toggle]   │
│ Phone                    [Toggle]   │
│ Anonymous Sign-ins       [Toggle]   │ ← 启用这个
│ Apple                    [Toggle]   │
│ GitHub                   [Toggle]   │
│ Google                   [Toggle]   │
└─────────────────────────────────────┘
```

---

## ❓ 常见问题

### Q: 找不到 Anonymous Sign-ins 选项？
A: 确保你在 **Authentication → Providers** 页面，向下滚动可以找到。

### Q: 开关是灰色的，无法点击？
A: 可能是权限问题，确保你是项目的 Owner 或 Admin。

### Q: 保存后没有反应？
A: 刷新页面，检查开关是否保持在启用状态。

### Q: 测试仍然失败？
A: 
1. 清除浏览器缓存
2. 重启开发服务器
3. 检查 .env.local 中的 API keys 是否正确

---

## 🚀 完成后

配置完成后，你就可以：

1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 访问上传页面：
   ```
   http://localhost:3000/upload
   ```

3. 上传视频测试 - **401 错误将消失！** ✨

---

## 💡 提示

如果你不想使用匿名认证，也可以：
- 实现用户注册/登录功能
- 使用 Email 认证
- 使用 OAuth (Google, GitHub 等)

但匿名认证是最快的方式，适合 MVP 阶段快速验证功能。

---

**需要帮助？** 随时问我！
