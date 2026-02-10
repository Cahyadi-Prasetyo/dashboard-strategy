<template>
    <div
        class="relative bg-white border border-gray-200 rounded-xl shadow-sm p-4 pt-4 mt-4"
    >
        <div
            class="absolute -top-4 left-0 right-0 px-4 flex flex-wrap items-center justify-between gap-2 z-20"
        >
            <div class="flex flex-wrap items-center gap-2">
                <div
                    class="flex items-center gap-2 px-4 py-1.5 bg-cyan-50 rounded-lg border border-cyan-100 shadow-sm whitespace-nowrap"
                >
                    <UIcon
                        name="i-heroicons-shopping-bag"
                        class="w-4 h-4 text-cyan-600"
                    />
                    <span
                        class="text-[12px] font-black text-cyan-700 uppercase tracking-wider"
                    >
                        Perdagangan Terdampak
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
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        v-for="n in 3"
                        :key="n"
                        label="Memuat..."
                        :loading="true"
                    />
                </div>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <StatCard
                    v-for="item in processedCards"
                    :key="item.label"
                    :label="item.label"
                    :icon="item.icon"
                    :color="item.color"
                    :isRound="true"
                    label-size="sm"
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
                                :source="
                                    item.info?.sumber !== '-'
                                        ? item.info?.sumber
                                        : item.info?.instansi
                                "
                                :last-update="item.info?.terakhir_diupdate"
                            />
                        </div>
                    </template>
                </StatCard>
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
                    Data Perdagangan tidak tersedia
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
            :initial-dataset-id="130"
            :initial-indikator-id="308"
        />
        <PerdaganganChartModal
            :is-open="isChartOpen"
            :raw-data="rawData"
            :dataset-info="datasetInfo"
            :loading="loading"
            @close="isChartOpen = false"
        />

        <ImproveDetailModal
            :is-open="isDetailOpen"
            title="Detail Perdagangan Terdampak"
            :dataset-id="[139, 139, 130]"
            :indicator-id="[146, 474, null]"
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
import PerdaganganChartModal from "~/components/ekonomi/PerdaganganChartModal.vue";
// import PerdaganganDetailModal from "~/components/ekonomi/PerdaganganDetailModal.vue";
import SpatialGenericModal from "~/components/map/SpatialGenericModal.vue";
import ImproveDetailModal from "../shared/ImproveDetailModal.vue";

const props = defineProps({
    selectedWilayah: { type: Object, required: true },
});

// State
const loading = ref(false);
const rawData = ref([]);
const isInfoOpen = ref(false);
const isDetailOpen = ref(false);
const isChartOpen = ref(false);
const datasetInfo = ref({});

const isMapOpen = ref(false); // ← state baru untuk map modal
// Configuration for Damage Levels (Category 4)

const DAMAGE_LABEL_MAP = {
    "Rusak Hanyut": "Hanyut",
    "Rusak Lainnya": "Lainnya",
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
    Lainnya: { color: "amber" },
    "Tidak Ada Informasi": { color: "slate" },
};

const damageOrder = Object.keys(damageConfig);

const cardConfig = [
    {
        key: "Jumlah Pasar Terdampak",
        icon: "i-heroicons-building-storefront",
        color: "cyan",
        datasetId: 139,
        indicatorId: 146,
        metadata: null,
    },
    {
        key: "Jumlah Pedagang Pasar Terdampak",
        icon: "i-heroicons-user",
        color: "cyan",
        datasetId: 139,
        indicatorId: 474,
        metadata: null,
    },
    {
        key: "Pertokoan",
        icon: "i-heroicons-shopping-bag",
        color: "indigo",
        datasetId: 130,
        metadata: null,
    },
    {
        key: "Pedagang Kaki Lima (PKL)",
        icon: "i-heroicons-user-group",
        color: "orange",
        datasetId: 130,
        metadata: null,
    },
];

const targetCategories = cardConfig.map((c) => c.key);

const modalConfig = [
    {
        type: "flat",
        pivotVar: "itemCategory2",
        tabs: ["Pasar"],
        columns: damageOrder,
    },
    {
        type: "flat",
        pivotVar: "itemCategory2",
        tabs: ["Pedagang Pasar"],
        columns: damageOrder,
    },
    {
        type: "flat",
        pivotVar: "itemCategory4",
        tabs: ["Pedagang Kaki Lima (PKL)", "Pertokoan"],
        columns: damageOrder,
    }
];

