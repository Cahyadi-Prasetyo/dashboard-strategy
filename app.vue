<template>
  <div class="h-screen w-screen flex flex-col relative overflow-hidden">
    <!-- Map as Background -->
    <div class="absolute inset-0 z-0">
      <ClientOnly>
        <MapBaseMap />
      </ClientOnly>
    </div>

    <!-- UI Overlay -->
    <div class="relative z-10 pointer-events-none h-full flex flex-col">
      <!-- Slot for dynamic content/overlays -->
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </div>
</template>

