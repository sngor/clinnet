import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: {},
    process: { env: {} },
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
});