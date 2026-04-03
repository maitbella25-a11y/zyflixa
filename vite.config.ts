import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor':  ['react', 'react-dom'],
          'router':        ['@tanstack/react-router'],
          'query':         ['@tanstack/react-query'],
          'motion':        ['framer-motion'],
          'icons':         ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});