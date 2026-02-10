<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
    >
        <div
            class="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
            @click="$emit('close')"
        ></div>

        <div
            class="relative w-full max-w-7xl max-h-[95vh] flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10"
        >
            <!-- Header Section -->
            <div class="px-6 pt-6 pb-2 flex items-center justify-between gap-4 bg-white z-20">
                <div class="flex items-center gap-2">
                    <UButton
                        v-if="currentLevel !== 'provinsi'"
                        icon="i-heroicons-arrow-left"
                        size="sm"
                        color="warning"
                        variant="soft"
                        @click="handleBack"
                    >
                        Kembali
                    </UButton>
                    <h3 class="text-lg font-bold text-gray-800">
                        {{ currentTitle }}
                    </h3>
                </div>

                <div class="flex items-center gap-2">
                    <div class="flex items-center gap-2 w-full sm:w-auto">
                        <div class="relative w-full sm:w-64">
                            <UIcon
                                name="i-heroicons-magnifying-glass"
                                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                            />
                            <input
                                v-model="searchQuery"
                                type="text"
                                placeholder="Cari wilayah..."
                                class="w-full pl-9 pr-4 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
                            />
                        </div>

                        <UTooltip text="Excel" :popper="{ placement: 'top' }">
                            <UButton
                                icon="i-heroicons-document-arrow-down"
                                size="xs"
                                :loading="isExporting"
                                :disabled="!filteredAndSortedData.length"
                                @click="triggerDownload"
                                class="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                <span class="tracking-wide text-sm">Excel</span>
                            </UButton>
                        </UTooltip>
                    </div>

                    <UButton
                        color="error"
                        variant="soft"
                        icon="i-heroicons-x-mark"
                        @click="$emit('close')"
                        class="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white border-none h-[31px] transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105"
                    />
                </div>
            </div>

            <!-- Filters Section -->
            <div class="px-6 py-3 bg-gray-50/50 border-b border-gray-100 flex flex-wrap gap-4 items-center">
                <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">Filters:</span>
                    <select
                        v-model="filterKewenangan"
                        class="bg-white px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-sm"
                    >
                        <option v-for="k in availableKewenangan" :key="k" :value="k">{{ k }}</option>
                    </select>

                    <select
                        v-if="filterKewenangan === 'Kewenangan Kabupaten/Kota'"
                        v-model="filterSektor"
                        class="bg-white px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-sm"
                    >
                        <option v-for="s in availableSektor" :key="s" :value="s">{{ s }}</option>
                    </select>
                </div>
            </div>

            <!-- Table Body -->
            <div class="flex-1 overflow-auto p-6 bg-slate-50/30">
                <div v-if="loading" class="h-64 flex flex-col items-center justify-center gap-3">
                    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    <p class="text-sm font-semibold text-gray-500">Memproses Data...</p>
                </div>

                <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full border-collapse">
                            <thead>
                                <tr class="bg-gray-100 border-b-2 border-gray-200">
                                    <th
                                        rowspan="2"
                                        class="px-3 py-3.5 text-left text-xs font-bold text-gray-900 uppercase tracking-wider border-r border-gray-200 sticky left-0 bg-gray-50 z-20 w-[200px]">
                                        Wilayah ({{ currentLevelName }})
                                    </th>
                                    <th v-for="col in activeColumns" :key="col.key" colspan="1" class="px-3 py-2 text-center text-[10px] font-black text-gray-700 uppercase tracking-wider border-r border-b border-gray-200 bg-blue-50/50">
                                        {{ col.label }}
                                    </th>
                                </tr>
                                <tr class="bg-gray-50 border-b border-gray-200">
                                    <template v-for="col in activeColumns" :key="`sub-${col.key}`">
                                        <th class="px-2 py-2 text-center text-[9px] font-bold text-gray-600 uppercase border-r border-gray-200 min-w-[100px]">
                                            Volume ({{ getUnit(col.key) }})
                                        </th>
                                    </template>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                <tr v-if="paginatedData.length === 0">
                                    <td :colspan="activeColumns.length + 1" class="px-4 py-12 text-center text-gray-400">
                                        <UIcon name="i-heroicons-inbox" class="w-12 h-12 mx-auto mb-2 opacity-20" />
                                        <p class="font-medium">Data tidak ditemukan untuk tingkat {{ currentLevelName }}</p>
                                    </td>
                                </tr>
                                <tr v-for="(row, idx) in paginatedData" :key="row.id" class="hover:bg-blue-50/30 transition-colors group">
                                    <td class="px-3 py-3 text-xs font-bold text-gray-900 border-r border-gray-100 sticky left-0 bg-white group-hover:bg-blue-50/30 transition-colors z-20">
                                        <div 
                                            class="flex items-center justify-between gap-2"
                                            :class="canDrillDown(row) ? 'cursor-pointer text-gray-600 hover:text-gray-800' : ''"
                                            @click="handleDrillDown(row)"
                                        >
                                            <span class="truncate">
                                                {{ (currentPage - 1) * itemsPerPage + idx + 1 }}. {{ row.region }}
                                            </span>
                                            <UIcon v-if="canDrillDown(row)" name="i-heroicons-chevron-right" class="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </td>
                                    <template v-for="col in activeColumns" :key="`cell-${col.key}`">
                                        <td class="px-2 py-2 text-[11px] text-center text-gray-700 border-r border-gray-50 font-mono tracking-tight">
                                            {{ formatNumber(row.data[col.key]?.volume || 0) }}
                                        </td>
                                    </template>
                                </tr>
                            </tbody>
                            <tfoot v-if="filteredAndSortedData.length > 0" class="bg-gray-100 border-t-2 border-gray-300 font-black">
                                <tr>
                                    <td class="px-3 py-4 text-[10px] text-gray-900 border-r border-gray-200 text-center uppercase tracking-widest sticky left-0 bg-gray-100 z-20">
                                        Grand Total
                                    </td>
                                    <template v-for="col in activeColumns" :key="`total-${col.key}`">
                                        <td class="px-2 py-4 text-[11px] text-center text-gray-900 border-r border-gray-200 font-mono">
                                            {{ formatNumber(grandTotals[col.key]?.volume || 0) }}
                                        </td>
                                    </template>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>

            <div
                class="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white text-xs"
            >
                <div class="flex flex-col gap-1 text-gray-500 text-left w-full sm:w-auto">
                    <div v-if="datasetInfo?.sumber || datasetInfo?.sumber_data" class="flex gap-1">
                        <span class="font-bold text-gray-600">Sumber:</span>
                        <span>{{ datasetInfo?.sumber || datasetInfo?.sumber_data }}</span>
                    </div>
                     <div v-if="datasetInfo?.instansi" class="flex gap-1">
                        <span class="font-bold text-gray-600">Instansi:</span>
                        <span>{{ datasetInfo?.instansi }}</span>
                    </div>
                     <div v-if="datasetInfo?.terakhir_diupdate" class="flex gap-1">
                        <span class="font-bold text-gray-600">Update Terakhir:</span>
                        <span>{{ formatDate(datasetInfo?.terakhir_diupdate) }}</span>
                    </div>
                </div>
                <div class="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-end">
                        <span class="text-gray-500 whitespace-nowrap">
                            {{ (currentPage - 1) * itemsPerPage + 1 }} -
                            {{ Math.min(currentPage * itemsPerPage, filteredAndSortedData.length) }} dari
                            {{ filteredAndSortedData.length }} data
                        </span>
                        <div class="flex gap-2">
                            <button
                                :disabled="currentPage === 1"
                                @click="currentPage--"
                                class="text-gray-500 px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                Prev
                            </button>
                            <button
                                :disabled="currentPage * itemsPerPage >= filteredAndSortedData.length"
                                @click="currentPage++"
                                class="text-gray-500 px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useDynamicExcel } from "~/composables/useDynamicExcel";

