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
            class="relative w-full max-w-6xl max-h-[90vh] flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10"
        >
            <div class="px-6 pt-6 pb-2 flex items-center justify-between gap-4">
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
                        :disabled="!filteredData.length || pending"
                        @click="triggerDownload"
                        class="bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 border-none ring-0 h-[31px]"
                        :ui="{
                            rounded: 'rounded-lg',
                            padding: { sm: 'px-4 py-1' },
                            font: 'font-semibold',
                            icon: { size: { sm: 'w-4 h-4' } },
                        }"
                        >
                        <span class="tracking-wide text-sm">Excel</span>
                        </UButton>
                    </UTooltip>
                    <UButton
                        color="error"
                        variant="soft"
                        icon="i-heroicons-x-mark"
                        @click="$emit('close')"
                        class="bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/40 hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 border-none ring-0 h-[31px]"
                    />
                </div>
            </div>

                 
            <div class="px-6 py-4 bg-white border-b border-gray-100">
                <div class="flex flex-wrap gap-2">
                    <button
                        v-for="(tab, index) in tabItems"
                        :key="index"
                        @click="activeTab = index"
                        class="px-4 py-2 text-xs font-bold rounded-full transition-all duration-200 border"
                        :class="activeTab === index 
                            ? 'bg-gray-600 text-white border-gray-600 shadow-md shadow-gray-200' 
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700'"
                    >
                        {{ tab.label }}
                    </button>
                </div>
            </div>

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
                        empty-message="Tidak ada data detail tersedia"
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
                                v-for="card in props.columnConfig[activeTab]?.cards"
                                :key="card.label"
                                class="px-3 py-2 text-[12px] text-right text-slate-900 border-r border-gray-100 font-mono font-medium"
                            >
                                {{ formatNumber(row[card.label] || 0) }}
                            </td>
                        </template>
                    </SharedTable>
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

const props = defineProps({
    isOpen: Boolean,
    title: String,
    regionIds: { type: Array, required: true },
    tahun: { type: Number, default: 2026 },
    datasetId: { type: Number, required: true },
    indicatorId: { type: Number, default: null },
    columnConfig: { type: Array, required: true },
    pivotField: { type: String, default: "itemCategory1" },
    customRowMatcher: { type: Function, default: null },
});

defineEmits(["close"]);

// --- State ---
const loading = ref(false);
const currentPage = ref(1);
const searchQuery = ref("");
const rawRecords = ref([]);
const isExporting = ref(false);

// Navigation
const currentLevel = ref("provinsi");
const currentParent = ref(null);

const currentTitle = computed(() => {
    return currentParent.value
        ? `Detail Wilayah - ${currentParent.value.name}`
        : props.title;
});

// Generate Columns for SharedTable Header
// const tableColumns = computed(() => [
//     { key: "region", label: "Wilayah", width: "30%" },
//     ...props.columnConfig.map((c) => ({
//         key: c.key,
//         label: c.label,
//         align: "right",
//     })),
// ]);

// --- 1. Fetch Logic (Dynamic) ---
async function fetchData() {
    loading.value = true;
    rawRecords.value = [];

    try {
        let requests = [];
        const baseQuery = { id_dataset: props.datasetId, id_indikator_insight: props.indicatorId };

        if (currentLevel.value === "provinsi") {
            const hasSpecificProvinces =
                props.regionIds.length > 0 && props.regionIds[0].length === 2;

            if (hasSpecificProvinces) {
                // Fetch specific provinces
                requests = props.regionIds.map((id) =>
                    $fetch("/api/agregat-insight", {
                        query: { ...baseQuery, id_prov: id },
                    }),
                );
            } else {
                // Fetch all
                requests = [
                    $fetch("/api/agregat-insight", { query: baseQuery }),
                ];
            }
        } else if (currentLevel.value === "kabupaten" && currentParent.value) {
            // Fetch children of parent
            requests = [
                $fetch("/api/agregat-insight", {
                    query: { ...baseQuery, id_prov: currentParent.value.id },
                }),
            ];
        } else if (currentLevel.value === "kecamatan" && currentParent.value) {
            // Fetch children of parent
            requests = [
                $fetch("/api/agregat-insight", {
                    query: { ...baseQuery, id_kab: currentParent.value.id },
                }),
            ];
        }

        const responses = await Promise.all(requests);
        rawRecords.value = responses.flatMap((r) => r?.data?.records || []);
    } catch (e) {
        console.error("Detail Fetch Error:", e);
    } finally {
        loading.value = false;
    }
}

