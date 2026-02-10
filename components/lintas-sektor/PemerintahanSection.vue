<template>
    <div
        class="relative bg-white border border-gray-200 rounded-xl shadow-sm p-4 pt-4 mt-6"
    >
        <div
            class="absolute -top-4 left-0 right-0 px-4 flex flex-wrap items-center justify-between gap-2 z-20"
        >
            <div class="flex flex-wrap items-center gap-2">
                <div
                    class="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 rounded-lg border border-indigo-100 shadow-sm whitespace-nowrap"
                >
                    <UIcon
                        name="i-heroicons-building-office-2"
                        class="w-4 h-4 text-indigo-600"
                    />
                    <span
                        class="text-[12px] font-black text-indigo-700 uppercase tracking-wider"
                    >
                        Kantor Pemerintahan Terdampak
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
            <div v-if="loading" class="mt-4">
                <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <StatCard label="Memuat..." :loading="true" />
                    <div
                        class="hidden md:block md:col-span-2 bg-gray-50 rounded-xl animate-pulse h-full min-h-[200px]"
                    ></div>
                </div>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                <div class="flex flex-col gap-3">
                    <StatCard
                        v-for="item in processedCards"
                        :key="item.label"
                        :label="item.label"
                        :icon="item.icon"
                        :color="item.color"
                        :isRound="true"
                        labelSize="sm"
                    >
                        <template #default>
                            <div
                                class="flex flex-col gap-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200"
                            >
                                <div class="flex items-baseline gap-2">
                                    <span
                                        class="text-4xl font-extrabold tracking-tight"
                                        :class="`text-${item.color}-600`"
                                    >
                                        {{
                                            item.total == null
                                                ? "N/A"
                                                : formatNumber(item.total)
                                        }}
                                    </span>
                                    <span
                                        class="text-[11px] text-slate-500 font-bold uppercase"
                                    >
                                        {{ item.unit }}
                                    </span>
                                </div>

                                <div
                                    class="grid grid-cols-2 gap-3 text-[11px] uppercase font-semibold"
                                >
                                    <div
                                        v-for="detail in item.details"
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

                <!-- <div class="flex flex-col md:col-span-2 gap-3">
                    <div
                        class="bg-white border border-gray-100 rounded-xl p-4 shadow-sm h-full flex flex-col justify-center"
                    >
                        <h4
                            class="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider text-center"
                        >
                            Visualisasi Tingkat Kerusakan
                        </h4>

                        <BarChart
                            :categories="chartData.categories"
                            :series="chartData.series"
                            height="h-64"
                            :show-legend="false"
                            :bar-width="'40%'"
                        />
                    </div>
                </div> -->
            </div>

            <div
                v-if="!loading && processedCards.length === 0"
                class="flex flex-col items-center justify-center py-12 text-center"
            >
                <div class="bg-gray-50 p-4 rounded-full mb-3">
                    <UIcon
                        name="i-heroicons-archive-box-x-mark"
                        class="w-8 h-8 text-gray-400"
                    />
                </div>
                <p class="text-sm font-medium text-gray-600">
                    Data Pemerintahan tidak tersedia
                </p>
            </div>
        </div>
    </div>

    <Teleport to="body">
        <SharedDatasetInfoModal
            :is-open="isInfoOpen"
            :dataset-info="datasetInfo"
            @close="isInfoOpen = false"
        />

        <SpatialGenericModal
            :is-open="isMapOpen"
            :selected-wilayah="selectedWilayah"
            @close="isMapOpen = false"
            @panel-opened="handleAutoFokus('pasca')"
            :initial-dataset-id="133"
            :initial-indikator-id="308"
        />
        <PemerintahanChartModal
            :is-open="isChartOpen"
            :raw-data="rawData"
            :dataset-info="datasetInfo"
            :loading="loading"
            @close="isChartOpen = false"
        />

        <SharedImproveDetailModal
            :is-open="isDetailOpen"
            title="Detail Pemerintahan Terdampak"
            :dataset-id="133"
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
import PemerintahanChartModal from "~/components/lintas-sektor/PemerintahanChartModal.vue";

import SpatialGenericModal from "~/components/map/SpatialGenericModal.vue";
const props = defineProps({
    selectedWilayah: { type: Object, required: true },
});

// State
const loading = ref(false);
const rawData = ref([]);
const isInfoOpen = ref(false);
const isDetailOpen = ref(false);
const isChartOpen = ref(false);
const datasetInfo = ref(null);
const isMapOpen = ref(false); // ← state baru untuk map modal

const DAMAGE_LABEL_MAP = {
    "Rusak Hanyut": "Hanyut",
    "Rusak Tidak Ada Informasi": "Tidak Ada Informasi",
};

