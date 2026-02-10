<template>
    <div
        class="relative bg-white border border-gray-200 rounded-xl shadow-sm p-5 pt-7 mt-6"
    >
        <div
            class="absolute -top-4 left-0 right-0 px-4 flex flex-wrap items-center justify-between gap-2 z-20"
        >
            <div class="flex flex-wrap items-center gap-2">
                <div
                    class="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100 shadow-sm whitespace-nowrap"
                >
                    <UIcon
                        name="i-heroicons-language"
                        class="w-4 h-4 text-emerald-600"
                    />
                    <span
                        class="text-[12px] font-black text-emerald-700 uppercase tracking-wider"
                    >
                        Fasilitas Kebudayaan Terdampak
                    </span>
                </div>
            </div>
            <div class="flex flex-row gap-2">
                <SharedActionButton
                    icon="i-heroicons-information-circle"
                    tooltip="Informasi Dataset"
                    @click="isInfoOpen = true"
                />

                <SharedActionButton
                    icon="i-heroicons-map"
                    tooltip="Lihat Peta"
                    @click="isMapOpen = true"
                    disabled="true"
                />

                <SharedActionButton
                    icon="i-heroicons-chart-bar"
                    tooltip="Lihat Grafik"
                    @click="isChartOpen = true"
                />

                <SharedActionButton
                    icon="i-heroicons-table-cells"
                    tooltip="Lihat Tabel"
                    @click="isDetailOpen = true"
                />
            </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div v-if="dataLoading" class="flex">
                <StatCard
                    label="Memuat Data..."
                    :dataLoading="true"
                    class="w-full"
                />
            </div>

            <template v-else>
                <StatCard
                    label="Objek Kebudayaan Terdampak"
                    color="rose"
                    icon="i-heroicons-globe-asia-australia"
                    label-size="sm"
                    :isRound="true"
                >
                    <template #default>
                        <div
                            class="flex flex-col gap-2 bg-slate-50/50 p-3 rounded-lg border border-slate-100"
                        >
                            <div class="flex items-baseline gap-2">
                                <span class="text-3xl font-black text-rose-600">
                                    {{ formatNumber(totalTerdampak) }}
                                </span>
                                <span
                                    class="text-[10px] text-slate-500 font-bold uppercase"
                                    >Objek</span
                                >
                            </div>

                            <div
                                class="grid grid-cols-2 gap-2 text-[11px] uppercase font-semibold"
                            >
                                <div
                                    class="flex items-center justify-between p-1.5 bg-amber-50 rounded border border-amber-100"
                                >
                                    <span class="text-amber-700"
                                        >Cagar Budaya</span
                                    >
                                    <span class="text-amber-900 font-black">{{
                                        formatNumber(categoryTotals.cagarBudaya)
                                    }}</span>
                                </div>
                                <div
                                    class="flex items-center justify-between p-1.5 bg-blue-50 rounded border border-blue-100"
                                >
                                    <span class="text-blue-700"
                                        >Diduga Cagar Budaya</span
                                    >
                                    <span class="text-blue-900 font-black">{{
                                        formatNumber(categoryTotals.didugaCB)
                                    }}</span>
                                </div>
                                <div
                                    class="flex items-center justify-between p-1.5 bg-emerald-50 rounded border border-emerald-100"
                                >
                                    <span class="text-emerald-700">Museum</span>
                                    <span class="text-emerald-900 font-black">{{
                                        formatNumber(categoryTotals.museum)
                                    }}</span>
                                </div>
                                <div
                                    class="flex items-center justify-between p-1.5 bg-rose-50 rounded border border-rose-100"
                                >
                                    <span class="text-rose-700">Sanggar</span>
                                    <span class="text-rose-900 font-black">{{
                                        formatNumber(categoryTotals.sanggar)
                                    }}</span>
                                </div>
                                <div
                                    class="flex items-center justify-between p-1.5 bg-purple-50 rounded border border-purple-100"
                                >
                                    <span class="text-purple-700"
                                        >Komunitas Budaya</span
                                    >
                                    <span class="text-purple-900 font-black">{{
                                        formatNumber(
                                            categoryTotals.komunitasBudaya,
                                        )
                                    }}</span>
                                </div>
                                <div
                                    class="flex items-center justify-between p-1.5 bg-gray-50 rounded border border-gray-100"
                                >
                                    <span class="text-gray-700">Lainnya</span>
                                    <span class="text-gray-900 font-black">{{
                                        formatNumber(categoryTotals.lainnya)
                                    }}</span>
                                </div>
                            </div>
                            <SharedDatasetInfoCard
                                :source="datasetInfo122?.sumber"
                                :last-update="datasetInfo122?.terakhir_diupdate"
                            />
                        </div>
                    </template>
                </StatCard>

                <!-- <StatCard
                    label="Cagar Budaya Terdampak"
                    color="purple"
                    icon="i-heroicons-language"
                    label-size="sm"
                    :isRound="true"
                >
                    <template #default>
                        <div
                            class="flex flex-col gap-2 bg-slate-50/50 p-3 rounded-lg border border-slate-100"
                        >
                            <div class="flex items-baseline gap-2">
                                <span
                                    class="text-3xl font-black text-purple-600"
                                >
                                    {{ formatNumber(mappedRecordsDs1.grand) }}
                                </span>
                                <span
                                    class="text-[10px] text-slate-500 font-bold uppercase"
                                    >Objek</span
                                >
                            </div>

                            <div
                                class="grid grid-cols-2 gap-2 text-[11px] uppercase font-semibold"
                            >
                                <div
                                    class="flex items-center justify-between p-1.5 bg-indigo-50 rounded border border-indigo-100"
                                >
                                    <span class="text-indigo-700"
                                        >Bangunan</span
                                    >
                                    <span class="text-indigo-900 font-black">{{
                                        formatNumber(
                                            mappedRecordsDs1.totals.bangunan,
                                        )
                                    }}</span>
                                </div>
                                <div
                                    class="flex items-center justify-between p-1.5 bg-cyan-50 rounded border border-cyan-100"
                                >
                                    <span class="text-cyan-700">Benda</span>
                                    <span class="text-cyan-900 font-black">{{
                                        formatNumber(
                                            mappedRecordsDs1.totals.benda,
                                        )
                                    }}</span>
                                </div>
                                <div
                                    class="flex items-center justify-between p-1.5 bg-teal-50 rounded border border-teal-100"
                                >
                                    <span class="text-teal-700">Kawasan</span>
                                    <span class="text-teal-900 font-black">{{
                                        formatNumber(
                                            mappedRecordsDs1.totals.kawasan,
                                        )
                                    }}</span>
                                </div>
                                <div
                                    class="flex items-center justify-between p-1.5 bg-violet-50 rounded border border-violet-100"
                                >
                                    <span class="text-violet-700">Situs</span>
                                    <span class="text-violet-900 font-black">{{
                                        formatNumber(
                                            mappedRecordsDs1.totals.situs,
                                        )
                                    }}</span>
                                </div>
                                <div
                                    class="flex items-center justify-between p-1.5 bg-pink-50 rounded border border-pink-100"
                                >
                                    <span class="text-pink-700">Struktur</span>
                                    <span class="text-pink-900 font-black">{{
                                        formatNumber(
                                            mappedRecordsDs1.totals.struktur,
                                        )
                                    }}</span>
                                </div>
                                <div
                                    class="flex items-center justify-between p-1.5 bg-gray-50 rounded border border-gray-100"
                                >
                                    <span class="text-gray-700"
                                        >Tidak Ada Kategori</span
                                    >
                                    <span class="text-gray-900 font-black">{{
                                        formatNumber(
                                            mappedRecordsDs1.totals
                                                .tidak_ada_kategori,
                                        )
                                    }}</span>
                                </div>
                            </div>
                            <SharedDatasetInfoCard
                                :source="datasetInfo120?.sumber"
                                :last-update="datasetInfo120?.terakhir_diupdate"
                            />
                        </div>
                    </template>
                </StatCard> -->
            </template>
        </div>
    </div>
    <Teleport to="body">
        <SharedDatasetInfoModal
            :is-open="isInfoOpen"
            :dataset-info="datasetInfo122"
            @close="isInfoOpen = false"
        />

        <FasilitasBudayaChartModal
            :is-open="isChartOpen"
            :ds1-data="ds1Data"
            :ds3-data="ds3Data"
            :dataset-info="datasetInfo"
            :loading="dataLoading"
            @close="isChartOpen = false"
        />

        <ImproveDetailModal
            :is-open="isDetailOpen"
            title="Objek Kebudayaan Terdampak"
            :region-ids="selectedWilayah || []"
            :dataset-id="[122]"
            :indicator-id="[278]"
            :config="modalConfig"
            @close="isDetailOpen = false"
        />
    </Teleport>
