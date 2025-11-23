import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 仓库名（根据实际仓库名修改）
const repoName = process.env.VITE_REPO_NAME || 'Primary-School-Notebook'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? `/${repoName}/` : '/',
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    open: true
  }
})

