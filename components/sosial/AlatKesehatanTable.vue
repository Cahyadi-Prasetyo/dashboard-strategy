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
            <div
                class="px-6 pt-6 pb-2 flex items-center justify-between gap-4 bg-white z-20"
            >
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
                                :disabled="!filteredAndSortedData.length || loading"
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
            <div class="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <!-- Filter Rumah Kesehatan -->
                    <div class="w-full">
                        <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Rumah Kesehatan</label>
                        <select
                            v-model="filterRumahKesehatan"
                            class="w-full bg-white px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer shadow-sm"
                        >
                            <option value="">Semua Rumah Kesehatan</option>
                            <option
                                v-for="rs in availableRumahKesehatan"
                                :key="rs"
                                :value="rs"
                            >
                                {{ rs }}
                            </option>
                        </select>
                    </div>

                    <!-- Filter Alat Kesehatan -->
                    <div class="w-full">
                        <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Alat Kesehatan</label>
                        <select
                            v-model="filterAlatKesehatan"
                            class="w-full bg-white px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer shadow-sm"
                        >
                            <option value="">Semua Alat</option>
                            <option
                                v-for="alat in availableAlatKesehatan"
                                :key="alat"
                                :value="alat"
                            >
                                {{ alat }}
                            </option>
                        </select>
                    </div>

                    <!-- Filter Ruangan -->
                    <div class="w-full">
                        <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Ruangan</label>
                        <select
                            v-model="filterRuangan"
                            class="w-full bg-white px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer shadow-sm"
                        >
                            <option value="">Semua Ruangan</option>
                            <option
                                v-for="ruangan in availableRuangan"
                                :key="ruangan"
                                :value="ruangan"
                            >
                                {{ ruangan }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Table Body -->
            <div class="flex-1 overflow-auto p-4 bg-slate-50/30">
                <div v-if="loading" class="h-64 flex flex-col items-center justify-center gap-3">
                    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    <p class="text-sm font-semibold text-gray-500">Memproses Data...</p>
                </div>

                <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full border-collapse">
                            <thead class="bg-gray-50 sticky top-0 z-10">
                                <tr class="bg-gray-100 border-b border-gray-300">
                                    <th
                                        class="px-2 py-2 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200"
                                        rowspan="2"
                                    >
                                        No
                                    </th>
                                    <th
                                        @click="toggleSort('region')"
                                        class="px-3 py-2 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors select-none sticky left-0 bg-gray-100 z-20"
                                        rowspan="2"
                                    >
                                        <div class="flex items-center gap-1">
                                            <span>{{ currentLevelName }}</span>
                                            <UIcon
                                                :name="getSortIcon('region')"
                                                class="w-3 h-3"
                                                :class="sortColumn === 'region' ? 'text-indigo-600' : 'text-gray-400'"
                                            />
                                        </div>
                                    </th>
                                    <!-- Kategori Kerusakan Headers -->
                                    <th
                                        v-for="kerusakan in kategoriKerusakan"
                                        :key="kerusakan"
                                        :colspan="statusAkhir.length"
                                        class="px-2 py-2 text-center text-[10px] font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200"
                                        :class="getKerusakanColor(kerusakan)"
                                    >
                                        {{ kerusakan }}
                                    </th>
                                    <th
                                        @click="toggleSort('total')"
                                        class="px-2 py-2 text-center text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 cursor-pointer hover:bg-emerald-100 transition-colors select-none min-w-[100px]"
                                        rowspan="2"
                                    >
                                        <div class="flex items-center justify-center gap-1">
                                            <span>Total</span>
                                            <UIcon
                                                :name="getSortIcon('total')"
                                                class="w-3 h-3"
                                                :class="sortColumn === 'total' ? 'text-emerald-600' : 'text-gray-400'"
                                            />
                                        </div>
                                    </th>
                                </tr>
                                <tr class="bg-gray-50 border-b border-gray-300">
                                    <!-- Status Akhir Sub-headers -->
                                    <template
                                        v-for="kerusakan in kategoriKerusakan"
                                        :key="`sub-${kerusakan}`"
                                    >
                                        <th
                                            v-for="status in statusAkhir"
                                            :key="`${kerusakan}-${status}`"
                                            class="px-2 py-2 text-center text-[9px] font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200"
                                            :class="getStatusColor(status)"
                                        >
                                            {{ status }}
                                        </th>
                                    </template>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                <tr v-if="paginatedData.length === 0">
                                    <td
                                        :colspan="2 + kategoriKerusakan.length * statusAkhir.length + 1"
                                        class="px-4 py-12 text-center text-gray-400"
                                    >
                                        <UIcon name="i-heroicons-inbox" class="w-12 h-12 mx-auto mb-2 opacity-20" />
                                        <p class="font-medium text-sm">Data tidak ditemukan</p>
                                    </td>
                                </tr>
                                <tr
                                    v-for="(row, idx) in paginatedData"
                                    :key="row.id"
                                    class="hover:bg-indigo-50/30 transition-colors group"
                                >
                                    <td class="px-2 py-2 text-[11px] text-gray-900 border-r border-gray-100 text-center">
                                        {{ (currentPage - 1) * itemsPerPage + idx + 1 }}
                                    </td>
                                    <td
                                        class="px-3 py-2 text-[11px] font-bold text-gray-900 border-r border-gray-100 sticky left-0 bg-white group-hover:bg-indigo-50/3 transition-colors z-20 shadow-[2px_0_5px_rgba(0,0,0,0.02)]"
                                        @click="handleDrillDown(row)"
                                        :class="canDrillDown(row) ? 'cursor-pointer hover:text-indigo-600 underline decoration-indigo-200 underline-offset-4' : ''"
                                    >
                                        <div class="flex items-center justify-between gap-2">
                                            <span class="truncate">{{ row.region }}</span>
                                            <UIcon
                                                v-if="canDrillDown(row)"
                                                name="i-heroicons-chevron-right"
                                                class="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400"
                                            />
                                        </div>
                                    </td>
                                    <template
                                        v-for="kerusakan in kategoriKerusakan"
                                        :key="`row-${kerusakan}`"
                                    >
                                        <td
                                            v-for="status in statusAkhir"
                                            :key="`${kerusakan}-${status}`"
                                            class="px-2 py-2 text-[11px] text-center text-gray-900 border-r border-gray-100 font-mono tracking-tight"
                                            :class="getCellColor(status)"
                                        >
                                            {{ formatNumber(row.data[kerusakan]?.[status] || 0) }}
                                        </td>
                                    </template>
                                    <td class="px-2 py-2 text-[11px] text-center font-bold text-emerald-700 bg-emerald-50/50">
                                        {{ formatNumber(row.total) }}
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot
                                v-if="filteredAndSortedData.length > 0"
                                class="bg-gray-100 border-t-2 border-gray-300 font-black"
                            >
                                <tr>
                                    <td
                                        colspan="2"
                                        class="px-3 py-3 text-[10px] text-gray-900 border-r border-gray-200 text-center uppercase tracking-widest sticky left-0 bg-gray-100 z-20"
                                    >
                                        Grand Total
                                    </td>
                                    <template
                                        v-for="kerusakan in kategoriKerusakan"
                                        :key="`total-${kerusakan}`"
                                    >
                                        <td
                                            v-for="status in statusAkhir"
                                            :key="`total-${kerusakan}-${status}`"
                                            class="px-2 py-3 text-[11px] text-center text-gray-900 border-r border-gray-200 font-mono"
                                            :class="getTotalCellColor(status)"
                                        >
                                            {{ formatNumber(grandTotals.data[kerusakan]?.[status] || 0) }}
                                        </td>
                                    </template>
                                    <td class="px-3 py-3 text-[12px] text-center text-emerald-900 bg-emerald-200">
                                        {{ formatNumber(grandTotals.total) }}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Footer Section -->
            <div
                class="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white text-xs"
            >
                <!-- Metadata Section (Left) -->
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

                <!-- Pagination & Info (Right) -->
                <div class="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-end">
                        <span class="text-gray-500 whitespace-nowrap">
                            {{ (currentPage - 1) * 10 + 1 }} -
                            {{ Math.min(currentPage * 10, filteredAndSortedData.length) }} dari
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
                                :disabled="currentPage * 10 >= filteredAndSortedData.length"
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
    title: { type: String, default: "Detail Alat Kesehatan Terdampak" },
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
const itemsPerPage = ref(10);
const sortColumn = ref("");
const sortDirection = ref("asc");

// Filters
const filterRumahKesehatan = ref("");
const filterAlatKesehatan = ref("");
const filterRuangan = ref("");

const availableRumahKesehatan = ref([]);
const availableAlatKesehatan = ref([]);
const availableRuangan = ref([]);

const kategoriKerusakan = ref([]);
const statusAkhir = ref([]);

// Drill-down State
const currentLevel = ref("provinsi");
const currentParent = ref(null);

const headers = useRequestHeaders(["cookie"]);

// --- Navigation Text ---
const currentTitle = computed(() => {
    return currentParent.value ? `${props.title} - ${currentParent.value.name}` : props.title;
});

const currentLevelName = computed(() => {
    const names = { provinsi: "Provinsi", kabupaten: "Kabupaten/Kota", kecamatan: "Kecamatan", desa: "Desa/Kelurahan" };
    return names[currentLevel.value] || "Wilayah";
});

// --- Formatting Helpers ---
const formatNumber = (n) => n === 0 ? "0" : new Intl.NumberFormat("id-ID").format(n || 0);
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

const getKerusakanColor = (kerusakan) => {
    const colors = {
        "Rusak Ringan": "bg-green-100",
        "Rusak Sedang": "bg-yellow-100",
        "Rusak Berat": "bg-orange-100",
    };
    return colors[kerusakan] || "bg-gray-100";
};

const getStatusColor = (status) => {
    const colors = {
        "Bisa Dipakai": "bg-blue-50/50",
        "Harus di Ganti (BAP)": "bg-red-50/50",
    };
    return colors[status] || "bg-gray-50/50";
};

const getCellColor = (status) => {
    if (status === "Bisa Dipakai") return "bg-blue-50/30";
    if (status === "Harus di Ganti (BAP)") return "bg-red-50/30";
    return "";
};

const getTotalCellColor = (status) => {
    if (status === "Bisa Dipakai") return "bg-blue-100";
    if (status === "Harus di Ganti (BAP)") return "bg-red-100";
    return "";
};

const toggleSort = (column) => {
    if (sortColumn.value === column) {
        sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
    } else {
        sortColumn.value = column;
        sortDirection.value = "desc";
    }
    currentPage.value = 1;
};

const getSortIcon = (column) => {
    if (sortColumn.value !== column) {
        return "i-heroicons-arrows-up-down";
    }
    return sortDirection.value === "asc"
        ? "i-heroicons-arrow-up"
        : "i-heroicons-arrow-down";
};

// --- Fetching Logic ---
async function fetchData() {
    loading.value = true;
    try {
        const query = { id_dataset: 110 };
        
        // Regional filters from props or current drill-down state
        if (currentLevel.value === "provinsi") {
            // Provincial level: fetch everything (initial)
        } else if (currentLevel.value === "kabupaten" && currentParent.value) {
            query.id_prov = currentParent.value.id;
        } else if (currentLevel.value === "kecamatan" && currentParent.value) {
            query.id_kab = currentParent.value.id;
        }

        const res = await $fetch("/api/agregat-insight", { query, headers });
        const allRecords = res?.data?.records || [];
        rawRecords.value = allRecords;
        datasetInfo.value = res?.data?.meta?.dataset || null;

        // Extract unique categories for table structure and filters
        const kerusakanSet = new Set();
        const statusSet = new Set();
        const rsSet = new Set();
        const alatSet = new Set();
        const ruanganSet = new Set();

        allRecords.forEach((record) => {
            if (record.itemCategory4?.nama) kerusakanSet.add(record.itemCategory4.nama);
            if (record.itemCategory5?.nama) statusSet.add(record.itemCategory5.nama);
            if (record.itemCategory1?.nama) rsSet.add(record.itemCategory1.nama);
            if (record.itemCategory2?.nama) alatSet.add(record.itemCategory2.nama);
            if (record.itemCategory3?.nama) ruanganSet.add(record.itemCategory3.nama);
        });

        kategoriKerusakan.value = Array.from(kerusakanSet).sort();
        statusAkhir.value = Array.from(statusSet).sort();
        availableRumahKesehatan.value = Array.from(rsSet).sort();
        availableAlatKesehatan.value = Array.from(alatSet).sort();
        availableRuangan.value = Array.from(ruanganSet).sort();

    } catch (e) {
        console.error("Error fetching Alat Kesehatan data:", e);
        rawRecords.value = [];
    } finally {
        loading.value = false;
    }
}

// --- Data Processing ---
const processedData = computed(() => {
    let filtered = rawRecords.value;

    // Apply local filters
    if (filterRumahKesehatan.value) {
        filtered = filtered.filter(r => r.itemCategory1?.nama === filterRumahKesehatan.value);
    }
    if (filterAlatKesehatan.value) {
        filtered = filtered.filter(r => r.itemCategory2?.nama === filterAlatKesehatan.value);
    }
    if (filterRuangan.value) {
        filtered = filtered.filter(r => r.itemCategory3?.nama === filterRuangan.value);
    }

    const grouped = new Map();

    filtered.forEach((r) => {
        let regionId, regionName;
        let isMatch = false;

        const kd_prov = r.kd_prov?.kode;
        const kd_kab = r.kd_kab?.kode;
        const kd_kec = r.kd_kec?.kode;

        if (currentLevel.value === "provinsi") {
            regionId = kd_prov;
            regionName = r.kd_prov?.nama;
            if (regionId && !kd_kab) isMatch = true;
        } else if (currentLevel.value === "kabupaten") {
            if (kd_prov === currentParent.value.id) {
                regionId = kd_kab;
                regionName = r.kd_kab?.nama;
                if (regionId && !kd_kec) isMatch = true;
            }
        } else if (currentLevel.value === "kecamatan") {
            if (kd_kab === currentParent.value.id) {
                regionId = kd_kec;
                regionName = r.kd_kec?.nama;
                if (regionId) isMatch = true;
            }
        }

        if (!isMatch || !regionId) return;

        if (!grouped.has(regionId)) {
            grouped.set(regionId, {
                id: regionId,
                region: regionName || "Wilayah " + regionId,
                data: {},
                total: 0
            });
        }

        const row = grouped.get(regionId);
        const kerusakan = r.itemCategory4?.nama || "Lainnya";
        const status = r.itemCategory5?.nama || "Lainnya";
        const val = Number(r.value) || 0;

        if (!row.data[kerusakan]) row.data[kerusakan] = {};
        if (!row.data[kerusakan][status]) row.data[kerusakan][status] = 0;
        
        row.data[kerusakan][status] += val;
        row.total += val;
    });

    // Fallback aggregation if no direct hits (e.g. data only at lower levels)
    if (grouped.size === 0 && filtered.length > 0) {
        filtered.forEach(r => {
             let regionId, regionName, isAggregatable = false;
             
             if (currentLevel.value === "provinsi") {
                regionId = r.kd_prov?.kode;
                regionName = r.kd_prov?.nama;
                if (regionId && r.kd_kab && !r.kd_kec) isAggregatable = true;
             } else if (currentLevel.value === "kabupaten") {
                if (r.kd_prov?.kode === currentParent.value.id) {
                    regionId = r.kd_kab?.kode;
                    regionName = r.kd_kab?.nama;
                    if (regionId && r.kd_kec) isAggregatable = true;
                }
             }

             if (!isAggregatable || !regionId) return;

             if (!grouped.has(regionId)) {
                grouped.set(regionId, { id: regionId, region: regionName || "Wilayah " + regionId, data: {}, total: 0 });
             }
             const row = grouped.get(regionId);
             const kerusakan = r.itemCategory4?.nama || "Lainnya";
             const status = r.itemCategory5?.nama || "Lainnya";
             const val = Number(r.value) || 0;

             if (!row.data[kerusakan]) row.data[kerusakan] = {};
             if (!row.data[kerusakan][status]) row.data[kerusakan][status] = 0;
             row.data[kerusakan][status] += val;
             row.total += val;
        });
    }

    return Array.from(grouped.values()).sort((a, b) => b.total - a.total);
});

const filteredAndSortedData = computed(() => {
    let data = [...processedData.value];
    
    // Apply search
    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase();
        data = data.filter(d => d.region.toLowerCase().includes(q));
    }

    // Apply sorting
    if (sortColumn.value) {
        data.sort((a, b) => {
            const aVal = sortColumn.value === 'region' ? a.region : a.total;
            const bVal = sortColumn.value === 'region' ? b.region : b.total;

            if (typeof aVal === "string") {
                if (sortDirection.value === "asc") {
                    return aVal.localeCompare(bVal, "id");
                } else {
                    return bVal.localeCompare(aVal, "id");
                }
            } else {
                if (sortDirection.value === "asc") {
                    return aVal - bVal;
                } else {
                    return bVal - aVal;
                }
            }
        });
    }

    return data;
});

