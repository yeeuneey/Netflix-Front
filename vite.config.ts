import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  // GitHub Pages 배포용 베이스 경로
  base: '/Netflix-Front/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
