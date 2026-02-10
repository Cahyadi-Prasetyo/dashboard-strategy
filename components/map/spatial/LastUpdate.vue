<template>
  <div
    class="bg-white/60 backdrop-blur-md pl-2.5 pr-3.5 py-1.5 rounded-full border border-gray-200 shadow-lg flex items-center gap-2 pointer-events-auto"
  >
    <div
      class="bg-emerald-100 p-1 rounded-full flex items-center justify-center"
    >
      <UIcon name="i-heroicons-clock" class="w-3 h-3 text-emerald-600" />
    </div>
    <span class="text-[10px] text-gray-600 font-medium leading-none mt-0.5">
      Data sebaran titik per
      <span class="font-bold text-gray-800">{{ text }}</span>
    </span>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    required: true,
    default: "-",
  },
});
</script>
