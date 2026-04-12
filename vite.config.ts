import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
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
