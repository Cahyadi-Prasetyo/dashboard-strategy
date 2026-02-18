<template>
  <div class="relative w-full h-full">
    <!-- Indicator Selection Panel -->
    <DashboardIndicatorSelector />
    
    <!-- Legend (Placeholder) -->
    <div class="absolute bottom-8 right-4 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg pointer-events-auto border border-gray-200">
      <div class="text-xs font-semibold text-gray-500 mb-2">Legenda</div>
      <div class="flex flex-col gap-1 text-xs">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-sm bg-blue-600"></div>
          <span>Tinggi</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-sm bg-blue-400"></div>
          <span>Sedang</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-sm bg-blue-200"></div>
          <span>Rendah</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Page meta for custom layout
definePageMeta({
  layout: 'default'
});
</script>
