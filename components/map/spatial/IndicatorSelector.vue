<template>
  <div class="relative">
    <UTooltip
      text="Filter Indikator"
      :prevent="!disabled"
      :popper="{ placement: 'bottom' }"
    >
      <button
        @click="toggleList"
        :disabled="disabled"
        :class="getBtnClass(disabled)"
      >
        <div class="flex items-center gap-2 overflow-hidden">
          <UIcon
            name="i-heroicons-chart-bar"
            class="w-5 h-5 text-gray-500 flex-shrink-0"
          />

          <span class="font-semibold text-gray-900 text-sm truncate">
            {{ buttonLabel || 'Pilih Indikator' }}
          </span>
        </div>
        <UIcon
          :name="
            showList ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'
          "
          class="w-4 h-4 text-gray-600 transition-transform flex-shrink-0"
        />
      </button>
    </UTooltip>

    <div
      v-if="showList && !disabled"
      class="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 w-60 max-h-[60vh] flex flex-col overflow-hidden animate-fade-in z-[2000]"
    >
      <!-- Header -->
      <div class="bg-gray-50 border-b border-gray-100 px-3 py-2 flex-shrink-0">
        <p class="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
          Pilih Indikator
        </p>
      </div>

      <!-- List Indikator -->
      <div class="overflow-y-auto flex-1 custom-scrollbar bg-white p-1.5">
        <div class="space-y-1">
          <div
            v-for="group in groupedDatasets"
            :key="group.id_dataset"
            class="rounded-lg border transition-colors duration-200"
            :class="
              isGroupActive(group) || expandedGroup === group.id_dataset
                ? 'border-amber-200 bg-amber-50/30'
                : 'border-transparent hover:border-gray-100'
            "
          >
            <!-- Single Indicator Dataset -->
            <div
              v-if="group.indicators.length === 1"
              @click="handleSingleSelection(group)"
              class="px-2.5 py-2 cursor-pointer rounded-md text-xs font-medium text-gray-700 flex items-center justify-between"
              :class="{
                'bg-amber-50 text-amber-700': isGroupActive(group),
                'hover:bg-gray-50': !isGroupActive(group),
              }"
            >
              <span class="flex-1 leading-snug">{{ group.dataset_label }}</span>
              <UIcon
                v-if="isGroupActive(group)"
                name="i-heroicons-check-circle"
                class="w-4 h-4 text-amber-600 flex-shrink-0 ml-2"
              />
            </div>

            <!-- Multiple Indicators Dataset -->
            <div v-else>
              <div
                @click="toggleGroupExpand(group.id_dataset)"
                class="px-2.5 py-2 cursor-pointer rounded-md text-xs font-bold text-gray-800 flex items-center justify-between hover:bg-gray-50"
              >
                <span class="flex-1 leading-snug">{{
                  group.dataset_label
                }}</span>
                <UIcon
                  :name="
                    expandedGroup === group.id_dataset
                      ? 'i-heroicons-chevron-up'
                      : 'i-heroicons-chevron-down'
                  "
                  class="w-3.5 h-3.5 text-gray-400 flex-shrink-0 ml-2"
                />
              </div>

              <!-- Sub Indicators -->
              <div
                v-if="expandedGroup === group.id_dataset"
                class="px-2 pb-2 pt-1 space-y-1"
              >
                <div
                  v-for="ind in group.indicators"
                  :key="ind.id_indikator"
                  @click="handleMultiSelection(group, ind)"
                  class="pl-3 pr-2 py-1.5 rounded cursor-pointer text-[11px] flex items-center gap-2 transition-colors border border-transparent"
                  :class="
                    isIndicatorActive(group.id_dataset, ind.id_indikator)
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : 'text-gray-600 hover:bg-white hover:border-gray-200'
                  "
                >
                  <div
                    class="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    :class="
                      isIndicatorActive(group.id_dataset, ind.id_indikator)
                        ? 'bg-amber-600'
                        : 'bg-gray-300'
                    "
                  ></div>
                  <span class="flex-1 leading-tight">{{ ind.label }}</span>
                </div>
              </div>
            </div>

            <!-- Filter Section (hanya muncul untuk dataset yang aktif) -->
            <div
              v-if="
                isGroupActive(group) &&
                (isLoadingData || filterConfigs.length > 0)
              "
              class="mx-2 mb-2 mt-1 p-2 bg-white rounded border border-amber-100 shadow-sm animate-fade-in"
            >
              <div
                v-if="isLoadingData"
                class="flex items-center gap-1.5 text-[9px] text-gray-400 py-1 justify-center"
              >
                <UIcon
                  name="i-heroicons-arrow-path"
                  class="w-3 h-3 animate-spin"
                />
                Memuat Filter...
              </div>

              <div v-else-if="filterConfigs.length > 0">
                <div
                  v-for="conf in filterConfigs"
                  :key="conf.key"
                  class="flex flex-col gap-1 mb-1.5"
                >
                  <label class="text-[8px] uppercase font-bold text-slate-500">
                    {{ conf.label }}
                  </label>
                  <USelect
                    :model-value="filterState[conf.key]"
                    :items="conf.options"
                    @update:model-value="
                      (val) => $emit('update:filter', { key: conf.key, value: val })
                    "
                    size="xs"
                    color="amber"
                    variant="outline"
                    :ui="{
                      base: 'text-[10px] h-7',
                      rounded: 'rounded-md',
                      placeholder: 'text-gray-400',
                    }"
                  />
                </div>
              </div>
              <div
                v-else
                class="text-[8px] text-gray-400 text-center italic py-0.5"
              >
                Tidak ada filter tambahan
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  disabled: Boolean,
  showList: Boolean,
  groupedDatasets: { type: Array, default: () => [] },
  selectedDatasetId: [Number, String, null],
  selectedIndikatorId: [Number, String, null],
  filterConfigs: { type: Array, default: () => [] },
  filterState: { type: Object, default: () => ({}) },
  isLoadingData: { type: Boolean, default: false },
  buttonLabel: { type: String, default: "" },
});

