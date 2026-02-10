<template>
    <div
        class="relative bg-white border border-gray-200 rounded-xl shadow-sm p-4 pt-4 mt-6"
    >
        <div
            class="absolute -top-4 left-0 right-0 px-4 flex flex-wrap items-center justify-between gap-2 z-20"
        >
            <div class="flex flex-wrap items-center gap-2">
                <div
                    class="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100 shadow-sm whitespace-nowrap"
                >
                    <UIcon
                        name="i-heroicons-building-library"
                        class="w-4 h-4 text-emerald-600"
                    />
                    <span
                        class="text-[12px] font-black text-emerald-700 uppercase tracking-wider"
                    >
                        Rumah Ibadah Terdampak
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
                <div class="grid grid-cols-1 gap-4">
                    <div class="flex flex-col gap-3">
                        <StatCard label="Memuat..." :loading="true" />
                    </div>
                    <div
                        class="hidden md:block md:col-span-2 bg-gray-50 rounded-xl animate-pulse h-full min-h-[300px]"
                    ></div>
                </div>
            </div>

            <div v-else class="grid grid-cols-1 gap-4 mt-4">
                <div class="flex flex-col gap-3">
                    <StatCard
                        v-for="item in processedCards"
                        :key="item.label"
                        :label="item.label"
                        :icon="item.icon"
                        :color="item.color"
                        :isRound="true"
                        label-size="md"
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

                <!-- Kolom kanan: BarChart kembali -->
                <!-- <div class="flex flex-col md:col-span-2 gap-3">
                    <div
                        class="bg-white border border-gray-100 rounded-xl p-4 shadow-sm h-full flex flex-col justify-center"
                    >
                        <h4
                            class="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider text-center"
                        >
                            Visualisasi Kerusakan Rumah Ibadah
                        </h4>

                        <BarChart
                            :categories="chartData.categories"
                            :series="chartData.series"
                            height="h-55"
                            :show-legend="false"
                            :bar-width="'40%'"
                            :grid="{
                                left: '3%',
                                right: '4%',
                                bottom: '5%',
                                top: '10%',
                                containLabel: true,
                            }"
                        />

                        <div
                            class="mt-4 text-center text-xs text-gray-400 italic"
                        >
                            * Grafik menampilkan total kerusakan Rumah Ibadah
                            (Tidak termasuk Perlengkapan)
                        </div>
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
                    Data Rumah Ibadah tidak tersedia
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

        <!-- Modal map baru -->
        <SpatialGenericModal
            :is-open="isMapOpen"
            :selected-wilayah="selectedWilayah"
            title="Rumah Ibadah Terdampak"
            @close="isMapOpen = false"
            @panel-opened="handleAutoFokus('pasca')"
            :initial-dataset-id="135"
            :initial-indikator-id="308"
        />

        <RumahIbadahChartModal
            :is-open="isChartOpen"
            :raw-data="rawData"
            :dataset-info="datasetInfo"
            :loading="loading"
            @close="isChartOpen = false"
        />

        <ImproveDetailModal
            :is-open="isDetailOpen"
            :dataset-id="135"
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
import ImproveDetailModal from "~/components/shared/ImproveDetailModal.vue";
import RumahIbadahChartModal from "~/components/sosial/RumahIbadahChartModal.vue";
import SpatialGenericModal from "~/components/map/SpatialGenericModal.vue";
import BarChart from "~/components/charts/BarChart.vue";

const props = defineProps({
    selectedWilayah: { type: Object, required: true },
});

const emit = defineEmits(["update:viewMode", "update:focusedMap"]);

const handleAutoFokus = (mapType) => {
    emit("update:viewMode", "focus");
    emit("update:focusedMap", mapType);
};

// State
const loading = ref(false);
const rawData = ref([]);
const isInfoOpen = ref(false);
const isDetailOpen = ref(false);
const isChartOpen = ref(false);
const isMapOpen = ref(false); // ← state baru untuk map modal
const datasetInfo = ref(null);

