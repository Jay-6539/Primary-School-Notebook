# Aiden's Personal Website

A fun and interactive website built for Aiden (LIU Hei Yuen Aiden), a 6-year-old student at St. Paul College Primary School.

## Features

- **Personal Information**: Display Aiden's personal details including school, class, hobbies, etc.
- **AI Chat (Little Si)**: Interactive chatbot for Aiden to chat with
- **Video Gallery**: Watch favorite videos like Tom and Jerry
- **Weather Forecast**: View current weather and 5-day forecast
- **Picture Wall**: Browse and view pictures in a beautiful grid layout
- **English Words Learning**: Record and learn English words with translations, images, and pronunciation
- **Exam Records**: Track exam scores and upload exam papers

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deploy to GitHub Pages

### 自动部署（推荐）

项目已配置 GitHub Actions，会自动部署到 GitHub Pages：

1. 在 GitHub 上创建新仓库（仓库名建议：`Primary-School-Aiden`）
2. 将代码推送到 GitHub：
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/Jay-6539/你的仓库名.git
git push -u origin main
```

3. 在 GitHub 仓库设置中启用 GitHub Pages：
   - 进入仓库 Settings → Pages
   - Source 选择 "GitHub Actions"
   - 保存设置

4. 每次推送到 main 分支时，GitHub Actions 会自动构建并部署网站

### 访问网站

部署完成后，你的网站地址将是：
```
https://Jay-6539.github.io/你的仓库名/
```

例如，如果仓库名是 `Primary-School-Aiden`，网站地址就是：
```
https://Jay-6539.github.io/Primary-School-Aiden/
```

### 手动部署（可选）

如果需要手动部署，可以使用 gh-pages：

1. 安装 gh-pages：
```bash
npm install --save-dev gh-pages
```

2. 修改 `vite.config.ts` 中的 `repoName` 为你的实际仓库名

3. 部署：
```bash
npm run deploy
```

## Project Structure

```
Primary School Aiden/
├── src/
│   ├── components/        # React components
│   │   ├── PersonalInfo.tsx
│   │   ├── ChatBot.tsx
│   │   ├── VideoGallery.tsx
│   │   ├── WeatherForecast.tsx
│   │   └── PictureWall.tsx
│   ├── data/              # Data files
│   │   ├── videos.ts
│   │   └── mockWeather.ts
│   ├── styles/            # CSS styles
│   │   └── App.css
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── index.html
├── package.json
└── vite.config.ts
```

## Technologies Used

- React 18
- TypeScript
- Vite
- CSS3 (with animations and gradients)

## Customization

- **Videos**: Edit `src/data/videos.ts` to add or modify video entries
- **Weather Data**: Edit `src/data/mockWeather.ts` to change weather information
- **Pictures**: Modify the `pictures` array in `src/components/PictureWall.tsx` to add your own images
- **Chat Responses**: Customize AI responses in `src/components/ChatBot.tsx` in the `getAIResponse` function

## Notes

- The AI chat uses simulated responses (no API key required)
- Weather data is currently mocked (can be replaced with a real API)
- Video gallery uses YouTube iframe embedding
- The design is optimized for children with bright colors and friendly UI

## License

This is a personal project for Aiden.

