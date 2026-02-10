<template>
  <div class="relative z-[2000]">
    <UTooltip
      :text="
        disabled
          ? 'Pilih Filter Wilayah Terlebih Dahulu'
          : 'Kondisi Wilayah Pra Bencana'
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
            : 'bg-white/95 backdrop-blur border-gray-300 cursor-pointer hover:bg-rose-50 hover:pl-1 hover:w-10',
          isOpen && !disabled ? 'bg-rose-50 w-10 pl-1' : '',
        ]"
      >
        <div
          class="h-full w-1.5 transition-colors rounded-r-full"
          :class="[
            activeLayer === layerType
              ? 'bg-rose-50 border-rose-200 ring-1 ring-rose-200'
              : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50',
          ]"
          @click="handleLayerChange(layerType)"
        >
          <UIcon
            :name="config.icon"
            class="w-6 h-6 mb-1"
            :class="
              activeLayer === layerType ? 'text-rose-600' : 'text-gray-400'
            "
          />
          <span
            class="text-[10px] font-semibold leading-tight"
            :class="
              activeLayer === layerType ? 'text-rose-700' : 'text-gray-600'
            "
          >
            Kondisi <br /> Wilayah
          </span>
        </div>
      </button>
    </UTooltip>

    <div
      v-if="isOpen && !disabled"
      class="absolute top-0 left-12 mt-0 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in-left"
      style="width: 620px; max-height: 500px"
    >
      <div
        class="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0"
      >
        <div>
          <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wide">
            Kondisi Wilayah
          </h4>
        </div>
      </div>

      <div class="p-3 grid grid-cols-2 gap-4">
        <!-- LEFT COLUMN: Layer Options + Opacity -->
        <div class="space-y-3 overflow-y-auto" style="max-height: 420px">
          <!-- Layer Options (Radio Buttons) -->
          <div class="space-y-2">
            <div
              v-for="(config, layerType) in LAYER_CONFIG_PRA"
              :key="layerType"
              class="flex items-center justify-between p-2.5 rounded-lg border transition-all"
              :class="[
                layerType === 'viirs'
                  ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                  : activeLayer === layerType
                    ? 'bg-rose-50 border-rose-200 cursor-pointer'
                    : 'bg-white border-gray-100 hover:border-gray-300 cursor-pointer',
              ]"
              @click="layerType !== 'viirs' ? handleLayerChange(layerType) : null"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  :name="config.icon"
                  class="w-4 h-4"
                  :class="[
                    layerType === 'viirs'
                      ? 'text-gray-400'
                      : activeLayer === layerType
                        ? 'text-rose-600'
                        : 'text-gray-500',
                  ]"
                />
                <div class="flex flex-col gap-0.5">
                  <span
                    class="text-xs font-medium"
                    :class="
                      layerType === 'viirs' ? 'text-gray-400' : 'text-gray-700'
                    "
                  >
                    {{ config.label }}
                  </span>
                  <span
                    v-if="layerType === 'viirs'"
                    class="text-[9px] text-gray-400 italic"
                  >
                    (Data belum tersedia)
                  </span>
                </div>
              </div>

              <!-- Radio Button -->
              <div
                class="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0"
                :class="
                  layerType === 'viirs'
                    ? 'border-gray-300 bg-gray-100'
                    : activeLayer === layerType
                      ? 'border-rose-500'
                      : 'border-gray-300'
                "
              >
                <div
                  v-if="activeLayer === layerType && layerType !== 'viirs'"
                  class="w-2 h-2 rounded-full bg-rose-500"
                ></div>
              </div>
            </div>
          </div>

          <!-- Opacity Slider -->
          <div v-if="activeLayer" class="space-y-2 animate-fade-in p-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-gray-500 uppercase">
                Transparansi
              </span>
              <span class="text-xs font-medium text-rose-600">
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
              color="rose"
            />
          </div>
        </div>

        <!-- RIGHT COLUMN: Legend + Info + Metadata -->
        <div
          v-if="activeLayer && activeLayerConfig"
          class="space-y-3 overflow-y-auto"
          style="max-height: 420px"
        >
          <!-- Legend - Dynamic based on layer type -->
          <div
            v-if="activeLayerConfig.legend"
            class="space-y-1.5 animate-fade-in"
          >
            <div class="text-[10px] font-bold text-gray-500 uppercase">
              {{ activeLayerConfig.legend.title }}
            </div>

            <!-- Sentinel Legend (Categorical with Color Gradients) -->
            <div v-if="activeLayer === 'sentinel'" class="space-y-2">
              <div
                v-for="(item, idx) in activeLayerConfig.legend.items"
                :key="idx"
                class="flex flex-col gap-1.5"
              >
                <span class="text-[9px] text-gray-700 font-medium">{{
                  item.label
                }}</span>
                <div class="flex gap-0.5">
                  <div
                    v-for="(color, colorIdx) in item.colors"
                    :key="colorIdx"
                    class="flex-1 h-6 border border-gray-300"
                    :class="{
                      'rounded-l': colorIdx === 0,
                      'rounded-r': colorIdx === item.colors.length - 1,
                    }"
                    :style="{ backgroundColor: color }"
                  ></div>
                </div>
              </div>
              <p class="text-[8px] text-gray-500 italic mt-2">
                *Warna bisa bervariasi
              </p>
            </div>

            <!-- DEM Legend (Gradient) -->
            <div v-else-if="activeLayer === 'dem'" class="space-y-1">
              <div
                class="h-4 rounded overflow-hidden relative"
                style="
                  background: linear-gradient(
                    to right,
                    #000000,
                    #1a1a2e,
                    #2d3142,
                    #4a5568,
                    #718096,
                    #a0aec0,
                    #cbd5e0,
                    #e2e8f0,
                    #f7fafc,
                    #ffffff
                  );
                "
              ></div>
              <div class="flex justify-between text-[9px] text-gray-600">
                <span>0 m</span>
                <span class="font-medium">{{
                  activeLayerConfig.legend.max
                }}</span>
              </div>
              <p class="text-[9px] text-gray-500 italic">
                {{ activeLayerConfig.legend.description }}
              </p>
            </div>

            <!-- VIIRS Legend (Gradient) -->
            <div v-else-if="activeLayer === 'viirs'" class="space-y-1">
              <div
                class="h-4 rounded overflow-hidden relative"
                style="
                  background: linear-gradient(
                    to right,
                    #000000,
                    #1a1a2e,
                    #2d3142,
                    #4a5568,
                    #718096,
                    #a0aec0,
                    #cbd5e0,
                    #e2e8f0,
                    #f7fafc,
                    #ffffff
                  );
                "
              ></div>
              <div class="flex justify-between text-[9px] text-gray-600">
                <span>0</span>
                <span class="font-medium">{{
                  activeLayerConfig.legend.max
                }}</span>
              </div>
              <p class="text-[9px] text-gray-500 italic">
                {{ activeLayerConfig.legend.description }}
              </p>
            </div>
          </div>

          <!-- Info Box - Dynamic -->
          <div class="bg-rose-50 rounded-lg p-2 border border-rose-100">
            <p class="text-[9px] text-rose-700 leading-relaxed">
              <strong>Info:</strong> {{ activeLayerConfig.description }}
            </p>
          </div>

          <!-- Metadata Info - Dynamic -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-[9px]">
              <span class="text-gray-500">Sumber Data:</span>
              <span class="text-gray-700 font-medium">
                {{ activeLayerConfig.metadata.source }}
              </span>
            </div>
            <div class="flex items-center justify-between text-[9px]">
              <span class="text-gray-500">Resolusi:</span>
              <span class="text-gray-700 font-medium">
                {{ activeLayerConfig.metadata.resolution }}
              </span>
            </div>
            <div class="flex items-center justify-between text-[9px]">
              <span class="text-gray-500">Tipe Data:</span>
              <span class="text-gray-700 font-medium">
                {{ activeLayerConfig.metadata.type }}
              </span>
            </div>
            <div class="flex items-center justify-between text-[9px]">
              <span class="text-gray-500">Status:</span>
              <span class="text-rose-600 font-bold">
                {{ activeLayerConfig.metadata.status }}
              </span>
            </div>
          </div>
        </div>

        <!-- Placeholder when no layer selected -->
        <div
          v-else-if="!activeLayer"
          class="flex items-center justify-center text-center text-gray-400 text-xs"
        >
          <p>Pilih layer untuk melihat detail</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { LAYER_CONFIG_PRA, LAYER_TYPES_PRA } from "~/constants/map-config";

const props = defineProps({
  disabled: Boolean,
  activeLayer: String,
  opacity: { type: Number, default: 0.8 },
});

const emit = defineEmits(["toggle-menu", "layer-change", "update:opacity"]);

const opacityPercentage = computed(() => Math.round(props.opacity * 100));

const activeLayerConfig = computed(() => {
  // PENTING: Sesuaikan variabel config disini juga (LAYER_CONFIG_PRA atau LAYER_CONFIG_PASCA)
  return props.activeLayer ? LAYER_CONFIG_PRA[props.activeLayer] : null;
});

const handleLayerChange = (layerType) => {
  if (props.activeLayer === layerType) {
    emit("layer-change", null);
  } else {
    emit("layer-change", layerType);
  }
};

const toggleList = () => {
  if (props.disabled) return;
  emit("toggle-menu", !props.isOpen);
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
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>