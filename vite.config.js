import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true
      },
      includeAssets: ["favicon.svg", "icon-192x192.png", "icon-512x512.png", "apple-touch-icon.png", "splash-640x1136.png", "splash-750x1334.png", "splash-1242x2208.png", "splash-1125x2436.png", "assets/noImage.jpeg"],
      manifest: {
        name: "Po'o Inventory",
        short_name: "Po'o Inventory",
        description: "Multi-Inventory Management System",
        theme_color: "#059669",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ],
        splashscreens: [
          {
            src: "splash-640x1136.png",
            sizes: "640x1136",
            type: "image/png"
          },
          {
            src: "splash-750x1334.png",
            sizes: "750x1334",
            type: "image/png"
          },
          {
            src: "splash-1242x2208.png",
            sizes: "1242x2208",
            type: "image/png"
          },
          {
            src: "splash-1125x2436.png",
            sizes: "1125x2436",
            type: "image/png"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpeg,jpg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: "globalThis",
  },
  build: {
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@react-pdf") || id.includes("pdfkit") || id.includes("fontkit")) {
              return "vendor-pdf";
            }
            if (id.includes("exceljs") || id.includes("file-saver")) {
              return "vendor-excel";
            }
            if (id.includes("@mui") || id.includes("@emotion")) {
              return "vendor-mui";
            }
            if (id.includes("chart.js") || id.includes("react-chartjs-2")) {
              return "vendor-charts";
            }
            if (id.includes("html2pdf.js") || id.includes("jspdf") || id.includes("html2canvas")) {
              return "vendor-html-pdf";
            }
            // Core react, router, and other small utilities will be handled automatically by Rollup.
          }
        },
      },
    },
  },
});
