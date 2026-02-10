<template>
  <div
    v-if="isVisible && (parentInfo || childrenData.length > 0)"
    class="absolute z-[1500] pointer-events-none bg-white/98 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/80 p-0 overflow-hidden flex"
    :style="{ top: position.y + 'px', left: position.x + 'px', width: '650px' }"
  >
    
    <!-- PANEL KIRI: Info Wilayah (dari InfoPanel) -->
    <div class="w-2/5 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 border-r border-gray-200 flex flex-col">
      <!-- Header Level Badge -->
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-blue-600" />
        <p class="text-[9px] font-bold text-blue-600 uppercase tracking-wider">
          {{ levelLabel }}
        </p>
      </div>
      
      <!-- Nama Wilayah -->
      <h4 class="font-bold text-gray-900 text-base leading-tight mb-3">
        {{ parentName }}
      </h4>
      
      <!-- Value Badge (Primary Metric) -->
      <div v-if="parentInfo" class="bg-white/60 rounded-lg p-3 mb-3 border border-blue-100">
        <p class="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
          HALO
          {{ datasetLabel || 'Nilai' }}
        </p>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-extrabold text-gray-900 leading-none">
            {{ formatNumber(parentInfo.value) }}
          </span>
          <span class="text-sm font-medium text-gray-600">
            {{ unit || parentInfo.unit || '' }}
          </span>
        </div>
      </div>
      
      <!-- Filter State / Context Tags -->
      <div v-if="filterState && Object.keys(filterState).length > 0" class="mb-3">
        <p class="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Filter Aktif
        </p>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="(val, key) in filterState"
            :key="key"
            class="text-[9px] font-medium bg-white/70 text-blue-700 px-2 py-1 rounded-md border border-blue-200/60"
          >
            {{ val }}
          </span>
        </div>
      </div>
      
      <!-- Description (jika ada) -->
      <div v-if="description" class="mb-3">
        <p class="text-xs text-gray-600 leading-relaxed line-clamp-3">
          {{ description }}
        </p>
      </div>
      
      <!-- Summary Footer -->
      <div class="mt-auto pt-3 border-t border-blue-200/50">
        <div class="flex justify-between items-center">
          <span class="text-[10px] font-bold text-gray-600 uppercase tracking-wide">
            Total {{ sortedChildren.length }} {{ levelLabel }}
          </span>
          <span class="text-sm font-bold text-blue-600">
            {{ formatNumber(totalValue) }}
          </span>
        </div>
      </div>
    </div>

    
    <!-- PANEL KANAN: Tabel Data (Top 3-5) -->
    <div class="w-3/5 flex flex-col bg-white">
      
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center gap-2 py-6 px-4 justify-center">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 text-blue-500 animate-spin" />
        <span class="text-sm text-gray-500">Memuat data {{ levelLabel.toLowerCase() }}...</span>
      </div>

      
      <!-- Tabel Top N -->
      <div v-else-if="sortedChildren.length > 0" class="flex-1 flex flex-col">
        <!-- Header Section -->
        <div class="bg-gradient-to-r from-gray-50 to-slate-50 px-4 py-3 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h5 class="font-bold text-gray-700 text-sm flex items-center gap-2">
              <UIcon name="i-heroicons-chart-bar" class="w-4 h-4 text-amber-600" />
              Top {{ Math.min(maxDisplay, sortedChildren.length) }} Wilayah
            </h5>
            <UIcon name="i-heroicons-arrow-down" class="w-4 h-4 text-blue-500" />
          </div>
        </div>
        
        <!-- Table Content -->
        <div class="flex-1 overflow-y-auto custom-scrollbar">
          <table class="w-full text-xs">
            <thead class="sticky top-0 bg-white border-b-2 border-gray-200 z-10">
              <tr>
                <!-- <th class="text-left py-2.5 px-4 font-semibold text-gray-600 text-[10px] uppercase tracking-wide">
                  Peringkat
                </th> -->
                <th class="text-left py-2.5 px-4 font-semibold text-gray-600 text-[10px] uppercase tracking-wide">
                  Wilayah
                </th>
                <th class="text-right py-2.5 px-4 font-semibold text-gray-600 text-[10px] uppercase tracking-wide">
                  Nilai
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(child, idx) in displayedChildren"
                :key="idx"
                class="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
                :class="[
                  idx === 0 ? 'bg-yellow-50/60' : '',
                  idx === 1 ? 'bg-gray-50/60' : '',
                  idx === 2 ? 'bg-orange-50/60' : ''
                ]"
              >
                <!-- Rank Column -->
                <!-- <td class="py-2.5 px-4">
                  <span 
                    class="flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold"
                    :class="[
                      idx === 0 ? 'bg-yellow-400 text-yellow-900 shadow-sm' : '',
                      idx === 1 ? 'bg-gray-300 text-gray-700 shadow-sm' : '',
                      idx === 2 ? 'bg-orange-300 text-orange-900 shadow-sm' : '',
                      idx > 2 ? 'bg-blue-100 text-blue-700' : ''
                    ]"
                  >
                    {{ idx + 1 }}
                  </span>
                </td> -->
                
                <!-- Name Column -->
                <td class="py-2.5 px-4 text-gray-700">
                  <span class="truncate block" :class="idx < 3 ? 'font-semibold' : 'font-medium'">
                    {{ child.name }}
                  </span>
                </td>
                
                <!-- Value Column -->
                <td class="py-2.5 px-4 text-right">
                  <span 
                    class="font-bold text-sm"
                    :class="[
                      idx === 0 ? 'text-yellow-700' : '',
                      idx === 1 ? 'text-gray-700' : '',
                      idx === 2 ? 'text-orange-700' : '',
                      idx > 2 ? 'text-gray-900' : ''
                    ]"
                  >
                    {{ formatNumber(child.value) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Footer: Showing indicator (jika ada lebih banyak data) -->
        <div 
          v-if="sortedChildren.length > maxDisplay"
          class="bg-gray-50 px-4 py-2 border-t border-gray-200 text-center"
        >
          <p class="text-[10px] text-gray-500">
            +{{ sortedChildren.length - maxDisplay }} wilayah lainnya
          </p>
        </div>
      </div>

      
      <!-- Empty State -->
      <div v-if="!isLoading && sortedChildren.length === 0" class="py-8 px-4 text-center flex-1 flex flex-col items-center justify-center">
        <UIcon name="i-heroicons-exclamation-circle" class="w-8 h-8 text-gray-400 mb-2" />
        <p class="text-sm text-gray-500 font-medium">Tidak ada data tersedia</p>
      </div>
    </div>
  </div>
</template>


<script setup>
import { computed } from 'vue';
import { formatMapNumber as formatNumber } from '~/utils/map-visuals';


const props = defineProps({
  isVisible: { type: Boolean, default: false },
  position: { type: Object, default: () => ({ x: 0, y: 0 }) },
  parentName: { type: String, default: '' },
  parentLevel: { type: String, default: '' }, // 'prov' | 'kab' | 'kec'
  parentInfo: { type: Object, default: null }, // { value, unit, context }
  childrenData: { type: Array, default: () => [] }, // [{ name, value }]
  isLoading: { type: Boolean, default: false },
  
  // Props dari InfoPanel
  datasetLabel: { type: String, default: 'currentIndikatorName.value' },
  unit: { type: String, default: '' },
  description: { type: String, default: '' },
  filterState: { type: Object, default: () => ({}) },
  
  // Jumlah max data yang ditampilkan
  maxDisplay: { type: Number, default: 3 }
});


// Computed: Label level child
const levelLabel = computed(() => {
  if (props.parentLevel === 'prov') return 'Kabupaten/Kota';
  if (props.parentLevel === 'kab') return 'Kecamatan';
  if (props.parentLevel === 'kec') return 'Desa';
  return 'Wilayah';
});


// Computed: Sorted children by value (descending)
const sortedChildren = computed(() => {
  return [...props.childrenData].sort((a, b) => (b.value || 0) - (a.value || 0));
});


// Computed: Displayed children (limited to maxDisplay)
const displayedChildren = computed(() => {
  return sortedChildren.value.slice(0, props.maxDisplay);
});


// Computed: Total value (dari semua data, bukan hanya yang ditampilkan)
const totalValue = computed(() => {
  return props.childrenData.reduce((sum, child) => sum + (child.value || 0), 0);
});
</script>


<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
