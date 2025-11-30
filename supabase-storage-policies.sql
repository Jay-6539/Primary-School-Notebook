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
-- 4. Public bucket: 勾选 ✅
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

-- ============================================
-- 验证设置
-- ============================================
-- 执行以下查询来验证策略是否创建成功：

-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%pictures%';

-- ============================================
-- 注意事项
-- ============================================
-- 1. 这些策略允许所有用户（包括匿名用户）对 pictures bucket 进行所有操作
-- 2. 在生产环境中，你可能想要更严格的权限控制
-- 3. 如果需要限制为仅认证用户，可以使用以下策略：

-- 仅认证用户可以上传：
-- CREATE POLICY "Authenticated Upload"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'pictures');

-- 仅认证用户可以删除：
-- CREATE POLICY "Authenticated Delete"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (bucket_id = 'pictures');

-- ============================================
-- 完成
-- ============================================
-- 执行完此 SQL 后，pictures bucket 应该可以：
-- ✅ 公开读取图片
-- ✅ 公开上传图片
-- ✅ 公开删除图片
-- ✅ 公开更新图片元数据

