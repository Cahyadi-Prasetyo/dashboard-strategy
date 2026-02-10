<template>
  <div class="relative z-[2000]">
    <UTooltip
      :text="
        disabled
          ? 'Pilih Filter Wilayah Terlebih Dahulu'
          : 'Layer PMSS (BPS GeoServer)'
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
            : 'bg-white/95 backdrop-blur border-gray-300 cursor-pointer hover:bg-blue-50 hover:pl-1 hover:w-10',
          isOpen && !disabled ? 'bg-blue-50 w-10 pl-1' : '',
        ]"
      >
        <div
          class="h-full w-1.5 transition-colors rounded-r-full"
          :class="[
            disabled
              ? 'bg-gray-300'
              : isOpen
                ? 'bg-blue-600'
                : 'bg-gray-300 group-hover:bg-blue-600',
          ]"
        ></div>

        <div class="flex-1 h-full flex items-center justify-center py-2">
          <span
            class="text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap transform rotate-180"
            :class="[
              disabled
                ? 'text-gray-400'
                : 'text-gray-500 group-hover:text-blue-800',
            ]"
            style="writing-mode: vertical-rl; text-orientation: mixed"
          >
            Layer PMSS
          </span>
        </div>
      </button>
    </UTooltip>

    <div
      v-if="isOpen && !disabled"
      class="absolute top-0 left-12 mt-0 bg-white rounded-xl shadow-2xl border border-gray-200 w-64 overflow-hidden animate-fade-in-left"
    >
      <div
        class="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0"
      >
        <div>
          <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wide">
            FloodMap Sumatera
          </h4>
          <p class="text-[9px] text-gray-500">Sumber: GeoServer BPS</p>
        </div>
        <UButton
          icon="i-heroicons-x-mark"
          size="2xs"
          color="gray"
          variant="ghost"
          @click="toggleList"
        />
      </div>

      <div class="p-2 space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar">
        <div v-for="(group, gIdx) in config" :key="gIdx" class="space-y-1">
          <div
            class="text-[10px] font-bold text-gray-500 uppercase px-1 mt-2 mb-1 flex items-center gap-1.5"
          >
            <span
              class="w-1.5 h-1.5 rounded-full"
              :class="
                group.color ? group.color.replace('bg-', 'bg-') : 'bg-gray-400'
              "
            ></span>
            {{ group.group }}
          </div>

          <div
            v-for="layer in group.layers"
            :key="layer.id"
            class="flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer"
            :class="
              checkActive(layer.id)
                ? 'bg-blue-50 border-blue-200'
                : 'bg-white border-gray-100 hover:border-gray-300'
            "
            @click="$emit('update:layer', layer)"
          >
            <div class="flex items-center gap-3">
              <div
                v-if="layer.color"
                class="w-3 h-3 rounded-full shadow-sm flex-shrink-0"
                :style="{ backgroundColor: layer.color }"
              ></div>

              <span class="text-xs font-medium text-gray-700 leading-tight">
                {{ layer.name || layer.label }}
              </span>
            </div>

            <div
              class="w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0"
              :class="
                checkActive(layer.id)
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-300'
              "
            >
              <UIcon
                v-if="checkActive(layer.id)"
                name="i-heroicons-check"
                class="w-3 h-3 text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  config: { type: Array, required: true },
  activeLayers: { type: Array, default: () => [] },
  isOpen: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["toggle-menu", "update:layer"]);

const toggleList = () => {
  if (props.disabled) return;
  emit("toggle-menu", !props.isOpen);
};

const handleClick = () => {
  toggleList();
};

// Helper function supaya robust (bisa baca array string ID maupun array object)
const checkActive = (layerId) => {
  if (!props.activeLayers) return false;
  return props.activeLayers.some((item) => {
    if (typeof item === "object" && item !== null) return item.id === layerId;
    return item === layerId;
  });
};
</script>

<style scoped>
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