const DAMAGE_LABEL_MAP = {
    "Rusak Hanyut": "Hanyut",
    "Rusak Tidak Ada Informasi": "Tidak Ada Informasi",
};

const mapDamageLabel = (rawLabel) => {
    return DAMAGE_LABEL_MAP[rawLabel] || rawLabel;
};

// Configurations
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
        key: "Rumah Ibadah Terdampak",
        icon: "i-heroicons-building-library",
        color: "emerald",
    },
];

const modalConfig = {
    type: "flat",
    pivotVar: "itemCategory4",
    tabs: ["Rumah Ibadah Terdampak"],
    columns: damageOrder,
};

const formatNumber = (n) => new Intl.NumberFormat("id-ID").format(n || 0);

async function fetchData() {
    loading.value = true;
    try {
        const w = props.selectedWilayah;
        const endpoint = "/api/agregat-insight";
        const headers = useRequestHeaders(["cookie"]);
        const datasetId = 135;

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
        console.error("Error fetching Rumah Ibadah: Terdampak", e);
        rawData.value = [];
    } finally {
        loading.value = false;
    }
}

const processedCards = computed(() => {
    const grouped = new Map();
    const targetKey = "Rumah Ibadah Terdampak";

    rawData.value.forEach((r) => {
        const cat1 = r.itemCategory1?.nama || r.itemCategory1;
        if (cat1 !== "Agama") return;

        const cat2 = r.itemCategory2?.nama || r.itemCategory2;
        if (cat2 && cat2.toLowerCase().includes("perlengkapan")) return;

        const cat4Raw =
            r.itemCategory4?.nama ||
            r.itemCategory4 ||
            "Rusak Tidak Ada Informasi";

        const cat4 = mapDamageLabel(cat4Raw); // ← Mapping label di sini
        const val = Number(r.value) || 0;

        if (!grouped.has(targetKey)) {
            const conf = cardConfig.find((c) => c.key === targetKey) || {
                icon: "i-heroicons-cube",
                color: "gray",
            };
            grouped.set(targetKey, {
                label: targetKey,
                icon: conf.icon,
                color: conf.color,
                total: 0,
                detailsMap: new Map(),
                unit: "Unit",
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
                color: damageConfig[label]?.color || "slate",
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

const chartData = computed(() => {
    const filtered = rawData.value.filter((r) => {
        const cat1 = r.itemCategory1?.nama || r.itemCategory1;
        const cat2 = r.itemCategory2?.nama || r.itemCategory2;

        const isAgama = cat1 === "Agama";
        const isNotPerlengkapan =
            cat2 && !cat2.toLowerCase().includes("perlengkapan");

        return isAgama && isNotPerlengkapan;
    });

    const damageCounts = new Map();
    damageOrder.forEach((l) => damageCounts.set(l, 0));

    filtered.forEach((r) => {
        const damageLevel =
            r.itemCategory4?.nama ||
            r.itemCategory4 ||
            "Rusak Tidak Ada Informasi";
        const val = Number(r.value) || 0;

        if (damageCounts.has(damageLevel)) {
            damageCounts.set(damageLevel, damageCounts.get(damageLevel) + val);
        }
    });

    const dataValues = damageOrder.map((level) => {
        return {
            value: damageCounts.get(level),
            itemStyle: {
                color: damageConfig[level]?.color
                    ? {
                          emerald: "#10B981",
                          amber: "#F59E0B",
                          rose: "#F97316",
                          red: "#EF4444",
                          slate: "#94A3B8",
                      }[damageConfig[level].color]
                    : "#cbd5e1",
            },
        };
    });

    return {
        categories: damageOrder,
        series: [
            {
                name: "Jumlah",
                data: dataValues,
                showLabel: true,
            },
        ],
    };
});

watch(() => props.selectedWilayah, fetchData, { deep: true, immediate: true });
</script>
