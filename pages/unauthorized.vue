<template>
  <div class="fixed inset-0 z-[999] grid h-screen w-screen place-items-center bg-black/40 backdrop-blur-[2px] overflow-auto">
    <div class="flex flex-col items-center gap-4">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin" />
      <p>
          Anda tidak dapat mengakses halaman ini, akan dialihkan ke halaman beranda...
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  definePageMeta({
    layout:false
  });

  setTimeout(() => {
    navigateTo("/");
  }, 500)
</script>

