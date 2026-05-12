import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'logo.png'],
      manifest: {
        name: 'STARINC Platform',
        short_name: 'STARINC',
        description: 'Platform e-commerce dan MLM STARINC',
        theme_color: '#047857',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/favicon.png', sizes: '192x192', type: 'image/png' },
          { src: '/logo.png',    sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3 MB
        globIgnores: ['**/partnership/**', '**/about/**'],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/appearance/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'api-appearance', expiration: { maxAgeSeconds: 3600 } },
          },
          {
            urlPattern: /^https?:\/\/.*\/api\/products/,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-products', expiration: { maxEntries: 100, maxAgeSeconds: 300 } },
          },
        ],
      },
    }),
  ],
  server: {
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          ui: ['sweetalert2'],
        }
      }
    }
  }
})