const props = defineProps({
    isOpen: Boolean,
    title: { type: String, default: "Detail Fasilitas Kelautan" },
    datasetId: { type: Number, default: 119 },
});

const emit = defineEmits(["close"]);

const { downloadDynamicExcel } = useDynamicExcel();

// --- State ---
const loading = ref(false);
const rawRecords = ref([]);
const datasetInfo = ref(null);
const isExporting = ref(false);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = 10;

const formatDate = (isoString) => {
    if (!isoString) return "-";
    try {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(date);
    } catch (e) {
        return isoString;
    }
};

// Drill-down State
const currentLevel = ref("provinsi");
const currentParent = ref(null);

// Filters
const filterKewenangan = ref("Kewenangan Kabupaten/Kota");
const filterSektor = ref("Perikanan Budidaya");
const availableKewenangan = ["Kewenangan Kabupaten/Kota", "Kewenangan Provinsi"];
const availableSektor = ["Perikanan Budidaya", "Perikanan Tangkap", "Kelautan dan Pengelolaan Ruang Laut"];

// --- Navigation Text ---
const currentTitle = computed(() => {
    return currentParent.value ? currentParent.value.name : props.title;
});

const currentLevelName = computed(() => {
    const names = { provinsi: "Provinsi", kabupaten: "Kabupaten/Kota", kecamatan: "Kecamatan", desa: "Desa/Kelurahan" };
    return names[currentLevel.value] || "Wilayah";
});

