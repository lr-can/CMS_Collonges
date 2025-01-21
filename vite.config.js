import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      injectRegister: 'auto',
      manifest: {
        name: 'CMS Collonges',
        short_name: 'CMS Collonges',
        theme_color: '#ffffff',
        background_color: '#ffffff',
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
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  
})
