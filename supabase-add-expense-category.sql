-- 添加 expense 类型到 bank_entries 表的 category 字段
-- 执行此 SQL 脚本以支持消费功能

-- 首先删除旧的 CHECK 约束
ALTER TABLE bank_entries 
DROP CONSTRAINT IF EXISTS bank_entries_category_check;

-- 添加新的 CHECK 约束，包含 expense 类型
ALTER TABLE bank_entries 
ADD CONSTRAINT bank_entries_category_check 
CHECK (category IN ('reward', 'red-packet', 'gift', 'other', 'expense'));

