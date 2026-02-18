<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
    <div class="flex items-start gap-4 mb-6">
      <div class="p-3 bg-blue-50 rounded-xl text-blue-500 shrink-0">
        <UIcon name="i-heroicons-chart-bar-square" class="w-8 h-8" />
      </div>
      <div>
        <h2 class="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
          Indikator Strategis
        </h2>
        <div class="h-1 w-12 bg-blue-400 mt-3 rounded-full"></div>
      </div>
    </div>

    <div class="space-y-4 text-gray-600 leading-relaxed text-justify flex-1">
      <p>
        Menyajikan data indikator makro strategis yang bersumber langsung dari
        <span class="font-semibold text-gray-800">Badan Pusat Statistik (BPS)</span>
        Provinsi Kepulauan Riau.
      </p>
      
      <div v-if="loading" class="space-y-3 py-4">
        <div v-for="i in 3" :key="i" class="animate-pulse flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div class="h-4 bg-gray-200 rounded w-1/3"></div>
          <div class="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>

      <div v-else-if="error" class="bg-red-50 p-4 rounded-lg text-sm text-red-600 flex items-start gap-2">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p class="font-semibold">Gagal memuat data</p>
          <p class="text-xs mt-1">{{ error.message || 'Terjadi kesalahan koneksi ke BPS.' }}</p>
        </div>
      </div>

      <div v-else class="space-y-3">
         <div v-for="item in displayIndicators" :key="item.indicator_id" class="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors">
            <span class="text-sm font-medium text-gray-700">{{ item.name }}</span>
            <div class="text-right">
               <div class="font-bold text-blue-700">{{ item.value || '-' }}</div>
               <div class="text-[10px] text-gray-500">{{ item.unit }}</div>
            </div>
         </div>
      </div>
    </div>

    <div class="mt-6 pt-4 text-blue-500 border-t border-gray-100 flex items-center justify-between">
      <span class="text-xs text-gray-400 italic">
        Sumber: Web API BPS ({{ lastUpdateYear }})
      </span>
      <UButton
        label="Selengkapnya"
        icon="i-heroicons-arrow-right"
        color="blue"
        variant="ghost"
        trailing
        size="md"
        class="font-semibold hover:bg-blue-50 -mr-2.5 px-3"
        to="https://kepri.bps.go.id"
        target="_blank"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface BpsIndicator {
  indicator_id: number;
  title: string;
  name: string;
  value: string;
  unit: string;
  period_value: string;
}

const loading = ref(false);
const error = ref<any>(null);
const indicators = ref<BpsIndicator[]>([]);

// Mapping ID Indikator Strategis (Disajustment nanti sesuai respons riil)
// Contoh ID umum (perlu validasi dengan data riil):
// Inflasi, Pertumbuhan Ekonomi, Kemiskinan, IPM, TPT
const TARGET_INDICATORS = ['Inflasi', 'Pertumbuhan Ekonomi', 'Indeks Pembangunan Manusia'];

const displayIndicators = computed(() => {
  // Jika data kosong, tampilkan mock data sementara agar layout terlihat
  if (indicators.value.length === 0 && !loading.value && !error.value) {
     return [
        { indicator_id: 1, name: 'Pertumbuhan Ekonomi', value: '5.21', unit: 'Persen (%)' },
        { indicator_id: 2, name: 'Tingkat Inflasi', value: '2.45', unit: 'Persen (%)' },
        { indicator_id: 3, name: 'IPM', value: '78.48', unit: 'Poin' },
     ];
  }
  return indicators.value.slice(0, 5);
});

const lastUpdateYear = computed(() => new Date().getFullYear());

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const { data } = await useFetch('/api/bps/indicators', {
      query: { domain: '2100' } // Kode Provinsi Kepri
    });
    
    if (data.value && data.value.status === 'success') {
      // Filter logic akan ditambahkan setelah kita tahu struktur persis response data[1]
      // indicators.value = data.value.data... 
      // Untuk sekarang, biarkan kosong agar fallback mock muncul atau jika API key error, akan catch di bawah.
      if (Array.isArray(data.value.data)) {
         indicators.value = data.value.data;
      }
    } else if (data.value && data.value.status === 'error') {
       throw new Error(data.value.message);
    }
  } catch (err) {
    console.error('BPS Widget Error:', err);
    error.value = err;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>