const totalPages = computed(() =>
    Math.ceil(filteredAndSortedData.value.length / itemsPerPage.value)
);

const displayedPages = computed(() => {
    const pages = [];
    const total = totalPages.value;
    const current = currentPage.value;

    if (total <= 7) {
        for (let i = 1; i <= total; i++) {
            pages.push(i);
        }
    } else {
        if (current <= 3) {
            for (let i = 1; i <= 4; i++) pages.push(i);
            pages.push("...");
            pages.push(total);
        } else if (current >= total - 2) {
            pages.push(1);
            pages.push("...");
            for (let i = total - 3; i <= total; i++) pages.push(i);
        } else {
            pages.push(1);
            pages.push("...");
            for (let i = current - 1; i <= current + 1; i++) pages.push(i);
            pages.push("...");
            pages.push(total);
        }
    }

    return pages;
});

const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    return filteredAndSortedData.value.slice(start, start + itemsPerPage.value);
});

const grandTotals = computed(() => {
    const total = { data: {}, total: 0 };
    filteredAndSortedData.value.forEach(row => {
        kategoriKerusakan.value.forEach(kerusakan => {
            if (!total.data[kerusakan]) total.data[kerusakan] = {};
            statusAkhir.value.forEach(status => {
                if (!total.data[kerusakan][status]) total.data[kerusakan][status] = 0;
                total.data[kerusakan][status] += row.data[kerusakan]?.[status] || 0;
            });
        });
        total.total += row.total;
    });
    return total;
});

