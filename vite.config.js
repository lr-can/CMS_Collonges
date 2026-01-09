import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      
      manifest: {
        name: 'CMS Collonges - Manœuvre',
        short_name: 'CMS Collonges',
        description: 'Application de gestion des manœuvres CMS Collonges',
        theme_color: '#0078f3',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'https://github.com/lr-can/CMS_Collonges/blob/main/public/img/icons/android-chrome-512x512.png?raw=true',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'https://github.com/lr-can/CMS_Collonges/blob/main/public/img/icons/android-chrome-512x512.png?raw=true',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,wav}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      },
      
      workbox: {
        sourcemap: true,
      },
      
      // ⭐ DÉSACTIVER EN DEV
      devOptions: {
        enabled: false, // Changé de true à false
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  
  server: {
    proxy: {
      '/api': {
        target: 'https://api.cms-collonges.fr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})