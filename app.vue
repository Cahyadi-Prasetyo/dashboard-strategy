
<template>
  <div class="antialiased text-slate-900 dark:text-slate-50 bg-white dark:bg-slate-950 min-h-screen font-sans selection:bg-primary-500 selection:text-white">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UNotifications />
  </div>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Dashboard Strategis` : 'Dashboard Strategis Provinsi Kepulauan Riau';
  },
  bodyAttrs: {
    class: 'overflow-hidden' 
  }
})
</script>

<style>
/* Global Transition */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(10px);
  filter: blur(4px);
}
</style>
