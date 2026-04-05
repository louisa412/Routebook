import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Routebook',
        short_name: 'Routebook',
        description: '旅行行程規劃工具',
        theme_color: '#6D5FB1',
        background_color: '#EFEEF7',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      },
      workbox: {
        // 快取所有靜態資源
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Firebase API 走 network-first（優先讀網路，離線時用快取）
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com/,
            handler: 'NetworkFirst',
            options: { cacheName: 'firebase-cache' }
          }
        ]
      }
    })
  ]
})
