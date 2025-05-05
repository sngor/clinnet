import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'REACT_APP_'])
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
      host: true
    },
    define: {
      // Make env variables available in your app
      'process.env.REACT_APP_API_ENDPOINT': JSON.stringify(env.REACT_APP_API_ENDPOINT || env.VITE_API_ENDPOINT),
      'process.env.REACT_APP_COGNITO_REGION': JSON.stringify(env.REACT_APP_COGNITO_REGION || env.VITE_COGNITO_REGION),
      'process.env.REACT_APP_USER_POOL_ID': JSON.stringify(env.REACT_APP_USER_POOL_ID || env.VITE_USER_POOL_ID),
      'process.env.REACT_APP_USER_POOL_CLIENT_ID': JSON.stringify(env.REACT_APP_USER_POOL_CLIENT_ID || env.VITE_USER_POOL_CLIENT_ID),
      'process.env.REACT_APP_S3_BUCKET': JSON.stringify(env.REACT_APP_S3_BUCKET || env.VITE_S3_BUCKET),
      'process.env.REACT_APP_S3_REGION': JSON.stringify(env.REACT_APP_S3_REGION || env.VITE_S3_REGION)
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      // Add this to handle dynamic imports
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom', '@mui/material', '@mui/icons-material'],
            aws: ['aws-amplify']
          }
        }
      }
    }
  }
})