// --- 2. Data Processing (Dynamic Pivot) ---
// const processedData = computed(() => {
//     if (!rawRecords.value.length) return [];

//     const groupedMap = new Map();

//     rawRecords.value.forEach((r) => {
//         // ... (Region Level Identification Logic A & B remains the same) ...
//         // Copy the logic for identifying 'key', 'name', 'isChild' from previous code

//         // [Condensed for brevity - use existing logic here]
//         let key, name, isChild;
//         const provCode = r.kd_prov?.kode;
//         const kabCode = r.kd_kab?.kode;
//         const kecCode = r.kd_kec?.kode;
//         const desaCode = r.kd_desa?.kode;

//         if (currentLevel.value === "provinsi") {
//             if (!provCode) return;
//             key = provCode;
//             name = r.kd_prov?.nama;
//             isChild = !!kabCode;
//         } else if (currentLevel.value === "kabupaten") {
//             if (!kabCode || provCode !== currentParent.value.id) return;
//             key = kabCode;
//             name = r.kd_kab?.nama;
//             isChild = !!kecCode;
//         } else if (currentLevel.value === "kecamatan") {
//             if (!kecCode || kabCode !== currentParent.value.id) return;
//             key = kecCode;
//             name = r.kd_kec?.nama;
//             isChild = false;
//         } else if (currentLevel.value === "desa") {
//             if (!desaCode || kecCode !== currentParent.value.id) return;
//             key = desaCode;
//             name = r.kd_desa?.nama;
//             isChild = false;
//         }

//         // Initialize Row
//         if (!groupedMap.has(key)) {
//             groupedMap.set(key, {
//                 id: key,
//                 region: name || "N/A",
//                 hasParentRow: false,
//             });
//             props.columnConfig.forEach(
//                 (col) => (groupedMap.get(key)[col.key] = 0),
//             );
//         }

//         const row = groupedMap.get(key);
//         const val = Number(r.value) || 0;

//         // Parent/Child Aggregation Logic
//         if (!isChild) {
//             if (!row.hasParentRow) {
//                 props.columnConfig.forEach((col) => (row[col.key] = 0));
//                 row.hasParentRow = true;
//             }
//         } else {
//             if (row.hasParentRow) return;
//         }

//         // --- [UPDATED] DYNAMIC PIVOT MATCHING ---
//         let matchedColKey = null;

//         if (props.customRowMatcher) {
//             // SCENARIO 1: Custom Logic (For Infrastructure)
//             // Use the function passed from parent to find which column key this record belongs to
//             matchedColKey = props.customRowMatcher(r);
//         } else {
//             // SCENARIO 2: Simple Pivot (For Schools)
//             const categoryObj = r[props.pivotField];
//             if (categoryObj) {
//                 const categoryKey = categoryObj.kode || categoryObj.nama;
//                 // Find column that matches this category key
//                 const configMatch = props.columnConfig.find(
//                     (col) =>
//                         col.key === categoryKey ||
//                         col.label === categoryKey ||
//                         col.key === categoryObj.nama,
//                 );
//                 if (configMatch) matchedColKey = configMatch.key;
//             }
//         }

//         // Add value if a column match was found
//         if (matchedColKey && row[matchedColKey] !== undefined) {
//             row[matchedColKey] += val;
//         }
//     });

//     return Array.from(groupedMap.values());
// });
// --- Tambahkan State Baru ---
const activeTab = ref(0);

// --- Mapping Items untuk UTabs ---
const tabItems = computed(() => {
    // Ambil daftar unik Subsektor dari data yang masuk (columnConfig berisi dynamicRows)
    return props.columnConfig.map((row, index) => ({
        label: row.title,
        index: index
    }));
});

