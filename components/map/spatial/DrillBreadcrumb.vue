<template>
  <div
    v-if="breadcrumbItems.length > 0"
    class="absolute -top-0 -left-10 z-[1500] bg-white/98 backdrop-blur-md rounded-lg shadow-lg border border-gray-200/80 px-2 py-0.5 flex items-center gap-2 animate-fade-in pointer-events-auto hover:shadow-xl transition-shadow"
  >
    <button
      @click="$emit('reset')"
      class="p-1 rounded-md hover:bg-blue-50 transition-colors group"
      title="Kembali ke Awal"
    >
      <UIcon
        name="i-heroicons-home"
        class="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-600"
      />
    </button>

    <div class="h-3 w-px bg-gray-300"></div>

    <div class="flex items-center gap-1 text-[11px] font-medium">
      <template v-for="(item, idx) in breadcrumbItems" :key="idx">
        <UIcon
          v-if="idx > 0"
          name="i-heroicons-chevron-right"
          class="w-3 h-3 text-gray-400 flex-shrink-0"
        />

        <button
          @click="$emit('drill-to-level', idx)"
          class="flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded"
          :class="
            idx === breadcrumbItems.length - 1
              ? 'text-gray-900 font-bold cursor-default'
              : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
          "
        >
          <span class="max-w-[120px] truncate">{{ item.label }}</span>
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  breadcrumbItems: { type: Array, default: () => [] }, // [{ label, level, id }]
  currentLevel: { type: String, default: "prov" },
});

defineEmits(["reset", "drill-to-level"]);

// Computed: Label level saat ini
const currentLevelLabel = computed(() => {
  const levelMap = {
    prov: "Provinsi",
    kab: "Kabupaten",
    kec: "Kecamatan",
    desa: "Desa",
  };
  return levelMap[props.currentLevel] || "Wilayah";
});
</script>

<style scoped>
.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
