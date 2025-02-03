import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // 외부에서 접근 가능하게 설정
    port: 3000,
    strictPort: true,
    hmr: {
      protocol: 'wss',         // WebSocket 프로토콜을 wss로 설정
      host: 'jooyoung.click',   // 실제 도메인 사용
      port: 443,
      path: '/vite/'            // 경로를 추가해서 Nginx 설정과 일치시킴
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
