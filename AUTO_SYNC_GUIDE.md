# 自动数据同步指南

## 🔄 自动同步机制

所有数据都会**自动**在 localStorage 和 Supabase 之间同步，无需手动操作。

## 📊 同步的数据类型

以下数据会自动同步：

- ✅ **English Words** - 识别和拼写单词
- ✅ **Spelling History** - 拼写练习历史
- ✅ **Recognition History** - 单词识别历史
- ✅ **Bank Entries** - 银行记录
- ✅ **Parent Feedback** - 家长反馈
- ✅ **Pictures** - 上传的图片

## 🔄 同步流程

### 1. 读取数据（组件加载时）

每个组件在加载时会：

1. **优先从 Supabase 读取**
   - 如果 Supabase 有数据 → 直接使用
   - 如果 Supabase 为空 → 从 localStorage 读取并自动迁移到 Supabase

2. **自动迁移**
   - 首次访问页面时，如果 Supabase 为空但 localStorage 有数据
   - 数据会自动迁移到 Supabase
   - 无需手动操作

### 2. 写入数据（数据更改时）

所有数据更改会**同时保存**到：

- ✅ **Supabase**（主要数据源）
- ✅ **localStorage**（作为备份）

### 3. 错误处理

- 如果 Supabase 连接失败 → 自动回退到 localStorage
- 数据不会丢失
- 网络恢复后，数据会自动同步到 Supabase

## 🎯 使用方式

### 正常使用即可

1. **打开应用**
2. **访问各个页面**（English Words、Bank、Parent Scorecard、Picture Wall）
3. **数据自动同步** - 无需任何手动操作

### 首次使用

- 如果 localStorage 有数据，首次访问页面时会自动迁移到 Supabase
- 迁移过程在后台自动完成
- 用户无感知，无需等待

## ✅ 验证同步

### 方法 1: 在应用中验证
1. 添加新数据（单词、银行记录等）
2. 刷新页面
3. 数据仍然存在 → 同步成功

### 方法 2: 在 Supabase Dashboard 验证
1. 登录 Supabase Dashboard
2. 进入 **Table Editor**
3. 查看各个表的数据
4. 确认数据已同步

### 方法 3: 检查浏览器控制台
1. 打开开发者工具（F12）
2. 查看 Console 标签
3. 确认没有错误信息
4. 可以看到同步日志（如果有）

## 🔍 同步状态

### 正常状态
- 数据在 Supabase 和 localStorage 中保持一致
- 新数据自动保存到两个位置
- 没有错误信息

### 离线状态
- 数据保存在 localStorage
- 网络恢复后自动同步到 Supabase
- 不会丢失数据

## 💡 重要提示

1. **无需手动操作**：所有同步都是自动的
2. **数据安全**：localStorage 作为备份，数据不会丢失
3. **实时同步**：数据更改立即同步到 Supabase
4. **错误恢复**：网络问题不会导致数据丢失

## 🆘 故障排除

### 数据没有同步
1. 检查网络连接
2. 检查浏览器控制台的错误信息
3. 确认 Supabase 表已创建
4. 确认 Supabase API Key 正确

### 数据重复
- 不用担心，使用 `upsert` 机制，不会产生重复数据
- 可以多次同步，不会产生问题

### 同步失败
- 检查 Supabase Dashboard 是否可访问
- 检查浏览器控制台的错误信息
- 数据会保存在 localStorage，不会丢失

## 📝 技术细节

### 同步策略
- **读取**：Supabase 优先，localStorage 作为后备
- **写入**：同时写入 Supabase 和 localStorage
- **更新**：使用 `upsert` 机制，避免重复

### 性能优化
- 使用 debounce（500ms）批量同步
- 避免频繁的数据库写入
- 优化网络请求

### 数据格式
- 自动转换数据格式（组件格式 ↔ 数据库格式）
- 无需手动转换
- 兼容旧数据格式

