import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",  // 모든 네트워크 인터페이스에서 접근 가능
    port: 3000,  // 프론트엔드 포트
    strictPort: true,  // 포트가 사용 중일 경우 다른 포트로 변경되지 않도록 설정
    https: false,  // Nginx에서 SSL을 처리하므로 Vite에서는 HTTP 사용
    hmr: {
      protocol: "wss",  // WebSocket Secure 사용
      host: "jooyoung.click",
      port: 443,  // HTTPS 포트
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