// --- Column Config ---
const columnDefinitions = {
    "Kewenangan Kabupaten/Kota": {
        "Perikanan Budidaya": [
            { key: "Tambak Rakyat (Ha)", label: "Tambak Rakyat" },
            { key: "Kolam Ikan (Ha)", label: "Kolam Ikan" },
            { key: "Keramba Jaring Apung (Petak)", label: "Keramba Jaring Apung" },
            { key: "Saluran Tambak (Km)", label: "Saluran Tambak" },
            { key: "Jalan Produksi (Km)", label: "Jalan Produksi" },
            { key: "Jembatan Produksi (Unit)", label: "Jembatan Produksi" },
            { key: "Pintu Air (Unit)", label: "Pintu Air" }
        ],
        "Perikanan Tangkap": [
            { key: "Pelabuhan Perikanan (PP) (Unit)", label: "Pelabuhan Perikanan (PP)" },
            { key: "Sentra Nelayan (Unit)", label: "Sentra Nelayan" },
            { key: "Alat Penangkapan Ikan (Unit)", label: "Alat Penangkapan Ikan" },
            { key: "Kapal Penangkapan Ikan (Unit)", label: "Kapal Penangkapan Ikan" },
            { key: "Balai Nelayan (Unit)", label: "Balai Nelayan" }
        ],
        "Kelautan dan Pengelolaan Ruang Laut": [
            { key: "Tunnel Garam (Unit)", label: "Tunnel Garam" },
            { key: "Tempat Perebusan Garam (Unit)", label: "Tempat Perebusan Garam" },
            { key: "Gidang Garam Rakyat (Unit)", label: "Gudang Garam Rakyat" },
            { key: "Lahan Mangrove Kawasan Konservasi (Ha)", label: "Lahan Mangrove Kawasan Konservasi" }
        ]
    },
    "Kewenangan Provinsi": {
        "All": [
            { key: "Balai Benih Ikan (BBI) (Unit)", label: "Balai Benih Ikan (BBI)" },
            { key: "Unit Pengolahan Ikan (UPI) (Unit)", label: "Unit Pengolahan Ikan (UPI)" },
            { key: "Pelabuhan Perikanan (PP) (Unit)", label: "Pelabuhan Perikanan (PP)" },
            { key: "Tambak Rakyat (Ha)", label: "Tambak Rakyat" },
            { key: "Mesin Kapal (Unit)", label: "Mesin Kapal" },
            { key: "Cold Box/Fiber (Unit)", label: "Cold Box/Fiber" }
        ]
    }
};

const activeColumns = computed(() => {
    if (filterKewenangan.value === "Kewenangan Provinsi") {
        return columnDefinitions["Kewenangan Provinsi"]["All"];
    }
    return columnDefinitions["Kewenangan Kabupaten/Kota"][filterSektor.value] || [];
});

const getUnit = (key) => {
    const match = key.match(/\((.*?)\)/);
    return match ? match[1] : "";
};

// --- Fetching Logic ---
async function fetchData() {
    loading.value = true;
    try {
        const query = { 
            id_dataset: 119,
            id_indikator: 221
        };
        
        // Fetch ALL data, kita akan agregasi di frontend
        const res = await $fetch("/api/agregat-insight", { query });
        const records = res?.data?.records || [];
        
        // Filter hanya records dengan indikator "Volume Kerusakan"
        rawRecords.value = records.filter(rec => {
            const indikatorNama = rec.indikator?.nama || "";
            return indikatorNama === "Volume Kerusakan";
        });
        
        datasetInfo.value = res?.data?.meta?.dataset || null;
    } catch (e) {
        console.error("Error fetching table data:", e);
        rawRecords.value = [];
    } finally {
        loading.value = false;
    }
}