</template>

<script setup>
import StatCard from "~/components/shared/StatCard.vue";
import ImproveDetailModal from "../shared/ImproveDetailModal.vue";
import FasilitasBudayaChartModal from "./FasilitasBudayaChartModal.vue";

const props = defineProps({
    selectedWilayah: { type: Object, required: true },
});

const dataLoading = ref(false);
const isDetailOpen = ref(false);
const isInfoOpen = ref(false);
const datasetInfo = ref({});
const isChartOpen = ref(false);

const datasetInfo120 = ref(null);
const datasetInfo122 = ref(null);

const headers = useRequestHeaders(["cookie"]);

const modalConfig = [
    // {
    //     type: "flat",
    //     tabs: ["Cagar Budaya Terdampak"],
    //     pivotVar: "itemCategory1",
    //     columns: [
    //         "Bangunan",
    //         "Benda",
    //         "Kawasan",
    //         "Situs",
    //         "Struktur",
    //         "Tidak Ada Kategori",
    //     ],
    // },
    {
        type: "flat",
        tabs: ["Objek Kebudayaan Terdampak"],
        pivotVar: "itemCategory1",
        columns: [
            "Cagar Budaya",
            "Objek diduga Cagar Budaya",
            "Museum",
            "Sanggar",
            "Komunitas Budaya",
            "Lainnya",
        ],
    },
];

