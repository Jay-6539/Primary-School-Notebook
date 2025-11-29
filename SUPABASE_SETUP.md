# Supabase 数据库设置指南

## 步骤 1: 创建数据库表

1. 登录到你的 Supabase 项目：https://sugwnzvsntqcpbegieeu.supabase.co
2. 进入 **SQL Editor**
3. 复制 `supabase-schema.sql` 文件中的所有 SQL 代码
4. 粘贴到 SQL Editor 中并执行

这将创建以下表：
- `words` - 英语单词（识别和拼写）
- `spelling_history` - 拼写历史记录
- `recognition_history` - 识别历史记录
- `bank_entries` - 银行记录
- `parent_feedback` - 家长反馈
- `pictures` - 图片

## 步骤 2: 安装依赖

运行以下命令安装 Supabase 客户端库：

```bash
npm install
```

## 步骤 3: 数据迁移

应用会自动检测并迁移数据：

1. **自动迁移**：当组件首次加载时，如果 Supabase 中没有数据，会自动从 localStorage 迁移数据到 Supabase
2. **手动迁移**：你也可以在浏览器控制台运行以下代码来手动触发迁移：

```javascript
import { migrateAllData } from './lib/migrateToSupabase'
migrateAllData()
```

## 步骤 4: 验证数据

1. 在 Supabase Dashboard 中，进入 **Table Editor**
2. 检查各个表是否有数据
3. 在应用中操作（添加单词、记录反馈等），确认数据同步正常

## 数据同步机制

- **读取**：应用启动时从 Supabase 加载数据
- **写入**：所有数据更改都会同步到 Supabase 和 localStorage（作为备份）
- **错误处理**：如果 Supabase 连接失败，会自动回退到 localStorage

## 注意事项

1. 所有表都启用了 Row Level Security (RLS)，当前设置为允许所有操作（公开访问）
2. 在生产环境中，建议配置更严格的 RLS 策略
3. localStorage 仍然保留作为备份，但主要数据源是 Supabase

## 故障排除

如果遇到问题：

1. 检查 Supabase 项目 URL 和 API Key 是否正确
2. 确认所有表都已创建
3. 检查浏览器控制台的错误信息
4. 确认网络连接正常

