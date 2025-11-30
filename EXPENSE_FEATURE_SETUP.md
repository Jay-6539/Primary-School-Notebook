# 消费功能设置说明

## 功能说明

Aiden Bank 现在支持记录消费功能！可以记录 Aiden 在什么时候消费了什么，并自动从余额中扣除。

## 数据库更新

在开始使用消费功能之前，需要先更新数据库表结构。

### 步骤：

1. 打开 Supabase Dashboard
2. 进入 SQL Editor
3. 复制并执行 `supabase-add-expense-category.sql` 文件中的 SQL 语句

或者直接执行以下 SQL：

```sql
-- 删除旧的 CHECK 约束
ALTER TABLE bank_entries 
DROP CONSTRAINT IF EXISTS bank_entries_category_check;

-- 添加新的 CHECK 约束，包含 expense 类型
ALTER TABLE bank_entries 
ADD CONSTRAINT bank_entries_category_check 
CHECK (category IN ('reward', 'red-packet', 'gift', 'other', 'expense'));
```

## 功能特点

1. **交易类型选择**：添加记录时可以选择"收入"或"消费"
2. **自动扣除**：消费记录会自动从余额中扣除
3. **视觉区分**：
   - 收入显示为绿色，带 "+" 号
   - 消费显示为红色，带 "-" 号
4. **历史记录**：所有收入和消费都会记录在历史列表中，显示日期和类型

## 使用方法

1. 在 Aiden Bank 页面，点击"Add New Entry"
2. 选择交易类型：
   - **Income (收入)**：奖励、红包、礼物等
   - **Expense (消费)**：购买玩具、零食等
3. 填写描述和金额
4. 如果是收入，可以选择分类（Reward、Red Packet、Gift、Other）
5. 点击"Add to Bank"或"Record Expense"保存

## 余额计算

- 收入：增加余额
- 消费：减少余额
- 余额 = 所有收入 - 所有消费

