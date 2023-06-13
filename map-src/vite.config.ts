import { resolve } from 'path'
import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/catskills/map',
  build: {
    outDir: '../map',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        planner: resolve(__dirname, 'planner/index.html'),
      },
    },
  },
  server: {
    // See https://vitejs.dev/config/server-options.html#server-proxy
    proxy: {
      '/catskills/assets': 'http://127.0.0.1:4000'
    }
  }
})
