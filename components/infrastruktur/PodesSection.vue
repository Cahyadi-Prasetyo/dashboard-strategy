<template>
    <div
        class="relative bg-white border border-gray-200 rounded-xl shadow-sm p-4 pt-10 mt-4"
    >
        <div
            class="absolute -top-4 left-0 right-0 px-4 flex flex-wrap items-center justify-between gap-2 z-20"
        >
            <div class="flex flex-wrap items-center gap-2">
                <div
                    class="flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-lg border border-blue-100 shadow-sm whitespace-nowrap"
                >
                    <UIcon
                        name="i-heroicons-map-pin"
                        class="w-4 h-4 text-blue-500"
                    />
                    <span
                        class="text-[10px] font-black text-blue-700 uppercase tracking-wider"
                    >
                        Pos dan Telekomunikasi
                    </span>
                </div>

                <div
                    class="flex items-center gap-1.5 bg-white/90 backdrop-blur px-2 py-1 rounded-lg border border-gray-200 shadow-sm"
                >
                    <UBadge
                        v-if="datasetInfo?.instansi"
                        color="primary"
                        variant="subtle"
                        size="xs"
                    >
                        {{ datasetInfo.instansi }}
                    </UBadge>
                    <UBadge
                        v-if="datasetInfo?.sumber"
                        color="primary"
                        variant="subtle"
                        size="xs"
                    >
                        {{ datasetInfo.sumber }}
                    </UBadge>
                    <span
                        v-if="datasetInfo?.terakhir_diupdate"
                        class="text-[10px] text-gray-400 flex items-center gap-0.5 ml-1"
                    >
                        <UIcon name="i-heroicons-clock" class="w-3 h-3" />
                        {{ formatDate(datasetInfo.terakhir_diupdate) }}
                    </span>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-0">
            <div
                v-for="(item, key) in utilitiesData"
                :key="key"
                class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col"
            >
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div :class="['p-2 rounded-lg', item.iconColor]">
                            <UIcon :name="item.icon" class="w-5 h-5" />
                        </div>
                        <div>
                            <h4 class="font-bold text-gray-800 text-sm">
                                {{ item.title }}
                            </h4>
                            <p class="text-[10px] text-gray-400 truncate">
                                {{ item.desc }}
                            </p>
                        </div>
                    </div>
                    <button
                        @click="openDetail(key)"
                        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        :title="`Lihat detail ${item.title}`"
                    >
                        <UIcon
                            :name="
                                activeDetailKey === key
                                    ? 'i-heroicons-eye-slash'
                                    : 'i-heroicons-eye'
                            "
                            class="w-4 h-4 text-gray-500"
                        />
                    </button>
                </div>

                <div v-if="loading" class="space-y-3 py-4">
                    <div class="flex justify-center items-center">
                        <div
                            class="w-24 h-24 rounded-full border-4 border-slate-50 border-t-amber-400 animate-spin"
                        ></div>
                    </div>
                </div>

                <ChartsPieChart
                    v-else
                    :data="item.data"
                    :series-name="item.title"
                    height="h-52"
                    legend-position="bottom"
                    inner-radius="45%"
                    outer-radius="70%"
                    :center="['50%', '40%']"
                />
            </div>
        </div>

        <Teleport to="body">
            <div
                v-if="activeDetailKey"
                class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
            >
                <div
                    class="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
                    @click="closeDetail"
                ></div>

                <div
                    class="relative w-full max-w-6xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 z-10 bg-white rounded-xl shadow-2xl overflow-hidden"
                >
                    <div
                        class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white flex-none"
                    >
                        <div
                            class="flex items-center gap-3"
                            v-if="utilitiesData[activeDetailKey]"
                        >
                            <div
                                :class="[
                                    'p-2 rounded-lg',
                                    utilitiesData[activeDetailKey].iconColor,
                                ]"
                            >
                                <UIcon
                                    :name="utilitiesData[activeDetailKey].icon"
                                    class="w-5 h-5"
                                />
                            </div>
                            <div>
                                <h3 class="text-lg font-bold text-gray-900">
                                    {{ utilitiesData[activeDetailKey].title }}
                                </h3>
                                <p class="text-xs text-gray-500">
                                    Distribusi wilayah berdasarkan
                                    {{
                                        utilitiesData[
                                            activeDetailKey
                                        ].desc.toLowerCase()
                                    }}
                                </p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3">
                            <UTooltip
                                text="Export ke Excel"
                                :popper="{ placement: 'top' }"
                            >
                                <UButton
                                    icon="i-heroicons-document-arrow-down"
                                    variant="soft"
                                    size="sm"
                                    :loading="isExporting"
                                    :disabled="!detailRecords.length"
                                    @click="triggerDownload"
                                    class="bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 border-none ring-0 h-[38px]"
                                    :ui="{
                                        rounded: 'rounded-lg',
                                        padding: { sm: 'px-4 py-2' },
                                        font: 'font-semibold',
                                        icon: { size: { sm: 'w-4 h-4' } },
                                    }"
                                >
                                    <span class="text-xs">Excel</span>
                                </UButton>
                            </UTooltip>

                            <div class="h-6 w-px bg-gray-200"></div>

                            <button
                                @click="closeDetail"
                                class="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                                title="Tutup"
                            >
                                <UIcon
                                    name="i-heroicons-x-mark"
                                    class="w-6 h-6"
                                />
                            </button>
                        </div>
                    </div>

                    <div class="flex-1 overflow-auto p-6 bg-gray-50/50">
                        <SharedTable
                            :columns="tableColumns"
                            :data="processedDetailRecords"
                            :loading="detailLoading"
                            :total-items="detailRecords.length"
                            v-model:current-page="currentPage"
                            v-model:sort-column="sortColumn"
                            v-model:sort-direction="sortDirection"
                            :items-per-page="itemsPerPage"
                            :show-no="true"
                            empty-message="Data detail tidak tersedia"
                        />
                    </div>
                </div>
            </div>
        </Teleport>
        <!-- <div
            class="mt-3 flex flex-col md:flex-row items-center justify-between text-[10px] text-gray-400 border-t border-gray-100 pt-3 px-2 gap-3"
        >
            <div class="flex flex-col gap-1.5">
                <div class="flex items-center gap-2">
                    <div
                        class="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-bold uppercase tracking-wider text-[9px]"
                    >
                        <UIcon name="i-heroicons-clock" class="w-3 h-3" />
                        Periode Pra-Bencana: 2025
                    </div>
                    <div
                        class="flex items-center gap-2 text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full w-fit font-medium"
                    >
                        <UIcon name="i-heroicons-information-circle" class="w-3 h-3" />
                        <span
                            >Data sektor layanan publik bersumber dari <b class="uppercase tracking-wider">PODES (Statik)</b> sebelum bencana</span
                        >
                    </div>
                </div>
            </div>

            <div class="flex flex-wrap gap-4">
                <span class="flex items-center gap-1.5">
                    <div class="w-2 h-2 bg-slate-300 rounded-sm"></div>
                    <span class="font-medium text-slate-500"
                        >Kondisi Awal: PODES (Statik)</span
                    >
                </span>
            </div>
        </div> -->
    </div>
