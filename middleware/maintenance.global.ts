export default defineNuxtRouteMiddleware((to) => {
  const config = useRuntimeConfig();

  const isMaintenance =
    String(config.public.maintenanceMode).toLowerCase() === "true";

  if (to.path === "/maintenance") return;

  if (isMaintenance) {
    return navigateTo("/maintenance", { replace: true });
  }
});