// --- Modifikasi processedData ---
const processedData = computed(() => {
    if (!rawRecords.value.length || !props.columnConfig.length) return [];

    // 1. Dapatkan Subsektor yang aktif berdasarkan Tab yang dipilih
    const currentSub = props.columnConfig[activeTab.value];
    const groupedMap = new Map();

    rawRecords.value.forEach((r) => {
        if (r.itemCategory2?.nama !== currentSub.title) return;

        let key, name, isChild;
        const provCode = r.kd_prov?.kode;
        const kabCode = r.kd_kab?.kode;
        const kecCode = r.kd_kec?.kode;
        const desaCode = r.kd_desa?.kode;

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
            });
            currentSub.cards.forEach(card => {
                groupedMap.get(key)[card.label] = 0;
            });
        }

        const row = groupedMap.get(key);
        const val = Number(r.value) || 0;

        if (!isChild) {
            if (!row.hasParentRow) {
                currentSub.cards.forEach(card => row[card.label] = 0);
                row.hasParentRow = true;
            }
        } else {
            if (row.hasParentRow) return;
        }

        const category3Name = r.itemCategory3?.nama; 
        if (category3Name && row[category3Name] !== undefined) {
            row[category3Name] += val;
        }
        
        const totalLabel = "Total";
        if (row[totalLabel] !== undefined) {
            row[totalLabel] = (row['Rusak Ringan'] || 0) + (row['Rusak Sedang'] || 0) + (row['Rusak Berat'] || 0);
        }
    });

    return Array.from(groupedMap.values());
});

// Update Header Tabel secara dinamis berdasarkan kartu di dynamicRows
const tableColumns = computed(() => {
    const cols = [{ key: "region", label: "Wilayah", width: "30%" }];
    if (props.columnConfig.length > 0) {
        props.columnConfig[0].cards.forEach(card => {
            cols.push({ key: card.label, label: card.label, align: "right" });
        });
    }
    return cols;
});

const formatNumber = (num) => new Intl.NumberFormat("id-ID").format(num);

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

// --- 3. Interaction Logic ---
const canDrillDown = (row) => {
    if (!row?.id) return false;

    if (currentLevel.value === "provinsi") return row.id.length === 2;

    if (currentLevel.value === "kabupaten") return row.id.length === 4;

    if (currentLevel.value === "kecamatan") return row.id.length === 6;

    return false;
};

function handleDrillDown(row) {
  if (!canDrillDown(row)) return;

  if (currentLevel.value === "provinsi") {
    currentLevel.value = "kabupaten";
  } else if (currentLevel.value === "kabupaten") {
    currentLevel.value = "kecamatan";
  } else if (currentLevel.value === "kecamatan") {
    currentLevel.value = "desa";
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
    } 
    else if (currentLevel.value === "kecamatan") {
        currentLevel.value = "kabupaten";
        const provId = currentParent.value.id.substring(0, 2);
        currentParent.value = { id: provId, name: "Wilayah Sebelumnya" }; 
    } 
    else if (currentLevel.value === "desa") {
        currentLevel.value = "kecamatan";
        const kabId = currentParent.value.id.substring(0, 4);
        currentParent.value = { id: kabId, name: "Wilayah Sebelumnya" };
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

        props.columnConfig.forEach((col) => {
            rowData[col.label] = row[col.key] || 0;
        });

        return rowData;
    });
});

const triggerDownload = async () => {
    isExporting.value = true;
    try {
        // 1. Buat Header Excel secara dinamis
        const dynamicColumns = [
            { header: "No", key: "No", width: 8 },
            { header: "Wilayah", key: "Wilayah", width: 30 },
            // Mapping sisa kolom dari columnConfig
            ...props.columnConfig.map((col) => ({
                header: col.label,
                key: col.label, // Harus sama dengan key di downloadData
                width: 15,
            })),
        ];

        if (typeof downloadDynamicExcel === "function") {
            const fileName = `${props.title}_${new Date().toISOString().split("T")[0]}`;
            
            await downloadDynamicExcel(
                downloadData.value,
                fileName.replace(/\s+/g, '_'), // Ganti spasi dengan underscore agar aman
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
}

// Reset on Open
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