</template>

<script setup>
import { ref, watch, reactive, computed } from "vue";
import Detail from "~/components/charts/DrillDownTable.vue";
import { useDynamicExcel } from "~/composables/useDynamicExcel";

const { downloadDynamicExcel } = useDynamicExcel();
const isExporting = ref(false);

const props = defineProps({
    selectedWilayah: { type: Object, required: true },
});

const itemsPerPage = ref(10);
const sortColumn = ref("provinsi");
const sortDirection = ref("desc");

const loading = ref(false);
const detailLoading = ref(false);
const activeDetailKey = ref(null);
const detailRecords = ref([]);
const rawDetailRecords = ref([]);
const datasetInfo = ref({});

const utilitiesData = reactive({
    bts: {
        title: "Menara BTS",
        desc: "Keberadaan menara BTS",
        icon: "i-heroicons-signal",
        iconColor: "bg-amber-50 text-amber-500",
        datasetId: 19,
        indicatorId: 17,
        data: [],
    },
    sinyalTelepon: {
        title: "Sinyal Telepon",
        desc: "Kekuatan sinyal telepon seluler",
        icon: "i-heroicons-device-phone-mobile",
        iconColor: "bg-indigo-50 text-indigo-500",
        datasetId: 20,
        indicatorId: 17,
        data: [],
    },
    sinyalInternet: {
        title: "Sinyal Internet",
        desc: "Kualitas sinyal internet seluler",
        icon: "i-heroicons-globe-alt",
        iconColor: "bg-rose-50 text-rose-500",
        datasetId: 21,
        indicatorId: 17,
        data: [],
    },
    pos: {
        title: "Pos & Logistik",
        desc: "Kantor pos & layanan ekspedisi",
        icon: "i-heroicons-envelope",
        iconColor: "bg-emerald-50 text-emerald-500",
        datasetId: 22,
        indicatorId: 17,
        data: [],
    },
});

