import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.svg",
        "apple-touch-icon.png",
      ],

      manifest: {
        name: "Po'o Inventory",
        short_name: "Po'o Inventory",
        description: "Multi-Inventory Management System",
        theme_color: "#059669",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        orientation: "portrait",

        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },

      workbox: {
        // Remove old service-worker caches
        cleanupOutdatedCaches: true,

        // Activate the new service worker immediately
        skipWaiting: true,

        // Take control of open pages immediately
        clientsClaim: true,

        // Cache Vite-generated static assets
        globPatterns: [
          "**/*.{js,css,ico,png,svg,woff2,woff}",
        ],

        runtimeCaching: [
          {
            // Inventory API
            urlPattern:
              /^https:\/\/inventory\.pootechnologies\.tech\/api\/.*$/i,

            // Always try the server first
            handler: "NetworkFirst",

            options: {
              cacheName: "api-cache",

              // If the server takes longer than 10 seconds,
              // fall back to cached data
              networkTimeoutSeconds: 10,

              expiration: {
                maxEntries: 100,

                // Keep API cache for 24 hours
                maxAgeSeconds: 60 * 60 * 24,
              },

              cacheableResponse: {
                statuses: [0, 200],
              },
            },
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

  define: {
    global: "globalThis",
  },

  build: {
    chunkSizeWarningLimit: 2500,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("@react-pdf") ||
              id.includes("pdfkit") ||
              id.includes("fontkit")
            ) {
              return "vendor-pdf";
            }

            if (
              id.includes("exceljs") ||
              id.includes("file-saver")
            ) {
              return "vendor-excel";
            }

            if (
              id.includes("chart.js") ||
              id.includes("react-chartjs-2")
            ) {
              return "vendor-charts";
            }

            if (
              id.includes("html2pdf.js") ||
              id.includes("jspdf") ||
              id.includes("html2canvas")
            ) {
              return "vendor-html-pdf";
            }
          }
        },
      },
    },
  },
});
