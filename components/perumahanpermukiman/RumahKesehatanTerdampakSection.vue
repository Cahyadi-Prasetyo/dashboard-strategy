<template>
    <div
        class="relative bg-white border border-gray-200 rounded-xl shadow-sm p-4 pt-4 mt-6"
    >
        <div
            class="absolute -top-4 left-0 right-0 px-4 flex flex-wrap items-center justify-between gap-2 z-20"
        >
            <div class="flex flex-wrap items-center gap-2">
                <div
                    class="flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-lg border border-blue-100 shadow-sm whitespace-nowrap"
                >
                    <UIcon
                        name="i-heroicons-heart"
                        class="w-4 h-4 text-blue-600"
                    />
                    <span
                        class="text-[12px] font-black text-blue-700 uppercase tracking-wider"
                    >
                        Rumah Tenaga Kesehatan Terdampak
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

        <div class="mt-2">
            <div v-if="loading" class="mt-4 flex flex-col gap-6">
                <div class="space-y-3">
                    <div
                        class="h-6 bg-gray-100 rounded w-1/4 animate-pulse"
                    ></div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <StatCard
                            v-for="n in 2"
                            :key="n"
                            label="Memuat..."
                            :loading="true"
                        />
                    </div>
                </div>
                <div class="space-y-3">
                    <div
                        class="h-6 bg-gray-100 rounded w-1/4 animate-pulse"
                    ></div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <StatCard
                            v-for="n in 2"
                            :key="n + 2"
                            label="Memuat..."
                            :loading="true"
                        />
                    </div>
                </div>
            </div>

            <div v-else class="mt-4 flex flex-col gap-4">
                <div
                    v-for="wrapper in processedData"
                    :key="wrapper.label"
                    class="flex flex-col gap-3"
                >
                    <div class="flex items-center gap-2">
                        <div class="h-8 w-1 bg-amber-500 rounded-full"></div>
                        <h3
                            class="text-sm font-bold text-gray-700 uppercase tracking-wide"
                        >
                            Status Kepemilikan: {{ wrapper.label }}
                        </h3>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <StatCard
                            v-for="card in wrapper.cards"
                            :key="card.label"
                            :label="card.label"
                            :icon="card.icon"
                            :color="card.color"
                            :isRound="true"
                            label-size="sm"
                        >
                            <template #default>
                                <div
                                    class="flex flex-col gap-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200 h-full"
                                >
                                    <div class="flex items-baseline gap-2">
                                        <span
                                            class="text-4xl font-extrabold tracking-tight"
                                            :class="`text-${card.color}-600`"
                                        >
                                            {{
                                                card.total == null
                                                    ? "N/A"
                                                    : formatNumber(card.total)
                                            }}
                                        </span>
                                        <span
                                            class="text-[11px] text-slate-500 font-bold uppercase"
                                        >
                                            Unit
                                        </span>
                                    </div>

                                    <div
                                        class="grid grid-cols-1 gap-3 text-[11px] uppercase font-semibold mt-auto"
                                    >
                                        <div
                                            v-for="detail in card.details"
                                            :key="detail.label"
                                            class="flex items-center justify-between p-2 rounded-md border"
                                            :class="[
                                                `bg-${detail.color}-50`,
                                                `border-${detail.color}-200`,
                                            ]"
                                        >
                                            <span
                                                class="font-semibold text-[10px] pr-1 leading-tight"
                                                :class="`text-${detail.color}-700`"
                                            >
                                                {{ detail.label }}
                                            </span>

                                            <span
                                                class="font-black text-[11px] shrink-0"
                                                :class="`text-${detail.color}-900`"
                                            >
                                                {{ formatNumber(detail.value) }}
                                            </span>
                                        </div>
                                    </div>
                                    <SharedDatasetInfoCard
                                        :source="datasetInfo?.sumber"
                                        :last-update="
                                            datasetInfo?.terakhir_diupdate
                                        "
                                    />
                                </div>
                            </template>
                        </StatCard>
                    </div>
                </div>

                <div
                    v-if="processedData.length === 0"
                    class="flex flex-col items-center justify-center py-12 text-center"
                >
                    <div class="bg-gray-50 p-4 rounded-full mb-3">
                        <UIcon
                            name="i-heroicons-archive-box-x-mark"
                            class="w-8 h-8 text-gray-400"
                        />
                    </div>
                    <p class="text-sm font-medium text-gray-600">
                        Data Rumah Tenaga Kesehatan tidak tersedia
                    </p>
                </div>
            </div>
        </div>
    </div>

    <Teleport to="body">
        <SharedDatasetInfoModal
            :is-open="isInfoOpen"
            :dataset-info="datasetInfo"
            @close="isInfoOpen = false"
        />

        <MapSpatialGenericModal
            :is-open="isMapOpen"
            :selected-wilayah="selectedWilayah"
            title="Peta Sebaran Rumah Tenaga Kesehatan"
            :initial-dataset-id="111"
            :initial-indikator-id="210"
            @close="isMapOpen = false"
        />

        <FasilitasKesehatanChartModal
            :is-open="isChartOpen"
            :raw-data="rawData"
            :dataset-info="datasetInfo"
            :loading="loading"
            @close="isChartOpen = false"
        />

        <SharedImproveDetailModal
            :is-open="isDetailOpen"
            title="Detail Rumah tenaga Kesehatan"
            :dataset-id="111"
            :region-ids="selectedWilayah || []"
            :config="modalConfig"
            @close="isDetailOpen = false"
        />
    </Teleport>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import StatCard from "~/components/shared/StatCard.vue";
