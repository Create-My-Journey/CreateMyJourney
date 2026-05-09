import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy /api/places/* → the Express server so the API key stays server-side
      '/api/places': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
