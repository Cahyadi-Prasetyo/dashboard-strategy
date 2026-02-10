<template>
    <div
        class="relative bg-white border border-gray-200 rounded-xl shadow-sm p-4 pt-10 mt-6"
    >
        <!-- Header Badge -->
        <div
            class="absolute -top-4 left-0 right-0 px-4 flex flex-wrap items-center justify-between gap-2 z-20"
        >
            <div class="flex flex-wrap items-center gap-2">
                <div
                    class="flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-lg border border-blue-100 shadow-sm whitespace-nowrap"
                >
                    <UIcon
                        name="i-heroicons-lifebuoy"
                        class="w-4 h-4 text-blue-600"
                    />
                    <span
                        class="text-[10px] font-black text-blue-700 uppercase tracking-wider"
                    >
                        Data Fasilitas Kelautan dan Perikanan
                    </span>
                </div>

                <div
                    class="flex items-center gap-1.5 bg-white/90 backdrop-blur px-2 py-1 rounded-lg border border-gray-200 shadow-sm"
                >
                    <UBadge
                        v-if="metaData.dataset?.instansi"
                        color="primary"
                        variant="subtle"
                        size="xs"
                    >
                        {{ metaData.dataset.instansi }}
                    </UBadge>
                    <UBadge
                        v-if="metaData.dataset?.sumber"
                        color="primary"
                        variant="subtle"
                        size="xs"
                    >
                        {{ metaData.dataset.sumber }}
                    </UBadge>
                    <span
                        v-if="metaData.dataset?.terakhir_diupdate"
                        class="text-[10px] text-gray-400 flex items-center gap-0.5 ml-1"
                    >
                        <UIcon name="i-heroicons-clock" class="w-3 h-3" />
                        {{ formatDate(metaData.dataset.terakhir_diupdate) }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Title Section -->
        <div class="mb-4">
            <h3 class="text-lg font-bold text-gray-800">
                {{ metaData.dataset?.judul || "Data Kerusakan Fasilitas Kelautan dan Perikanan" }}
            </h3>
        </div>

        <!-- Local Filters -->
        <div class="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <!-- Filter Kewenangan -->
            <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1.5">
                    Kewenangan
                </label>
                <select
                    v-model="filterKewenangan"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                    <option
                        v-for="kewenangan in availableKewenangan"
                        :key="kewenangan"
                        :value="kewenangan"
                    >
                        {{ kewenangan }}
                    </option>
                </select>
            </div>

            <!-- Filter Sektor Perikanan -->
            <div v-if="filterKewenangan === 'Kewenangan Kabupaten/Kota'">
                <label class="block text-xs font-semibold text-gray-700 mb-1.5">
                    Sektor Perikanan
                </label>
                <select
                    v-model="filterSektor"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                    <option
                        v-for="sektor in availableSektor"
                        :key="sektor"
                        :value="sektor"
                    >
                        {{ sektor }}
                    </option>
                </select>
            </div>
        </div>

        <!-- Search & Download Controls -->
        <div class="mb-4 flex items-start justify-between gap-4">
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
                        class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                </div>
                <div
                    v-if="searchQuery"
                    class="mt-1 text-xs text-gray-600 text-right"
                >
                    Ditemukan:
                    <strong>{{ filteredAndSortedData.length }}</strong>
                    data
                </div>
            </div>

            <UTooltip text="Export Excel" :popper="{ placement: 'top' }">
                <UButton
                    icon="i-heroicons-document-arrow-down"
                    size="sm"
                    :loading="isExporting"
                    :disabled="!filteredAndSortedData.length || loading"
                    @click="triggerDownload"
                    class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 border-none ring-0 h-[38px]"
                    :ui="{
                        rounded: 'rounded-lg',
                        padding: { sm: 'px-4 py-2' },
                        font: 'font-semibold',
                        icon: { size: { sm: 'w-4 h-4' } },
                    }"
                >
                    <span class="tracking-wide text-sm">Excel</span>
                </UButton>
            </UTooltip>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="text-center">
                <div
                    class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"
                ></div>
                <p class="text-sm text-gray-600">Memuat data...</p>
            </div>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table class="w-full border-collapse">
                <thead>
                    <tr class="bg-gray-100 border-b-2 border-gray-300">
                        <th
                            rowspan="2"
                            class="px-2 py-2 text-center text-[10px] font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200"
                        >
                            No
                        </th>
                        <th
                            rowspan="2"
                            @click="toggleSort('provinsi')"
                            class="px-2 py-2 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                        >
                            <div class="flex items-center gap-1">
                                <span>Provinsi</span>
                                <UIcon
                                    :name="getSortIcon('provinsi')"
                                    class="w-3 h-3 text-gray-400"
                                />
                            </div>
                        </th>
                        <th
                            rowspan="2"
                            @click="toggleSort('kabupaten')"
                            class="px-2 py-2 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                        >
                            <div class="flex items-center gap-1">
                                <span>Kabupaten</span>
                                <UIcon
                                    :name="getSortIcon('kabupaten')"
                                    class="w-3 h-3 text-gray-400"
                                />
                            </div>
                        </th>
                        <!-- Grouped Headers for Facilities -->
                        <th
                            v-for="col in activeColumns"
                            :key="col.key"
                            colspan="2"
                            class="px-2 py-1.5 text-center text-[10px] font-bold text-gray-700 uppercase tracking-wider border-r border-b border-gray-200 bg-gray-50/50"
                        >
                            {{ col.label }}
                        </th>
                        <th
                            rowspan="2"
                            class="px-2 py-2 text-center text-[10px] font-bold text-blue-800 uppercase tracking-wider bg-blue-100/50 border-l border-gray-200"
                        >
                            Total Estimasi (Rp)
                        </th>
                    </tr>
                    <tr class="bg-gray-50 border-b border-gray-300">
                        <template v-for="col in activeColumns" :key="`sub-${col.key}`">
                            <th
                                class="px-2 py-1 text-center text-[9px] font-semibold text-gray-600 uppercase border-r border-gray-200"
                                :title="getUnit(col.key)"
                            >
                                Volume Kerusakan ({{ getUnit(col.key) }})
                            </th>
                            <th
                                class="px-2 py-1 text-center text-[9px] font-semibold text-gray-600 uppercase border-r border-gray-200"
                            >
                                Estimasi Biaya (Rp)
                            </th>
                        </template>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    <tr v-if="paginatedData.length === 0">
                        <td
                            :colspan="4 + (activeColumns.length * 2)"
                            class="px-4 py-8 text-center text-gray-500"
                        >
                            <UIcon
                                name="i-heroicons-inbox"
                                class="w-12 h-12 mx-auto mb-2 text-gray-400"
                            />
                            <p>Tidak ada data tersedia</p>
                        </td>
                    </tr>
                    <tr
                        v-for="(row, index) in paginatedData"
                        :key="index"
                        class="hover:bg-blue-50/30 transition-colors"
                    >
                        <td
                            class="px-2 py-1.5 text-[11px] text-gray-600 text-center border-r border-gray-100"
                        >
                            {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                        </td>
                        <td
                            class="px-2 py-1.5 text-[11px] text-gray-900 border-r border-gray-100 whitespace-nowrap"
                        >
                            {{ row.provinsi }}
                        </td>
                        <td
                            class="px-2 py-1.5 text-[11px] text-gray-900 border-r border-gray-100 whitespace-nowrap"
                        >
                            {{ row.kabupaten }}
                        </td>
                        <!-- Data Cells -->
                        <template v-for="col in activeColumns" :key="`cell-${col.key}`">
                            <td
                                class="px-2 py-1.5 text-[11px] text-center text-gray-900 border-r border-gray-100 font-mono"
                            >
                                {{ formatNumber(row.data[col.key]?.volume || 0) }}
                            </td>
                            <td
                                class="px-2 py-1.5 text-[11px] text-center text-gray-900 border-r border-gray-100 font-mono bg-amber-100/30"
                            >
                                {{ formatNumber(row.data[col.key]?.estimasi || 0) }}
                            </td>
                        </template>
                        <td
                            class="px-2 py-1.5 text-[11px] text-center font-bold text-blue-700 bg-blue-50/50"
                        >
                            {{ formatNumber(row.totalEstimasi) }}
                        </td>
                    </tr>
                </tbody>
                <!-- Footer for Grand Total -->
                <tfoot
                    v-if="filteredAndSortedData.length > 0"
                    class="bg-gray-100 border-t-2 border-gray-400"
                >
                    <tr class="font-bold">
                        <td
                            colspan="3"
                            class="px-2 py-2 text-[11px] text-gray-900 border-r border-gray-200 text-center uppercase tracking-wider"
                        >
                            Grand Total
                        </td>
                        <!-- Grand Total Data Cells -->
                        <template v-for="col in activeColumns" :key="`total-${col.key}`">
                            <td
                                class="px-2 py-2 text-[11px] text-center text-gray-900 border-r border-gray-200 font-mono"
                            >
                                {{ formatNumber(grandTotals[col.key]?.volume || 0) }}
                            </td>
                            <td
                                class="px-2 py-2 text-[11px] text-center text-gray-900 border-r border-gray-200 font-mono bg-amber-100/30"
                            >
                                {{ formatNumber(grandTotals[col.key]?.estimasi || 0) }}
                            </td>
                        </template>
                        <td
                            class="px-2 py-2 text-[11px] text-center text-blue-900 bg-blue-200 font-bold"
                        >
                            {{ formatNumber(overallEstimasiTotal) }}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Pagination -->
        <div
            v-if="!loading && filteredAndSortedData.length > 0 && totalPages > 1"
            class="flex items-center justify-center mt-4 gap-1"
        >
            <button
                @click="changePage(1)"
                :disabled="currentPage === 1"
                class="p-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
                <UIcon name="i-heroicons-chevron-double-left" class="w-3.5 h-3.5" />
            </button>

            <button
                @click="changePage(currentPage - 1)"
                :disabled="currentPage <= 1"
                class="px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
                <UIcon name="i-heroicons-chevron-left" class="w-3.5 h-3.5" />
                Prev
            </button>

            <div class="flex items-center gap-1">
                <template v-for="page in displayedPages" :key="page">
                    <button
                        v-if="page !== '...'"
                        @click="changePage(page)"
                        :class="[
                            'min-w-[32px] h-8 rounded-md border text-xs font-medium transition-all',
                            currentPage === page
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
                        ]"
                    >
                        {{ page }}
                    </button>
                    <span v-else class="px-1 text-gray-500 text-xs">...</span>
                </template>
            </div>

            <button
                @click="changePage(currentPage + 1)"
                :disabled="currentPage >= totalPages"
                class="px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
                Next
                <UIcon name="i-heroicons-chevron-right" class="w-3.5 h-3.5" />
            </button>

            <button
                @click="changePage(totalPages)"
                :disabled="currentPage === totalPages"
                class="p-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
                <UIcon name="i-heroicons-chevron-double-right" class="w-3.5 h-3.5" />
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, toRef, watch } from 'vue';
import { useAgregatInsight } from '~/composables/useAgregatInsight';
import { useDynamicExcel } from "~/composables/useDynamicExcel";

