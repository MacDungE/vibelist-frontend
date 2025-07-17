import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    // 백엔드와의 CORS 문제 해결을 위한 프록시 설정
    proxy: {
      // SSO 관련 API 프록시 (쿠키 전송을 위해 중요)
      '/v1/sso': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
        // 쿠키 전송을 위한 설정
        cookieDomainRewrite: 'localhost',
        cookiePathRewrite: '/',
      },
      // 기존 API 프록시
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
        secure: false,
      },
    },
  },
  // 환경변수 타입 지원
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
