# 安装依赖 - 解决 PowerShell 执行策略问题

## 问题
PowerShell 显示错误：`无法加载文件 npm.ps1，因为在此系统上禁止运行脚本`

## 解决方案（选择其一）

### 方案 1: 使用 CMD（最简单，推荐）✅

1. 按 `Win + R`
2. 输入 `cmd`，按回车
3. 在命令提示符中运行：
   ```cmd
   cd "D:\Cursor Project\Primary School Aiden"
   npm install
   ```

### 方案 2: 修改 PowerShell 执行策略（需要管理员权限）

1. 按 `Win + X`，选择 **"Windows PowerShell (管理员)"** 或 **"终端 (管理员)"**
2. 运行以下命令（临时修改，仅当前会话有效）：
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
   ```
3. 然后切换到项目目录并安装：
   ```powershell
   cd "D:\Cursor Project\Primary School Aiden"
   npm install
   ```

### 方案 3: 在 VS Code 中使用 CMD 终端

1. 在 VS Code 中打开项目文件夹
2. 按 `Ctrl + `` (反引号) 打开终端
3. 点击终端右上角的 **"+"** 旁边的下拉箭头
4. 选择 **"Command Prompt"** 或 **"cmd"**
5. 运行：
   ```cmd
   npm install
   ```

### 方案 4: 使用 Git Bash

如果你安装了 Git，可以使用 Git Bash：

1. 右键点击项目文件夹
2. 选择 **"Git Bash Here"**
3. 运行：
   ```bash
   npm install
   ```

### 方案 5: 绕过执行策略（临时）

在 PowerShell 中运行：
```powershell
powershell -ExecutionPolicy Bypass -Command "cd 'D:\Cursor Project\Primary School Aiden'; npm install"
```

## 推荐方案

**最简单的方法：使用 CMD（方案 1）**

1. 按 `Win + R`
2. 输入 `cmd`，按回车
3. 复制粘贴以下命令：
   ```cmd
   cd /d "D:\Cursor Project\Primary School Aiden" && npm install
   ```

## 验证安装

安装完成后，检查 `node_modules` 文件夹是否存在：
```cmd
dir node_modules
```

如果看到 `node_modules` 文件夹，说明安装成功！

## 下一步

安装完成后，启动应用：
```cmd
npm run dev
```

## 常见问题

### Q: 为什么会出现这个错误？
A: Windows PowerShell 默认的执行策略限制了脚本运行，这是安全措施。

### Q: 修改执行策略安全吗？
A: 方案 2 中的 `RemoteSigned` 是相对安全的，只对当前 PowerShell 会话有效。如果不想修改，使用 CMD 更简单。

### Q: 安装需要多长时间？
A: 通常需要 1-3 分钟，取决于网络速度。

