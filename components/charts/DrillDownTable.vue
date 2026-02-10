<template>
  <div class="flex flex-col h-full bg-white overflow-hidden">
    <div class="px-0 pt-4 pb-3 flex items-start justify-between gap-4">
      <div class="w-72">
        <div class="relative">
          <UIcon
            name="i-heroicons-magnifying-glass"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari wilayah..."
            class="w-full pl-9 pr-4 py-1 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        <div
          v-if="searchQuery"
          class="mt-1 text-xs text-gray-600 text-right"
        >
          Ditemukan:
          <strong>{{ filteredData.length }}</strong>
          data
        </div>
      </div>

      <UTooltip text="Excel" :popper="{ placement: 'top' }">
        <UButton
          icon="i-heroicons-document-arrow-down"
          size="sm"
          :loading="isExporting"
          :disabled="!filteredData.length || pending"
          @click="triggerDownload"
          class="bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 border-none ring-0 h-[38px]"
          :ui="{
            rounded: 'rounded-lg',
            padding: { sm: 'px-4 py-1' },
            font: 'font-semibold',
            icon: { size: { sm: 'w-4 h-4' } },
          }"
        >
          <span class="tracking-wide text-sm">Excel</span>
        </UButton>
      </UTooltip>
    </div>

    <!-- Table Wrapper -->
    <div class="flex-1 overflow-hidden px-0">
      <div class="overflow-x-auto rounded-lg border border-gray-200">

        <table class="w-full">
          <thead>
            <tr class="bg-gray-100 border-b border-gray-300">
              <th class="px-2 py-1.5 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                No
              </th>
              <th class="px-2 py-1.5 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                Wilayah
              </th>
              <th v-for="col in columnConfig" :key="col.key" class="px-2 py-1.5 text-center text-[10px] font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap">
                {{ col.label }}
              </th>
              <th class="px-2 py-1.5 text-center text-[10px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50">
                Total
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200">
            <!-- Loading State -->
            <template v-if="pending">
              <tr v-for="i in 8" :key="`loading-${i}`">
                <td :colspan="totalColumns" class="px-4 py-12 text-center">
                  <div class="flex flex-col items-center gap-3">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                    <p class="text-sm text-gray-600">Memuat data...</p>
                  </div>
                </td>
              </tr>
            </template>

            <template v-else-if="paginatedData.length === 0">
              <tr>
                <td :colspan="totalColumns" class="px-4 py-8 text-center text-gray-500">
                  <UIcon name="i-heroicons-inbox" class="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>
                    {{ searchQuery ? "Tidak ada data yang sesuai dengan pencarian" : "Tidak ada data tersedia" }}
                  </p>
                </td>
              </tr>
            </template>

          <!-- 🔥 FIX: Unique composite key + cleaner structure -->
          <template v-else>
            <tr
              v-for="(row, idx) in paginatedData"
              :key="`${row.level}-${row.id}-${idx}`"
              @click="toggleExpansion(row)"
              class="group transition-colors border-b border-gray-200 hover:bg-gray-50/50"
              :class="[
                row.hasChildren ? 'cursor-pointer' : 'cursor-default',
                row.isExpanded ? 'bg-blue-50/20' : ''
              ]"
            >
              <td class="px-2 py-1.5 text-center text-[11px] font-medium text-gray-500 border-r border-gray-100">
                {{ (currentPage - 1) * itemsPerPage + idx + 1 }}
              </td>

              <td class="sticky left-0 z-10 border-r border-gray-100 bg-white group-hover:bg-gray-50/50 transition-colors"
                  :class="[
                    row.isExpanded ? 'bg-blue-50/20' : 'bg-white'
                  ]">
                <div 
                  class="flex items-center gap-2 py-1.5"
                  :style="{ paddingLeft: getIndentPadding(row.level) }"
                >
                  <div class="flex-shrink-0 w-5 flex items-center justify-center">
                    <UIcon
                      v-if="row.hasChildren"
                      :name="row.isExpanded ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
                      class="w-3.5 h-3.5 transition-transform duration-200"
                      :class="row.isExpanded ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'"
                    />
                    <div v-else class="w-1 h-1 rounded-full bg-gray-300"></div>
                  </div>

                  <div class="flex flex-col flex-1 min-w-0">
                    <div v-if="row.level !== 'provinsi'" 
                         class="flex items-center gap-1 text-[8px] font-bold text-gray-400 uppercase tracking-tight mb-0.5">
                      <span v-if="row.provinsi">{{ row.provinsi }}</span>
                      <UIcon v-if="row.provinsi && row.kabupaten && row.level !== 'kabupaten'" name="i-heroicons-chevron-right" class="w-1.5 h-1.5" />
                      <span v-if="row.kabupaten && row.level !== 'kabupaten'">{{ row.kabupaten }}</span>
                      <UIcon v-if="row.kabupaten && row.kecamatan && row.level !== 'kecamatan'" name="i-heroicons-chevron-right" class="w-1.5 h-1.5" />
                      <span v-if="row.kecamatan && row.level !== 'kecamatan'">{{ row.kecamatan }}</span>
                    </div>
                    
                    <span 
                      class="text-[11px] font-bold uppercase tracking-tight truncate transition-colors"
                      :class="[
                        row.level === 'provinsi' ? 'text-gray-900' : 'text-gray-700',
                        row.hasChildren && 'group-hover:text-blue-600'
                      ]"
                    >
                      {{ row.nama }}
                    </span>
                  </div>
                </div>
              </td>

              <td
                v-for="col in columnConfig"
                :key="col.key"
                class="px-2 py-1.5 text-right text-[11px] font-medium text-gray-700 border-r border-gray-100"
              >
                <span :class="row.values[col.key] > 0 ? 'text-gray-900 font-bold' : 'text-gray-300'">
                  {{ formatNumber(row.values[col.key] || 0) }}
                </span>
              </td>

              <td class="sticky right-0 z-10 px-2 py-1.5 text-right text-[11px] font-bold text-blue-700 bg-blue-50/30">
                {{ formatNumber(row.total) }}
              </td>
            </tr>
          </template>
          </tbody>

          <!-- Grand Total Footer -->
          <tfoot v-if="filteredData.length > 0" class="bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-300">
            <tr class="font-bold">
              <td colspan="2" class="px-2 py-2 text-[11px] text-gray-900 border-r border-gray-200">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-calculator" class="w-3.5 h-3.5 text-gray-600" />
                  <span class="uppercase tracking-wide">Grand Total</span>
                </div>
              </td>
              <td v-for="col in columnConfig" :key="col.key" class="px-2 py-2 text-[11px] text-center text-gray-900 border-r border-gray-200">
                {{ formatNumber(grandTotals[col.key] || 0) }}
              </td>
              <td class="px-2 py-2 text-[11px] text-center text-blue-900 bg-blue-200">
                {{ formatNumber(overallTotal) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <ChartsDataTable
      :table-title="''"
      :enable-pagination="true"
      :total-items="filteredData.length"
      :items-per-page="itemsPerPage"
      v-model="currentPage"
      class="hidden"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";

const props = defineProps({
  title: { type: String, default: "Detail Data" },
  regionIds: { type: Array, required: true },
  columnConfig: { type: Array, required: true },
  rawData: { type: Array, required: true },
  pending: { type: Boolean, default: false }
});

const emit = defineEmits(["close"]);

const isExporting = ref(false);
const metaData = computed(() => ({ 
  dataset: { judul: props.title } 
}));

const { downloadDynamicExcel } = useDynamicExcel();

// Prepare flat data for Excel export
const downloadData = computed(() => {
  return filteredData.value.map((row, index) => {
    const flatRow = {
      No: index + 1,
      Provinsi: row.provinsi || "-",
      "Kabupaten/Kota": row.kabupaten || "-",
      Kecamatan: row.kecamatan || "-",
      "Desa/Kelurahan": row.level === 'desa' ? row.nama : "-"
    };
    
    // Add dynamic columns
    if (props.columnConfig) {
      props.columnConfig.forEach((col) => {
        flatRow[col.label] = row.values?.[col.key] || 0;
      });
    }
    
    flatRow.Total = row.total || 0;
    
    return flatRow;
  });
});

const triggerDownload = async () => {
  isExporting.value = true;
  try {
    const columns = [
      { header: "No", key: "No", width: 10 },
      { header: "Provinsi", key: "Provinsi", width: 20 },
      { header: "Kabupaten/Kota", key: "Kabupaten/Kota", width: 20 },
      { header: "Kecamatan", key: "Kecamatan", width: 20 },
      { header: "Desa/Kelurahan", key: "Desa/Kelurahan", width: 25 }
    ];
    
    // Add dynamic columns
    if (props.columnConfig) {
      props.columnConfig.forEach((col) => {
        columns.push({ header: col.label, key: col.label, width: 15 });
      });
    }
    
    columns.push({ header: "Total", key: "Total", width: 15 });
    
    const fileName = `${props.title.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}`;
    
    // Check if function exists before calling
    if (typeof downloadDynamicExcel === "function") {
      await downloadDynamicExcel(downloadData.value, fileName, columns);
    } else {
      console.error("Fungsi downloadDynamicExcel tidak ditemukan.");
    }
  } catch (error) {
    console.error("Error downloading Excel:", error);
  } finally {
    isExporting.value = false;
  }
};

// --- STATE: PAGINATION & SEARCH ---
const currentPage = ref(1);
const itemsPerPage = ref(20);
const searchQuery = ref("");

// --- STATE: EXPANSION ---
const expandedRegions = ref([]);

// Reset when data changes
watch(
  () => props.rawData,
  () => {
    expandedRegions.value = [];
    searchQuery.value = "";
    currentPage.value = 1;
  },
  { deep: true }
);

// --- HELPER FUNCTIONS ---

const getRegionIdAtLevel = (item, level) => {
  if (!item) return null;
  try {
    switch (level) {
      case 'provinsi': return item.kd_prov?.kode || null;
      case 'kabupaten': return item.kd_kab?.kode || null;
      case 'kecamatan': return item.kd_kec?.kode || null;
      case 'desa': return item.kd_desa?.kode || null;
      default: return null;
    }
  } catch (error) {
    console.error('Error getting region ID:', error);
    return null;
  }
};

const getRegionNameAtLevel = (item, level) => {
  if (!item) return null;
  try {
    switch (level) {
      case 'provinsi': return item.kd_prov?.nama || null;
      case 'kabupaten': return item.kd_kab?.nama || null;
      case 'kecamatan': return item.kd_kec?.nama || null;
      case 'desa': return item.kd_desa?.nama || null;
      default: return null;
    }
  } catch (error) {
    console.error('Error getting region name:', error);
    return null;
  }
};

const getParentId = (childId) => {
  if (!childId) return null;
  try {
    const str = String(childId);
    const len = str.length;
    if (len >= 10) return str.substring(0, 7);
    if (len >= 7) return str.substring(0, 4);
    if (len >= 4) return str.substring(0, 2);
    return null;
  } catch (error) {
    console.error('Error getting parent ID:', error);
    return null;
  }
};

const getNextLevel = (currentLevel) => {
  const levels = ['provinsi', 'kabupaten', 'kecamatan', 'desa'];
  const idx = levels.indexOf(currentLevel);
  return idx >= 0 && idx < levels.length - 1 ? levels[idx + 1] : null;
};

const hasChildren = (regionId, currentLevel) => {
  if (!regionId || !Array.isArray(props.rawData) || props.rawData.length === 0) {
    return false;
  }
  
  try {
    const nextLevel = getNextLevel(currentLevel);
    if (!nextLevel) return false;
    
    const regionIdStr = String(regionId);
    
    return props.rawData.some(item => {
      if (!item) return false;
      const childId = getRegionIdAtLevel(item, nextLevel);
      if (!childId) return false;
      const childIdStr = String(childId);
      return childIdStr.startsWith(regionIdStr) && childIdStr !== regionIdStr;
    });
  } catch (error) {
    console.error('Error checking children:', error);
    return false;
  }
};

const getLevelNumber = (level) => {
  return ['provinsi', 'kabupaten', 'kecamatan', 'desa'].indexOf(level);
};

const getIndentPadding = (level) => {
  const levelNum = getLevelNumber(level);
  return `${24 + (levelNum * 32)}px`;
};

// --- DATA PROCESSING ---

// Group data by specific level (with safety checks)
const groupByLevel = (level) => {
  if (!Array.isArray(props.rawData) || props.rawData.length === 0) {
    return [];
  }
  
  try {
    const grouped = {};
    
    props.rawData.forEach(item => {
      if (!item) return;
      
      const regionId = getRegionIdAtLevel(item, level);
      const regionName = getRegionNameAtLevel(item, level);
      
      if (!regionId || !regionName) return;
      
      const idKey = String(regionId);
      
      if (!grouped[idKey]) {
        grouped[idKey] = {
          id: idKey,
          nama: regionName,
          level: level,
          provinsi: item.kd_prov?.nama || null,
          kabupaten: item.kd_kab?.nama || null,
          kecamatan: item.kd_kec?.nama || null,
          parentId: getParentId(regionId),
          values: {},
          total: 0
        };
      }
      
      const categoryKey = item.itemCategory2?.nama || item.itemCategory1?.nama || item.itemCategory3?.nama;
      
      if (categoryKey && item.value != null) {
        const matchingCol = props.columnConfig.find(col => 
          col.key === categoryKey || col.label === categoryKey
        );
        
        if (matchingCol) {
          if (!grouped[idKey].values[matchingCol.key]) {
            grouped[idKey].values[matchingCol.key] = 0;
          }
          grouped[idKey].values[matchingCol.key] += Number(item.value);
          grouped[idKey].total += Number(item.value);
        }
      }
    });
    
    return Object.values(grouped);
  } catch (error) {
    console.error('Error grouping by level:', error);
    return [];
  }
};

// Build flat hierarchical list (tree structure)
const hierarchicalData = computed(() => {
  if (!Array.isArray(props.rawData) || props.rawData.length === 0) {
    return [];
  }
  
  try {
    const result = [];
    
    // Get all provinces
    const provinces = groupByLevel('provinsi');
    if (provinces.length === 0) return [];
    
    provinces.sort((a, b) => b.total - a.total);
    
    // Build tree
    provinces.forEach(prov => {
      if (!prov || !prov.id) return;
      
      const provHasChildren = hasChildren(prov.id, 'provinsi');
      const provIsExpanded = expandedRegions.value.includes(prov.id);
      
      result.push({
        ...prov,
        hasChildren: provHasChildren,
        isExpanded: provIsExpanded
      });
      
      if (provIsExpanded) {
        const kabupatens = groupByLevel('kabupaten')
          .filter(kab => kab && kab.parentId === prov.id)
          .sort((a, b) => b.total - a.total);
        
        kabupatens.forEach(kab => {
          if (!kab || !kab.id) return;
          
          const kabHasChildren = hasChildren(kab.id, 'kabupaten');
          const kabIsExpanded = expandedRegions.value.includes(kab.id);
          
          result.push({
            ...kab,
            hasChildren: kabHasChildren,
            isExpanded: kabIsExpanded
          });
          
          if (kabIsExpanded) {
            const kecamatans = groupByLevel('kecamatan')
              .filter(kec => kec && kec.parentId === kab.id)
              .sort((a, b) => b.total - a.total);
            
            kecamatans.forEach(kec => {
              if (!kec || !kec.id) return;
              
              const kecHasChildren = hasChildren(kec.id, 'kecamatan');
              const kecIsExpanded = expandedRegions.value.includes(kec.id);
              
              result.push({
                ...kec,
                hasChildren: kecHasChildren,
                isExpanded: kecIsExpanded
              });
              
              if (kecIsExpanded) {
                const desas = groupByLevel('desa')
                  .filter(desa => desa && desa.parentId === kec.id)
                  .sort((a, b) => b.total - a.total);
                
                desas.forEach(desa => {
                  if (desa) {
                    result.push({
                      ...desa,
                      hasChildren: false,
                      isExpanded: false
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
    
    return result;
  } catch (error) {
    console.error('Error building hierarchical data:', error);
    return [];
  }
});

// --- LOGIC: AGGREGATES ---
const grandTotals = computed(() => {
  try {
    const totals = {};
    const provinces = groupByLevel('provinsi');
    
    provinces.forEach(row => {
      if (!row || !row.values) return;
      Object.entries(row.values).forEach(([key, val]) => {
        totals[key] = (totals[key] || 0) + (Number(val) || 0);
      });
    });
    
    return totals;
  } catch (error) {
    console.error('Error calculating totals:', error);
    return {};
  }
});

const overallTotal = computed(() => {
  try {
    const values = Object.values(grandTotals.value);
    return values.reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  } catch (error) {
    console.error('Error calculating overall total:', error);
    return 0;
  }
});

// --- LOGIC: SEARCH FILTER ---
const filteredData = computed(() => {
  if (!searchQuery.value) return hierarchicalData.value;
  
  try {
    const lowerQuery = searchQuery.value.toLowerCase();
    
    return hierarchicalData.value.filter(row => {
      if (!row) return false;
      return (
        row.nama?.toLowerCase().includes(lowerQuery) ||
        row.provinsi?.toLowerCase().includes(lowerQuery) ||
        row.kabupaten?.toLowerCase().includes(lowerQuery) ||
        row.kecamatan?.toLowerCase().includes(lowerQuery) ||
        row.id?.includes(lowerQuery)
      );
    });
  } catch (error) {
    console.error('Error filtering data:', error);
    return hierarchicalData.value;
  }
});

// --- LOGIC: PAGINATION ---
watch(searchQuery, () => (currentPage.value = 1));

const paginatedData = computed(() => {
  try {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    return filteredData.value.slice(start, start + itemsPerPage.value);
  } catch (error) {
    console.error('Error paginating data:', error);
    return [];
  }
});

const totalColumns = computed(() => {
  return 3 + (props.columnConfig?.length || 0);
});

const toggleExpansion = async (row) => {
  if (!row || !row.hasChildren) return;
  
  try {
    const isCurrentlyExpanded = expandedRegions.value.includes(row.id);
    
    if (isCurrentlyExpanded) {
      const rowIdStr = String(row.id);
      expandedRegions.value = expandedRegions.value.filter(id => {
        const idStr = String(id);
        return idStr !== rowIdStr && !idStr.startsWith(rowIdStr);
      });
    } else {
      expandedRegions.value = [...expandedRegions.value, row.id];
    }
    
    await nextTick();
  } catch (error) {
    console.error('Error toggling expansion:', error);
  }
};

watch([expandedRegions, searchQuery, () => props.rawData], () => {
  currentPage.value = 1;
}, { deep: true });

// --- UTILS ---
const formatNumber = (num) => {
  try {
    return new Intl.NumberFormat("id-ID").format(Number(num) || 0);
  } catch (error) {
    return String(num || 0);
  }
};
</script>

<style scoped>
/* Simpler transitions */
.group {
  transition: background-color 0.2s ease;
}

.group:hover .flex-col {
  transform: translateX(2px);
  transition: transform 0.2s ease;
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>