// FETCHING DATASET
async function fetchDataset(idDataset, idIndikator) {
    dataLoading.value = true;
    const w = props.selectedWilayah;
    const idWilayah =
        (w.desa?.length ? w.desa : null) ||
        (w.kecamatan?.length ? w.kecamatan : null) ||
        (w.kabupaten?.length ? w.kabupaten : null) ||
        (w.provinsi?.length ? w.provinsi : null) ||
        [];

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
        let requests = [];
        const endpoint = "/api/agregat-insight";

        if (w.kabupaten?.length > 0) {
            requests = w.kabupaten.map((kabId) =>
                $fetch(endpoint, {
                    headers: headers,
                    query: {
                        id_dataset: idDataset,
                        id_indikator_insight: idIndikator,
                        id_kab: kabId,
                    },
                }),
            );
        } else if (w.provinsi?.length > 0) {
            requests = w.provinsi.map((provId) =>
                $fetch(endpoint, {
                    headers: headers,
                    query: {
                        id_dataset: idDataset,
                        id_indikator_insight: idIndikator,
                        id_prov: provId,
                    },
                }),
            );
        } else {
            requests = [
                $fetch(endpoint, {
                    headers: headers,
                    query: {
                        id_dataset: idDataset,
                        id_indikator_insight: idIndikator,
                    },
                }),
            ];
        }

        const responses = await Promise.all(requests);
        const allRecords = responses.flatMap((r) => r?.data?.records || []);

        const meta = responses[0]?.data?.meta?.dataset || null;

        return { records: allRecords, meta };
    } catch (e) {
        console.error("Error fetching dataset:", e);
        return { records: [], meta: null };
    }
}

