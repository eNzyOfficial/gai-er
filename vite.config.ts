import path from "node:path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE || "/",
  plugins: [
      vue(),
      tailwindcss(),
      vueDevTools(),
      VitePWA({
          devOptions: {
              enabled: true,
          },
          registerType: "autoUpdate",
          includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
          manifest: {
              display: "standalone",
              name: "ไก่เอ๋อ",
              short_name: "ไก่เอ๋อ",
              description: "An app to learn Thai vocabulary.",
              theme_color: "#ffffff",
              icons: [
                  {
                      src: "pwa-192x192.png",
                      sizes: "192x192",
                      type: "image/png",
                  },
                  {
                      src: "pwa-512x512.png",
                      sizes: "512x512",
                      type: "image/png",
                  },
              ],
          },
      }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
