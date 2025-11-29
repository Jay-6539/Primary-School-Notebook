# 启动应用和数据迁移指南

## 🚀 启动应用

在 CMD 中运行（确保在项目目录下）：

```cmd
cd /d "D:\Cursor Project\Primary School Aiden"
npm run dev
```

应用会在 `http://localhost:5173` 启动。

## 🔄 数据迁移

### 自动迁移（已配置）

应用启动后，数据会自动迁移：

1. **首次访问页面时**：
   - 每个组件（English Words、Bank、Parent Scorecard、Picture Wall）会自动检测
   - 如果 Supabase 为空但 localStorage 有数据 → 自动迁移到 Supabase
   - 如果 Supabase 有数据 → 直接使用 Supabase 数据

2. **无需手动操作**：
   - 只需正常使用应用
   - 访问各个页面，数据会自动迁移

### 手动迁移（可选）

如果你想手动触发完整迁移：

1. 打开应用：`http://localhost:5173`
2. 点击导航栏中的 **"Data Migration"**
3. 点击 **"Start Migration"** 按钮
4. 等待迁移完成

## ✅ 验证步骤

### 1. 检查应用是否正常启动
- 浏览器自动打开 `http://localhost:5173`
- 看到 Aiden's Website 首页

### 2. 检查数据迁移
访问以下页面，确认数据正常显示：
- **English Words** - 检查单词列表
- **Aiden Bank** - 检查银行记录
- **Parent Scorecard** - 检查家长反馈
- **Picture Wall** - 检查图片

### 3. 检查 Supabase 数据
1. 登录 Supabase Dashboard: https://sugwnzvsntqcpbegieeu.supabase.co
2. 进入 **Table Editor**
3. 检查各个表是否有数据：
   - `words` 表
   - `spelling_history` 表
   - `recognition_history` 表
   - `bank_entries` 表
   - `parent_feedback` 表
   - `pictures` 表

### 4. 测试新数据保存
- 添加一个新单词
- 添加一条银行记录
- 记录家长反馈
- 上传一张图片

然后检查：
- 应用中的数据是否正常显示
- Supabase Dashboard 中是否同步保存

## 📝 数据同步机制

### 读取数据
1. **优先从 Supabase 读取**
2. 如果 Supabase 为空，从 localStorage 读取并自动迁移

### 写入数据
- 所有新数据会**同时保存**到：
  - ✅ Supabase（主要数据源）
  - ✅ localStorage（作为备份）

### 错误处理
- 如果 Supabase 连接失败，自动回退到 localStorage
- 数据不会丢失

## 🎯 下一步

1. **启动应用**：`npm run dev`
2. **访问页面**：让数据自动迁移
3. **验证数据**：检查各个页面和 Supabase Dashboard
4. **开始使用**：所有新数据会自动保存到 Supabase

## 🆘 遇到问题？

### 应用无法启动
- 检查端口 5173 是否被占用
- 查看 CMD 中的错误信息
- 确认 Node.js 版本（需要 14+）

### 数据没有迁移
- 打开浏览器开发者工具（F12）
- 查看 Console 标签的错误信息
- 确认 Supabase 表已创建
- 尝试手动迁移（Data Migration 页面）

### 数据同步失败
- 检查网络连接
- 检查 Supabase Dashboard 是否可访问
- 查看浏览器控制台的错误信息

## 💡 提示

- 首次迁移可能需要几秒钟
- 迁移过程中不要关闭浏览器
- 迁移完成后，可以继续正常使用应用
- 所有新数据会自动保存到 Supabase，无需再次迁移

