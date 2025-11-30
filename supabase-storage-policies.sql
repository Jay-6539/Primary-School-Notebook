-- Supabase Storage 设置 SQL
-- 用于创建 pictures bucket 和配置权限策略
-- 在 Supabase SQL Editor 中执行此文件

-- ============================================
-- 步骤 1: 创建 Storage Bucket (如果不存在)
-- ============================================
-- 注意：如果 bucket 已经存在，此操作会被忽略

-- 由于 Supabase 的 bucket 创建需要通过 Dashboard 或 API，
-- 这里只提供策略设置。请先在 Dashboard 中创建 bucket：
-- 1. 进入 Storage 菜单
-- 2. 点击 "New bucket"
-- 3. Name: pictures
-- 4. Public bucket: 勾选
-- 5. File size limit: 10MB (或更大)

-- ============================================
-- 步骤 2: 删除现有策略（如果存在）
-- ============================================
-- 先删除可能存在的旧策略，避免冲突

DROP POLICY IF EXISTS "Allow all operations on pictures" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;
DROP POLICY IF EXISTS "Public Access - Read" ON storage.objects;
DROP POLICY IF EXISTS "Public Access - Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Access - Delete" ON storage.objects;
DROP POLICY IF EXISTS "Public Access - Update" ON storage.objects;

-- ============================================
-- 步骤 3: 创建权限策略
-- ============================================

-- 策略 1: 允许公开读取（任何人都可以查看图片）
CREATE POLICY "Public Access - Read"
ON storage.objects FOR SELECT
USING (bucket_id = 'pictures');

-- 策略 2: 允许公开上传（任何人都可以上传图片）
CREATE POLICY "Public Access - Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pictures');

-- 策略 3: 允许公开删除（任何人都可以删除图片）
CREATE POLICY "Public Access - Delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'pictures');

-- 策略 4: 允许公开更新（如果需要更新文件元数据）
CREATE POLICY "Public Access - Update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'pictures')
WITH CHECK (bucket_id = 'pictures');

