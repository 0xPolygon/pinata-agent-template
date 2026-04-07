import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/app',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['__AGENT_HOST__'],
    hmr: {
      host: '__AGENT_HOST__',
      protocol: 'wss',
      clientPort: 443,
    },
  },
})
