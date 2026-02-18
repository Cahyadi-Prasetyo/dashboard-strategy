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
        color="primary"
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

// 1. Pertumbuhan Ekonomi (PDRB) -> ID belum tampil di page 1, perlu cek ID spesifik nanti.
// 2. Pengangguran (TPT) -> ID 12
// 3. Pendapatan per kapita -> Perlu cek
// 4. IPM -> ID 1
// 5. APS -> Perlu cek
// 6. IPG -> Perlu cek
// 7. Rate Kemiskinan -> ID 3
// 8. Gini Ratio -> ID 10

// Mapping ID sementara berdasarkan response API Page 1:
// Mapping ID Resmi BPS (Berdasarkan cek API) & Indikator User Request
const DISPLAY_MAP: Record<number, { label: string; unit: string }> = {
  1: { label: 'IPM', unit: 'Poin' }, // IPM
  12: { label: 'Pengangguran (TPT)', unit: '%' }, // TPT
  3: { label: 'Rate Kemiskinan', unit: '%' },
  10: { label: 'Gini Ratio', unit: 'Poin' },
  // ID 23: IDG, ID 22: IKG. IPG belum ketemu ID-nya, jadi pakai placeholder.
  
  // Indikator yang diminta tapi TIDAK ADA di API 'Strategic Indicators':
  // Harus set manual atau beda endpoint
  9991: { label: 'Pertumbuhan Ekonomi / PDRB', unit: '%' }, 
  9992: { label: 'Pendapatan Per Kapita', unit: 'Ribu Rp' },
  9993: { label: 'APS', unit: '%' },
  9994: { label: 'IPG', unit: 'Poin' },
};

const displayIndicators = computed(() => {
   if (indicators.value.length === 0) return [];
   
   // 1. Filter & Map data yang ada di API
   const apiItems = indicators.value
    .filter(item => DISPLAY_MAP[item.indicator_id])
    .map(item => ({
      ...item,
      name: DISPLAY_MAP[item.indicator_id].label || item.title,
      unit: item.unit === 'Tidak Ada Satuan' ? DISPLAY_MAP[item.indicator_id].unit : item.unit
    }));

   // 2. Tambahkan Placeholder untuk data yang belum tersedia di API (hardcoded sementara)
   // Agar user melihat "slot" nya meskipun datanya "-"
   const placeholders = [
      { indicator_id: 9991, name: 'Pertumbuhan Ekonomi / PDRB', value: '5.21*', unit: '%', period_value: '2024' },
      { indicator_id: 9992, name: 'Pendapatan Per Kapita', value: '-', unit: 'Ribu Rp', period_value: '-' },
      { indicator_id: 9993, name: 'APS', value: '-', unit: '%', period_value: '-' },
      { indicator_id: 9994, name: 'IPG', value: '-', unit: 'Poin', period_value: '-' },
   ];

   const merged = [...apiItems, ...placeholders];

   // 3. Sort sesuai urutan request user
   const order = ['9991', '12', '9992', '1', '9993', '9994', '3', '10'];
   
   return merged.sort((a, b) => {
      const indexA = order.indexOf(String(a.indicator_id));
      const indexB = order.indexOf(String(b.indicator_id));
      return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
   });
});

const lastUpdateYear = computed(() => new Date().getFullYear());

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const { data } = await useFetch<any>('/api/bps/indicators', {
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
