import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // Add Buffer polyfill for Cognito
      buffer: 'buffer/',
      process: 'process/browser',
    },
  },
  define: {
    'global': 'window',
    // Don't override process.env as it interferes with Vite's env loading
    // 'process.env': {},
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'build', // Changed from 'dist' to 'build' for consistency with deployment scripts
    sourcemap: process.env.NODE_ENV !== 'production', // Only generate sourcemaps in development
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          cognito: ['amazon-cognito-identity-js'],
        },
      },
    },
  },
  // Add vitest configuration
  test: {
    globals: true,
    environment: 'jsdom',
    // setupFiles: './src/tests/setup.js', // if you have a setup file
  },
});