<template>
  <div class="relative z-[2000]">
    <UTooltip
      :text="
        disabled ? 'Pilih Filter Wilayah Terlebih Dahulu' : 'Kawasan Terdampak'
      "
      placement="right"
    >
      <button
        @click="handleClick"
        :disabled="disabled"
        class="group flex items-center border-y border-r rounded-r-xl shadow-md transition-all duration-200 h-20 w-9 relative"
        :class="[
          disabled
            ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-70'
            : 'bg-white/95 backdrop-blur border-gray-300 cursor-pointer hover:bg-emerald-50 hover:pl-1 hover:w-10',
          isOpen && !disabled ? 'bg-emerald-50 w-10 pl-1' : '',
        ]"
      >
        <div
          class="h-full w-1.5 transition-colors rounded-r-full"
          :class="[
            disabled
              ? 'bg-gray-300'
              : isOpen
                ? 'bg-emerald-500'
                : 'bg-gray-300 group-hover:bg-emerald-500',
          ]"
        ></div>

        <div class="flex-1 h-full flex items-center justify-center py-2">
          <span
            class="text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap transform rotate-180"
            :class="[
              disabled
                ? 'text-gray-400'
                : 'text-gray-500 group-hover:text-emerald-700',
            ]"
            style="writing-mode: vertical-rl; text-orientation: mixed"
          >
            Layer Lain
          </span>
        </div>
      </button>
    </UTooltip>

    <div
      v-if="isOpen && !disabled"
      class="absolute top-0 left-12 mt-0 bg-white rounded-xl shadow-2xl border border-gray-200 w-60 overflow-hidden animate-fade-in-left"
    >
      <div
        class="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center"
      >
        <div>
          <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wide">
            Layer Tambahan
          </h4>
          <p class="text-[9px] text-gray-500">Sumber: BRIN</p>
        </div>
        <UButton
          icon="i-heroicons-x-mark"
          size="2xs"
          color="gray"
          variant="ghost"
          @click="toggleList"
        />
      </div>

      <div class="p-2 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
        <div
          v-for="layer in layers"
          :key="layer.id"
          class="flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer"
          :class="
            activeLayers.includes(layer.id)
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-white border-gray-100 hover:border-gray-300'
          "
          @click="$emit('update:layer', layer.id)"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-3 h-3 rounded-full shadow-sm"
              :style="{ backgroundColor: layer.color }"
            ></div>
            <span class="text-xs font-medium text-gray-700">{{
              layer.label
            }}</span>
          </div>
          <div
            class="w-4 h-4 rounded border flex items-center justify-center transition-colors"
            :class="
              activeLayers.includes(layer.id)
                ? 'bg-emerald-500 border-emerald-500'
                : 'border-gray-300'
            "
          >
            <UIcon
              v-if="activeLayers.includes(layer.id)"
              name="i-heroicons-check"
              class="w-3 h-3 text-white"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  layers: { type: Array, required: true },
  activeLayers: { type: Array, default: () => [] },
  isOpen: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }, // Props baru
});

const emit = defineEmits(["toggle-menu", "update:layer"]);

const toggleList = () => {
  if (props.disabled) return;
  emit("toggle-menu", !props.isOpen);
};

const handleClick = () => {
  toggleList();
};
</script>

<style scoped>
/* Style sama seperti sebelumnya */
.animate-fade-in-left {
  animation: fade-in-left 0.2s ease-out forwards;
}
@keyframes fade-in-left {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
</style>
