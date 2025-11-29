# 数据迁移指南

## 🎯 迁移方式

有两种方式可以将 localStorage 数据迁移到 Supabase：

### 方式 1: 自动迁移（推荐）

**自动迁移会在以下情况触发：**

1. **首次打开应用时**：每个组件（WordList、Bank、ParentFeedback、PictureWall）在加载时会自动检测：
   - 如果 Supabase 中有数据 → 使用 Supabase 数据
   - 如果 Supabase 为空但 localStorage 有数据 → 自动迁移到 Supabase

2. **无需手动操作**：只需正常使用应用，数据会自动同步

### 方式 2: 手动迁移

如果你想手动触发完整迁移：

1. 打开应用
2. 点击导航栏中的 **"Data Migration"** 按钮
3. 点击 **"Start Migration"** 按钮
4. 等待迁移完成

## 📋 迁移的数据类型

迁移工具会迁移以下所有数据：

- ✅ **English Words** - 所有识别和拼写单词
- ✅ **Spelling History** - 拼写练习历史记录
- ✅ **Recognition History** - 单词识别历史记录
- ✅ **Bank Entries** - 所有银行记录
- ✅ **Parent Feedback** - 家长反馈记录
- ✅ **Pictures** - 上传的图片

## 🔄 数据同步机制

### 读取数据
1. 优先从 Supabase 读取
2. 如果 Supabase 为空，从 localStorage 读取并自动迁移

### 写入数据
- 所有新数据会**同时保存**到：
  - Supabase（主要数据源）
  - localStorage（作为备份）

### 错误处理
- 如果 Supabase 连接失败，自动回退到 localStorage
- 数据不会丢失

## ✅ 验证迁移

### 方法 1: 在应用中验证
1. 打开各个页面（English Words、Bank、Parent Scorecard、Picture Wall）
2. 检查数据是否正常显示
3. 尝试添加新数据，确认能正常保存

### 方法 2: 在 Supabase Dashboard 验证
1. 登录 Supabase Dashboard: https://sugwnzvsntqcpbegieeu.supabase.co
2. 进入 **Table Editor**
3. 检查各个表是否有数据：
   - `words` 表
   - `spelling_history` 表
   - `recognition_history` 表
   - `bank_entries` 表
   - `parent_feedback` 表
   - `pictures` 表

## 🔍 故障排除

### 问题 1: 数据没有迁移
**解决方案：**
- 检查 Supabase 表是否已创建
- 检查浏览器控制台是否有错误
- 尝试手动迁移（使用 Data Migration 页面）

### 问题 2: 迁移后数据重复
**解决方案：**
- 不用担心，迁移使用 `upsert`（更新或插入），不会创建重复数据
- 可以多次运行迁移，不会产生重复

### 问题 3: 部分数据没有迁移
**解决方案：**
- 检查 localStorage 中是否有对应数据
- 检查浏览器控制台的错误信息
- 尝试手动迁移

### 问题 4: 网络连接问题
**解决方案：**
- 确保网络连接正常
- 如果 Supabase 连接失败，应用会自动使用 localStorage
- 网络恢复后，数据会自动同步到 Supabase

## 📝 注意事项

1. **数据安全**：
   - 迁移不会删除 localStorage 中的数据
   - localStorage 仍然保留作为备份

2. **多次迁移**：
   - 可以安全地多次运行迁移
   - 使用 `upsert` 机制，不会产生重复数据

3. **数据格式**：
   - 迁移会自动转换数据格式（从组件格式到数据库格式）
   - 无需手动转换

4. **实时同步**：
   - 迁移完成后，所有新操作都会自动同步到 Supabase
   - 无需再次迁移

## 🚀 开始使用

1. **确保数据库表已创建**（已完成 ✅）
2. **安装依赖**：
   ```bash
   npm install
   ```
3. **启动应用**：
   ```bash
   npm run dev
   ```
4. **打开应用**，数据会自动迁移
5. **验证数据**：检查各个页面数据是否正常

## 💡 提示

- 首次迁移可能需要几秒钟，取决于数据量
- 迁移过程中不要关闭浏览器
- 迁移完成后，可以继续正常使用应用
- 所有新数据会自动保存到 Supabase

