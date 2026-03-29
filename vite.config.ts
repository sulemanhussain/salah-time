import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    mkcert()
  ],
  server: {
    proxy: {
      '/maps/api': {
        target: "https://maps.googleapis.com",
        changeOrigin: true,
      }
    },
    host: true
  }
})
