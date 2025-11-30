# Storage 上传问题诊断指南

## 问题：上传的图片没有出现在 Storage 中

### 步骤 1: 检查浏览器控制台

1. 打开网站
2. 按 **F12** 打开开发者工具
3. 切换到 **Console** 标签
4. 尝试上传一张图片
5. 查看控制台输出，应该看到类似以下信息：

```
[Storage Upload] 开始上传文件到 bucket "pictures"
[Storage Upload] 文件名: uploaded-1234567890-0.jpg
[Storage Upload] 文件大小: 2.34 MB
[Storage Upload] 文件类型: image/jpeg
```

### 步骤 2: 检查错误信息

如果上传失败，控制台会显示错误。常见错误：

#### 错误 1: "Bucket not found" 或 "not found"
**原因**: Storage bucket 不存在或名称不匹配

**解决方案**:
1. 登录 Supabase Dashboard
2. 进入 **Storage** 菜单
3. 检查是否有名为 `pictures` 的 bucket
4. 如果没有，点击 **New bucket** 创建：
   - Name: `pictures` (必须完全一致，区分大小写)
   - Public bucket: ✅ 勾选
   - File size limit: 10MB 或更大

#### 错误 2: "new row violates row-level security"
**原因**: 权限策略未正确设置

**解决方案**:
1. 在 Supabase Dashboard 中，进入 **Storage** → `pictures` bucket
2. 点击 **Policies** 标签
3. 确认有以下 4 个策略：
   - Public Access - Read
   - Public Access - Upload
   - Public Access - Delete
   - Public Access - Update
4. 如果没有，执行 `supabase-storage-policies.sql` 文件

#### 错误 3: "File size exceeds"
**原因**: 文件大小超过限制

**解决方案**:
1. 在 Supabase Dashboard 中，进入 **Storage** → `pictures` bucket
2. 点击 **Settings**
3. 增加 **File size limit**（建议 10MB 或更大）

### 步骤 3: 验证 Storage 设置

在 Supabase Dashboard 中检查：

#### 3.1 检查 Bucket 是否存在
1. **Storage** → 查看 bucket 列表
2. 确认有 `pictures` bucket
3. 确认 bucket 是 **Public**（公开的）

#### 3.2 检查权限策略
1. **Storage** → `pictures` → **Policies**
2. 应该看到 4 个策略：
   ```
   Public Access - Read
   Public Access - Upload
   Public Access - Delete
   Public Access - Update
   ```

#### 3.3 检查文件列表
1. **Storage** → `pictures` → **Files**
2. 上传后应该能看到文件
3. 如果看不到，说明上传确实失败了

### 步骤 4: 手动测试上传

在浏览器控制台中运行以下代码测试：

```javascript
// 测试 Storage 连接
const testUpload = async () => {
  const testFile = new File(['test'], 'test.txt', { type: 'text/plain' })
  
  const { data, error } = await supabase.storage
    .from('pictures')
    .upload('test-file.txt', testFile)
  
  if (error) {
    console.error('上传测试失败:', error)
  } else {
    console.log('上传测试成功:', data)
    // 删除测试文件
    await supabase.storage.from('pictures').remove(['test-file.txt'])
  }
}

testUpload()
```

### 步骤 5: 检查代码中的 Bucket 名称

确认代码中的 bucket 名称与 Supabase 中的一致：

1. 打开 `src/lib/supabaseService.ts`
2. 找到第 299 行：`const PICTURES_BUCKET = 'pictures'`
3. 确认这个名称与 Supabase Dashboard 中的 bucket 名称完全一致（区分大小写）

### 步骤 6: 检查网络请求

1. 打开开发者工具 → **Network** 标签
2. 尝试上传图片
3. 查找对 `storage/v1/object/pictures` 的请求
4. 检查请求状态：
   - **200**: 成功
   - **400/401/403**: 权限问题
   - **404**: Bucket 不存在
   - **413**: 文件太大

## 常见问题解答

### Q: 上传显示成功，但 Storage 中没有文件？
A: 可能是：
1. 查看错误的 bucket（确认名称是 `pictures`）
2. 文件上传到其他位置
3. 检查控制台是否有错误信息

### Q: 控制台显示上传成功，但图片不显示？
A: 可能是：
1. URL 获取失败
2. 图片 URL 格式不正确
3. 检查控制台中的 URL 是否正确

### Q: 如何确认上传真的成功了？
A: 检查：
1. 控制台日志显示 `✅ 文件上传成功`
2. Supabase Dashboard → Storage → pictures → Files 中有文件
3. 数据库 `pictures` 表中有新记录
4. 图片 URL 可以正常访问

## 快速检查清单

- [ ] Bucket `pictures` 已创建
- [ ] Bucket 设置为 Public
- [ ] 权限策略已正确设置（4 个策略）
- [ ] 文件大小在限制范围内
- [ ] 代码中的 bucket 名称是 `pictures`
- [ ] 浏览器控制台没有错误
- [ ] Network 请求返回 200 状态码

## 需要帮助？

如果以上步骤都无法解决问题，请提供：
1. 浏览器控制台的完整错误信息
2. Network 标签中的请求详情
3. Supabase Dashboard 中 Storage 的截图