async function fetchFromApi(datasetId, indicatorId = null) {
    const w = props.selectedWilayah;
    const endpoint = "/api/agregat-insight";
    const headers = useRequestHeaders(["cookie"]);

    let requests = [];
    const baseQuery = {
        id_dataset: datasetId,
        id_indikator_insight: indicatorId,
    };

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
    return {
        records: responses.flatMap((r) => r?.data?.records || []),
        meta: responses[0]?.data?.meta || null,
    };
}

async function fetchData() {
    loading.value = true;
    try {
        const results = await Promise.all([
            fetchFromApi(130),
            fetchFromApi(139, 146),
            fetchFromApi(139, 474),
        ]);

        const allRecords = [];

        // Dataset 130
        results[0].records.forEach((r) => {
            allRecords.push({
                ...r,
                unifiedCategory: r.itemCategory2?.nama || r.itemCategory2,
                unifiedDamage: r.itemCategory4?.nama || r.itemCategory4,
                isMarketLevel: false,
            });
        });

        // Dataset 139, 146
        results[1].records.forEach((r) => {
            allRecords.push({
                ...r,
                unifiedCategory: "Jumlah Pasar Terdampak",
                unifiedDamage: r.itemCategory2?.nama || r.itemCategory2,
                entityName: r.itemCategory1?.nama || r.itemCategory1,
                isMarketLevel: true,
            });
        });

        // Dataset 139, 474
        results[2].records.forEach((r) => {
            allRecords.push({
                ...r,
                unifiedCategory: "Jumlah Pedagang Pasar Terdampak",
                unifiedDamage: r.itemCategory2?.nama || r.itemCategory2,
                entityName: r.itemCategory1?.nama || r.itemCategory1,
                isMarketLevel: true,
            });
        });

        rawData.value = allRecords;

        if (results[0].meta?.dataset) {
            datasetInfo.value['Pertokoan dan Pedagang Kaki Lima (PKL) Terdampak'] = results[0].meta.dataset;
        }
        if (results[1].meta?.dataset) {
            datasetInfo.value['Pedagang Pasar dan Pasar Terdampak'] = results[1].meta.dataset;
        }
    } catch (e) {
        console.error("Error fetching Perdagangan:", e);
        rawData.value = [];
    } finally {
        loading.value = false;
    }
}

const processedCards = computed(() => {
    const grouped = new Map();

    rawData.value.forEach((r) => {
        const cat2 = r.unifiedCategory;
        if (!targetCategories.includes(cat2)) return;

        const val = Number(r.value) || 0;
        const damageLevel = mapDamageLabel(r.unifiedDamage || "Tidak Ada Informasi");

        if (!grouped.has(cat2)) {
            const conf = cardConfig.find((c) => c.key === cat2) || {
                icon: "i-heroicons-cube",
                color: "gray",
            };

            const customUnits = {
                "Jumlah Pasar Terdampak": "Unit",
                "Jumlah Pedagang Pasar Terdampak": "Orang",
                Pertokoan: "Unit",
                "Pedagang Kaki Lima (PKL)": "Unit",
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

        const currentDetailVal = group.detailsMap.get(damageLevel) || 0;
        group.detailsMap.set(damageLevel, currentDetailVal + val);
    });

    return Array.from(grouped.values())
        .map((group) => {
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
                    if (indexA !== -1) return -1;
                    if (indexB !== -1) return 1;
                    return b.value - a.value;
                });

            const conf = cardConfig.find((c) => c.key === group.label);
            const mapping = {
                130: "Pertokoan dan Pedagang Kaki Lima (PKL) Terdampak",
                139: "Pedagang Pasar dan Pasar Terdampak",
            };
            const info = datasetInfo.value[mapping[conf?.datasetId]];

            return {
                label: group.label,
                icon: group.icon,
                color: group.color,
                total: group.total,
                unit: group.unit,
                details: details,
                info: info,
            };
        })
        .sort((a, b) => {
            const idxA = targetCategories.indexOf(a.label);
            const idxB = targetCategories.indexOf(b.label);
            return idxA - idxB;
        });
});

const formatNumber = (n) => new Intl.NumberFormat("id-ID").format(n || 0);

watch(() => props.selectedWilayah, fetchData, { deep: true, immediate: true });
</script>
