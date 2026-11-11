import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/getonbrd': {
        target: 'https://www.getonbrd.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/getonbrd/, '/api/v0'),
      },
      '/api/remotive': {
        target: 'https://remotive.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/remotive/, '/api'),
      },
      '/api/remoteok': {
        target: 'https://remoteok.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/remoteok/, '/api'),
      }
    }
  }
});

