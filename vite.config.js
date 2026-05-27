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
      // Proxy /api/transport/* → the same Express server (Amadeus transport)
      '/api/transport': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // Proxy /api/db/* → PostgREST for direct database access
      '/api/db': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/db/, ''),
      },
    },
  },
})
