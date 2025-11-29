# GitHub Pages 部署指南

## 快速部署步骤

### 1. 在 GitHub 上创建仓库

1. 登录 GitHub，进入 https://github.com/new
2. 仓库名建议：`Primary-School-Aiden`（或者你喜欢的名字）
3. 设置为 Public（GitHub Pages 免费版需要公开仓库）
4. 不要初始化 README、.gitignore 或 license（因为本地已经有文件了）
5. 点击 "Create repository"

### 2. 将代码推送到 GitHub

在项目目录下执行以下命令：

```bash
# 初始化 git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Aiden's website"

# 重命名分支为 main（如果使用的是 master，可以跳过）
git branch -M main

# 添加远程仓库（替换 YOUR_REPO_NAME 为你的实际仓库名）
git remote add origin https://github.com/Jay-6539/YOUR_REPO_NAME.git

# 推送到 GitHub
git push -u origin main
```

### 3. 启用 GitHub Pages

1. 在 GitHub 仓库页面，点击 **Settings**（设置）
2. 在左侧菜单找到 **Pages**（页面）
3. 在 **Source** 下拉菜单中，选择 **GitHub Actions**
4. 如果没有看到 GitHub Actions 选项，选择 **Deploy from a branch**，然后选择 **main** 分支和 **/ (root)** 文件夹
5. 保存设置

### 4. 等待自动部署

1. 点击仓库顶部的 **Actions**（操作）标签
2. 你会看到 "Deploy to GitHub Pages" 工作流正在运行
3. 等待几分钟，直到看到绿色的 ✓ 标记
4. 部署完成后，回到 **Settings → Pages**，你会看到网站地址

### 5. 访问你的网站

部署成功后，你的网站地址将是：
```
https://Jay-6539.github.io/YOUR_REPO_NAME/
```

例如，如果仓库名是 `Primary-School-Aiden`：
```
https://Jay-6539.github.io/Primary-School-Aiden/
```

## 重要提示

### 如果仓库名不是 "Primary-School-Aiden"

如果仓库名不同，你需要：

1. 修改 `vite.config.ts` 文件，找到这一行：
```typescript
const repoName = process.env.VITE_REPO_NAME || 'Primary-School-Aiden'
```

2. 将 `'Primary-School-Aiden'` 改为你的实际仓库名

或者，在 `.github/workflows/deploy.yml` 中，环境变量会自动使用仓库名，所以通常不需要修改。

### 后续更新

每次你修改代码并推送到 GitHub 时：

```bash
git add .
git commit -m "更新内容描述"
git push
```

GitHub Actions 会自动重新构建和部署网站。

## 常见问题

### 网站显示 404 错误

- 检查仓库是否是 Public（公开的）
- 确认 GitHub Pages 已启用
- 等待几分钟让 DNS 生效
- 检查 Actions 中是否有构建错误

### 网站样式或资源加载失败

- 确认 `vite.config.ts` 中的 `base` 路径正确
- 检查控制台错误信息
- 清除浏览器缓存

### 需要帮助？

如果遇到问题，可以：
1. 检查 GitHub Actions 的日志
2. 查看 GitHub Pages 的设置
3. 参考 GitHub Pages 官方文档







