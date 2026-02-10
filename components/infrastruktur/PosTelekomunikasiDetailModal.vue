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
            class="relative w-full max-w-7xl max-h-[90vh] flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10"
        >
            <!-- Header -->
            <div class="px-6 pt-6 pb-2 flex items-center justify-between gap-4 border-b border-gray-100">
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
                    <div class="w-64">
                        <input
                            v-model="searchQuery"
                            type="text"
                            placeholder="Cari wilayah..."
                            class="w-full pl-9 pr-4 py-1 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <UTooltip text="Excel" :popper="{ placement: 'top' }">
                        <UButton
                            icon="i-heroicons-document-arrow-down"
                            size="xs"
                            :loading="isExporting"
                            :disabled="!filteredData.length || loading"
                            @click="triggerDownload"
                            class="bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md"
                        >
                            <span class="tracking-wide text-sm">Excel</span>
                        </UButton>
                    </UTooltip>
                    <UButton
                        color="error"
                        variant="soft"
                        icon="i-heroicons-x-mark"
                        @click="$emit('close')"
                        class="bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md"
                    />
                </div>
            </div>

            <!-- Table -->
            <div class="flex-1 overflow-y-auto p-4 bg-slate-50/30">
                <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                    <SharedTable 
                        :columns="tableColumns"
                        :data="paginatedData"
                        :loading="loading"
                        :show-no="true"
                        :total-items="filteredData.length"
                        :items-per-page="10"
                        v-model:current-page="currentPage"
                        empty-message="Tidak ada data tersedia"
                    >
                        <template #row="{ row, index, startIndex }">
                            <td class="px-3 py-2 text-[12px] text-slate-500 border-r border-gray-100 text-center bg-slate-50/30">
                                {{ startIndex + index }}
                            </td>

                            <td
                                class="px-3 py-2 text-[12px] border-r border-gray-100 font-bold transition-all"
                                :class="canDrillDown(row)
                                    ? 'text-slate-700 cursor-pointer hover:bg-blue-50 hover:underline'
                                    : 'text-slate-900'"
                                @click="handleDrillDown(row)"
                            >
                                <div class="flex items-center justify-between gap-1">
                                    <span class="truncate">{{ row.region }}</span>
                                    <UIcon
                                        v-if="canDrillDown(row)"
                                        name="i-heroicons-chevron-right"
                                        class="w-4 h-4 text-slate-900 flex-shrink-0"
                                    />
                                </div>
                            </td>

                            <td
                                v-for="status in statusKerusakan"
                                :key="status.key"
                                class="px-3 py-2 text-[12px] text-right text-slate-900 border-r border-gray-100 font-mono font-medium"
                            >
                                {{ formatNumber(row[status.key] || 0) }}
                            </td>

                            <td class="px-3 py-2 text-[12px] text-right font-bold text-blue-700 bg-blue-50/50">
                                {{ formatNumber(row.total || 0) }}
                            </td>
                        </template>
                    </SharedTable>
                </div>
            </div>
            <!-- Metadata Footer -->
            <div
                v-if="datasetInfo?.sumber || datasetInfo?.sumber_data || datasetInfo?.instansi"
                class="px-6 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500 shrink-0 z-20"
            >
                <div v-if="datasetInfo?.sumber || datasetInfo?.sumber_data" class="flex items-center gap-1">
                    <span class="font-bold">Sumber:</span>
                    <span>{{ datasetInfo.sumber || datasetInfo.sumber_data }}</span>
                </div>
                <div v-if="datasetInfo?.instansi" class="flex items-center gap-1">
                    <span class="font-bold">Instansi:</span>
                    <span>{{ datasetInfo.instansi }}</span>
                </div>
                <div v-if="datasetInfo?.terakhir_diupdate" class="flex items-center gap-1">
                    <span class="font-bold">Update Terakhir:</span>
                    <span>{{ formatDate(datasetInfo.terakhir_diupdate) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import SharedTable from "~/components/shared/SharedTable.vue";
import { useDynamicExcel } from "~/composables/useDynamicExcel";

const { downloadDynamicExcel } = useDynamicExcel();
const headers = useRequestHeaders(["cookie"]);

const props = defineProps({
    isOpen: Boolean,
    regionIds: { type: Array, default: () => [] },
    metaData: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["close"]);

const loading = ref(false);
const currentPage = ref(1);
const searchQuery = ref("");
const rawRecords = ref([]);
const isExporting = ref(false);
const datasetInfo = ref(null);

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

// Navigation
const currentLevel = ref("provinsi");
const currentParent = ref(null);

// Status kerusakan
const statusKerusakan = [
    { key: 'Rusak Ringan', label: 'Rusak Ringan' },
    { key: 'Rusak Sedang', label: 'Rusak Sedang' },
    { key: 'Rusak Berat', label: 'Rusak Berat' },
    { key: 'Rusak Hanyut', label: 'Rusak Hanyut' },
    { key: 'Rusak Tidak Diketahui', label: 'Rusak Tidak Diketahui' },
];

const currentTitle = computed(() => {
    return currentParent.value
        ? `Detail Pos & Telekomunikasi - ${currentParent.value.name}`
        : 'Detail Kerusakan Pos & Telekomunikasi';
});

// Table columns
const tableColumns = computed(() => {
    const cols = [
        { key: "region", label: "Wilayah", width: "25%" }
    ];
    
    statusKerusakan.forEach(status => {
        cols.push({ 
            key: status.key, 
            label: `${status.label} (Unit)`, 
            align: "right" 
        });
    });
    
    cols.push({ key: "total", label: "Total (Unit)", align: "right" });
    
    return cols;
});

const formatNumber = (num) => new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2
}).format(num);

// Fetch data
async function fetchData() {
    loading.value = true;
    rawRecords.value = [];

    try {
        let requests = [];
        const baseQuery = { id_dataset: 132 };

        if (currentLevel.value === "provinsi") {
            const hasSpecificProvinces = props.regionIds.length > 0 && props.regionIds[0].length === 2;

            if (hasSpecificProvinces) {
                requests = props.regionIds.map((id) =>
                    $fetch("/api/agregat-insight", {
                        query: { ...baseQuery, id_prov: id },
                        headers: headers
                    }),
                );
            } else {
                requests = [
                    $fetch("/api/agregat-insight", { 
                        query: baseQuery,
                        headers: headers 
                    }),
                ];
            }
        } else if (currentLevel.value === "kabupaten" && currentParent.value) {
            requests = [
                $fetch("/api/agregat-insight", {
                    query: { ...baseQuery, id_prov: currentParent.value.id },
                    headers: headers
                }),
            ];
        } else if (currentLevel.value === "kecamatan" && currentParent.value) {
            requests = [
                $fetch("/api/agregat-insight", {
                    query: { ...baseQuery, id_kab: currentParent.value.id },
                    headers: headers
                }),
            ];
        }

        const responses = await Promise.all(requests);
        if (responses[0]?.data?.meta) {
            datasetInfo.value = responses[0].data.meta.dataset;
        }
        const allRecords = responses.flatMap((r) => r?.data?.records || []);
        
        rawRecords.value = allRecords.filter(record => {
            return record.itemCategory1?.kode === "2.5";
        });
    } catch (e) {
        console.error("Fetch Error:", e);
    } finally {
        loading.value = false;
    }
}

// Process data
// const processedData = computed(() => {
//     if (!rawRecords.value.length) return [];

//     const groupedMap = new Map();

//     rawRecords.value.forEach((r) => {
//         let key, name, isChild;
//         const provCode = r.kd_prov?.kode;
//         const kabCode = r.kd_kab?.kode;
//         const kecCode = r.kd_kec?.kode;

//         if (currentLevel.value === "provinsi") {
//             if (!provCode) return;
//             key = provCode;
//             name = r.kd_prov?.nama;
//             isChild = !!kabCode;
//         } else if (currentLevel.value === "kabupaten") {
//             if (!kabCode || (currentParent.value && provCode !== currentParent.value.id)) return;
//             key = kabCode;
//             name = r.kd_kab?.nama;
//             isChild = !!kecCode;
//         } else if (currentLevel.value === "kecamatan") {
//             if (!kecCode || (currentParent.value && kabCode !== currentParent.value.id)) return;
//             key = kecCode;
//             name = r.kd_kec?.nama;
//             isChild = false;
//         }

//         if (!key) return;

//         if (!groupedMap.has(key)) {
//             groupedMap.set(key, {
//                 id: key,
//                 region: name || "N/A",
//                 hasParentRow: false,
//                 total: 0
//             });
//             statusKerusakan.forEach(status => {
//                 groupedMap.get(key)[status.key] = 0;
//             });
//         }

//         const row = groupedMap.get(key);
//         const val = Number(r.value) || 0;

//         if (!isChild) {
//             if (!row.hasParentRow) {
//                 statusKerusakan.forEach(status => row[status.key] = 0);
//                 row.total = 0;
//                 row.hasParentRow = true;
//             }
//         } else {
//             if (row.hasParentRow) return;
//         }

//         const statusName = r.itemCategory4?.nama;
//         if (statusName && row[statusName] !== undefined) {
//             row[statusName] += val;
//             row.total += val;
//         }
//     });

//     return Array.from(groupedMap.values());
//});
// Process data - VERSI SIMPLIFIED

const processedData = computed(() => {
    console.log('=== DEBUG PROCESSED DATA ===');
    console.log('rawRecords.value.length:', rawRecords.value.length);
    console.log('currentLevel:', currentLevel.value);
    console.log('currentParent:', currentParent.value);
    
    if (!rawRecords.value.length) {
        console.log('No raw records');
        return [];
    }

    const groupedMap = new Map();

    rawRecords.value.forEach((r, index) => {
        if (index < 3) { // Log 3 record pertama saja
            console.log(`Record ${index}:`, {
                provCode: r.kd_prov?.kode,
                kabCode: r.kd_kab?.kode,
                kecCode: r.kd_kec?.kode,
                category4: r.itemCategory4?.nama,
                value: r.value
            });
        }

        let key, name, isChild;
        const provCode = r.kd_prov?.kode;
        const kabCode = r.kd_kab?.kode;
        const kecCode = r.kd_kec?.kode;

        if (currentLevel.value === "provinsi") {
            if (!provCode) return;
            key = provCode;
            name = r.kd_prov?.nama;
            isChild = !!kabCode;
        } else if (currentLevel.value === "kabupaten") {
            if (!kabCode || (currentParent.value && provCode !== currentParent.value.id)) return;
            key = kabCode;
            name = r.kd_kab?.nama;
            isChild = !!kecCode;
        } else if (currentLevel.value === "kecamatan") {
            if (!kecCode || (currentParent.value && kabCode !== currentParent.value.id)) return;
            key = kecCode;
            name = r.kd_kec?.nama;
            isChild = false;
        }

        if (!key) return;

        if (!groupedMap.has(key)) {
            groupedMap.set(key, {
                id: key,
                region: name || "N/A",
                hasParentRow: false,
                total: 0
            });
            statusKerusakan.forEach(status => {
                groupedMap.get(key)[status.key] = 0;
            });
        }

        const row = groupedMap.get(key);
        const val = Number(r.value) || 0;

        if (!isChild) {
            if (!row.hasParentRow) {
                statusKerusakan.forEach(status => row[status.key] = 0);
                row.total = 0;
                row.hasParentRow = true;
            }
        } else {
            if (row.hasParentRow) return;
        }

        const statusName = r.itemCategory4?.nama;
        if (statusName && row[statusName] !== undefined) {
            row[statusName] += val;
            row.total += val;
        }
    });

    const result = Array.from(groupedMap.values());
    console.log('Processed data result:', result);
    console.log('=== END DEBUG ===');
    
    return result;
});

const filteredData = computed(() => {
    const data = processedData.value;
    if (!searchQuery.value) return data;
    const q = searchQuery.value.toLowerCase();
    return data.filter((r) => r.region.toLowerCase().includes(q));
});

const paginatedData = computed(() => {
    const itemsPerPage = 10;
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredData.value.slice(start, end);
});

const canDrillDown = (row) => {
    if (!row?.id) return false;
    if (currentLevel.value === "provinsi") return row.id.length === 2;
    if (currentLevel.value === "kabupaten") return row.id.length === 4;
    return false;
};

function handleDrillDown(row) {
    if (!canDrillDown(row)) return;

    if (currentLevel.value === "provinsi") {
        currentLevel.value = "kabupaten";
    } else if (currentLevel.value === "kabupaten") {
        currentLevel.value = "kecamatan";
    }

    currentParent.value = { id: row.id, name: row.region };
    currentPage.value = 1;
    searchQuery.value = "";
    fetchData();
}

function handleBack() {
    if (currentLevel.value === "kabupaten") {
        currentLevel.value = "provinsi";
        currentParent.value = null;
    } else if (currentLevel.value === "kecamatan") {
        currentLevel.value = "kabupaten";
        const provId = currentParent.value.id.substring(0, 2);
        currentParent.value = { id: provId, name: "Wilayah Sebelumnya" };
    }
    searchQuery.value = "";
    currentPage.value = 1;
    fetchData();
}

const downloadData = computed(() => {
    return filteredData.value.map((row, index) => {
        const rowData = {
            No: index + 1,
            Wilayah: row.region,
        };

        statusKerusakan.forEach((status) => {
            rowData[status.label] = row[status.key] || 0;
        });

        rowData['Total'] = row.total || 0;

        return rowData;
    });
});

const triggerDownload = async () => {
    isExporting.value = true;
    try {
        const dynamicColumns = [
            { header: "No", key: "No", width: 8 },
            { header: "Wilayah", key: "Wilayah", width: 30 },
            ...statusKerusakan.map((status) => ({
                header: status.label,
                key: status.label,
                width: 18,
            })),
            { header: "Total", key: "Total", width: 15 },
        ];

        if (typeof downloadDynamicExcel === "function") {
            const fileName = `Kerusakan_Pos_Telekomunikasi_${new Date().toISOString().split("T")[0]}`;
            
            await downloadDynamicExcel(
                downloadData.value,
                fileName,
                dynamicColumns
            );
        } else {
            throw new Error("Fungsi downloadDynamicExcel tidak ditemukan.");
        }
    } catch (error) {
        console.error("Error downloading Excel:", error);
    } finally {
        isExporting.value = false;
    }
};

watch(
    () => props.isOpen,
    (val) => {
        if (val) {
            currentLevel.value = "provinsi";
            currentParent.value = null;
            searchQuery.value = "";
            currentPage.value = 1;
            fetchData();
        }
    },
    { immediate: true },
);
</script>