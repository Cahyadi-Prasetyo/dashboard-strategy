<template>
  <div class="flex flex-col gap-4">
    <div
      v-if="disabled"
      class="p-3 bg-gray-50 rounded-lg text-center border border-dashed border-gray-200"
    >
      <span class="text-xs text-gray-400">
        Pilih Filter Wilayah Terlebih Dahulu
      </span>
    </div>

    <div v-else class="flex flex-col gap-4 p-2">
      <div class="bg-gray-50 p-3 rounded-lg border border-gray-100">
        <div class="flex justify-between items-center mb-3">
          <label class="text-[10px] font-bold text-gray-500 uppercase">
            Transparansi Layer
          </label>
          <span class="text-[10px] font-bold text-emerald-600">
            {{ Math.round(opacity * 100) }}%
          </span>
        </div>

        <USlider
          :model-value="opacity"
          @update:model-value="$emit('update:opacity', $event)"
          :min="0"
          :max="1"
          :step="0.1"
          color="emerald"
          size="sm"
        />
      </div>

      <div>
        <h5
          class="text-[11px] font-bold text-gray-800 uppercase mb-2 flex items-center gap-2"
        >
          <UIcon name="i-heroicons-rectangle-stack" class="w-3 h-3" />
          Kawasan Terdampak (BRIN)
        </h5>
        <div class="space-y-1">
          <div
            v-for="layer in brinLayers"
            :key="layer.id"
            class="flex items-center justify-between p-2 rounded-md border transition-all cursor-pointer"
            :class="
              activeBrinLayers.includes(layer.id)
                ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                : 'bg-white border-gray-100 hover:bg-gray-50'
            "
            @click="$emit('update:brin', layer.id)"
          >
            <div class="flex items-center gap-2">
              <span
                class="w-2.5 h-2.5 rounded-full border border-black/10 shadow-sm flex-shrink-0"
                :style="{ backgroundColor: layer.color }"
              ></span>
              <span class="text-xs text-gray-700 font-medium">{{
                layer.label
              }}</span>
            </div>

            <UToggle
              :model-value="activeBrinLayers.includes(layer.id)"
              @update:model-value="$emit('update:brin', layer.id)"
              color="emerald"
              size="sm"
              :ui="{ active: 'bg-emerald-500', inactive: 'bg-gray-200' }"
            />
          </div>
        </div>
      </div>

      <UDivider />

      <div>
        <!-- <h5
          class="text-[11px] font-bold text-gray-800 uppercase mb-2 flex items-center gap-2"
        >
          <UIcon name="i-heroicons-map" class="w-3 h-3" />
          FloodMap Sumatera
        </h5> -->

        <div class="space-y-3">
          <div v-for="(group, gIdx) in pmssConfig" :key="gIdx">
            <div
              class="text-[10px] font-bold text-gray-800 mb-1 ml-1 uppercase tracking-wider"
            >
              {{ group.group }}
            </div>
            <div class="space-y-1">
              <div
                v-for="layer in group.layers"
                :key="layer.id"
                class="flex items-center justify-between p-2 rounded-md border transition-all cursor-pointer"
                :class="
                  isPmssActive(layer)
                    ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-200'
                    : 'bg-white border-gray-100 hover:bg-gray-50'
                "
                @click="$emit('update:pmss', layer)"
              >
                <span class="text-xs text-gray-700 font-medium">{{
                  layer.name
                }}</span>

                <UToggle
                  :model-value="isPmssActive(layer)"
                  @update:model-value="$emit('update:pmss', layer)"
                  color="blue"
                  size="sm"
                  :ui="{ active: 'bg-blue-500', inactive: 'bg-gray-200' }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  brinLayers: { type: Array, required: true },
  activeBrinLayers: { type: Array, default: () => [] },
  pmssConfig: { type: Array, required: true },
  activePmssLayers: { type: Array, default: () => [] },
  disabled: Boolean,
  opacity: { type: Number, default: 0.8 },
});

const emit = defineEmits(["update:brin", "update:pmss", "update:opacity"]);

// Helper Function: Cek apakah layer aktif
// Menangani kasus jika activePmssLayers berisi Object (karena kita emit object)
// ataupun berisi ID (jaga-jaga).
const isPmssActive = (layer) => {
  if (!props.activePmssLayers || props.activePmssLayers.length === 0)
    return false;

  // Cek cara aman: cari berdasarkan ID di dalam array
  return props.activePmssLayers.some((item) => {
    // Jika item di array adalah Object, cek id-nya
    if (typeof item === "object" && item !== null) {
      return item.id === layer.id;
    }
    // Jika item di array adalah String/Number (ID langsung), cek match
    return item === layer.id;
  });
};
</script>
