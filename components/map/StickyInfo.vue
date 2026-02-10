<template>
  <div
    class="fixed top-1/2 left-0 z-[1000] font-sans transition-transform duration-300 ease-in-out w-72 lg:w-80"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <div
      class="w-full bg-amber-50 border-y border-r border-amber-200 shadow-2xl rounded-r-2xl flex flex-col relative bg-opacity-95 backdrop-blur-sm"
    >
      <div
        class="flex items-center justify-between px-4 py-3 border-b border-amber-200/50 bg-amber-100/50 rounded-tr-2xl"
      >
        <div class="flex items-center gap-2 text-amber-800">
          <UIcon name="i-heroicons-information-circle" class="w-5 h-5" />
          <span class="font-bold text-sm">Informasi Peta</span>
        </div>
        <!-- <button
          @click="isOpen = false"
          class="text-amber-600 hover:text-amber-900 transition-colors"
        >
          <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
        </button> -->
      </div>

      <div class="p-4 text-sm text-amber-900/80 leading-relaxed">
        <p class="mb-3">
          <strong>Klasifikasi Warna:</strong><br />
          Warna wilayah disusun menggunakan metode
          <em>Jenks Natural Breaks</em> (tingkat kepadatan data).
        </p>
        <p>
          <strong>Interaksi:</strong><br />
          Klik wilayah peta untuk melihat <strong>Detail Data</strong> dan
          sebaran titik koordinat.
        </p>

        <div
          v-if="lokasiLabel"
          class="mt-4 pt-3 border-t border-amber-200/50 text-xs text-amber-700 font-medium"
        >
          Cakupan: {{ lokasiLabel }}
        </div>
      </div>
    </div>

    <button
      @click="isOpen = !isOpen"
      class="absolute top-4 left-full flex items-center justify-center bg-amber-400 hover:bg-amber-500 text-white shadow-[4px_4px_10px_rgba(0,0,0,0.1)] cursor-pointer border-y border-r border-amber-500 rounded-r-lg transition-all duration-300"
      :class="isOpen ? 'h-10 w-8' : 'h-32 w-9'"
    >
      <UIcon v-if="isOpen" name="i-heroicons-chevron-left" class="w-5 h-5" />

      <div v-else class="h-full flex items-center justify-center py-2">
        <span
          class="text-xs font-bold uppercase tracking-widest whitespace-nowrap transform rotate-180 text-amber-900"
          style="writing-mode: vertical-rl; text-orientation: mixed"
        >
          Info Peta
        </span>
      </div>
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  wilayah: { type: Object, default: () => ({ provinsi: [], kabupaten: [] }) },
});

const isOpen = ref(false);

const lokasiLabel = computed(() => {
  if (props.wilayah.kabupaten?.length > 0)
    return `${props.wilayah.kabupaten.length} Kabupaten`;
  if (props.wilayah.provinsi?.length > 0)
    return `${props.wilayah.provinsi.length} Provinsi`;
  return null;
});
</script>
