import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 从环境变量读取后端地址，默认使用 localhost
const apiUrl = process.env.VITE_API_URL || 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: apiUrl,
        changeOrigin: true,
      }
    }
  }
})
