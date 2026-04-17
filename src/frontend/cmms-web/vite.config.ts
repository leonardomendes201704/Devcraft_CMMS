import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_TARGET || 'http://localhost:8117'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5487,
      proxy: {
        '/health': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
