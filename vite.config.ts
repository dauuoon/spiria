import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Set base path for GitHub Pages (repo: spiria)
  base: '/spiria/',
  plugins: [react()],
  server: {
    open: true
  }
})
