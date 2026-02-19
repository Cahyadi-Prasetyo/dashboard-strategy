
<script setup lang="ts">
// Redirect ke dashboard
await navigateTo('/dashboard');
</script>

<template>
  <div class="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950">
    <div class="flex flex-col items-center gap-4">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-blue-500" />
        <p class="text-gray-500">Memuat Dashboard...</p>
    </div>
  </div>
</template>
