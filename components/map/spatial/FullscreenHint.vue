<template>
  <div
    v-if="show"
    class="absolute top-full right-0 mt-3 w-48 p-3 bg-white/70 backdrop-blur-md text-gray-800 rounded-xl shadow-xl z-50 animate-bounce-soft pointer-events-none border border-white/50"
  >
    <div
      class="absolute -top-1.5 right-3 w-3 h-3 bg-white/70 backdrop-blur-md rotate-45 border-t border-l border-white/50"
    ></div>

    <div class="relative flex flex-col gap-1">
      <p class="text-[10px] font-bold uppercase tracking-wider text-gray-800">
        Saran Tampilan
      </p>
      <p class="text-xs font-medium leading-snug">
        Gunakan mode <b>Fullscreen</b> untuk eksplorasi peta yang lebih maksimal
        dan menampilkan detail seluruh elemen pada peta.
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
@keyframes bounce-soft {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}
.animate-bounce-soft {
  animation: bounce-soft 2s infinite;
}
</style>