const props = defineProps({
    selectedWilayah: { type: Object, required: true },
});

const selectedWilayahRef = toRef(props, "selectedWilayah");

const { downloadDynamicExcel } = useDynamicExcel();
const { status, rawRecords, datasetInfo } = useAgregatInsight(119, selectedWilayahRef);

const loading = computed(() => status.value === 'pending');
const isExporting = ref(false);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const sortColumn = ref("provinsi");
const sortDirection = ref("asc");

// Local Filters
const filterKewenangan = ref("Kewenangan Kabupaten/Kota");
const filterSektor = ref("Perikanan Budidaya");

const availableKewenangan = ["Kewenangan Kabupaten/Kota", "Kewenangan Provinsi"];
const availableSektor = ["Perikanan Budidaya", "Perikanan Tangkap", "Kelautan dan Pengelolaan Ruang Laut"];

// Metadata for header/badges
const metaData = computed(() => ({
    dataset: datasetInfo.value
}));

// Column Definitions Mapping (Grouped Headers)
const columnDefinitions = {
    "Kewenangan Kabupaten/Kota": {
        "Perikanan Budidaya": [
            { key: "Tambak Rakyat (Ha)", label: "Tambak Rakyat" },
            { key: "Kolam Ikan (Ha)", label: "Kolam Ikan" },
            { key: "Keramba Jaring Apung (Petak)", label: "Keramba Jaring Apung" },
            { key: "Saluran Tambak (Km)", label: "Saluran Tambak" },
            { key: "Jalan Produksi (Km)", label: "Jalan Produksi" },
            { key: "Jembatan Produksi (Unit)", label: "Jembatan Produksi" },
            { key: "Pintu Air (Unit)", label: "Pintu Air" },
            { key: "Balai Benih Ikan (BBI) (Unit)", label: "Balai Benih Ikan (BBI)" },
            { key: "Unit Pengolahan Ikan (UPI) (Unit)", label: "Unit Pengolahan Ikan (UPI)" }
        ],
        "Perikanan Tangkap": [
            { key: "Pelabuhan Perikanan (PP) (Unit)", label: "Pelabuhan Perikanan (PP)" },
            { key: "Sentra Nelayan (Unit)", label: "Sentra Nelayan" },
            { key: "Alat Penangkapan Ikan (Unit)", label: "Alat Penangkapan Ikan" },
            { key: "Kapal Penangkapan Ikan (Unit)", label: "Kapal Penangkapan Ikan" },
            { key: "Mesin Kapal (Unit)", label: "Mesin Kapal" },
            { key: "Cold Box/Fiber (Unit)", label: "Cold Box/Fiber" },
            { key: "Balai Nelayan (Unit)", label: "Balai Nelayan" }
        ],
        "Kelautan dan Pengelolaan Ruang Laut": [
            { key: "Tunnel Garam (Unit)", label: "Tunnel Garam" },
            { key: "Tempat Perebusan Garam (Unit)", label: "Tempat Perebusan Garam" },
            { key: "Gidang Garam Rakyat (Unit)", label: "Gudang Garam Rakyat" },
            { key: "Saluran Garam (Meter)", label: "Saluran Garam" },
            { key: "Jalan Produksi Garam  (Meter)", label: "Jalan Produksi Garam" },
            { key: "Lahan Mangrove Kawasan Konservasi (Ha)", label: "Lahan Mangrove Kawasan Konservasi" }
        ]
    },
    "Kewenangan Provinsi": {
        "All": [
            { key: "Balai Benih Ikan (BBI) (Unit)", label: "Balai Benih Ikan (BBI)" },
            { key: "Pelabuhan Perikanan (PP) (Unit)", label: "Pelabuhan Perikanan (PP)" },
            { key: "Tambak Rakyat (Ha)", label: "Tambak Rakyat" }
        ]
    }
};

