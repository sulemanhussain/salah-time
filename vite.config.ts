import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
    mkcert(),
    VitePWA({
      registerType: 'autoUpdate',
      // strategies: 'injectManifest',
      // srcDir: 'src',
      // filename: 'serviceWorker.ts',
      manifest: {
        name: 'Salah Time - Prayer Times Finder',
        short_name: 'SalahTime',
        description: 'A prayer time app with Google Maps integration',
        theme_color: '#20afe3',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect fill='%232563eb' width='192' height='192'/><text x='96' y='130' font-size='80' font-weight='bold' fill='white' text-anchor='middle' font-family='system-ui'>S</text></svg>",
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><rect fill='%232563eb' width='512' height='512'/><text x='256' y='352' font-size='200' font-weight='bold' fill='white' text-anchor='middle' font-family='system-ui'>S</text></svg>",
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2,ttf,eot}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/maps\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-maps-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 24 * 60 * 60 // 24 hours
              }
            }
          },
          {
            urlPattern: /^https:\/\/api\.aladhan\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'aladhan-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 // 1 hour
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/maps/api': {
        target: "https://maps.googleapis.com",
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:5192',
        changeOrigin: true,
      }
    },
    host: true
  }
})
