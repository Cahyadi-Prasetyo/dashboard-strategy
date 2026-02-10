<template>
  <div class="relative z-[2000]">
    <UTooltip
      :text="
        disabled
          ? 'Pilih Filter Wilayah Terlebih Dahulu'
          : 'Layer Digital Elevation Model'
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
            : 'bg-white/95 backdrop-blur border-gray-300 cursor-pointer hover:bg-purple-50 hover:pl-1 hover:w-10',
          isOpen && !disabled ? 'bg-purple-50 w-10 pl-1' : '',
        ]"
      >
        <div
          class="h-full w-1.5 transition-colors rounded-r-full"
          :class="[
            disabled
              ? 'bg-gray-300'
              : isOpen
                ? 'bg-purple-600'
                : 'bg-gray-300 group-hover:bg-purple-600',
          ]"
        ></div>

        <div class="flex-1 h-full flex items-center justify-center py-2">
          <span
            class="text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap transform rotate-180"
            :class="[
              disabled
                ? 'text-gray-400'
                : 'text-gray-500 group-hover:text-purple-800',
            ]"
            style="writing-mode: vertical-rl; text-orientation: mixed"
          >
            DEM Layer
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
            Digital Elevation Model
          </h4>
          <p class="text-[9px] text-gray-500">Ketinggian Topografi (mdpl)</p>
        </div>
        <UButton
          icon="i-heroicons-x-mark"
          size="2xs"
          color="gray"
          variant="ghost"
          @click="toggleList"
        />
      </div>

      <div class="p-3 space-y-3">
        <!-- Toggle DEM Layer -->
        <div
          class="flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer"
          :class="
            isActive
              ? 'bg-purple-50 border-purple-200'
              : 'bg-white border-gray-100 hover:border-gray-300'
          "
          @click="$emit('toggle-dem')"
        >
          <div class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-map"
              class="w-4 h-4 text-purple-600"
            />
            <span class="text-xs font-medium text-gray-700">
              Tampilkan DEM
            </span>
          </div>

          <div
            class="w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0"
            :class="
              isActive
                ? 'bg-purple-500 border-purple-500'
                : 'border-gray-300'
            "
          >
            <UIcon
              v-if="isActive"
              name="i-heroicons-check"
              class="w-3 h-3 text-white"
            />
          </div>
        </div>

        <!-- Opacity Slider -->
        <div v-if="isActive" class="space-y-2 animate-fade-in">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold text-gray-500 uppercase">
              Transparansi
            </span>
            <span class="text-xs font-medium text-purple-600">
              {{ opacityPercentage }}%
            </span>
          </div>
          <USlider
            :model-value="opacity"
            @update:model-value="$emit('update:opacity', $event)"
            :min="0.1"
            :max="1"
            :step="0.1"
            size="sm"
            color="purple"
          />
        </div>


        <!-- Info Box -->
        <div class="bg-purple-50 rounded-lg p-2 border border-purple-100">
          <p class="text-[9px] text-purple-700 leading-relaxed">
            <strong>Info:</strong> Layer ini menampilkan ketinggian topografi dalam meter di atas permukaan laut (mdpl).
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },
  opacity: { type: Number, default: 0.7 },
  hillshadeEnabled: { type: Boolean, default: false },
  supportsHillshade: { type: Boolean, default: false } // Set true jika pakai GeoServer/Titiler
});

const emit = defineEmits([
  'toggle-menu', 
  'toggle-dem', 
  'update:opacity',
  'toggle-hillshade'
]);

const opacityPercentage = computed(() => Math.round(props.opacity * 100));

const toggleList = () => {
  if (props.disabled) return;
  emit('toggle-menu', !props.isOpen);
};

const handleClick = () => {
  toggleList();
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
.animate-fade-in {
  animation: fade-in 0.2s ease-out forwards;
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>