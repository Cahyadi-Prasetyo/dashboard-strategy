// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2025-01-01",
    devtools: { enabled: true },

    modules: [
        "@nuxt/ui",
        "nuxt-auth-utils",
    ],

    runtimeConfig: {
        bpsApiKey: process.env.BPS_API_KEY,
        bpsApiBaseUrl: process.env.BPS_API_BASE_URL,
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
            script: [],
        },
    },

    css: ["~/assets/css/main.css"],

    build: {
        // Fix SSR "document is not defined" for vue-echarts
        transpile: ["vue-echarts", "echarts", "zrender"],
    },
});
