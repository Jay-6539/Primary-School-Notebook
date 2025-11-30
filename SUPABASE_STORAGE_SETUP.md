# Supabase Storage 设置指南

## 步骤 1: 创建 Storage Bucket

1. 登录到你的 Supabase 项目：https://sugwnzvsntqcpbegieeu.supabase.co
2. 进入 **Storage** 菜单
3. 点击 **New bucket** 创建新存储桶
4. 设置以下信息：
   - **Name**: `pictures` (必须与代码中的 `PICTURES_BUCKET` 常量一致)
   - **Public bucket**: 勾选 ✅ (这样图片才能通过公共 URL 访问)
   - **File size limit**: 建议设置为 10MB 或更大
   - **Allowed MIME types**: 可以留空（允许所有图片类型）或设置为 `image/*`

## 步骤 2: 配置 Bucket 权限

1. 在 Storage 页面，点击 `pictures` bucket
2. 进入 **Policies** 标签
3. 创建以下策略：

### 策略 1: 允许公开读取
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'pictures');
```

### 策略 2: 允许上传
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pictures');
```

### 策略 3: 允许删除
```sql
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'pictures');
```

或者，如果你想允许所有操作（包括匿名用户），可以使用：

```sql
-- 允许所有操作（公开访问）
CREATE POLICY "Allow all operations on pictures"
ON storage.objects FOR ALL
USING (bucket_id = 'pictures')
WITH CHECK (bucket_id = 'pictures');
```

## 步骤 3: 验证设置

1. 在应用中上传一张测试图片
2. 检查 Storage 中是否出现文件
3. 检查图片是否能正常显示

## 注意事项

- **Bucket 名称**: 代码中使用的是 `pictures`，如果创建时使用了不同的名称，需要修改 `src/lib/supabaseService.ts` 中的 `PICTURES_BUCKET` 常量
- **公共访问**: 如果 bucket 不是公开的，图片将无法通过 URL 直接访问
- **文件大小**: 确保设置的文件大小限制足够大，以支持你需要的图片大小
- **安全性**: 在生产环境中，建议配置更严格的权限策略，只允许认证用户上传

## 故障排除

如果上传失败：
1. 检查 bucket 名称是否正确
2. 确认 bucket 已创建且为公开访问
3. 检查权限策略是否正确配置
4. 查看浏览器控制台的错误信息
5. 确认 Supabase 项目 URL 和 API Key 正确