const mappedRecordsDs1 = computed(() => {
    const typeMap = {
        Bangunan: "bangunan",
        Benda: "benda",
        Kawasan: "kawasan",
        Situs: "situs",
        Struktur: "struktur",
        "Tidak Ada Kategori": "tidak_ada_kategori",
    };

    const totals = {
        bangunan: 0,
        benda: 0,
        kawasan: 0,
        situs: 0,
        struktur: 0,
        tidak_ada_kategori: 0,
    };

    ds1Data.value.forEach((r) => {
        const typeRaw = r.itemCategory1?.nama || "";
        const value = Number(r.value) || 0;
        const field = typeMap[typeRaw];
        if (field) totals[field] += value;
    });

    const grand = Object.values(totals).reduce((a, b) => a + b, 0);

    return { totals, grand };
});

const mappedRecordsDs3 = computed(() => {
    const groups = new Map();

    const categoryMap = {
        "Cagar Budaya": "cagar_budaya",
        "Objek diduga Cagar Budaya": "diduga_cb",
        Museum: "museum",
        Sanggar: "sanggar",
        "Komunitas Budaya": "komunitas_budaya",
        Lainnya: "lainnya",
    };

    ds3Data.value.forEach((r) => {
        const provKey = r.kd_prov?.kode || r.id_prov || "XX";
        const provName = r.kd_prov?.nama || r.nm_prov || "-";
        const kabKey = r.kd_kab?.kode || r.id_kab || "XX";
        const kabName = r.kd_kab?.nama || r.nm_kab || "-";
        const kecKey = r.kd_kec?.kode || r.id_kec || "XX";
        const kecName = r.kd_kec?.nama || r.nm_kec || "-";
        const desKey = r.kd_desa?.kode || r.id_desa || "XX";
        const desName = r.kd_desa?.nama || r.nm_desa || "-";
        const categoryRaw =
            r.itemCategory1?.nama || r.item_category_1 || "Lainnya";

        const key = `${provKey}-${kabKey}-${kecKey}-${desKey}`;
        const value = Number(r.value) || 0;

        if (!groups.has(key)) {
            groups.set(key, {
                provinsi: provName,
                kabupaten: kabName,
                kecamatan: kecName,
                desa: desName,
                cagar_budaya: 0,
                diduga_cb: 0,
                museum: 0,
                sanggar: 0,
                komunitas_budaya: 0,
                lainnya: 0,
                total: 0,
            });
        }

        const field = categoryMap[categoryRaw] || "lainnya";

        groups.get(key)[field] += value;
        groups.get(key).total += value;
    });

    return Array.from(groups.values()).sort((a, b) =>
        a.provinsi.localeCompare(b.provinsi),
    );
});

const ds1Data = ref([]);
const ds3Data = ref([]);

const categoryTotals = computed(() => {
    return mappedRecordsDs3?.value.reduce(
        (acc, row) => {
            acc.cagarBudaya += row.cagar_budaya || 0;
            acc.didugaCB += row.diduga_cb || 0;
            acc.museum += row.museum || 0;
            acc.sanggar += row.sanggar || 0;
            acc.komunitasBudaya += row.komunitas_budaya || 0;
            acc.lainnya += row.lainnya || 0;
            return acc;
        },
        {
            cagarBudaya: 0,
            didugaCB: 0,
            museum: 0,
            sanggar: 0,
            komunitasBudaya: 0,
            lainnya: 0,
        },
    );
});

const totalTerdampak = computed(() => {
    return mappedRecordsDs3.value.reduce(
        (sum, row) => sum + (row.total || 0),
        0,
    );
});

watch(
    () => props.selectedWilayah,
    async () => {
        dataLoading.value = true;
        try {
            const [res120, res122] = await Promise.all([
                fetchDataset(120, 276), // Cagar Budaya
                fetchDataset(122, 278), // Objek Kebudayaan
            ]);

            // Assign Data
            ds1Data.value = res120.records || [];
            ds3Data.value = res122.records || [];

            // Assign Metadata Separately
            datasetInfo120.value = res120.meta;
            datasetInfo122.value = res122.meta;

            // Optional: Set global info for the main modal (fallback to 120)
            datasetInfo.value = res120.meta || {};
        } catch (error) {
            console.error("Error loading data:", error);
            ds1Data.value = [];
            ds3Data.value = [];
        } finally {
            dataLoading.value = false;
        }
    },
    { immediate: true, deep: true },
);
</script>