const emit = defineEmits([
  "toggle-list",
  "indicator-change",
  "update:filter",
]);

const expandedGroup = ref(null);

// Auto-expand jika ada dataset terpilih dari luar
watch(
  () => props.selectedDatasetId,
  (newVal) => {
    if (newVal) {
      expandedGroup.value = newVal;
    }
  },
  { immediate: true },
);

const getBtnClass = (disabled) => [
  "h-[42px] w-60 px-3 rounded-lg flex items-center justify-between transition-all border shadow-lg",
  disabled
    ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-75 shadow-none"
    : "bg-white border-gray-200 hover:bg-gray-50 cursor-pointer",
];

const toggleList = () => {
  emit("toggle-list");
};

const toggleGroupExpand = (datasetId) => {
  if (expandedGroup.value === datasetId) {
    expandedGroup.value = null;
  } else {
    expandedGroup.value = datasetId;
  }
};

const isGroupActive = (group) => {
  return props.selectedDatasetId === group.id_dataset;
};

const isIndicatorActive = (datasetId, indikatorId) => {
  return (
    props.selectedDatasetId === datasetId &&
    props.selectedIndikatorId === indikatorId
  );
};

// Handle Single Indicator Selection
const handleSingleSelection = (group) => {
  const ind = group.indicators[0];
  emit("indicator-change", {
    id_dataset: group.id_dataset,
    id_indikator: ind.id_indikator,
    label: ind.label || group.dataset_label,
  });
};

// Handle Multiple Indicator Selection
const handleMultiSelection = (group, ind) => {
  emit("indicator-change", {
    id_dataset: group.id_dataset,
    id_indikator: ind.id_indikator,
    label: ind.label,
  });
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
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

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
</style>