const formatDate = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
};

async function fetchDataset(idDataset, idIndikator, returnFull = false) {
    const w = props.selectedWilayah;

    const idWilayah =
        w.desa?.[0] || w.kecamatan?.[0] || w.kabupaten?.[0] || w.provinsi?.[0];

    const level = w.desa?.length
        ? "id_desa"
        : w.kecamatan?.length
          ? "id_kec"
          : w.kabupaten?.length
            ? "id_kab"
            : "id_prov";

    const query = {
        id_dataset: idDataset,
        id_indikator_insight: idIndikator,
    };

    if (idWilayah) {
        query[level] = idWilayah;
    }

    try {
        const res = await $fetch("/api/agregat-insight", { query });
        return returnFull ? res?.data : res?.data?.records || [];
    } catch (e) {
        return returnFull ? { records: [], meta: {} } : [];
    }
}
const currentPage = ref(1);

// Computed untuk column config berdasarkan data yang ada
const detailColumnConfig = computed(() => {
    if (!detailRecords.value || detailRecords.value.length === 0) return [];

    // Extract unique categories dari values
    const categoriesSet = new Set();
    detailRecords.value.forEach((record) => {
        Object.keys(record.values).forEach((cat) => categoriesSet.add(cat));
    });

    // Convert ke format columnConfig
    return Array.from(categoriesSet).map((cat) => ({
        key: cat,
        label: cat,
    }));
});

const selectedRegionIds = computed(() => {
    const w = props.selectedWilayah;
    return w.desa?.length
        ? w.desa
        : w.kecamatan?.length
          ? w.kecamatan
          : w.kabupaten?.length
            ? w.kabupaten
            : w.provinsi;
});

const closeDetail = () => {
    activeDetailKey.value = null;
    // [FIX] Optional: Clear data on close as well for safety
    setTimeout(() => {
        rawDetailRecords.value = [];
        detailRecords.value = [];
    }, 300); // Wait for transition out
};

async function loadAllData() {
    loading.value = true;

    try {
        const requests = [
            fetchDataset(19, 17, true), // BTS
            fetchDataset(20, 17), // Sinyal Telepon
            fetchDataset(21, 17), // Sinyal Internet
            fetchDataset(22, 17), // Pos & Ekspedisi
        ];

        const [res19, ds20, ds21, ds22] = await Promise.all(requests);

        if (res19?.meta?.dataset) {
            datasetInfo.value = res19.meta.dataset;
        }

        const ds19 = res19.records || [];

        // Process Utils Charts
        const processPie = (records) => {
            const map = new Map();
            records.forEach((r) => {
                const label =
                    r.itemCategory2?.nama || r.itemCategory3?.nama || "Lainnya";
                map.set(label, (map.get(label) || 0) + r.value);
            });
            return Array.from(map.entries()).map(([name, value]) => ({
                name,
                value,
            }));
        };

        utilitiesData.bts.data = processPie(ds19);
        utilitiesData.sinyalTelepon.data = processPie(ds20);
        utilitiesData.sinyalInternet.data = processPie(ds21);
        utilitiesData.pos.data = processPie(ds22);

        // If detail is open, refresh it too
        if (activeDetailKey.value) {
            openDetail(activeDetailKey.value); // Changed from toggleDetail
        }
    } finally {
        loading.value = false;
    }
}

