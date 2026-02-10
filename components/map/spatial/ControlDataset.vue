<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <label class="text-xs font-semibold text-gray-700">Sektor</label>
      <USelectMenu
        v-model="localSektor"
        :items="availableSektors"
        placeholder="Pilih Sektor"
        :disabled="disabled"
        searchable
        searchable-placeholder="Cari sektor..."
        class="w-full"
      >
        <template #leading>
          <UIcon name="i-heroicons-squares-2x2" class="w-4 h-4 text-gray-500" />
        </template>
      </USelectMenu>
    </div>

    <div
      v-if="isLoadingData"
      class="py-2 text-center text-xs text-gray-500 flex items-center justify-center gap-1"
    >
      <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
      <span>Memuat dataset...</span>
    </div>

    <div v-else-if="isInfrastruktur" class="animate-fade-in pt-1">
      <div class="flex flex-col gap-2">
        <label class="text-xs font-semibold text-gray-700">Indikator</label>
        <div class="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <MapSpatialLayer2
            :model-value="layer2Model"
            @update:model-value="onLayer2Update"
            @change="$emit('update:layer2-change')"
          />
        </div>
      </div>
    </div>

    <div v-else-if="localSektor" class="flex flex-col gap-4 animate-fade-in">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-gray-700">Dataset</label>
        <USelectMenu
          :model-value="selectedGroup"
          :items="filteredGroupOptions"
          option-attribute="label"
          placeholder="Pilih Dataset"
          :disabled="disabled"
          searchable
          searchable-placeholder="Cari dataset..."
          class="w-full"
          @update:model-value="onDatasetChange"
          :ui="{
            option: {
              truncate: false,
              container: 'w-full',
              base: 'whitespace-normal h-auto',
            },
          }"
        >
          <template #leading>
            <UIcon
              name="i-heroicons-table-cells"
              class="w-4 h-4 text-gray-500"
            />
          </template>

          <template #option="{ option }">
            <div
              class="w-full whitespace-normal break-words text-left leading-snug py-1"
            >
              {{ option.label }}
            </div>
          </template>
        </USelectMenu>
      </div>

      <div
        v-if="selectedGroup && hasMultipleIndicators"
        class="flex flex-col gap-1.5 animate-fade-in"
      >
        <label class="text-xs font-semibold text-gray-700">Indikator</label>
        <USelectMenu
          v-model="selectedIndikatorObj"
          :items="selectedGroup.indicators"
          option-attribute="label"
          placeholder="Pilih Indikator"
          :disabled="disabled"
          class="w-full"
        >
          <template #leading>
            <UIcon name="i-heroicons-funnel" class="w-4 h-4 text-gray-500" />
          </template>
        </USelectMenu>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  disabled: Boolean,
  activeSektorTab: String,
  availableSektors: { type: Array, default: () => [] },
  groupedDatasets: { type: Array, default: () => [] },
  // Props nilai terpilih dari parent
  selectedDatasetId: [Number, String, null],
  selectedIndikatorId: [Number, String, null],
  selectedVariantId: [String, null],
  isLoadingData: Boolean,

  // Props Baru untuk menerima data Layer 2 (Checklist)
  layer2Model: { type: Array, default: () => [] },
});

// Tambahkan emit 'update:layer2'
const emit = defineEmits([
  "update:activeSektorTab",
  "dataset-change",
  "update:layer2",
  "update:layer2-change",
]);

// --- STATE LOKAL ---
const localSektor = computed({
  get: () => props.activeSektorTab,
  set: (val) => {
    emit("update:activeSektorTab", val);
    selectedGroup.value = null;
    selectedIndikatorObj.value = null;
  },
});
const isInfrastruktur = computed(() => {
  return localSektor.value === "Kondisi Infrastruktur (BPS)";
});

const selectedGroup = ref(null);
const selectedIndikatorObj = ref(null);

// --- HANDLER LAYER 2 ---
const onLayer2Update = (val) => {
  emit("update:layer2", val);
};

// --- COMPUTED OPTIONS (NORMAL FLOW) ---
const filteredGroupOptions = computed(() => {
  if (!props.groupedDatasets || props.groupedDatasets.length === 0) return [];
  return props.groupedDatasets.map((group) => ({
    label: group.dataset_label,
    ...group,
  }));
});

const hasMultipleIndicators = computed(() => {
  return (
    selectedGroup.value &&
    selectedGroup.value.indicators &&
    selectedGroup.value.indicators.length > 1
  );
});

watch(
  () => [
    props.selectedDatasetId,
    props.selectedVariantId,
    props.groupedDatasets,
  ],
  ([newDsId, newVarId, datasets]) => {
    // 1. LOGIKA RESET: Jika ID Dataset dari parent jadi NULL/KOSONG
    if (!newDsId) {
      selectedGroup.value = null;
      selectedIndikatorObj.value = null;
      return; // Berhenti di sini
    }

    // 2. Cek ketersediaan data
    if (!datasets.length) return;

    // 3. Logika Mencari Dataset Terpilih (Existing)
    const foundGroup = datasets.find((g) => {
      const idMatch = g.id_dataset == newDsId;
      if (newVarId) return idMatch && g.variant_id == newVarId;
      return idMatch;
    });

    if (foundGroup) {
      selectedGroup.value = {
        label: foundGroup.dataset_label,
        ...foundGroup,
      };
      if (props.selectedIndikatorId) {
        const foundInd = foundGroup.indicators.find(
          (i) => i.id_indikator == props.selectedIndikatorId,
        );
        if (foundInd) selectedIndikatorObj.value = foundInd;
      }
    }
  },
  { immediate: true },
);

watch(selectedGroup, (newGroup) => {
  if (!newGroup) return;
  if (newGroup.indicators.length === 1) {
    selectedIndikatorObj.value = newGroup.indicators[0];
    triggerChange(newGroup, newGroup.indicators[0]);
  } else {
    if (
      !selectedIndikatorObj.value ||
      !newGroup.indicators.find(
        (i) => i.id_indikator === selectedIndikatorObj.value.id_indikator,
      )
    ) {
      selectedIndikatorObj.value = null;
    }
  }
});

watch(selectedIndikatorObj, (newInd) => {
  if (newInd && selectedGroup.value) {
    triggerChange(selectedGroup.value, newInd);
  }
});

const triggerChange = (group, indicator) => {
  emit("dataset-change", {
    id_dataset: group.id_dataset,
    id_indikator: indicator.id_indikator,
    label: group.indicators.length > 1 ? indicator.label : group.dataset_label,
    sektor: group.sektor,
    variant_id: group.variant_id,
  });
};

const onDatasetChange = (val) => {
  if (selectedGroup.value?.id_dataset === val?.id_dataset) {
    selectedGroup.value = null;
    selectedIndikatorObj.value = null;
    emit("dataset-change", { id_dataset: null });
    return;
  }
  selectedGroup.value = val;
};
</script>
