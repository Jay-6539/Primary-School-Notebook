# 快速开始指南

## ✅ 已完成
- [x] 数据库表已创建
- [x] Supabase 集成代码已就绪
- [x] 自动迁移逻辑已实现
- [x] 手动迁移工具已创建

## 📦 安装依赖

由于 PowerShell 执行策略限制，请使用以下方法之一安装依赖：

### 方法 1: 使用命令提示符 (CMD)
1. 按 `Win + R`，输入 `cmd`，按回车
2. 切换到项目目录：
   ```cmd
   cd "D:\Cursor Project\Primary School Aiden"
   ```
3. 运行安装命令：
   ```cmd
   npm install
   ```

### 方法 2: 使用 Git Bash
1. 打开 Git Bash
2. 切换到项目目录
3. 运行：
   ```bash
   npm install
   ```

### 方法 3: 使用 VS Code 终端
1. 在 VS Code 中打开项目
2. 按 `Ctrl + `` (反引号) 打开终端
3. 选择 "Command Prompt" 或 "Git Bash" 作为终端类型
4. 运行：
   ```bash
   npm install
   ```

## 🚀 启动应用

安装完成后，启动开发服务器：

```bash
npm run dev
```

应用会在 `http://localhost:5173` 启动。

## 🔄 数据迁移

### 自动迁移（推荐）
1. 打开应用
2. 访问各个页面（English Words、Bank、Parent Scorecard、Picture Wall）
3. 数据会自动从 localStorage 迁移到 Supabase
4. 无需手动操作

### 手动迁移
1. 打开应用
2. 点击导航栏中的 **"Data Migration"**
3. 点击 **"Start Migration"** 按钮
4. 等待迁移完成

## ✅ 验证

### 检查数据迁移
1. 在应用中打开各个页面，确认数据正常显示
2. 尝试添加新数据，确认能正常保存
3. 在 Supabase Dashboard 的 Table Editor 中查看数据

### 检查 Supabase 连接
1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签
3. 确认没有错误信息
4. 如果有错误，检查网络连接和 Supabase 配置

## 📝 下一步

1. **安装依赖** - 使用上述方法之一
2. **启动应用** - `npm run dev`
3. **验证迁移** - 检查数据是否正常
4. **开始使用** - 所有新数据会自动保存到 Supabase

## 🆘 遇到问题？

### 依赖安装失败
- 确保已安装 Node.js（版本 14+）
- 尝试清除 npm 缓存：`npm cache clean --force`
- 尝试删除 `node_modules` 和 `package-lock.json`，然后重新安装

### 应用无法启动
- 检查 Node.js 版本：`node --version`
- 检查端口 5173 是否被占用
- 查看终端错误信息

### 数据迁移失败
- 检查 Supabase 表是否已创建
- 检查浏览器控制台错误
- 确认网络连接正常
- 尝试手动迁移

## 📚 相关文档

- `SUPABASE_SETUP.md` - Supabase 设置详细指南
- `MIGRATION_GUIDE.md` - 数据迁移详细指南
- `SUPABASE_INTEGRATION_SUMMARY.md` - 集成总结

