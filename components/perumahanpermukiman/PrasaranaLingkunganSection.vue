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
                        name="i-heroicons-building-office"
                        class="w-4 h-4 text-blue-600"
                    />
                    <span
                        class="text-[12px] font-black text-blue-700 uppercase tracking-wider"
                    >
                        Prasarana Lingkungan Terdampak
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
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                        v-for="n in 3"
                        :key="n"
                        label="Memuat..."
                        :loading="true"
                    />
                </div>
            </div>

            <div
                v-else
                class="grid grid-cols-1 gap-4 mt-4"
                :class="`md:grid-cols-${processedCards.length}`"
            >
                <SharedStatCard
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
                                class="grid grid-cols-1 gap-3 text-[11px] uppercase font-semibold"
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
                                :last-update="datasetInfo?.terakhir_diupdate"
                            />
                        </div>
                    </template>
                </SharedStatCard>
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
                    Data Prasarana Lingkungan tidak tersedia
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
            :initial-dataset-id="134"
            :initial-indikator-id="308"
        />

        <PerumahanpermukimanPrasaranaChartModal
            :is-open="isChartOpen"
            :raw-data="rawData"
            :dataset-info="datasetInfo"
            :loading="loading"
            @close="isChartOpen = false"
        />

        <SharedImproveDetailModal
            :is-open="isDetailOpen"
            title="Detail Prasarana Lingkungan Terdampak"
            :dataset-id="134"
            :region-ids="selectedWilayah || []"
            :config="modalConfig"
            @close="isDetailOpen = false"
        />
    </Teleport>
</template>

<script setup>
import { ref, computed, watch } from "vue";
// Ensure you have created this file in the shared folder as discussed
import SpatialGenericModal from "~/components/map/SpatialGenericModal.vue";

const props = defineProps({
    selectedWilayah: { type: Object, required: true },
});

// State
const loading = ref(false);
const rawData = ref([]);
const isInfoOpen = ref(false);
const isDetailOpen = ref(false);
const datasetInfo = ref(null);
const isChartOpen = ref(false);

const isMapOpen = ref(false); // ← state baru untuk map modal

const mapDamageLabel = (rawLabel) => {
    return DAMAGE_LABEL_MAP[rawLabel] || rawLabel;
};

// Line 241-244: Update DAMAGE_LABEL_MAP to include all mappings
const DAMAGE_LABEL_MAP = {
    "Rusak Ringan": "Rusak Ringan",
    "Rusak Sedang": "Rusak Sedang",
    "Rusak Berat": "Rusak Berat",
    "Rusak Hanyut": "Hanyut",
    "Rusak Tidak Ada Informasi": "Tidak Ada Informasi",
};

// Line 250-265: modalConfig using the map
const modalConfig = {
    type: "flat",
    pivotVar: "itemCategory4",
    tabs: [
        "Drainase Lingkungan",
        "Jalan Lingkungan",
        "Jembatan Ruas Jalan Lingkungan",
    ],
    columns: [
        "Rusak Ringan",
        "Rusak Sedang",
        "Rusak Berat",
        "Hanyut",
        "Tidak Ada Informasi",
    ],
    columnMapping: DAMAGE_LABEL_MAP,
};

// Configuration: Order of Damage Levels inside the card
const damageConfig = {
    "Rusak Ringan": { color: "emerald" },
    "Rusak Sedang": { color: "amber" },
    "Rusak Berat": { color: "rose" },
    Hanyut: { color: "red" },
    "Tidak Ada Informasi": { color: "slate" },
};

const unitConfig = {
    "Jalan Lingkungan": "Meter",
    "Drainase Lingkungan": "Unit",
    "Jembatan Ruas Jalan Lingkungan": "Jembatan",
};

const damageOrder = Object.keys(damageConfig);

// Configuration: Card Types (ItemCategory2)
const cardConfig = [
    {
        key: "Drainase Lingkungan",
        icon: "i-heroicons-building-storefront",
        color: "green",
    },
    { key: "Jalan Lingkungan", icon: "i-heroicons-map", color: "blue" },
    {
        key: "Jembatan Ruas Jalan Lingkungan",
        icon: "i-heroicons-arrows-right-left",
        color: "indigo",
    },
];

const targetCategories = cardConfig.map((c) => c.key);

async function fetchData() {
    loading.value = true;
    try {
        const w = props.selectedWilayah;
        const endpoint = "/api/agregat-insight";
        const headers = useRequestHeaders(["cookie"]);
        const datasetId = 134;

        let requests = [];

        if (w.kabupaten?.length > 0) {
            requests = w.kabupaten.map((kabId) =>
                $fetch(endpoint, {
                    query: { id_dataset: datasetId, id_kab: kabId },
                    headers,
                }),
            );
        } else if (w.provinsi?.length > 0) {
            requests = w.provinsi.map((provId) =>
                $fetch(endpoint, {
                    query: { id_dataset: datasetId, id_prov: provId },
                    headers,
                }),
            );
        } else {
            requests = [
                $fetch(endpoint, { query: { id_dataset: datasetId }, headers }),
            ];
        }

        const responses = await Promise.all(requests);
        rawData.value = responses.flatMap((r) => r?.data?.records || []);

        if (responses[0]?.data?.meta) {
            datasetInfo.value = responses[0].data.meta.dataset;
        }
    } catch (e) {
        console.error("Error fetching Prasarana:", e);
        rawData.value = [];
    } finally {
        loading.value = false;
    }
}

const processedCards = computed(() => {
    const grouped = new Map();

    rawData.value.forEach((r) => {
        const cat2 = r.itemCategory2?.nama || r.itemCategory2;
        if (!targetCategories.includes(cat2)) return;

        const cat4Raw =
            r.itemCategory4?.nama ||
            r.itemCategory4 ||
            "Rusak Tidak Ada Informasi";

        const cat4 = mapDamageLabel(cat4Raw); // ← Mapping label di sini
        const val = Number(r.value) || 0;

        if (!grouped.has(cat2)) {
            const conf = cardConfig.find((c) => c.key === cat2) || {
                icon: "i-heroicons-cube",
                color: "gray",
            };

            const customUnits = {
                "Jalan Lingkungan": "Meter",
                "Drainase Lingkungan": "Unit",
                "Jembatan Ruas Jalan Lingkungan": "Jembatan",
            };
            grouped.set(cat2, {
                label: cat2,
                icon: conf.icon,
                color: conf.color,
                total: 0,
                detailsMap: new Map(),
                unit: customUnits[cat2] || r.indikator?.satuan || "Unit",
            });
        }

        const group = grouped.get(cat2);
        group.total += val;

        const currentDetailVal = group.detailsMap.get(cat4) || 0;
        group.detailsMap.set(cat4, currentDetailVal + val);
    });

    return Array.from(grouped.values())
        .map((group) => {
            const details = Array.from(group.detailsMap.entries())
                .map(([label, value]) => ({
                    label,
                    value,
                    // [IMPORTANT] Assign color here
                    color: damageConfig[label]?.color || "slate",
                }))
                .sort((a, b) => {
                    const indexA = damageOrder.indexOf(a.label);
                    const indexB = damageOrder.indexOf(b.label);
                    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                    if (indexA !== -1) return -1;
                    if (indexB !== -1) return 1;
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
        })
        .sort((a, b) => {
            const idxA = targetCategories.indexOf(a.label);
            const idxB = targetCategories.indexOf(b.label);
            return idxA - idxB;
        });
});

watch(() => props.selectedWilayah, fetchData, { deep: true, immediate: true });
</script>
