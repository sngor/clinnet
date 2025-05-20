import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // or your framework's plugin

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
    'process.env': process.env
  },
  resolve: {
    alias: {
      './runtimeConfig': './runtimeConfig.browser',
      buffer: 'buffer/'
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
});