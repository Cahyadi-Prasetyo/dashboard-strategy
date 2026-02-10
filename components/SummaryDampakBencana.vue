<template>
  <div class="space-y-6">
    <!-- Filter Section -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <!-- Sumber Data Section -->
        <div class="flex-1">
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-building-library" class="w-4 h-4 text-gray-500" />
              <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sumber Data</span>
            </div>
            <p class="text-sm font-semibold text-gray-900">
              {{ datasetInfo?.instansi || 'Memuat...' }}
            </p>
            <div v-if="datasetInfo?.terakhir_diupdate" class="flex items-center gap-2 text-xs text-gray-600">
              <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5" />
              <span>Update terakhir: <span class="font-medium">{{ formatUpdateDate(datasetInfo.terakhir_diupdate) }}</span></span>
            </div>
          </div>
        </div>

        <!-- Filter Tanggal Section -->
        <div class="flex-1 max-w-sm w-full">
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Data Per Tanggal:
          </label>
          <USelectMenu
            v-model="selectedTanggal"
            :items="tanggalOptions"
            placeholder="Pilih tanggal..."
            :loading="status === 'pending'"
            :ui="{
              base: 'relative',
              trigger: 'w-full bg-white border border-gray-300 hover:border-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 rounded-lg px-4 py-2.5 font-medium text-gray-900 transition-all',
              option: {
                base: 'px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors',
                active: 'bg-amber-50 text-amber-900',
              }
            }"
          >
            <template #label>
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-calendar" class="w-4 h-4 text-gray-500" />
                <span>{{ selectedTanggal ? formatDate(selectedTanggal) : 'Pilih tanggal...' }}</span>
              </div>
            </template>
          </USelectMenu>
        </div>

        <!-- Location Badge -->
        <div v-if="selectedTanggal && formattedLocation" class="text-sm text-gray-600 lg:mt-6">
          <div class="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
            <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-gray-500" />
            <span class="font-medium">{{ formattedLocation }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="status === 'pending'" class="flex items-center justify-center py-16">
      <div class="text-center space-y-3">
        <div class="w-12 h-12 mx-auto border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin"></div>
        <p class="text-sm text-gray-600">Memuat data...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="status === 'error'" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center gap-3">
        <UIcon name="i-heroicons-exclamation-circle" class="w-5 h-5 text-red-600" />
        <div>
          <p class="text-sm font-medium text-red-900">Gagal memuat data</p>
          <p class="text-xs text-red-700 mt-0.5">Silakan coba lagi</p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <!-- <div v-else-if="selectedTanggal">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <div class="bg-gradient-to-br from-red-50 to-white border border-red-100 rounded-lg p-4 hover:shadow-md transition-all">
          <div class="flex items-center gap-2.5 mb-2">
            <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-heart" class="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p class="text-xs font-semibold text-red-600 uppercase tracking-wide">Meninggal Dunia</p>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <p class="text-2xl font-bold text-gray-900">
              {{ formatNumber(korbanStats.meninggal) }}
            </p>
            <span class="text-xs text-gray-500 font-medium">JIWA</span>
          </div>
        </div>
        <div class="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-lg p-4 hover:shadow-md transition-all">
          <div class="flex items-center gap-2.5 mb-2">
            <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-question-mark-circle" class="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p class="text-xs font-semibold text-orange-600 uppercase tracking-wide">Hilang</p>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <p class="text-2xl font-bold text-gray-900">
              {{ formatNumber(korbanStats.hilang) }}
            </p>
            <span class="text-xs text-gray-500 font-medium">JIWA</span>
          </div>
        </div>
        <div class="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-lg p-4 hover:shadow-md transition-all">
          <div class="flex items-center gap-2.5 mb-2">
            <div class="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-user-group" class="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p class="text-xs font-semibold text-amber-600 uppercase tracking-wide">Pengungsi</p>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <p class="text-2xl font-bold text-gray-900">
              {{ formatNumber(korbanStats.pengungsi) }}
            </p>
            <span class="text-xs text-gray-500 font-medium">JIWA</span>
          </div>
        </div>
      </div> -->
      <!-- Content -->
     <!-- Content -->
    <div v-else-if="selectedTanggal">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <!-- Meninggal -->
        <div class="bg-gradient-to-br from-red-50 to-white border border-red-100 rounded-lg p-5 hover:shadow-md transition-all">
          <div class="flex flex-col items-center justify-center space-y-3">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <UIcon name="i-heroicons-heart" class="w-5 h-5 text-red-600" />
              </div>
              <p class="text-xs font-semibold text-red-600 uppercase tracking-wide">Meninggal Dunia</p>
            </div>
            <div class="flex items-baseline gap-2">
              <p class="text-3xl font-bold text-gray-900">
                {{ formatNumber(korbanStats.meninggal) }}
              </p>
              <span class="text-sm text-gray-500 font-medium">JIWA</span>
            </div>
          </div>
        </div>

        <!-- Hilang -->
        <div class="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-lg p-5 hover:shadow-md transition-all">
          <div class="flex flex-col items-center justify-center space-y-3">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <UIcon name="i-heroicons-question-mark-circle" class="w-5 h-5 text-orange-600" />
              </div>
              <p class="text-xs font-semibold text-orange-600 uppercase tracking-wide">Hilang</p>
            </div>
            <div class="flex items-baseline gap-2">
              <p class="text-3xl font-bold text-gray-900">
                {{ formatNumber(korbanStats.hilang) }}
              </p>
              <span class="text-sm text-gray-500 font-medium">JIWA</span>
            </div>
          </div>
        </div>

        <!-- Pengungsi -->
        <div class="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-lg p-5 hover:shadow-md transition-all">
          <div class="flex flex-col items-center justify-center space-y-3">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <UIcon name="i-heroicons-user-group" class="w-5 h-5 text-amber-600" />
              </div>
              <p class="text-xs font-semibold text-amber-600 uppercase tracking-wide">Pengungsi</p>
            </div>
            <div class="flex items-baseline gap-2">
              <p class="text-3xl font-bold text-gray-900">
                {{ formatNumber(korbanStats.pengungsi) }}
              </p>
              <span class="text-sm text-gray-500 font-medium">JIWA</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bar Charts Section (DIPERKECIL) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Rumah Terdampak -->
        <div v-if="rumahChartData.series.length > 0 && rumahChartData.categories.length > 0" 
             class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div class="border-b border-gray-200 px-4 py-3.5 bg-gradient-to-r from-red-50 to-orange-50">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <UIcon name="i-heroicons-home" class="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 class="text-base font-bold text-gray-900">Rumah Terdampak</h3>
                <p class="text-xs text-gray-600 mt-0.5">Total: <span class="font-semibold">{{ formatNumber(totalRumah) }}</span> unit</p>
              </div>
            </div>
          </div>
          <div class="p-4">
            <ChartsBarChart
              :categories="rumahChartData.categories"
              :series="rumahChartData.series"
              height="h-64"
              :show-legend="true"
              legend-position="bottom"
              :grid="{ left: '3%', right: '4%', bottom: '20%', top: '5%', containLabel: true }"
            />
          </div>
        </div>

        <!-- Infrastruktur Terdampak -->
        <div v-if="infrastrukturChartData.series.length > 0" 
             class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div class="border-b border-gray-200 px-4 py-3.5 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <UIcon name="i-heroicons-building-office-2" class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 class="text-base font-bold text-gray-900">Infrastruktur Terdampak</h3>
                <p class="text-xs text-gray-600 mt-0.5">Total: <span class="font-semibold">{{ formatNumber(totalInfrastruktur) }}</span> unit</p>
              </div>
            </div>
          </div>
          <div class="p-4">
            <ChartsBarChart
              :categories="infrastrukturChartData.categories"
              :series="infrastrukturChartData.series"
              height="h-64"
              :show-legend="true"
              legend-position="bottom"
              :grid="{ left: '3%', right: '4%', bottom: '20%', top: '5%', containLabel: true }"
            />
          </div>
        </div>
      </div>

      <!-- Info Footer -->
      <div class="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mt-6">
        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center gap-2 text-gray-600">
            <UIcon name="i-heroicons-information-circle" class="w-5 h-5" />
            <span>Data agregat dari wilayah terpilih</span>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-calendar" class="w-4 h-4 text-gray-500" />
            <span class="font-semibold text-gray-900">{{ formatDate(selectedTanggal) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-gradient-to-br from-gray-50 to-white border border-dashed border-gray-300 rounded-xl p-16 text-center">
      <div class="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
        <UIcon name="i-heroicons-calendar" class="w-10 h-10 text-gray-400" />
      </div>
      <h3 class="text-lg font-bold text-gray-900 mb-2">Pilih Tanggal</h3>
      <p class="text-sm text-gray-600 max-w-sm mx-auto">
        Silakan pilih tanggal untuk melihat statistik dampak bencana
      </p>
    </div>
  </div>
</template>

<script setup>
// Script tetap sama seperti sebelumnya
import { computed, watch } from 'vue';
import ChartsBarChart from "~/components/charts/BarChart.vue";
import { useAgregatInsightEnhanced } from "~/composables/useAgregatInsightEnhanced";
import { useDynamicChartTransformer } from "~/composables/useDynamicChartTransformer";

const props = defineProps({
  regionIds: {
    type: Array,
    required: true,
  },
  tahun: {
    type: Number,
    default: 2026,
  },
  formattedLocation: {
    type: String,
    default: '',
  },
});

// ===== COMPOSABLES =====
const { extractUniqueValues } = useDynamicChartTransformer();

// Dataset ID untuk dampak bencana
const DATASET_ID = 91;

// ===== STATE MANAGEMENT =====
const selectedTanggal = ref('');

// Gunakan composable untuk fetch data
const selectedWilayah = computed(() => {
  const wilayah = {
    provinsi: [],
    kabupaten: [],
    kecamatan: [],
    desa: [],
    provinsiNames: [],
    kabupatenNames: [],
    kecamatanNames: [],
    desaNames: [],
  };

  if (!props.regionIds || props.regionIds.length === 0) {
    return wilayah;
  }

  props.regionIds.forEach(id => {
    if (!id) return;
    
    const length = id.toString().length;
    
    if (length === 2) {
      wilayah.provinsi.push(id);
    } else if (length === 4 || length === 5) {
      wilayah.kabupaten.push(id);
    } else if (length === 6 || length === 7) {
      wilayah.kecamatan.push(id);
    } else if (length >= 10) {
      wilayah.desa.push(id);
    }
  });

  return wilayah;
});

const { rawRecords, status, error, datasetInfo } = useAgregatInsightEnhanced(
  DATASET_ID,
  selectedWilayah
);

// ===== COMPUTED: FILTER OPTIONS =====
const tanggalOptions = computed(() => {
  if (!rawRecords.value || rawRecords.value.length === 0) return [];
  
  const dates = rawRecords.value
    .map(r => r.tanggal)
    .filter(Boolean)
    .map(d => new Date(d).toISOString().split('T')[0])
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => new Date(b) - new Date(a));
  
  return dates;
});

// ===== COMPUTED: FILTERED DATA BY DATE =====
const filteredRecords = computed(() => {
  if (!rawRecords.value || rawRecords.value.length === 0) return [];

  let filtered = [...rawRecords.value];

  if (selectedTanggal.value) {
    filtered = filtered.filter(r => {
      if (!r.tanggal) return false;
      const recordDate = new Date(r.tanggal).toISOString().split('T')[0];
      return recordDate === selectedTanggal.value;
    });
  }

  return filtered;
});

// ===== COMPUTED: KORBAN STATISTICS (AGREGAT) =====
const korbanStats = computed(() => {
  const stats = {
    meninggal: 0,
    hilang: 0,
    pengungsi: 0,
  };

  if (!filteredRecords.value || filteredRecords.value.length === 0) return stats;

  filteredRecords.value.forEach(record => {
    const indikatorName = (record.indikator?.nama || '').toLowerCase();
    const value = Number(record.value || 0);

    if (indikatorName.includes('meninggal')) {
      stats.meninggal += value;
    } else if (indikatorName.includes('hilang')) {
      stats.hilang += value;
    } else if (indikatorName.includes('pengungsi')) {
      stats.pengungsi += value;
    }
  });

  return stats;
});

// ===== COMPUTED: RUMAH CHART DATA =====
const rumahChartData = computed(() => {
  const rumahData = filteredRecords.value.filter(r => {
    const indikatorName = (r.indikator?.nama || '').toLowerCase();
    return indikatorName.includes('jumlah rumah terdampak') && 
           r.itemCategory1 && 
           r.itemCategory1.nama &&
           r.itemCategory1.nama !== 'Total';
  });

  const grouped = {};
  rumahData.forEach(record => {
    const category = record.itemCategory1?.nama || 'Lainnya';
    if (!grouped[category]) {
      grouped[category] = 0;
    }
    grouped[category] += Number(record.value || 0);
  });

  const categoryOrder = ['Rusak Berat', 'Rusak Sedang', 'Rusak Ringan'];
  const categories = categoryOrder.filter(cat => grouped[cat]);

  const colorMap = {
    'Rusak Berat': '#EF4444',
    'Rusak Sedang': '#F59E0B',
    'Rusak Ringan': '#FCD34D',
  };

  return {
    categories: ['Kerusakan Rumah'],
    series: categories.map(cat => ({
      name: cat,
      data: [grouped[cat]],
      color: colorMap[cat] || '#10B981',
    })),
  };
});

// ===== COMPUTED: INFRASTRUKTUR CHART DATA =====
const infrastrukturChartData = computed(() => {
  const excludeKeywords = ['meninggal', 'hilang', 'pengungsi'];
  
  const infraData = filteredRecords.value.filter(r => {
    const indikatorName = (r.indikator?.nama || '').toLowerCase();
    const isNotKorban = !excludeKeywords.some(keyword => indikatorName.includes(keyword));
    const isNotRumahTerdampak = !indikatorName.includes('jumlah rumah terdampak');
    
    return isNotKorban && isNotRumahTerdampak;
  });

  const grouped = {};
  infraData.forEach(record => {
    let indikator = record.indikator?.nama || 'Lainnya';
    
    indikator = indikator
      .replace('Jumlah ', '')
      .replace(' Terdampak', '')
      .replace('Fasilitas Kesehatan', 'Faskes');
    
    if (!grouped[indikator]) {
      grouped[indikator] = 0;
    }
    grouped[indikator] += Number(record.value || 0);
  });

  const categories = Object.keys(grouped).sort((a, b) => grouped[b] - grouped[a]);
  const colors = ['#3B82F6', '#3B82F6', '#3B82F6', '#3B82F6', '#3B82F6', '#3B82F6'];

  return {
    categories: ['Infrastruktur'],
    series: categories.map((cat, idx) => ({
      name: cat,
      data: [grouped[cat]],
      color: colors[idx % colors.length],
    })),
  };
});

// ===== COMPUTED: TOTAL VALUES =====
const totalRumah = computed(() => {
  return rumahChartData.value.series.reduce((sum, s) => {
    return sum + s.data.reduce((a, b) => a + b, 0);
  }, 0);
});

const totalInfrastruktur = computed(() => {
  return infrastrukturChartData.value.series.reduce((sum, s) => sum + (s.data[0] || 0), 0);
});

// ===== HELPER FUNCTIONS =====
const formatNumber = (value) => {
  if (!value || value === 0) return '0';
  return Number(value).toLocaleString('id-ID');
};

const formatDate = (isoString) => {
    if (!isoString) return "-";
    try {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(date);
    } catch (e) {
        return isoString;
    }
};

const formatUpdateDate = (date) => {
  if (!date) return '-';
  
  const d = new Date(date);
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  
  return d.toLocaleDateString('id-ID', options);
};

// ===== WATCHERS =====
watch(tanggalOptions, (newOptions) => {
  if (newOptions.length > 0 && !selectedTanggal.value) {
    selectedTanggal.value = newOptions[0];
  }
}, { immediate: true });
</script>