const activeColumns = computed(() => {
    if (filterKewenangan.value === "Kewenangan Provinsi") {
        return columnDefinitions["Kewenangan Provinsi"]["All"];
    }
    return columnDefinitions["Kewenangan Kabupaten/Kota"][filterSektor.value] || [];
});

// Helper to extract unit from key
const getUnit = (key) => {
    const match = key.match(/\((.*?)\)/);
    return match ? match[1] : "";
};

// Process data with dual indicators
const processedData = computed(() => {
    if (!rawRecords.value?.length) return [];

    let filtered = rawRecords.value;

    // Filter by Kewenangan
    filtered = filtered.filter(r => r.itemCategory1?.nama === filterKewenangan.value);

    // Filter by Sektor (only for Kabupaten/Kota)
    if (filterKewenangan.value === "Kewenangan Kabupaten/Kota") {
        filtered = filtered.filter(r => r.itemCategory2?.nama === filterSektor.value);
    }

    const groupedData = new Map();

    filtered.forEach((record) => {
        const key = `${record.kd_prov?.kode || ""}-${record.kd_kab?.kode || ""}`;

        if (!groupedData.has(key)) {
            groupedData.set(key, {
                provinsi: record.kd_prov?.nama || "-",
                kabupaten: record.kd_kab?.nama || "-",
                data: {},
                totalEstimasi: 0,
            });
        }

        const item = groupedData.get(key);
        const value = Number(record.value) || 0;
        const categoryName = record.itemCategory3?.nama?.trim();
        const indicatorName = record.indikator?.nama;

        if (categoryName) {
            if (!item.data[categoryName]) {
                item.data[categoryName] = { volume: 0, estimasi: 0 };
            }

            if (indicatorName === "Volume Kerusakan") {
                item.data[categoryName].volume += value;
            } else if (indicatorName === "Estimasi Biaya Rehab/Rekon") {
                item.data[categoryName].estimasi += value;
                item.totalEstimasi += value;
            }
        }
    });

    return Array.from(groupedData.values());
});

