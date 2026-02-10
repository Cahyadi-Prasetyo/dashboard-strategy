// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",
  devtools: { enabled: true },

  modules: [
    "@nuxt/ui",
    "nuxt-auth-utils",
  ],

  runtimeConfig: {
    public: {
      maintenanceMode: process.env.NUXT_PUBLIC_MAINTENANCE_MODE || "false",
    },
  },

  app: {
    head: {
      title: "Dashboard Monitoring Bencana",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Sistem Monitoring & Analisis Dampak Bencana",
        },
      ],
      link: [
        // Leaflet CSS (loaded via CDN)
        {
          rel: "stylesheet",
          href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
        },
      ],
      script: [
        // Leaflet JS (loaded via CDN for window.L usage)
        {
          src: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
          defer: true,
        },
      ],
    },
  },

  css: ["~/assets/css/main.css"],
});
