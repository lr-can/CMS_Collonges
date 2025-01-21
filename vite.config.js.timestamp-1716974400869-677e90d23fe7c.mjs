// vite.config.js
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///C:/Users/lorca/OneDrive/Pompiers/CMS_Collonges/cms_collonges/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/lorca/OneDrive/Pompiers/CMS_Collonges/cms_collonges/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { VitePWA } from "file:///C:/Users/lorca/OneDrive/Pompiers/CMS_Collonges/cms_collonges/node_modules/vite-plugin-pwa/dist/index.js";
var __vite_injected_original_import_meta_url = "file:///C:/Users/lorca/OneDrive/Pompiers/CMS_Collonges/cms_collonges/vite.config.js";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true
      },
      injectRegister: "auto",
      manifest: {
        name: "CMS Collonges",
        short_name: "CMS Collonges",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        icons: [
          {
            src: "https://github.com/lr-can/CMS_Collonges/blob/main/public/img/icons/android-chrome-512x512.png?raw=true",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "https://github.com/lr-can/CMS_Collonges/blob/main/public/img/icons/android-chrome-512x512.png?raw=true",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxsb3JjYVxcXFxPbmVEcml2ZVxcXFxQb21waWVyc1xcXFxDTVNfQ29sbG9uZ2VzXFxcXGNtc19jb2xsb25nZXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGxvcmNhXFxcXE9uZURyaXZlXFxcXFBvbXBpZXJzXFxcXENNU19Db2xsb25nZXNcXFxcY21zX2NvbGxvbmdlc1xcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbG9yY2EvT25lRHJpdmUvUG9tcGllcnMvQ01TX0NvbGxvbmdlcy9jbXNfY29sbG9uZ2VzL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnXG5cbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgdnVlKCksXG4gICAgVml0ZVBXQSh7XG4gICAgICByZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJyxcbiAgICAgIGRldk9wdGlvbnM6IHtcbiAgICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICBpbmplY3RSZWdpc3RlcjogJ2F1dG8nLFxuICAgICAgbWFuaWZlc3Q6IHtcbiAgICAgICAgbmFtZTogJ0NNUyBDb2xsb25nZXMnLFxuICAgICAgICBzaG9ydF9uYW1lOiAnQ01TIENvbGxvbmdlcycsXG4gICAgICAgIHRoZW1lX2NvbG9yOiAnI2ZmZmZmZicsXG4gICAgICAgIGJhY2tncm91bmRfY29sb3I6ICcjZmZmZmZmJyxcbiAgICAgICAgaWNvbnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICdodHRwczovL2dpdGh1Yi5jb20vbHItY2FuL0NNU19Db2xsb25nZXMvYmxvYi9tYWluL3B1YmxpYy9pbWcvaWNvbnMvYW5kcm9pZC1jaHJvbWUtNTEyeDUxMi5wbmc/cmF3PXRydWUnLFxuICAgICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnaHR0cHM6Ly9naXRodWIuY29tL2xyLWNhbi9DTVNfQ29sbG9uZ2VzL2Jsb2IvbWFpbi9wdWJsaWMvaW1nL2ljb25zL2FuZHJvaWQtY2hyb21lLTUxMng1MTIucG5nP3Jhdz10cnVlJyxcbiAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICB9KSxcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMnLCBpbXBvcnQubWV0YS51cmwpKVxuICAgIH1cbiAgfSxcbiAgXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvWCxTQUFTLGVBQWUsV0FBVztBQUV2WixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFNBQVM7QUFDaEIsU0FBUyxlQUFlO0FBSnFOLElBQU0sMkNBQTJDO0FBTzlSLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxJQUNKLFFBQVE7QUFBQSxNQUNOLGNBQWM7QUFBQSxNQUNkLFlBQVk7QUFBQSxRQUNWLFNBQVM7QUFBQSxNQUNYO0FBQUEsTUFDQSxnQkFBZ0I7QUFBQSxNQUNoQixVQUFVO0FBQUEsUUFDUixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEsUUFDWixhQUFhO0FBQUEsUUFDYixrQkFBa0I7QUFBQSxRQUNsQixPQUFPO0FBQUEsVUFDTDtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1I7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxjQUFjLElBQUksSUFBSSxTQUFTLHdDQUFlLENBQUM7QUFBQSxJQUN0RDtBQUFBLEVBQ0Y7QUFFRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
