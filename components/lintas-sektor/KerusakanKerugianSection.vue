<template>
    <div class="relative bg-white border border-gray-200 rounded-xl shadow-sm p-4 pt-10 mt-6">
        <!-- Header Badge -->
        <div class="absolute -top-4 left-0 right-0 px-4 flex flex-wrap items-center justify-between gap-2 z-20">
            <div class="flex flex-wrap items-center gap-2">
                <div class="flex items-center gap-2 px-4 py-1.5 bg-purple-50 rounded-lg border border-purple-100 shadow-sm whitespace-nowrap">
                    <UIcon name="i-heroicons-banknotes" class="w-4 h-4 text-purple-600" />
                    <span class="text-[10px] font-black text-purple-700 uppercase tracking-wider">
                        Penilaian Kerusakan dan Kerugian
                    </span>
                </div>

                <div class="flex items-center gap-1.5 bg-white/90 backdrop-blur px-2 py-1 rounded-lg border border-gray-200 shadow-sm">
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
                {{ metaData.dataset?.judul || "Penilaian Kerusakan dan Kerugian Pasca Bencana" }}
            </h3>
        </div>

        <!-- Filters & Search -->
        <div class="mb-4 flex flex-wrap items-center justify-end gap-2">
            <!-- Filter Indikator -->
            <div class="w-60">
                <select
                    v-model="selectedIndikator"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                >
                    <option value="">Semua Indikator</option>
                    <option
                        v-for="indikator in availableIndikator"
                        :key="indikator"
                        :value="indikator"
                    >
                        {{ indikator }}
                    </option>
                </select>
            </div>

            <!-- Search -->
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
                        class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
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

            <!-- Excel Export -->
            <UTooltip text="Export Excel" :popper="{ placement: 'top' }">
                <UButton
                    icon="i-heroicons-document-arrow-down"
                    size="sm"
                    :loading="isExporting"
                    :disabled="!filteredAndSortedData.length || loading"
                    @click="triggerDownload"
                    class="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/40 hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 border-none ring-0 h-[38px]"
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
                    class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-3"
                ></div>
                <p class="text-sm text-gray-600">Memuat data...</p>
            </div>
        </div>

        <!-- Table -->
        <!-- Table dengan Sticky Columns -->
    <div v-else class="overflow-x-auto rounded-lg border border-gray-200">
    <table class="w-full relative">
        <thead>
            <tr class="bg-gray-100 border-b border-gray-300">
                <th
                    rowspan="2"
                    class="px-2 py-1.5 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200 sticky left-0 z-20 bg-gray-100"
                >
                    No
                </th>
                <th
                    rowspan="2"
                    @click="toggleSort('provinsi')"
                    class="px-2 py-1.5 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors select-none sticky left-[40px] z-20 bg-gray-100"
                >
                    <div class="flex items-center gap-1">
                        <span>Provinsi</span>
                        <UIcon
                            :name="getSortIcon('provinsi')"
                            class="w-3 h-3"
                            :class="
                                sortColumn === 'provinsi'
                                    ? 'text-purple-600'
                                    : 'text-gray-400'
                            "
                        />
                    </div>
                </th>
                <th
                    rowspan="2"
                    @click="toggleSort('kabupaten')"
                    class="px-2 py-1.5 text-left text-[10px] font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors select-none sticky left-[140px] z-20 bg-gray-100"
                >
                    <div class="flex items-center gap-1">
                        <span>Kabupaten</span>
                        <UIcon
                            :name="getSortIcon('kabupaten')"
                            class="w-3 h-3"
                            :class="
                                sortColumn === 'kabupaten'
                                    ? 'text-purple-600'
                                    : 'text-gray-400'
                            "
                        />
                    </div>
                </th>
                        <!-- Sektor Headers (itemCategory1) -->
                        <th
                            v-for="sektor in uniqueSektor"
                            :key="sektor"
                            :colspan="uniqueSubSektor.length"
                            class="px-2 py-1.5 text-center text-[10px] font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200"
                            :class="getSektorColor(sektor)"
                        >
                            {{ sektor }}
                        </th>
                        <th
                            rowspan="2"
                            @click="toggleSort('total')"
                            class="px-2 py-1.5 text-center text-[10px] font-bold text-purple-700 uppercase tracking-wider bg-purple-50 cursor-pointer hover:bg-purple-100 transition-colors select-none"
                        >
                            <div class="flex items-center justify-center gap-1">
                                <span>Total</span>
                                <UIcon
                                    :name="getSortIcon('total')"
                                    class="w-3 h-3"
                                    :class="
                                        sortColumn === 'total'
                                            ? 'text-purple-600'
                                            : 'text-gray-400'
                                    "
                                />
                            </div>
                        </th>
                    </tr>
                    <tr class="bg-gray-50 border-b border-gray-300">
                        <!-- Sub-Sektor Headers (itemCategory2) -->
                        <template v-for="sektor in uniqueSektor" :key="`sub-${sektor}`">
                            <th
                                v-for="subSektor in uniqueSubSektor"
                                :key="`${sektor}-${subSektor}`"
                                class="px-2 py-1.5 text-center text-[9px] font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200"
                                :class="getSubSektorColor(subSektor)"
                            >
                                {{ subSektor }}
                            </th>
                        </template>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    <tr v-if="paginatedData.length === 0">
                        <td
                            :colspan="3 + uniqueSektor.length * uniqueSubSektor.length + 1"
                            class="px-4 py-8 text-center text-gray-500"
                        >
                            <UIcon
                                name="i-heroicons-inbox"
                                class="w-12 h-12 mx-auto mb-2 text-gray-400"
                            />
                            <p>
                                {{
                                    searchQuery || selectedIndikator
                                        ? "Tidak ada data yang sesuai dengan filter"
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
                        class="px-2 py-1.5 text-[11px] text-gray-900 border-r border-gray-100 sticky left-0 z-10 bg-white"
                    >
                        {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                    </td>
                    <td
                        class="px-2 py-1.5 text-[11px] text-gray-900 border-r border-gray-100 sticky left-[40px] z-10 bg-white"
                    >
                        {{ row.provinsi }}
                    </td>
                    <td
                        class="px-2 py-1.5 text-[11px] text-gray-900 border-r border-gray-100 sticky left-[140px] z-10 bg-white"
                    >
                        {{ row.kabupaten }}
                    </td>
                        <!-- Data Cells -->
                        <template v-for="sektor in uniqueSektor" :key="`data-${sektor}`">
                            <td
                                v-for="subSektor in uniqueSubSektor"
                                :key="`${sektor}-${subSektor}`"
                                class="px-2 py-1.5 text-[11px] text-right text-gray-900 border-r border-gray-100"
                                :class="getCellColor(sektor)"
                            >
                                {{ formatRupiah(row.data[sektor]?.[subSektor] || 0) }}
                            </td>
                        </template>
                        <td
                            class="px-2 py-1.5 text-[11px] text-right font-bold text-purple-700 bg-purple-50/50"
                        >
                            {{ formatRupiah(row.total) }}
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
                    class="px-2 py-2 text-[11px] text-gray-900 border-r border-gray-200 sticky left-0 z-10 bg-gradient-to-r from-gray-50 to-gray-100"
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
                        <template v-for="sektor in uniqueSektor" :key="`total-${sektor}`">
                            <td
                                v-for="subSektor in uniqueSubSektor"
                                :key="`total-${sektor}-${subSektor}`"
                                class="px-2 py-2 text-[11px] text-right text-gray-900 border-r border-gray-200"
                                :class="getTotalCellColor(sektor)"
                            >
                                {{ formatRupiah(grandTotal.data[sektor]?.[subSektor] || 0) }}
                            </td>
                        </template>
                        <td
                            class="px-2 py-2 text-[11px] text-right text-purple-900 bg-purple-200"
                        >
                            {{ formatRupiah(grandTotal.total) }}
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
                                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
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

        <!-- Footer Info -->
        <div
            class="mt-4 flex flex-col md:flex-row items-center justify-between text-[10px] text-gray-400 border-t border-gray-100 pt-3 px-2 gap-3"
        >
            <div class="flex flex-col gap-1.5">
                <div
                    class="flex items-center gap-2 text-[9px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full w-fit font-medium"
                >
                    <UIcon name="i-heroicons-information-circle" class="w-3 h-3" />
                    <span>
                        Penilaian kerusakan dan kerugian pasca bencana dari
                        <b class="uppercase tracking-wider">{{
                            metaData.dataset?.sumber || "Kajian Kebutuhan Pasca Bencana"
                        }}</b>
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useDynamicExcel } from "~/composables/useDynamicExcel";
const { downloadDynamicExcel } = useDynamicExcel();

const props = defineProps({
    selectedWilayah: { type: Object, required: true },
});

const headers = useRequestHeaders(["cookie"]);

const loading = ref(false);
const isExporting = ref(false);
const searchQuery = ref("");
const selectedIndikator = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const rawRecords = ref([]);
const sortColumn = ref("");
const sortDirection = ref("asc");

const metaData = ref({
    dataset: null,
    sektor: null,
    period: null,
});

// Unique categories
const uniqueSektor = ref([]);
const availableIndikator = ref([]);

const formatRupiah = (value) => {
    if (value == null || value === 0) return "-";  // ← Ubah dari "Rp 0" menjadi "-"
    const formatted = new Intl.NumberFormat("id-ID").format(value);
    return `Rp ${formatted}`;
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

const getSektorColor = (sektor) => {
    const colors = {
        Perumahan: "bg-blue-100",
        Infrastruktur: "bg-green-100",
        Ekonomi: "bg-yellow-100",
        Sosial: "bg-orange-100",
        Lintas: "bg-purple-100",
    };
    return colors[sektor] || "bg-gray-100";
};

const getSubSektorColor = () => {
    return "bg-gray-50/50";
};

const getCellColor = (sektor) => {
    const colors = {
        Perumahan: "bg-blue-50/30",
        Infrastruktur: "bg-green-50/30",
        Ekonomi: "bg-yellow-50/30",
        Sosial: "bg-orange-50/30",
        Lintas: "bg-purple-50/30",
    };
    return colors[sektor] || "bg-gray-50/30";
};

const getTotalCellColor = (sektor) => {
    const colors = {
        Perumahan: "bg-blue-100",
        Infrastruktur: "bg-green-100",
        Ekonomi: "bg-yellow-100",
        Sosial: "bg-orange-100",
        Lintas: "bg-purple-100",
    };
    return colors[sektor] || "bg-gray-100";
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

// Computed: uniqueSubSektor yang dinamis berdasarkan indikator
const uniqueSubSektor = computed(() => {
    let filtered = rawRecords.value;
    
    // Filter berdasarkan indikator yang dipilih
    if (selectedIndikator.value) {
        filtered = filtered.filter(r => r.indikator?.nama === selectedIndikator.value);
    }
    
    const subSektorSet = new Set();
    filtered.forEach((record) => {
        if (record.itemCategory2?.nama) {
            subSektorSet.add(record.itemCategory2.nama);
        }
    });
    
    return Array.from(subSektorSet).sort();
});

async function fetchKerusakanKerugian() {
    loading.value = true;
    try {
        const w = props.selectedWilayah;
        const endpoint = "/api/agregat-insight";

        let requests = [];

        // Filter berdasarkan wilayah
        if (w.kabupaten?.length > 0) {
            requests = w.kabupaten.map((kabId) =>
                $fetch(endpoint, {
                    query: { id_dataset: 125, id_kab: kabId },
                    headers: headers,
                })
            );
        } else if (w.provinsi?.length > 0) {
            requests = w.provinsi.map((provId) =>
                $fetch(endpoint, {
                    query: { id_dataset: 125, id_prov: provId },
                    headers: headers,
                })
            );
        } else {
            requests = [
                $fetch(endpoint, {
                    query: { id_dataset: 125 },
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
        const sektorSet = new Set();
        const indikatorSet = new Set();

        allRecords.forEach((record) => {
            if (record.itemCategory1?.nama) sektorSet.add(record.itemCategory1.nama);
            if (record.indikator?.nama) indikatorSet.add(record.indikator.nama);
        });

        uniqueSektor.value = Array.from(sektorSet).sort();
        availableIndikator.value = Array.from(indikatorSet).sort();
    } catch (error) {
        console.error("Error fetching kerusakan kerugian:", error);
        rawRecords.value = [];
    } finally {
        loading.value = false;
    }
}

// Process data with filters
const processedData = computed(() => {
    let filtered = rawRecords.value;

    // Apply indikator filter
    if (selectedIndikator.value) {
        filtered = filtered.filter(
            (r) => r.indikator?.nama === selectedIndikator.value
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
            uniqueSektor.value.forEach((sektor) => {
                groupedData.get(key).data[sektor] = {};
                uniqueSubSektor.value.forEach((subSektor) => {
                    groupedData.get(key).data[sektor][subSektor] = 0;
                });
            });
        }

        const item = groupedData.get(key);
        const value = Number(record.value) || 0;
        const sektor = record.itemCategory1?.nama;
        const subSektor = record.itemCategory2?.nama;

        if (sektor && subSektor) {
            if (!item.data[sektor]) {
                item.data[sektor] = {};
            }
            if (!item.data[sektor][subSektor]) {
                item.data[sektor][subSektor] = 0;
            }
            item.data[sektor][subSektor] += value;
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
    Math.min(
        currentPage.value * itemsPerPage.value,
        filteredAndSortedData.value.length
    )
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
    uniqueSektor.value.forEach((sektor) => {
        total.data[sektor] = {};
        uniqueSubSektor.value.forEach((subSektor) => {
            total.data[sektor][subSektor] = 0;
        });
    });

    // Sum up all data
    filteredAndSortedData.value.forEach((row) => {
        uniqueSektor.value.forEach((sektor) => {
            uniqueSubSektor.value.forEach((subSektor) => {
                total.data[sektor][subSektor] += row.data[sektor]?.[subSektor] || 0;
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

        // Add all sektor and subsektor columns
        uniqueSektor.value.forEach((sektor) => {
            uniqueSubSektor.value.forEach((subSektor) => {
                const columnName = `${sektor} - ${subSektor}`;
                rowData[columnName] = row.data[sektor]?.[subSektor] || 0;
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

        // Add columns for each sektor and subsektor
        uniqueSektor.value.forEach((sektor) => {
            uniqueSubSektor.value.forEach((subSektor) => {
                const columnName = `${sektor} - ${subSektor}`;
                columns.push({
                    header: columnName,
                    key: columnName,
                    width: 20,
                });
            });
        });

        columns.push({ header: "Total", key: "Total", width: 20 });

        if (typeof downloadDynamicExcel === "function") {
            await downloadDynamicExcel(
                downloadData.value,
                `Data_Kerusakan_Kerugian_${new Date().toISOString().split("T")[0]}`,
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

// Update available filters when indikator changes
watch(selectedIndikator, () => {
    currentPage.value = 1;
});

watch(
    () => props.selectedWilayah,
    async () => {
        searchQuery.value = "";
        currentPage.value = 1;
        sortColumn.value = "";
        sortDirection.value = "asc";
        selectedIndikator.value = "";
        await fetchKerusakanKerugian();
    },
    { deep: true, immediate: true }
);

watch(searchQuery, () => {
    currentPage.value = 1;
});
</script>