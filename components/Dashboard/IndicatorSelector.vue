<template>
  <div class="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg w-80 pointer-events-auto border border-gray-200">
    <h2 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
      <div class="i-heroicons-chart-bar w-5 h-5 text-blue-600" />
      Indikator BPS Kepri
    </h2>
    
    <div class="space-y-2">
      <button
        v-for="indicator in INDICATORS"
        :key="indicator.id"
        @click="selectIndicator(indicator)"
        class="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-sm flex items-center justify-between group"
        :class="selectedIndicatorId === indicator.id 
          ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
          : 'hover:bg-gray-50 text-gray-600 border border-transparent'"
      >
        <span class="font-medium">{{ indicator.label }}</span>
        <span 
          v-if="selectedIndicatorId === indicator.id" 
          class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
        >
          Aktif
        </span>
      </button>
    </div>

    <!-- Active Indicator Detail -->
    <div v-if="activeIndicator" class="mt-4 pt-4 border-t border-gray-200">
      <div class="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Deskripsi</div>
      <p class="text-xs text-gray-600 leading-relaxed">
        {{ activeIndicator.description }}
      </p>
      <div class="mt-2 flex items-center gap-2 text-xs text-gray-500">
        <span class="font-semibold">Satuan:</span> {{ activeIndicator.unit }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDashboardState } from '~/composables/useDashboardState';
import { INDICATORS } from '~/constants/indicators';
import type { BPSIndicator } from '~/types/indicator';

const { selectedIndicatorId, activeIndicator, setIndicator } = useDashboardState();

const selectIndicator = (indicator: BPSIndicator) => {
  setIndicator(indicator.id);
};
</script>

