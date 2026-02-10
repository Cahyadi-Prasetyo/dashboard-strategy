<template>
  <div class="flex flex-col gap-4">
    <div
      v-if="disabled"
      class="p-3 bg-gray-50 rounded-lg text-center border border-dashed border-gray-200"
    >
      <span class="text-xs text-gray-400"
        >Pilih Filter Wilayah Terlebih Dahulu</span
      >
    </div>

    <div v-else class="space-y-4">
      <div class="grid grid-cols-2 gap-2">
        <div
          v-for="(config, layerType) in LAYER_CONFIG_PASCA"
          :key="layerType"
          class="relative flex flex-col items-center justify-center p-2 rounded-lg border transition-all cursor-pointer text-center h-20"
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
            {{ config.label }}
          </span>

          <div
            v-if="activeLayer === layerType"
            class="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"
          ></div>
        </div>
      </div>

      <div class="p-3 grid grid-cols-2 gap-4">
        <!-- LEFT COLUMN: Layer Options + Opacity -->
        <div class="space-y-3 overflow-y-auto">
          <!-- Layer Options (Radio Buttons) -->
          <div class="space-y-2">
            <div
              v-for="(config, layerType) in LAYER_CONFIG_PASCA"
              :key="layerType"
              class="flex items-center justify-between p-2.5 rounded-lg border transition-all"
              :class="[
                layerType !== 'dem'
              ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                  : activeLayer === layerType
                    ? 'bg-rose-50 border-rose-200 cursor-pointer'
                    : 'bg-white border-gray-100 hover:border-gray-300 cursor-pointer',
              ]"
              @click="layerType === 'dem' ? handleLayerChange(layerType) : null"
              
            >
              <div class="flex items-center gap-2">
                <UIcon
                  :name="config.icon"
                  class="w-4 h-4"
                  :class="[
                    layerType !== 'dem'
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
                      layerType !== 'dem' ? 'text-gray-400' : 'text-gray-700'
                    "
                  >
                    {{ config.label }}
                  </span>
                  <span
                    v-if="layerType !== 'dem'"
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
                  layerType !== 'dem'
                   ? 'border-gray-300 bg-gray-100'
                    : activeLayer === layerType
                      ? 'border-rose-500'
                      : 'border-gray-300'
                "
              >
                <div
                  v-if="activeLayer === layerType && layerType === 'dem'"
                  class="w-2 h-2 rounded-full bg-rose-500"
                ></div>
              </div>
            </div>
          </div>

          <USlider
            :model-value="opacity"
            @update:model-value="$emit('update:opacity', $event)"
            :min="0"
            :max="1"
            :step="0.05"
            color="rose"
            size="xs"
            :ui="{
              track: { background: 'bg-gray-200' },
              thumb: { color: 'text-rose-500', size: 'h-3 w-3' },
            }"
          />
        </div>

        <div v-if="activeLayerConfig.legend">
          <div class="text-[10px] font-bold text-gray-500 uppercase mb-1">
            Legenda
          </div>

          <div v-if="activeLayer === 'sentinel'" class="flex gap-1 flex-wrap">
            <div
              v-for="(item, idx) in activeLayerConfig.legend.items"
              :key="idx"
              class="flex items-center gap-1"
            >
              <div
                class="w-2 h-2 rounded-full"
                :style="{ backgroundColor: item.colors[0] }"
              ></div>
              <span class="text-[9px] text-gray-600">{{ item.label }}</span>
            </div>
          </div>

          <div
            v-else
            class="h-2 w-full rounded-full bg-gradient-to-r from-black to-white border border-gray-200"
          ></div>
        </div>

        <div
          class="text-[10px] text-gray-600 leading-snug border-t border-gray-200 pt-2 mt-2"
        >
          {{ activeLayerConfig.description }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
// PENTING: Jika file ini untuk PRA, ganti import menjadi LAYER_CONFIG_PRA
import { LAYER_CONFIG_PASCA } from "~/constants/map-config";

const props = defineProps({
  disabled: Boolean,
  activeLayer: String,
  opacity: { type: Number, default: 0.8 },
});

const emit = defineEmits(["layer-change", "update:opacity"]);

const activeLayerConfig = computed(() => {
  // PENTING: Sesuaikan variabel config disini juga (LAYER_CONFIG_PRA atau LAYER_CONFIG_PASCA)
  return props.activeLayer ? LAYER_CONFIG_PASCA[props.activeLayer] : null;
});

const handleLayerChange = (layerType) => {
  // Toggle logic: click aktif -> mati, click beda -> ganti
  const newValue = props.activeLayer === layerType ? null : layerType;
  emit("layer-change", newValue);
};
</script>
