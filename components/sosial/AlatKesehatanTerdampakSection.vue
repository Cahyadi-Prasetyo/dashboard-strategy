<template>
    <div class="border-t border-gray-100 mt-6"></div>
    <div
        class="relative bg-white rounded-xl py-4 mt-0"
    >

        <!-- Title Section -->
        <EkonomiChartHeader
            :dataset-info="metaData.dataset"
            icon="i-heroicons-heart"
            icon-class="text-orange-600"
            class="mb-4"
        />
        

        <!-- Local Filters -->
        <div class="mb-2 grid grid-cols-1 md:grid-cols-3 gap-2">
            <div class="w-full">
                <label class="block text-xs font-semibold text-gray-700 mb-1.5">
                    Rumah Kesehatan Terdampak
                </label>
                <select
                        v-model="filterRumahKesehatan"
                        class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                >
                    <option :value="null">Rumah Kesehatan Terdampak</option>
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
                <label class="block text-xs font-semibold text-gray-700 mb-1.5">
                    Alat Kesehatan Terdampak
                </label>
                <select
                    v-model="filterAlatKesehatan"
                    class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
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
                <label class="block text-xs font-semibold text-gray-700 mb-1.5">
                    Ruangan Rumah Kesehatan
                </label>
                <select
                    v-model="filterRuangan"
                    class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
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

        <!-- Search & Download Controls -->
        <div class="mb-4 flex items-start justify-between gap-4">
            <div class="w-102">
                <div class="relative">
                    <UIcon
                        name="i-heroicons-magnifying-glass"
                        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                    />
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Cari wilayah..."
                        class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    />
                </div>
                <div
                    v-if="searchQuery"
                    class="mt-1 text-xs text-gray-600 text-left"
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
                    class="bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 border-none ring-0 h-[38px]"
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
                    class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-3"
                ></div>
                <p class="text-sm text-gray-600">Memuat data...</p>
            </div>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto rounded-lg border border-gray-200">
            <table class="w-full">
                <thead>
                    <tr class="bg-gray-100 border-b border-gray-300">
                        <th
                            class="px-2 py-1.5 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200"
                            rowspan="2"
                        >
                            No
                        </th>
                        <th
                            @click="toggleSort('provinsi')"
                            class="px-2 py-1.5 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                            rowspan="2"
                        >
                            <div class="flex items-center gap-1">
                                <span>Provinsi</span>
                                <UIcon
                                    :name="getSortIcon('provinsi')"
                                    class="w-3 h-3"
                                    :class="
                                        sortColumn === 'provinsi'
                                            ? 'text-emerald-600'
                                            : 'text-gray-400'
                                    "
                                />
                            </div>
                        </th>
                        <th
                            @click="toggleSort('kabupaten')"
                            class="px-2 py-1.5 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                            rowspan="2"
                        >
                            <div class="flex items-center gap-1">
                                <span>Kabupaten</span>
                                <UIcon
                                    :name="getSortIcon('kabupaten')"
                                    class="w-3 h-3"
                                    :class="
                                        sortColumn === 'kabupaten'
                                            ? 'text-emerald-600'
                                            : 'text-gray-400'
                                    "
                                />
                            </div>
                        </th>
                        <!-- Kategori Kerusakan Headers -->
                        <th
                            v-for="kerusakan in kategoriKerusakan"
                            :key="kerusakan"
                            :colspan="statusAkhir.length"
                            class="px-2 py-1.5 text-center text-[10px] font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200"
                            :class="getKerusakanColor(kerusakan)"
                        >
                            {{ kerusakan }}
                        </th>
                        <th
                            @click="toggleSort('total')"
                            class="px-2 py-1.5 text-center text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 cursor-pointer hover:bg-emerald-100 transition-colors select-none"
                            rowspan="2"
                        >
                            <div class="flex items-center justify-center gap-1">
                                <span>Total</span>
                                <UIcon
                                    :name="getSortIcon('total')"
                                    class="w-3 h-3"
                                    :class="
                                        sortColumn === 'total'
                                            ? 'text-emerald-600'
                                            : 'text-gray-400'
                                    "
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
                                class="px-2 py-1.5 text-center text-[9px] font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200"
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
                            :colspan="3 + kategoriKerusakan.length * statusAkhir.length + 1"
                            class="px-4 py-8 text-center text-gray-500"
                        >
                            <UIcon
                                name="i-heroicons-inbox"
                                class="w-12 h-12 mx-auto mb-2 text-gray-400"
                            />
                            <p>
                                {{
                                    searchQuery
                                        ? "Tidak ada data yang sesuai dengan pencarian"
                                        : "Tidak ada data tersedia"
                                }}
                            </p>
                        </td>
                    </tr>
                    <tr
                        v-for="(row, index) in paginatedData"
                        :key="index"
                        class="hover:bg-gray-50 transition-colors"
                    >
                        <td
                            class="px-2 py-1.5 text-[11px] text-gray-900 border-r border-gray-100"
                        >
                            {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                        </td>
                        <td
                            class="px-2 py-1.5 text-[11px] text-gray-900 border-r border-gray-100"
                        >
                            {{ row.provinsi }}
                        </td>
                        <td
                            class="px-2 py-1.5 text-[11px] text-gray-900 border-r border-gray-100"
                        >
                            {{ row.kabupaten }}
                        </td>
                        <!-- Data Cells -->
                        <template
                            v-for="kerusakan in kategoriKerusakan"
                            :key="`data-${kerusakan}`"
                        >
                            <td
                                v-for="status in statusAkhir"
                                :key="`${kerusakan}-${status}`"
                                class="px-2 py-1.5 text-[11px] text-center text-gray-900 border-r border-gray-100"
                                :class="getCellColor(kerusakan, status)"
                            >
                                {{ formatNumber(row.data[kerusakan]?.[status] || 0) }}
                            </td>
                        </template>
                        <td
                            class="px-2 py-1.5 text-[11px] text-center font-bold text-emerald-700 bg-emerald-50/50"
                        >
                            {{ formatNumber(row.total) }}
                        </td>
                    </tr>
                </tbody>
                <!-- Grand Total Footer -->
                <tfoot
                    v-if="filteredAndSortedData.length > 0"
                    class="bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-300"
                >
                    <tr class="font-bold">
                        <td
                            colspan="3"
                            class="px-2 py-2 text-[11px] text-gray-900 border-r border-gray-200"
                        >
                            <div class="flex items-center gap-2">
                                <UIcon
                                    name="i-heroicons-calculator"
                                    class="w-3.5 h-3.5 text-gray-600"
                                />
                                <span class="uppercase tracking-wide">Grand Total</span>
                            </div>
                        </td>
                        <!-- Grand Total Data Cells -->
                        <template
                            v-for="kerusakan in kategoriKerusakan"
                            :key="`total-${kerusakan}`"
                        >
                            <td
                                v-for="status in statusAkhir"
                                :key="`total-${kerusakan}-${status}`"
                                class="px-2 py-2 text-[11px] text-center text-gray-900 border-r border-gray-200"
                                :class="getTotalCellColor(kerusakan, status)"
                            >
                                {{ formatNumber(grandTotal.data[kerusakan]?.[status] || 0) }}
                            </td>
                        </template>
                        <td
                            class="px-2 py-2 text-[11px] text-center text-emerald-900 bg-emerald-200"
                        >
                            {{ formatNumber(grandTotal.total) }}
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
                title="Halaman Pertama"
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

            <!-- Page Numbers -->
            <div class="flex items-center gap-1">
                <template v-for="page in displayedPages" :key="page">
                    <button
                        v-if="page !== '...'"
                        @click="changePage(page)"
                        :class="[
                            'min-w-[32px] h-8 rounded-md border text-xs font-medium transition-all',
                            currentPage === page
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
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
                title="Halaman Terakhir"
            >
                <UIcon name="i-heroicons-chevron-double-right" class="w-3.5 h-3.5" />
            </button>
        </div>

        <!-- Pagination Info -->
        <div
            v-if="!loading && filteredAndSortedData.length > 0"
            class="text-center mt-2 text-[10px] text-gray-500"
        >
            Menampilkan {{ startItem }}-{{ endItem }} dari
            {{ filteredAndSortedData.length }} data
        </div>
    </div>
</template>

<script setup>
import { useDynamicExcel } from "~/composables/useDynamicExcel";
import EkonomiChartHeader from "~/components/ekonomi/ChartHeader.vue";
const { downloadDynamicExcel } = useDynamicExcel();

const props = defineProps({
    selectedWilayah: { type: Object, required: true },
});

const loading = ref(false);
const isExporting = ref(false);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const rawRecords = ref([]);
const sortColumn = ref("");
const sortDirection = ref("asc");

// Local Filters
const filterRumahKesehatan = ref("");
const filterAlatKesehatan = ref("");
const filterRuangan = ref("");

const metaData = ref({
    dataset: null,
    sektor: null,
    period: null,
});

const headers = useRequestHeaders(["cookie"]);

// Unique categories from data
const kategoriKerusakan = ref([]);
const statusAkhir = ref([]);
const availableRumahKesehatan = ref([]);
const availableAlatKesehatan = ref([]);
const availableRuangan = ref([]);

const formatNumber = (value) => {
    if (value == null || value === 0) return "0";
    return new Intl.NumberFormat("id-ID").format(value);
};

const formatDate = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
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

const getCellColor = (kerusakan, status) => {
    if (status === "Bisa Dipakai") {
        return "bg-blue-50/30";
    }
    return "bg-red-50/30";
};

const getTotalCellColor = (kerusakan, status) => {
    if (status === "Bisa Dipakai") {
        return "bg-blue-100";
    }
    return "bg-red-100";
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

async function fetchAlatKesehatanTerdampak() {
    loading.value = true;
    try {
        const w = props.selectedWilayah;
        const endpoint = "/api/agregat-insight";

        let requests = [];

        // Filter berdasarkan wilayah
        if (w.kabupaten?.length > 0) {
            requests = w.kabupaten.map((kabId) =>
                $fetch(endpoint, {
                    query: { id_dataset: 110, id_kab: kabId },
                    headers: headers,
                }),
            );
        } else if (w.provinsi?.length > 0) {
            requests = w.provinsi.map((provId) =>
                $fetch(endpoint, {
                    query: { id_dataset: 110, id_prov: provId },
                    headers: headers,
                }),
            );
        } else {
            requests = [
                $fetch(endpoint, {
                    query: { id_dataset: 110 },
                    headers: headers,
                }),
            ];
        }

        const responses = await Promise.all(requests);
        const allRecords = responses.flatMap((r) => r?.data?.records || []);
        rawRecords.value = allRecords;

        // Set metadata
        if (responses[0]?.data?.meta) {
            metaData.value = responses[0].data.meta;
        }

        // Extract unique categories
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
    } catch (error) {
        console.error("Error fetching alat kesehatan terdampak:", error);
        rawRecords.value = [];
    } finally {
        loading.value = false;
    }
}

// Process data with local filters
const processedData = computed(() => {
    let filtered = rawRecords.value;

    // Apply local filters
    if (filterRumahKesehatan.value) {
        filtered = filtered.filter(
            (r) => r.itemCategory1?.nama === filterRumahKesehatan.value
        );
    }
    if (filterAlatKesehatan.value) {
        filtered = filtered.filter(
            (r) => r.itemCategory2?.nama === filterAlatKesehatan.value
        );
    }
    if (filterRuangan.value) {
        filtered = filtered.filter(
            (r) => r.itemCategory3?.nama === filterRuangan.value
        );
    }

    // Group by wilayah
    const groupedData = new Map();

    filtered.forEach((record) => {
        const key = `${record.kd_prov?.kode || ""}-${record.kd_kab?.kode || ""}`;

        if (!groupedData.has(key)) {
            groupedData.set(key, {
                provinsi: record.kd_prov?.nama || "-",
                kabupaten: record.kd_kab?.nama || "-",
                data: {},
                total: 0,
            });

            // Initialize data structure
            kategoriKerusakan.value.forEach((kerusakan) => {
                groupedData.get(key).data[kerusakan] = {};
                statusAkhir.value.forEach((status) => {
                    groupedData.get(key).data[kerusakan][status] = 0;
                });
            });
        }

        const item = groupedData.get(key);
        const value = Number(record.value) || 0;
        const kerusakan = record.itemCategory4?.nama;
        const status = record.itemCategory5?.nama;

        if (kerusakan && status) {
            if (!item.data[kerusakan]) {
                item.data[kerusakan] = {};
            }
            if (!item.data[kerusakan][status]) {
                item.data[kerusakan][status] = 0;
            }
            item.data[kerusakan][status] += value;
            item.total += value;
        }
    });

    return Array.from(groupedData.values());
});

const filteredData = computed(() => {
    if (!searchQuery.value.trim()) {
        return processedData.value;
    }

    const query = searchQuery.value.toLowerCase();
    return processedData.value.filter((item) => {
        return (
            item.provinsi.toLowerCase().includes(query) ||
            item.kabupaten.toLowerCase().includes(query)
        );
    });
});

const filteredAndSortedData = computed(() => {
    let data = [...filteredData.value];

    if (sortColumn.value) {
        data.sort((a, b) => {
            const aVal = a[sortColumn.value];
            const bVal = b[sortColumn.value];

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

const startItem = computed(() => (currentPage.value - 1) * itemsPerPage.value + 1);
const endItem = computed(() =>
    Math.min(currentPage.value * itemsPerPage.value, filteredAndSortedData.value.length)
);

const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredAndSortedData.value.slice(start, end);
});

const grandTotal = computed(() => {
    const total = {
        data: {},
        total: 0,
    };

    // Initialize structure
    kategoriKerusakan.value.forEach((kerusakan) => {
        total.data[kerusakan] = {};
        statusAkhir.value.forEach((status) => {
            total.data[kerusakan][status] = 0;
        });
    });

    // Sum up all data
    filteredAndSortedData.value.forEach((row) => {
        kategoriKerusakan.value.forEach((kerusakan) => {
            statusAkhir.value.forEach((status) => {
                total.data[kerusakan][status] += row.data[kerusakan]?.[status] || 0;
            });
        });
        total.total += row.total || 0;
    });

    return total;
});

const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

const downloadData = computed(() => {
    return filteredAndSortedData.value.map((row, index) => {
        const rowData = {
            No: index + 1,
            Provinsi: row.provinsi,
            Kabupaten: row.kabupaten,
        };

        // Add all kategori kerusakan and status akhir columns
        kategoriKerusakan.value.forEach((kerusakan) => {
            statusAkhir.value.forEach((status) => {
                const columnName = `${kerusakan} - ${status}`;
                rowData[columnName] = row.data[kerusakan]?.[status] || 0;
            });
        });

        rowData.Total = row.total;
        return rowData;
    });
});

const triggerDownload = async () => {
    isExporting.value = true;
    try {
        const columns = [
            { header: "No", key: "No", width: 10 },
            { header: "Provinsi", key: "Provinsi", width: 20 },
            { header: "Kabupaten", key: "Kabupaten", width: 20 },
        ];

        // Add columns for each kategori kerusakan and status akhir
        kategoriKerusakan.value.forEach((kerusakan) => {
            statusAkhir.value.forEach((status) => {
                const columnName = `${kerusakan} - ${status}`;
                columns.push({
                    header: columnName,
                    key: columnName,
                    width: 20,
                });
            });
        });

        columns.push({ header: "Total", key: "Total", width: 15 });

        if (typeof downloadDynamicExcel === "function") {
            await downloadDynamicExcel(
                downloadData.value,
                `Data_Alat_Kesehatan_Terdampak_${new Date().toISOString().split("T")[0]}`,
                columns
            );
        } else {
            console.error("Fungsi downloadDynamicExcel tidak ditemukan.");
        }
    } catch (error) {
        console.error("Error downloading Excel:", error);
    } finally {
        isExporting.value = false;
    }
};

// Update available filters when local filters change
watch([filterRumahKesehatan, filterAlatKesehatan, filterRuangan], () => {
    let filtered = rawRecords.value;

    // Re-filter for dropdown options
    if (filterRumahKesehatan.value) {
        filtered = filtered.filter(
            (r) => r.itemCategory1?.nama === filterRumahKesehatan.value
        );
    }
    if (filterAlatKesehatan.value) {
        filtered = filtered.filter(
            (r) => r.itemCategory2?.nama === filterAlatKesehatan.value
        );
    }
    if (filterRuangan.value) {
        filtered = filtered.filter(
            (r) => r.itemCategory3?.nama === filterRuangan.value
        );
    }

    // Update available options based on current filters
    const rsSet = new Set();
    const alatSet = new Set();
    const ruanganSet = new Set();

    rawRecords.value.forEach((record) => {
        let include = true;

        if (filterRumahKesehatan.value && record.itemCategory1?.nama !== filterRumahKesehatan.value) {
            include = false;
        }
        if (filterAlatKesehatan.value && record.itemCategory2?.nama !== filterAlatKesehatan.value) {
            include = false;
        }
        if (filterRuangan.value && record.itemCategory3?.nama !== filterRuangan.value) {
            include = false;
        }

        if (include) {
            if (record.itemCategory1?.nama) rsSet.add(record.itemCategory1.nama);
            if (record.itemCategory2?.nama) alatSet.add(record.itemCategory2.nama);
            if (record.itemCategory3?.nama) ruanganSet.add(record.itemCategory3.nama);
        }
    });

    if (!filterRumahKesehatan.value) {
        availableRumahKesehatan.value = Array.from(rsSet).sort();
    }
    if (!filterAlatKesehatan.value) {
        availableAlatKesehatan.value = Array.from(alatSet).sort();
    }
    if (!filterRuangan.value) {
        availableRuangan.value = Array.from(ruanganSet).sort();
    }

    currentPage.value = 1;
});

watch(
    () => props.selectedWilayah,
    async () => {
        searchQuery.value = "";
        currentPage.value = 1;
        sortColumn.value = "";
        sortDirection.value = "asc";
        filterRumahKesehatan.value = "";
        filterAlatKesehatan.value = "";
        filterRuangan.value = "";
        await fetchAlatKesehatanTerdampak();
    },
    { deep: true, immediate: true }
);

watch(searchQuery, () => {
    currentPage.value = 1;
});
</script>