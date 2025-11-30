# 图片同步测试指南

## 测试步骤

### 1. 上传图片测试

1. 打开网站：https://jay-6539.github.io/Primary-School-Notebook/
2. 进入 **Picture Wall** 页面
3. 点击 **+ Upload Pictures** 按钮
4. 选择一张或多张图片
5. 可选：输入图片标题
6. 点击 **上传图片**
7. 等待上传完成（会显示"成功上传 X 张图片！"）

### 2. 验证图片显示

上传成功后，应该能看到：
- 图片在网格中正常显示
- 图片可以点击放大查看
- 图片标题（如果有）显示在图片下方

### 3. 跨设备测试

在不同设备上测试：

**设备 A（上传设备）**
1. 上传图片
2. 确认图片显示正常

**设备 B（其他设备）**
1. 打开网站
2. 进入 **Picture Wall** 页面
3. 应该能看到设备 A 上传的所有图片
4. 图片应该能正常加载和显示

### 4. 删除测试

1. 点击图片右上角的 **×** 按钮
2. 确认删除对话框
3. 图片应该从列表中消失
4. 在其他设备上刷新，图片也应该消失

## 检查清单

- [ ] 图片能成功上传到 Supabase Storage
- [ ] 图片在数据库中正确保存（URL 和元数据）
- [ ] 图片能在上传设备上正常显示
- [ ] 图片能在其他设备上正常显示
- [ ] 图片 URL 是 Supabase Storage 的公共 URL
- [ ] 删除功能正常工作
- [ ] 图片加载速度正常

## 故障排除

### 问题 1: 上传失败

**检查：**
1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签的错误信息
3. 检查 Network 标签，查看上传请求是否成功

**可能原因：**
- Storage bucket 未创建或名称不正确
- Storage 权限策略未正确配置
- 文件大小超过限制
- 网络连接问题

**解决方案：**
- 确认 bucket 名称为 `pictures`
- 确认 bucket 设置为公开访问
- 执行 `supabase-storage-policies.sql` 设置权限
- 检查文件大小（建议小于 10MB）

### 问题 2: 图片无法显示

**检查：**
1. 查看图片 URL 是否正确
2. 在浏览器中直接访问图片 URL
3. 检查 Console 是否有图片加载错误

**可能原因：**
- 图片 URL 不正确
- Storage bucket 不是公开的
- 图片文件未正确上传

**解决方案：**
- 确认 bucket 设置为公开访问
- 检查图片 URL 格式：`https://[project].supabase.co/storage/v1/object/public/pictures/[filename]`
- 在 Supabase Dashboard 中检查 Storage 是否有文件

### 问题 3: 其他设备看不到图片

**检查：**
1. 确认图片已保存到 Supabase 数据库
2. 在其他设备上检查 Console 日志
3. 确认网络连接正常

**可能原因：**
- 图片只保存在 localStorage，未同步到 Supabase
- 数据库查询失败
- 缓存问题

**解决方案：**
- 清除浏览器缓存
- 检查 Supabase Dashboard 中的 `pictures` 表是否有数据
- 确认图片 URL 是 Storage URL，不是 base64

## 验证 Storage 设置

在 Supabase Dashboard 中验证：

1. **Storage → pictures bucket**
   - 确认 bucket 存在
   - 确认设置为 Public
   - 查看文件列表

2. **Storage → pictures → Policies**
   - 确认有 4 个策略：
     - Public Access - Read
     - Public Access - Upload
     - Public Access - Delete
     - Public Access - Update

3. **Table Editor → pictures**
   - 查看数据库记录
   - 确认 `url` 字段是 Storage URL
   - 确认 `is_uploaded` 为 `true`

## 成功标志

✅ 图片上传后立即显示
✅ 图片 URL 是 Supabase Storage URL
✅ 在不同设备上都能看到相同的图片
✅ 删除操作在所有设备上同步
✅ 图片加载速度快
✅ 没有控制台错误