const openDetail = async (key) => {
    // Clear old data
    rawDetailRecords.value = [];
    detailRecords.value = [];

    activeDetailKey.value = key;
    currentPage.value = 1;
    sortColumn.value = "provinceName"; // Default sort
    sortDirection.value = "asc";
    detailLoading.value = true;

    try {
        const util = utilitiesData[key];
        const records = await fetchDataset(
            util.datasetId,
            util.indicatorId,
            false,
        );
        rawDetailRecords.value = records;

        const regionMap = new Map();

        records.forEach((r) => {
            const regionId =
                r.kd_desa?.kode ||
                r.kd_kec?.kode ||
                r.kd_kab?.kode ||
                r.kd_prov?.kode ||
                "XX";
            const regionName =
                r.kd_desa?.nama ||
                r.kd_kec?.nama ||
                r.kd_kab?.nama ||
                r.kd_prov?.nama ||
                "-";
            const provinceName = r.kd_prov?.nama || "-";
            const category =
                r.itemCategory2?.nama || r.itemCategory1?.nama || "-";
            const value = r.value || 0;

            if (!regionMap.has(regionId)) {
                regionMap.set(regionId, {
                    regionId,
                    regionName,
                    provinceName,
                    total: 0,
                    // No nested 'values' object needed, we flatten it below
                });
            }

            const entry = regionMap.get(regionId);
            // Flatten: entry['Sinyal Kuat'] = 10
            entry[category] = (entry[category] || 0) + value;
            entry.total += value;
        });

        detailRecords.value = Array.from(regionMap.values());
    } finally {
        detailLoading.value = false;
    }
};

// [ADD] Computed Columns for SharedTable
const tableColumns = computed(() => {
    if (!detailRecords.value || detailRecords.value.length === 0) return [];

    // 1. Static Columns
    const cols = [
        {
            key: "provinceName",
            label: "Provinsi",
            sortable: true,
            width: "25%",
        },
        {
            key: "regionName",
            label: "Kabupaten/Kota",
            sortable: true,
            width: "25%",
        },
    ];

    // 2. Dynamic Columns (Extract from first record keys, excluding static ones)
    const staticKeys = ["regionId", "regionName", "provinceName", "total"];
    const sample = detailRecords.value[0];
    const dynamicKeys = Object.keys(sample).filter(
        (k) => !staticKeys.includes(k),
    );

    dynamicKeys.forEach((key) => {
        cols.push({
            key: key,
            label: key,
            sortable: true,
            headerClass: "bg-blue-50 text-blue-700",
            cellClass: "text-center",
        });
    });

    // 3. Total Column
    cols.push({
        key: "total",
        label: "Total",
        sortable: true,
        headerClass: "bg-gray-100",
        cellClass: "text-center font-bold bg-gray-50",
    });

    return cols;
});

// [ADD] Sorting & Pagination Logic
const processedDetailRecords = computed(() => {
    let data = [...detailRecords.value];

    // 1. Sorting
    if (sortColumn.value) {
        data.sort((a, b) => {
            const aVal = a[sortColumn.value] || 0;
            const bVal = b[sortColumn.value] || 0;

            if (typeof aVal === "string") {
                return sortDirection.value === "asc"
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }
            return sortDirection.value === "asc" ? aVal - bVal : bVal - aVal;
        });
    }

    // 2. Pagination
    const start = (currentPage.value - 1) * itemsPerPage.value;
    return data.slice(start, start + itemsPerPage.value);
});

const triggerDownload = async () => {
    if (!detailRecords.value.length) return;

    isExporting.value = true;
    try {
        const excelColumns = tableColumns.value.map((col) => ({
            header: col.label,
            key: col.key,
            width:
                col.key === "provinceName" || col.key === "regionName"
                    ? 25
                    : 15,
        }));

        // 2. Generate Filename
        const title = utilitiesData[activeDetailKey.value]?.title || "Data";
        const date = new Date().toISOString().split("T")[0];
        const filename = `Detail_${title.replace(/\s+/g, "_")}_${date}`;

        // 3. Execute Download
        await downloadDynamicExcel(detailRecords.value, filename, excelColumns);
    } catch (error) {
        console.error("Export error:", error);
    } finally {
        isExporting.value = false;
    }
};

watch(
    () => props.selectedWilayah,
    () => {
        loadAllData();
    },
    { deep: true, immediate: true },
);
</script>
