import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Better Node.js polyfills
    global: 'globalThis',
    process: { 
      env: {}, 
      browser: true 
    },
    Buffer: ['buffer', 'Buffer'],
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_ENDPOINT || 'https://ilw09lpwga.execute-api.us-east-2.amazonaws.com/dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      // Add Node.js module aliases for browser compatibility
      'buffer': 'buffer/',
      'process': 'process/browser',
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      }
    }
  }
});