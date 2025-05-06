import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    build: {
      outDir: 'build', // Changed from 'dist' to 'build' to match Amplify config
      sourcemap: false,
      minify: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            mui: ['@mui/material', '@mui/icons-material'],
            amplify: ['aws-amplify']
          }
        }
      }
    },
    server: {
      port: 3000,
      strictPort: true,
      host: true
    },
    preview: {
      port: 5000,
      strictPort: true,
      host: true
    },
    // Add support for process.env in Vite
    define: {
      'process.env': env
    },
    resolve: {
      alias: {
        '@': '/src',
        '@core': '/src/core',
        '@components': '/src/components',
        '@services': '/src/services',
        '@utils': '/src/utils',
        '@hooks': '/src/hooks',
        '@features': '/src/features',
        '@pages': '/src/pages',
        '@assets': '/src/assets',
        '@config': '/src/config'
      }
    }
  }
})