export default defineNuxtPlugin((nuxtApp) => {
    return {
        provide: {
            maplibre: {
                accessToken: '' // MapLibre doesn't need a token by default if using open tiles
            }
        }
    };
});