const mapDamageLabel = (rawLabel) => {
    return DAMAGE_LABEL_MAP[rawLabel] || rawLabel;
};

const damageConfig = {
    "Rusak Ringan": { color: "emerald" },
    "Rusak Sedang": { color: "amber" },
    "Rusak Berat": { color: "rose" },
    Hanyut: { color: "red" },
    "Tidak Ada Informasi": { color: "slate" },
};

const damageOrder = Object.keys(damageConfig);

const cardConfig = [
    {
        key: "Kantor Pemerintahan",
        label: "Jumlah Kantor Pemerintahan Rusak",
        icon: "i-heroicons-building-office-2",
        color: "indigo",
    },
];

const modalConfig = {
    type: "flat",
    pivotVar: "itemCategory4",
    tabs: ["Kantor Pemerintahan"],
    columns: damageOrder,
};

async function fetchData() {
    loading.value = true;
    try {
        const w = props.selectedWilayah;
        const endpoint = "/api/agregat-insight";
        const headers = useRequestHeaders(["cookie"]);
        const datasetId = 133;

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
        console.error("Error fetching Pemerintahan:", e);
        rawData.value = [];
    } finally {
        loading.value = false;
    }
}

const processedCards = computed(() => {
    const grouped = new Map();
    const targetKey = "Kantor Pemerintahan";

    rawData.value.forEach((r) => {
        const cat1 = r.itemCategory1?.nama || r.itemCategory1;
        if (cat1 !== "Pemerintahan") return;

        const cat2 = r.itemCategory2?.nama || r.itemCategory2;
        if (cat2 !== "Kantor Pemerintahan") return;

        const cat4Raw =
            r.itemCategory4?.nama ||
            r.itemCategory4 ||
            "Rusak Tidak Ada Informasi";

        const cat4 = mapDamageLabel(cat4Raw); // ← Mapping label di sini
        const val = Number(r.value) || 0;

        if (!grouped.has(targetKey)) {
            const conf = cardConfig.find((c) => c.key === targetKey) || {
                label: targetKey,
                icon: "i-heroicons-cube",
                color: "gray",
            };

            const customUnits = {
                "Kantor Pemerintahan": "Unit",
            };

            grouped.set(targetKey, {
                label: conf.label,
                icon: conf.icon,
                color: conf.color,
                total: 0,
                detailsMap: new Map(),
                unit: customUnits[targetKey] || r.indikator?.satuan || "Unit",
            });
        }

        const group = grouped.get(targetKey);
        group.total += val;

        const currentDetailVal = group.detailsMap.get(cat4) || 0;
        group.detailsMap.set(cat4, currentDetailVal + val);
    });

    return Array.from(grouped.values()).map((group) => {
        const details = Array.from(group.detailsMap.entries())
            .map(([label, value]) => ({
                label,
                value,
                color: damageConfig[label]?.color || "gray",
            }))
            .sort((a, b) => {
                const indexA = damageOrder.indexOf(a.label);
                const indexB = damageOrder.indexOf(b.label);
                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                return b.value - a.value;
            });

        return {
            label: group.label,
            icon: group.icon,
            color: group.color,
            total: group.total,
            unit: group.unit,
            details: details,
        };
    });
});

// [ADD THIS] Computed property to prepare data for the Bar Chart
const chartData = computed(() => {
    if (processedCards.value.length === 0) {
        return { categories: [], series: [] };
    }

    const card = processedCards.value[0]; // We only have one card

    // Transform details array into chart format
    // details is already sorted by damageOrder in processedCards
    const categories = card.details.map((d) => d.label);
    const dataValues = card.details.map((d) => d.value);

    // Color map for the bars matching the damage types
    const colorMap = {
        "Rusak Ringan": "#10B981", // Emerald
        "Rusak Sedang": "#F59E0B", // Amber
        "Rusak Berat": "#F97316", // Orange
        "Rusak Hanyut": "#EF4444", // Red
        "Rusak Tidak Ada Informasi": "#94A3B8", // Slate
    };

    // Create an array of colors corresponding to the categories
    const colors = categories.map((cat) => colorMap[cat] || "#6B7280");

    return {
        categories: categories,
        series: [
            {
                name: "Unit",
                data: dataValues.map((val, i) => ({
                    value: val,
                    itemStyle: { color: colors[i] }, // Individual bar color
                })),
                showLabel: true,
            },
        ],
    };
});

const formatNumber = (n) => new Intl.NumberFormat("id-ID").format(n || 0);

watch(() => props.selectedWilayah, fetchData, { deep: true, immediate: true });
</script>
