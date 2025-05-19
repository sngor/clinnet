import { defineConfig } from 'vite';

export default defineConfig({
  // ...existing code...
  define: {
    'process.env.REACT_APP_USER_POOL_ID': JSON.stringify(process.env.REACT_APP_USER_POOL_ID),
    'process.env.REACT_APP_CLIENT_ID': JSON.stringify(process.env.REACT_APP_CLIENT_ID),
  },
  // ...existing code...
});