// --- Data Processing dengan Agregasi yang Benar ---
const processedData = computed(() => {
    const grouped = new Map();
    const data = rawRecords.value;

    data.forEach((r) => {
        // 1. Filter by Kewenangan
        const cat1 = (r.itemCategory1?.nama || r.itemCategory1 || "").trim();
        if (cat1 !== filterKewenangan.value) return;

        // 2. Filter by Sektor
        if (filterKewenangan.value === "Kewenangan Kabupaten/Kota") {
            const cat2 = (r.itemCategory2?.nama || r.itemCategory2 || "").trim();
            if (cat2 !== filterSektor.value) return;
        }

        // 3. Tentukan region berdasarkan level drill-down
        let regionId, regionName;
        let shouldInclude = false;

        if (currentLevel.value === "provinsi") {
            // Agregasi per provinsi
            regionId = r.kd_prov?.kode;
            regionName = r.kd_prov?.nama;
            if (regionId) shouldInclude = true;
            
        } else if (currentLevel.value === "kabupaten") {
            // Tampilkan kabupaten dalam provinsi terpilih
            if (r.kd_prov?.kode === currentParent.value?.id) {
                regionId = r.kd_kab?.kode;
                regionName = r.kd_kab?.nama;
                if (regionId) shouldInclude = true;
            }
            
        } else if (currentLevel.value === "kecamatan") {
            // Tampilkan kecamatan dalam kabupaten terpilih
            if (r.kd_kab?.kode === currentParent.value?.id) {
                regionId = r.kd_kec?.kode;
                regionName = r.kd_kec?.nama;
                if (regionId) shouldInclude = true;
            }
            
        } else if (currentLevel.value === "desa") {
            // Tampilkan desa dalam kecamatan terpilih
            if (r.kd_kec?.kode === currentParent.value?.id) {
                regionId = r.kd_desa?.kode;
                regionName = r.kd_desa?.nama;
                if (regionId) shouldInclude = true;
            }
        }

        if (!shouldInclude || !regionId) return;

        // 4. Initialize region
        if (!grouped.has(regionId)) {
            grouped.set(regionId, {
                id: regionId,
                region: regionName || "Wilayah " + regionId,
                data: {}
            });
        }

        // 5. Agregasi values
        const row = grouped.get(regionId);
        const cat3 = (r.itemCategory3?.nama || r.itemCategory3 || "").trim();
        const value = Number(r.value) || 0;

        if (!row.data[cat3]) {
            row.data[cat3] = { volume: 0 };
        }
        
        row.data[cat3].volume += value;
    });

    return Array.from(grouped.values()).sort((a, b) => a.region.localeCompare(b.region));
});

const filteredAndSortedData = computed(() => {
    let data = [...processedData.value];
    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase();
        data = data.filter(d => d.region.toLowerCase().includes(q));
    }
    return data;
});

const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return filteredAndSortedData.value.slice(start, start + itemsPerPage);
});

// --- Grand Totals ---
const grandTotals = computed(() => {
    const totals = {};
    activeColumns.value.forEach(col => {
        totals[col.key] = {
            volume: filteredAndSortedData.value.reduce((sum, row) => sum + (row.data[col.key]?.volume || 0), 0)
        };
    });
    return totals;
});

// --- Drill-down Handlers ---
const canDrillDown = (row) => {
    return currentLevel.value !== "desa";
};

function handleDrillDown(row) {
    if (!canDrillDown(row)) return;
    
    currentParent.value = { id: row.id, name: row.region };
    
    if (currentLevel.value === "provinsi") {
        currentLevel.value = "kabupaten";
    } else if (currentLevel.value === "kabupaten") {
        currentLevel.value = "kecamatan";
    } else if (currentLevel.value === "kecamatan") {
        currentLevel.value = "desa";
    }
    
    currentPage.value = 1;
}

function handleBack() {
    if (currentLevel.value === "kabupaten") {
        currentLevel.value = "provinsi";
        currentParent.value = null;
    } else if (currentLevel.value === "kecamatan") {
        const provId = currentParent.value.id.substring(0, 2);
        currentLevel.value = "kabupaten";
        currentParent.value = { id: provId, name: "Kembali ke Kabupaten/Kota" };
    } else if (currentLevel.value === "desa") {
        const kabId = currentParent.value.id.substring(0, 4);
        currentLevel.value = "kecamatan";
        currentParent.value = { id: kabId, name: "Kembali ke Kecamatan" };
    }
    
    currentPage.value = 1;
}

// --- Watchers ---
watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        currentLevel.value = "provinsi";
        currentParent.value = null;
        currentPage.value = 1;
        fetchData();
    }
});

watch([filterKewenangan, filterSektor, searchQuery], () => {
    currentPage.value = 1;
});

// --- Global Helpers ---
const formatNumber = (n) => n === 0 ? "0" : new Intl.NumberFormat("id-ID").format(n || 0);

const triggerDownload = async () => {
    isExporting.value = true;
    try {
        const cols = [{ header: "Wilayah", key: "region", width: 25 }];
        activeColumns.value.forEach(c => {
            cols.push({ header: `${c.label} (Volume)`, key: `${c.key}_vol`, width: 15 });
        });

        const excelData = filteredAndSortedData.value.map(row => {
            const r = { region: row.region };
            activeColumns.value.forEach(c => {
                r[`${c.key}_vol`] = row.data[c.key]?.volume || 0;
            });
            return r;
        });

        await downloadDynamicExcel(excelData, `Fasilitas_Kelautan_${currentLevel.value}`, cols);
    } finally {
        isExporting.value = false;
    }
};
</script>

<style scoped>
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
::-webkit-scrollbar-track {
    background: transparent;
}
::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>