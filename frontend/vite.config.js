import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/', // 🚀 Vite가 index.html을 올바르게 해석하도록 설정
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.svg'], // ❌ .html 파일 제거
  server: {
    host: true, // 0.0.0.0으로 바인딩
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
