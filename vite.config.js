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
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core — wajib di semua route, separate dari vendor lain biar cache stabil
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')) {
            return 'react-core';
          }
          if (id.includes('node_modules/react-router')) {
            return 'router';
          }
          // Charts — hanya di admin dashboard
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
            return 'charts';
          }
          // PDF viewer — hanya di product detail bila ada PDF
          if (id.includes('node_modules/react-pdf') || id.includes('node_modules/pdfjs-dist')) {
            return 'pdf';
          }
          // OCR — hanya di DaftarCenter (sudah dynamic import)
          if (id.includes('node_modules/tesseract')) {
            return 'ocr';
          }
          // UI utilities
          if (id.includes('node_modules/sweetalert2')) {
            return 'ui';
          }
          // Icons — di-share lintas route
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          // Axios + utility kecil — bundle ke vendor umum
          if (id.includes('node_modules/axios') ||
              id.includes('node_modules/clsx') ||
              id.includes('node_modules/tailwind-merge')) {
            return 'vendor';
          }
        },
      },
    },
  }
})
