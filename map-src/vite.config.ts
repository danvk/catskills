import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/catskills/map',
  build: {
    outDir: '../map',
  },
  server: {
    // See https://vitejs.dev/config/server-options.html#server-proxy
    proxy: {
      '/catskills/assets': 'http://127.0.0.1:4000'
    }
  }
})