import SharedDatasetInfoModal from "~/components/shared/DatasetInfoModal.vue";
import SharedImproveDetailModal from "~/components/shared/ImproveDetailModal.vue";
import FasilitasKesehatanChartModal from "~/components/perumahanpermukiman/FasilitasKesehatanChartModal.vue";

const props = defineProps({
    selectedWilayah: { type: Object, required: true },
});

// State
const loading = ref(false);
const rawData = ref([]);
const isInfoOpen = ref(false);
const isDetailOpen = ref(false);
const isChartOpen = ref(false);
const isMapOpen = ref(false);
const datasetInfo = ref(null);

const damageConfig = {
    "Rusak Ringan": { color: "emerald" },
    "Rusak Sedang": { color: "amber" },
    "Rusak Berat": { color: "rose" },
    Hilang: { color: "red" },
};
const damageOrder = ["Rusak Ringan", "Rusak Sedang", "Rusak Berat", "Hilang"];

const modalConfig = {
    type: "nested",
    pivotVar: "itemCategory1",
    tabs: ["Pribadi", "Sewa"],
    groups: ["Permanen", "Semi Permanen"],
    columns: damageOrder,
};

async function fetchData() {
    loading.value = true;
    try {
        const w = props.selectedWilayah;
        const endpoint = "/api/agregat-insight";
        const headers = useRequestHeaders(["cookie"]);
        const datasetId = 111;

        let requests = [];
        const baseQuery = { id_dataset: datasetId };

        if (w.kabupaten?.length > 0) {
            requests = w.kabupaten.map((kabId) =>
                $fetch(endpoint, {
                    query: { ...baseQuery, id_kab: kabId },
                    headers,
                }),
            );
        } else if (w.provinsi?.length > 0) {
            requests = w.provinsi.map((provId) =>
                $fetch(endpoint, {
                    query: { ...baseQuery, id_prov: provId },
                    headers,
                }),
            );
        } else {
            requests = [$fetch(endpoint, { query: baseQuery, headers })];
        }

        const responses = await Promise.all(requests);
        rawData.value = responses.flatMap((r) => r?.data?.records || []);

        if (responses[0]?.data?.meta) {
            datasetInfo.value = responses[0].data.meta.dataset;
        }
    } catch (e) {
        console.error("Error fetching Fasilitas Kesehatan:", e);
        rawData.value = [];
    } finally {
        loading.value = false;
    }
}

const processedData = computed(() => {
    const result = {
        Sewa: {
            Permanen: { total: 0, details: {} },
            "Semi Permanen": { total: 0, details: {} },
        },
        Pribadi: {
            Permanen: { total: 0, details: {} },
            "Semi Permanen": { total: 0, details: {} },
        },
    };

    const records = rawData.value;
    const len = records.length;

    // 2. High-performance Loop (Indexed for-loop is faster than forEach for large data)
    for (let i = 0; i < len; i++) {
        const r = records[i];

        const c2 = (
            r.itemCategory2?.nama ||
            r.itemCategory2 ||
            ""
        ).toLowerCase();

        let wKey = null; // Wrapper Key
        if (c2.includes("pribadi")) wKey = "Pribadi";
        else if (c2.includes("sewa")) wKey = "Sewa";
        else continue; // Skip if not matching

        const c3 = (
            r.itemCategory3?.nama ||
            r.itemCategory3 ||
            ""
        ).toLowerCase();

        let cKey = null;
        if (c3.includes("semi permanen") || c3.includes("semi-permanen")) {
            cKey = "Semi Permanen";
        } else if (c3.includes("permanen")) {
            cKey = "Permanen";
        } else continue;

        const val = Number(r.value) || 0;
        const target = result[wKey][cKey];

        target.total += val;

        const dmgCat = r.itemCategory1?.nama || r.itemCategory1 || "Lainnya";
        target.details[dmgCat] = (target.details[dmgCat] || 0) + val;
    }

    const output = [];
    const wrappers = ["Pribadi", "Sewa"];

    const cardConfigs = {
        Permanen: { icon: "i-heroicons-home-modern", color: "amber" },
        "Semi Permanen": { icon: "i-heroicons-home", color: "cyan" },
    };

    for (const wKey of wrappers) {
        const wData = result[wKey];
        const cardsArr = [];
        let wTotal = 0;

        for (const cKey of ["Permanen", "Semi Permanen"]) {
            const cData = wData[cKey];

            const detArr = Object.entries(cData.details)
                .map(([label, value]) => ({
                    label,
                    value,
                    color: damageConfig[label]?.color || "slate",
                }))
                .sort((a, b) => {
                    const idxA = damageOrder.indexOf(a.label);
                    const idxB = damageOrder.indexOf(b.label);
                    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                    return b.value - a.value;
                });

            cardsArr.push({
                label: cKey,
                icon: cardConfigs[cKey].icon,
                color: cardConfigs[cKey].color,
                total: cData.total,
                details: detArr,
            });

            wTotal += cData.total;
        }

        // Only add wrapper if it has data
        if (wTotal > 0) {
            output.push({
                label: wKey,
                cards: cardsArr,
            });
        }
    }

    return output;
});

const formatNumber = (n) => new Intl.NumberFormat("id-ID").format(n || 0);

watch(() => props.selectedWilayah, fetchData, { deep: true, immediate: true });
</script>
