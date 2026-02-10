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
                        name="i-heroicons-lifebuoy"
                        class="w-4 h-4 text-indigo-600"
                    />
                    <span
                        class="text-[12px] font-black text-indigo-700 uppercase tracking-wider"
                    >
                        Kelautan dan Perikanan Terdampak
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

        <div class="mt-2">
            <div v-if="loading" class="mt-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard label="Memuat..." :loading="true" />
                    <StatCard label="Memuat..." :loading="true" />
                    <StatCard label="Memuat..." :loading="true" />
                </div>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <StatCard
                    v-for="item in processedCards"
                    :key="item.key"
                    :label="item.label"
                    :icon="item.icon"
                    :color="item.color"
                    :isRound="true"
                    labelSize="sm"
                >
                    <template #default>
                        <div
                            class="flex flex-col items-center justify-center bg-slate-50/60 p-6 rounded-xl border border-slate-200 h-full"
                        >
                            <div class="flex items-baseline gap-2">
                                <span
                                    class="text-2xl font-extrabold tracking-tight"
                                    :class="`text-${item.color}-600`"
                                >
                                    {{
                                        item.total == null
                                            ? "N/A"
                                            : formatNumber(item.total)
                                    }}
                                </span>
                                <span
                                    class="text-xs text-slate-500 font-bold uppercase"
                                >
                                    {{ item.unit }}
                                </span>
                            </div>
                        </div>
                        <SharedDatasetInfoCard
                            :source="datasetInfo?.sumber"
                            :last-update="datasetInfo?.terakhir_diupdate"
                        />
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
                    Data Kelautan tidak tersedia
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
            :initial-dataset-id="119"
            :initial-indikator-id="221"
        />
        <KelautanChartModal
            :is-open="isChartOpen"
            :raw-data="rawData"
            :dataset-info="datasetInfo"
            :loading="loading"
            @close="isChartOpen = false"
        />

        <FasilitasKelautanTerdampakTable
            :is-open="isDetailOpen"
            title="Detail Kelautan Terdampak"
            :dataset-id="119"
            @close="isDetailOpen = false"
        />
    </Teleport>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import StatCard from "~/components/shared/StatCard.vue";
import SharedDatasetInfoModal from "~/components/shared/DatasetInfoModal.vue";
import SharedImproveDetailModal from "~/components/shared/ImproveDetailModal.vue";
import KelautanChartModal from "~/components/lintas-sektor/KelautanChartModal.vue";
import FasilitasKelautanTerdampakTable from "~/components/lintas-sektor/FasilitasKelautanTerdampakTable.vue";

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
const isMapOpen = ref(false);

const cardConfig = [
    {
        key: "Tambak Rakyat (Ha)",
        label: "Luas Tambak Rakyat Terdampak",
        icon: "i-heroicons-building-storefront",
        color: "blue",
        unit: "Ha",
    },
    {
        key: "Pelabuhan Perikanan (PP) (Unit)",
        label: "Jumlah Pelabuhan Perikanan (PP) Terdampak",
        icon: "i-heroicons-wrench-screwdriver",
        color: "indigo",
        unit: "PP",
    },
    {
        key: "Lahan Mangrove Kawasan Konservasi (Ha)",
        label: "Luas Lahan Mangrove Kawasan Konservasi Terdampak",
        icon: "i-heroicons-lifebuoy",
        color: "emerald",
        unit: "Ha",
    },
];

async function fetchData() {
    loading.value = true;
    try {
        const w = props.selectedWilayah;
        const endpoint = "/api/agregat-insight";
        const headers = useRequestHeaders(["cookie"]);
        const datasetId = 119;
        const indikatorId = 221; // PENTING: Filter hanya indikator Volume Kerusakan

        let requests = [];
        const baseQuery = {
            id_dataset: datasetId,
            id_indikator: indikatorId,
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

        // Filter hanya records dengan indikator "Volume Kerusakan"
        rawData.value = responses.flatMap((r) => {
            const records = r?.data?.records || [];
            return records.filter((rec) => {
                const indikatorNama = rec.indikator?.nama || "";
                return indikatorNama === "Volume Kerusakan";
            });
        });

        if (responses[0]?.data?.meta) {
            datasetInfo.value = responses[0].data.meta.dataset;
        }
    } catch (e) {
        console.error("Error fetching Kelautan:", e);
        rawData.value = [];
    } finally {
        loading.value = false;
    }
}

const processedCards = computed(() => {
    const grouped = new Map();

    // Initialize all cards with 0
    cardConfig.forEach((conf) => {
        grouped.set(conf.key, {
            key: conf.key,
            label: conf.label,
            icon: conf.icon,
            color: conf.color,
            total: 0,
            unit: conf.unit,
        });
    });

    // Agregasi data berdasarkan itemCategory3 saja
    // Data dari API sudah di-filter berdasarkan selectedWilayah DAN indikator Volume Kerusakan
    rawData.value.forEach((r) => {
        const cat3Raw = r.itemCategory3?.nama || r.itemCategory3 || "";
        const cat3 = cat3Raw.trim();

        // Match berdasarkan key yang tepat
        const match = cardConfig.find((c) => c.key === cat3);
        if (!match) return;

        const val = Number(r.value) || 0;
        const group = grouped.get(match.key);
        group.total += val;
    });

    return Array.from(grouped.values());
});

const formatNumber = (n) =>
    n === 0 ? "0" : new Intl.NumberFormat("id-ID").format(n || 0);

watch(() => props.selectedWilayah, fetchData, { deep: true, immediate: true });
</script>