// --- Drill-down Handlers ---
const canDrillDown = (row) => {
    return currentLevel.value !== "kecamatan";
};

function handleDrillDown(row) {
    if (!canDrillDown(row)) return;
    
    currentParent.value = { id: row.id, name: row.region };
    if (currentLevel.value === "provinsi") currentLevel.value = "kabupaten";
    else if (currentLevel.value === "kabupaten") currentLevel.value = "kecamatan";
    
    currentPage.value = 1;
    fetchData();
}

function handleBack() {
    if (currentLevel.value === "kabupaten") {
        currentLevel.value = "provinsi";
        currentParent.value = null;
    } else if (currentLevel.value === "kecamatan") {
        currentLevel.value = "kabupaten";
        currentParent.value = { id: currentParent.value.id.slice(0, 2), name: "Provinsi" };
    }
    currentPage.value = 1;
    fetchData();
}

// --- Watchers ---
watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        currentLevel.value = "provinsi";
        currentParent.value = null;
        fetchData();
    }
});

watch([filterRumahKesehatan, filterAlatKesehatan, filterRuangan, searchQuery], () => {
    // Update available options based on current filters
    const rsSet = new Set();
    const alatSet = new Set();
    const ruanganSet = new Set();

    rawRecords.value.forEach((record) => {
        let include = true;

        if (filterRumahKesehatan.value && record.itemCategory1?.nama !== filterRumahKesehatan.value) include = false;
        if (filterAlatKesehatan.value && record.itemCategory2?.nama !== filterAlatKesehatan.value) include = false;
        if (filterRuangan.value && record.itemCategory3?.nama !== filterRuangan.value) include = false;

        if (include) {
            if (record.itemCategory1?.nama) rsSet.add(record.itemCategory1.nama);
            if (record.itemCategory2?.nama) alatSet.add(record.itemCategory2.nama);
            if (record.itemCategory3?.nama) ruanganSet.add(record.itemCategory3.nama);
        }
    });

    if (!filterRumahKesehatan.value) availableRumahKesehatan.value = Array.from(rsSet).sort();
    if (!filterAlatKesehatan.value) availableAlatKesehatan.value = Array.from(alatSet).sort();
    if (!filterRuangan.value) availableRuangan.value = Array.from(ruanganSet).sort();

    currentPage.value = 1;
});

const triggerDownload = async () => {
    isExporting.value = true;
    try {
        const columns = [
            { header: "No", key: "no", width: 10 },
            { header: currentLevelName.value, key: "region", width: 25 },
        ];

        kategoriKerusakan.value.forEach(kerusakan => {
            statusAkhir.value.forEach(status => {
                columns.push({
                    header: `${kerusakan} - ${status}`,
                    key: `${kerusakan}_${status}`,
                    width: 20
                });
            });
        });

        columns.push({ header: "Total", key: "total", width: 15 });

        const excelData = filteredAndSortedData.value.map((row, index) => {
            const r = { no: index + 1, region: row.region, total: row.total };
            kategoriKerusakan.value.forEach(kerusakan => {
                statusAkhir.value.forEach(status => {
                    r[`${kerusakan}_${status}`] = row.data[kerusakan]?.[status] || 0;
                });
            });
            return r;
        });

        await downloadDynamicExcel(excelData, `Data_Alat_Kesehatan_${currentLevel.value}_${new Date().toISOString().split('T')[0]}`, columns);
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

.animate-in {
    animation: animate-in 0.2s ease-out;
}

@keyframes animate-in {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}
</style>