const filteredData = computed(() => {
    if (!searchQuery.value.trim()) return processedData.value;
    const query = searchQuery.value.toLowerCase();
    return processedData.value.filter(item => 
        item.provinsi.toLowerCase().includes(query) || 
        item.kabupaten.toLowerCase().includes(query)
    );
});

const filteredAndSortedData = computed(() => {
    let data = [...filteredData.value];
    if (sortColumn.value) {
        data.sort((a, b) => {
            let aVal = a[sortColumn.value];
            let bVal = b[sortColumn.value];
            
            if (sortColumn.value === 'total') {
                aVal = a.totalEstimasi;
                bVal = b.totalEstimasi;
            }

            if (typeof aVal === "string") {
                return sortDirection.value === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            } else {
                return sortDirection.value === "asc" ? aVal - bVal : bVal - aVal;
            }
        });
    }
    return data;
});

// Totals
const grandTotals = computed(() => {
    const totals = {};
    activeColumns.value.forEach(col => {
        totals[col.key] = {
            volume: filteredAndSortedData.value.reduce((sum, row) => sum + (row.data[col.key]?.volume || 0), 0),
            estimasi: filteredAndSortedData.value.reduce((sum, row) => sum + (row.data[col.key]?.estimasi || 0), 0)
        };
    });
    return totals;
});

