import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
        }
      }
    }
  },
  base: './',
  server: {
    host: true,
    port: 3000,
    // Настройка прокси для GigaChat API (обход CORS)
    proxy: {
      '/api/giga/auth': {
        target: 'https://ngw.devices.sberbank.ru:9443',
        changeOrigin: true,
        secure: false, // Игнорируем ошибки SSL (у Сбера свои сертификаты)
        rewrite: (path) => path.replace(/^\/api\/giga\/auth/, '/api/v2/oauth')
      },
      '/api/giga/chat': {
        target: 'https://gigachat.devices.sberbank.ru',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/giga\/chat/, '/api/v1/chat/completions')
      }
    }
  }
});