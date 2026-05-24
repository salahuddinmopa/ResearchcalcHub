import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          chartjs: ['chart.js'],
          react: ['react', 'react-dom', 'react-router-dom'],
          recharts: ['recharts'],
          jstat: ['jstat'],
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
});
