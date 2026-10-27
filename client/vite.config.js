import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        timeout: 180000,
        proxyTimeout: 180000,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:5001',
        ws: true,
        timeout: 180000,
      },
    },
  },
})
