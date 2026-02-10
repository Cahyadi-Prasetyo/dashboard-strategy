<template>
  <div class="flex flex-col gap-3 pb-20 p-4">
    <UAccordion
      v-model="openedItems"
      :items="accordionItems"
      :ui="{
        wrapper: 'flex flex-col gap-3',
        item: {
          base: 'bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-0',
          padding: 'p-0',
          icon: 'text-gray-400',
        },
        default: {
          class:
            'p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold uppercase text-xs transition-colors border-b border-gray-100',
          openIcon: 'i-heroicons-chevron-up',
          closeIcon: 'i-heroicons-chevron-down',
        },
      }"
    >
      <template #dataset>
        <div class="p-3 bg-white">
          <MapSpatialControlDataset
            class="w-full"
            :disabled="!isMapReady"
            :active-sektor-tab="datasetProps.activeSektorTab"
            :available-sektors="datasetProps.availableSektors"
            :grouped-datasets="datasetProps.groupedDatasets"
            :selected-dataset-id="datasetProps.selectedDatasetId"
            :selected-indikator-id="datasetProps.selectedIndikatorId"
            :selected-variant-id="datasetProps.variantId"
            :is-loading-data="datasetProps.isLoading"
            :layer2-model="layer2Props.modelValue"
            @update:layer2="$emit('update:layer2', $event)"
            @update:layer2-change="$emit('update:layer2')"
            @update:active-sektor-tab="$emit('update:activeSektorTab', $event)"
            @dataset-change="$emit('dataset-change', $event)"
          />
        </div>
      </template>

      <template #pendataan>
        <div class="p-3 bg-white">
          <MapSpatialLayer2
            :model-value="layer2Props.modelValue"
            @change="$emit('update:layer2')"
          />
        </div>
      </template>

      <template #kondisi>
        <div class="p-0 bg-white relative sidebar-embedded-mode">
          <component
            :is="conditionLayerComponent"
            :is-open="true"
            :disabled="disabled"
            :active-layer="conditionProps.activeLayer"
            :opacity="conditionProps.opacity"
            @layer-change="$emit('update-condition', $event)"
            @update:opacity="$emit('update:conditionOpacity', $event)"
          />
        </div>
      </template>

      <template #dampak>
        <div class="p-0 bg-white relative sidebar-embedded-mode">
          <MapSpatialDampakLayer
            :is-open="true"
            :disabled="disabled"
            :brin-layers="dampakProps.brinLayers"
            :active-brin-layers="dampakProps.activeBrin"
            :pmss-config="dampakProps.pmssConfig"
            :active-pmss-layers="dampakProps.activePmss"
            :opacity="dampakProps.opacity"
            @update:brin="$emit('update-brin', $event)"
            @update:pmss="$emit('update-pmss', $event)"
            @update:opacity="$emit('update:dampakOpacity', $event)"
          />
        </div>
      </template>
    </UAccordion>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  mapType: { type: String, default: "pasca" },
  isMapReady: Boolean,
  disabled: Boolean,
  showPendataan: { type: Boolean, default: false },
  datasetProps: Object,
  layer2Props: Object,
  conditionLayerComponent: Object,
  conditionProps: Object,
  dampakProps: Object,
});

const openedItems = ref([0]);

const emit = defineEmits([
  "dataset-change",
  "update:activeSektorTab",
  "update:layer2",
  "update-condition",
  "update:conditionOpacity",
  "update-brin",
  "update-pmss",
  "update:dampakOpacity",
]);

const accordionItems = computed(() => {
  const isPra = props.mapType === "pra";

  const items = [
    {
      label: isPra ? "Data Statistik Wilayah" : "Data Statistik",
      icon: "i-heroicons-chart-bar",
      slot: "dataset",
      defaultOpen: true,
    },
    // props.showPendataan
    //   ? {
    //       label: "Pendataan Pasca Bencana (BPS)",
    //       icon: "ph:map-pin-simple-area-duotone",
    //       slot: "pendataan",
    //       defaultOpen: true,
    //     }
    //   : null,
    !isPra
      ? {
          label: "Sebaran Dampak",
          icon: "i-heroicons-exclamation-triangle",
          slot: "dampak",
          defaultOpen: true,
        }
      : null,
  ];

  return items.filter(Boolean);
});

watch(
  () => props.showPendataan,
  (isVisible) => {
    if (isVisible) {
      const index = accordionItems.value.findIndex(
        (i) => i.slot === "pendataan",
      );

      if (index !== -1) {
        if (!openedItems.value.includes(index)) {
          openedItems.value = [...openedItems.value, index];
        }
      }
    }
  },
  { immediate: true },
);
</script>