const overallEstimasiTotal = computed(() => {
    return filteredAndSortedData.value.reduce((sum, row) => sum + row.totalEstimasi, 0);
});

// Pagination
const totalPages = computed(() => Math.ceil(filteredAndSortedData.value.length / itemsPerPage.value));
const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    return filteredAndSortedData.value.slice(start, start + itemsPerPage.value);
});

const displayedPages = computed(() => {
    const pages = [];
    const total = totalPages.value;
    const current = currentPage.value;
    if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i);
    } else {
        if (current <= 3) {
            for (let i = 1; i <= 4; i++) pages.push(i);
            pages.push("...", total);
        } else if (current >= total - 2) {
            pages.push(1, "...");
            for (let i = total - 3; i <= total; i++) pages.push(i);
        } else {
            pages.push(1, "...", current - 1, current, current + 1, "...", total);
        }
    }
    return pages;
});

// Helpers
const formatNumber = (value) => {
    if (value == null || value === 0) return "0";
    return new Intl.NumberFormat("id-ID").format(value);
};

const formatDate = (isoString) => {
    if (!isoString) return "-";
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(isoString));
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
    if (sortColumn.value !== column) return "i-heroicons-arrows-up-down";
    return sortDirection.value === "asc" ? "i-heroicons-arrow-up" : "i-heroicons-arrow-down";
};

const changePage = (page) => {
    currentPage.value = page;
};

const triggerDownload = async () => {
    if (!filteredAndSortedData.value.length) return;
    isExporting.value = true;
    try {
        const exportData = filteredAndSortedData.value.map((row, idx) => {
            const rowData = { "No": idx + 1, "Provinsi": row.provinsi, "Kabupaten": row.kabupaten };
            activeColumns.value.forEach(col => {
                rowData[`${col.label} (Volume)`] = row.data[col.key]?.volume || 0;
                rowData[`${col.label} (Estimasi)`] = row.data[col.key]?.estimasi || 0;
            });
            rowData["Total Estimasi (Rp)"] = row.totalEstimasi;
            return rowData;
        });
        const filename = `Fasilitas_Kelautan_${filterKewenangan.value}_${filterSektor.value}`;
        await downloadDynamicExcel(exportData, filename);
    } catch (error) {
        console.error("Export failed:", error);
    } finally {
        isExporting.value = false;
    }
};

watch([filterKewenangan, filterSektor, searchQuery], () => {
    currentPage.value = 1;
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
th {
    white-space: nowrap;
}
</style>
