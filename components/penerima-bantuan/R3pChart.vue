<template>
    <div
        class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative"
    >
        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg text-emerald-500 bg-emerald-50">
                    <UIcon name="i-heroicons-home" class="w-5 h-5" />
                </div>
                <div>
                    <h4 class="font-bold text-gray-800 text-sm">
                        Rencana Rehabilitasi dan Rekonstruksi Pasca Bencana
                    </h4>
                    <div class="flex flex-wrap items-center gap-2 text-sm">
                        <UBadge color="primary" variant="subtle" size="xs">
                            Hasil Pendataan
                        </UBadge>

                        <UBadge color="primary" variant="subtle" size="xs">
                            Badan Pusat Statistik
                        </UBadge>

                        <span
                            class="text-xs text-gray-500 flex items-center gap-1 ml-1"
                        >
                            <UIcon
                                name="i-heroicons-clock"
                                class="w-3.5 h-3.5"
                            />
                            Diperbarui: {{ informationDate.pendataan_pkl_last_update }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Dropdown Selection -->
        <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
                Pilih Kategori Data
            </label>
            <div class="w-full max-w-2xl">
                <select 
                    v-model="selectedCategory" 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900"
                >
                    <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                    </option>
                </select>
            </div>
        </div>

        <!-- Loading State -->
        <div
            v-if="pendingPerWilayah"
            class="min-h-96 flex flex-col items-center justify-center gap-4"
        >
            <div class="flex items-end gap-2 h-full w-full px-8 pb-8">
                <USkeleton class="w-full h-[40%]" />
                <USkeleton class="w-full h-[70%]" />
                <USkeleton class="w-full h-[50%]" />
                <USkeleton class="w-full h-[80%]" />
                <USkeleton class="w-full h-[60%]" />
            </div>
            <p class="text-gray-500 text-sm">Loading sedang mengambil data...</p>
        </div>

        <!-- Table View -->
        <div v-else-if="selectedCategory && dataPerWilayah && dataPerWilayah.length > 0" class="overflow-x-auto">
            <div class="mb-4">
                <h3 class="text-base font-semibold text-gray-800">
                    Tabel {{ getCurrentCategoryLabel }}
                </h3>
            </div>
            <table class="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                <thead class="bg-orange-500">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-orange-300">
                            Kode
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-orange-300">
                            Kabupaten/Kota
                        </th>
                        <th 
                            v-for="(indicator, index) in currentIndicators"
                            :key="index"
                            class="px-6 py-3 text-center text-xs font-bold text-white uppercase tracking-wider"
                            :class="{ 'border-r border-orange-300': index < currentIndicators.length - 1 }"
                        >
                            <div>{{ indicator.label }}</div>
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                <tr class="bg-orange-300">
                    <td class="px-6 py-2 text-center text-xs font-bold text-black border-r border-orange-300">(1)</td>
                    <td class="px-6 py-2 text-center text-xs font-bold text-black border-r border-orange-300">(2)</td>
                    <td 
                        v-for="(indicator, index) in currentIndicators" 
                        :key="index"
                        class="px-6 py-2 text-center text-xs font-bold text-black"
                        :class="{ 'border-r border-orange-300': index < currentIndicators.length - 1 }"
                    >
                        ({{ index + 3 }})
                    </td>
                </tr>
                    <tr v-for="(wilayah, idx) in sortedDataPerWilayah" :key="idx" class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                            {{ wilayah.id || '-' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                            {{ wilayah.nama }}
                        </td>
                        <td 
                            v-for="(indicator, index) in currentIndicators" 
                            :key="index"
                            class="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700"
                            :class="{ 'border-r border-gray-200': index < currentIndicators.length - 1 }"
                        >
                            {{ formatNumber(wilayah[indicator.key]) }}
                        </td>
                    </tr>
                    <!-- Total Row -->
                    <tr class="bg-orange-500 font-bold">
                        <td colspan="2" class="px-6 py-4 text-sm text-white border-r border-orange-300 uppercase">
                            JUMLAH
                        </td>
                        <td 
                            v-for="(indicator, index) in currentIndicators" 
                            :key="index"
                            class="px-6 py-4 whitespace-nowrap text-sm text-center text-white"
                            :class="{ 'border-r border-orange-300': index < currentIndicators.length - 1 }"
                        >
                            {{ formatNumber(calculateTotal(indicator.key)) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Empty State -->
        <div v-else class="h-96 flex items-center justify-center">
            <div class="text-center">
                <UIcon name="i-heroicons-inbox" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p class="text-gray-400">
                    {{ selectedCategory ? 'Tidak ada data' : 'Silakan pilih kategori data' }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, toRef, watch } from "vue";
import informationDate from "~/data/information-date.json";

const props = defineProps({
    regionIds: { type: Array, required: true, default: () => [] },
    tahun: { type: Number, default: 2026 },
});

// --- CATEGORY OPTIONS ---
const categoryOptions = [
    {
        label: 'Jumlah Keluarga Hasil Pendataan Menurut Kabupaten/Kota',
        value: 'kategori_1',
        indicators: [
            { 
                key: 'keluarga_ditemukan_tinggal_disini', 
                label: 'Di temukan dan tinggal di lokasi',
            },
            { 
                key: 'keluarga_tidak_ditemukan_pindah', 
                label: 'Tidak ditemukan/pindah',
            },
            { 
                key: 'keluarga_seluruh_anggota_meninggal', 
                label: 'Seluruh anggota meninggal',
            },
            { 
                key: 'keluarga_ditemukan_tidak_terdampak', 
                label: 'Ditemukan tidak terdampak',
            },
            { 
                key: 'keluarga_ditemukan_menungsi_desa_lain', 
                label: 'Ditemukan mengungsi desa lain',
            },
            { 
                key: 'keluarga_tambahan', 
                label: 'Keluarga Tambahan',
            },
            { 
                key: 'keluarga_total_hasil_pendataan', 
                label: 'Total Keluarga hasil pendataan',
            },
        ]
    },
    {
        label: 'Jumlah Keluarga Terdampak Menurut Tempat Mengungsi',
        value: 'kategori_2',
        indicators: [
            { 
                key: 'hunian_keluarga_tidak_mengungsi', 
                label: 'Tidak Mengungsi',
            },
            { 
                key: 'hunian_keluarga_tinggal_rumah_keluarga_besar', 
                label: 'Rumah keluarga besar',
            },
            { 
                key: 'hunian_keluarga_tinggal_pengungsian', 
                label: 'Pengungsian',
            },
            { 
                key: 'hunian_keluarga_tinggal_rumah_tumpangan', 
                label: 'Rumah tumpangan',
            },
            { 
                key: 'hunian_keluarga_tinggal_fasilitas_umum', 
                label: 'Fasilitas umum',
            },
            { 
                key: 'hunian_keluarga_tinggal_huntara', 
                label: 'Huntara',
            },
            { 
                key: 'hunian_keluarga_tinggal_lainnya', 
                label: 'Lainnya',
            },
        ]
    },
    {
        label: 'Jumlah Penduduk yang Terdampak menurut Status Keberadaan',
        value: 'kategori_3',
        indicators: [
            { 
                key: 'penduduk_terdampak', 
                label: 'Penduduk Terdampak',
            },
            { 
                key: 'penduduk_tidak_pernah_mengungsi', 
                label: 'Tidak Pernah Mengungsi',
            },
            { 
                key: 'penduduk_masih_berada_di_pengungsian', 
                label: 'Masih Berada di Pengungsian',
            },
            { 
                key: 'penduduk_pernah_mengungsi_kembali', 
                label: 'Pernah mengungsi kembali',
            },
            { 
                key: 'penduduk_meninggal_hilang_akibat_bencana', 
                label: 'Meninggal/Hilang akibat Bencana',
            },
        ]
    },
    {
        label: 'Jumlah Keluarga yang Memiliki Kelompok Rentan',
        value: 'kategori_4',
        indicators: [
            { 
                key: 'keluarga_terdapat_anggota_balita', 
                label: 'Memiliki Balita',
            },
            { 
                key: 'keluarga_terdapat_anggota_lansia', 
                label: 'Memiliki Lansia',
            },
            { 
                key: 'keluarga_terdapat_anggota_disabilitas', 
                label: 'Memiliki Anggota Disabilitas',
            },
            { 
                key: 'keluarga_terdapat_anggota_hamil',
                label: 'Memiliki Ibu Hamil',
            },
        ]
    },
    {
        label: 'Jumlah Keluarga yang memiliki anggota keluarga yang bekerja',
        value: 'kategori_5',
        indicators: [
            { 
                key: 'keluarga_terdapat_anggota_bekerja', 
                label: 'Ada Anggota Bekerja',
            },
            { 
                key: 'keluarga_pekerjaan_terdampak_dapat_melanjutkan', 
                label: 'Pekerjaan Terdampak Dapat Melanjutkan',
            },
            { 
                key: 'keluarga_pekerjaan_terdampak_tidak_bisa_melanjutkan', 
                label: 'Pekerjaan Terdampak Tidak Bisa Melanjutkan',
            },
            { 
                key: 'keluarga_pekerjaan_tidak_terdampak', 
                label: 'Pekerjaan Tidak Terdampak',
            },
        ]
    },
];

const selectedCategory = ref('kategori_1');

// --- CURRENT INDICATORS ---
const currentIndicators = computed(() => {
    if (!selectedCategory.value) return [];
    const category = categoryOptions.find(c => c.value === selectedCategory.value);
    return category ? category.indicators : [];
});

// --- GET CURRENT CATEGORY LABEL ---
const getCurrentCategoryLabel = computed(() => {
    if (!selectedCategory.value) return '';
    const category = categoryOptions.find(c => c.value === selectedCategory.value);
    return category ? category.label : '';
});

// --- INDICATOR IDS FOR API ---
const indicatorIds = computed(() => {
    return currentIndicators.value.map(ind => ind.key);
});

// --- SORTED DATA PER WILAYAH ---
const sortedDataPerWilayah = computed(() => {
    if (!dataPerWilayah.value) return [];
    return [...dataPerWilayah.value].sort((a, b) => {
        const idA = a.id || '';
        const idB = b.id || '';
        return idA.localeCompare(idB);
    });
});

// --- FETCH DATA PER WILAYAH ---
const { data: dataPerWilayah, pending: pendingPerWilayah, refresh } = useFetch(
    "/api/data-per-wilayah",
    {
        method: "POST",
        lazy: true,
        immediate: false,
        body: {
            regionIds: toRef(props, "regionIds"),
            indicatorIds: indicatorIds,
            tahun: toRef(props, "tahun"),
        },
    },
);

// --- WATCH SELECTED CATEGORY ---
watch(selectedCategory, (newVal) => {
    if (newVal) {
        console.log('indicatorIds:', indicatorIds.value);
        refresh();
    }
});

// --- ON MOUNTED UNTUK FETCH AWAL ---
onMounted(() => {
    refresh();
});

// --- HELPER FUNCTIONS ---
const formatNumber = (value) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('id-ID').format(value);
};

const calculateTotal = (indicatorKey) => {
    if (!sortedDataPerWilayah.value || !sortedDataPerWilayah.value.length) return 0;
    return sortedDataPerWilayah.value.reduce((sum, wilayah) => {
        return sum + (wilayah[indicatorKey] || 0);
    }, 0);
};
</script>

<style scoped>
table {
    font-size: 0.875rem;
}

thead th {
    position: sticky;
    top: 0;
    z-index: 10;
}
</style>