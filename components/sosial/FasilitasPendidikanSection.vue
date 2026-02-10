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
                        name="i-heroicons-building-office-2"
                        class="w-4 h-4 text-emerald-400"
                    />
                    <span
                        class="text-[12px] font-black text-emerald-700 uppercase tracking-wider"
                    >
                        Fasilitas Pendidikan Terdampak
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

        <!-- CONTENT -->
        <div class="mt-2">
            <!-- LOADING -->
            <div v-if="loading" class="mt-0">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="flex flex-col gap-3">
                        <StatCard label="Memuat..." :loading="true" />
                    </div>
                    <div
                        class="hidden md:block md:col-span-2 bg-gray-50 rounded-xl animate-pulse min-h-[300px]"
                    />
                </div>
            </div>

            <!-- DATA -->
            <div
                v-else-if="processedCards?.length"
                class="grid grid-cols-1 gap-4 mt-0"
            >
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
            </div>

            <!-- EMPTY -->
            <div
                v-else
                class="flex flex-col items-center justify-center py-12 text-center"
            >
                <div class="bg-gray-50 p-4 rounded-full mb-3">
                    <UIcon
                        name="i-heroicons-archive-box-x-mark"
                        class="w-8 h-8 text-gray-400"
                    />
                </div>
                <p class="text-sm font-medium text-gray-600">
                    Data Fasilitas Pendidikan Terdampak tidak tersedia
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

        <FasilitasPendidikanChartModal
            :is-open="isChartOpen"
            :raw-data="rawData"
            :dataset-info="datasetInfo"
            :loading="loading"
            @close="isChartOpen = false"
        />

        <ImproveDetailModal
            :is-open="isDetailOpen"
            title="Detail Sekolah Terdampak"
            :region-ids="selectedWilayah || []"
            :dataset-id="116"
            :config="modalConfig"
            @close="isDetailOpen = false"
            hide-total="true"
        />
    </Teleport>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import StatCard from "~/components/shared/StatCard.vue";
import SharedDatasetInfoModal from "~/components/shared/DatasetInfoModal.vue";
import ImproveDetailModal from "~/components/shared/ImproveDetailModal.vue";
import FasilitasPendidikanChartModal from "~/components/sosial/FasilitasPendidikanChartModal.vue";

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

const jenjangConfig = {
    "Pendidikan Anak Usia Dini": { color: "emerald" },
    "Sekolah Dasar": { color: "blue" },
    "Sekolah Menengah Pertama": { color: "indigo" },
    "Sekolah Menengah Atas": { color: "yellow" },
    "Sekolah Menengah Kejuruan": { color: "purple" },
    "Sekolah Luar Biasa": { color: "rose" },
    "Lembaga Kursus dan Pelatihan": { color: "amber" },
    "Pusat Kegiatan Belajar Masyarakat": { color: "orange" },
    "Pendidikan kesetaraan": { color: "slate" },
    "Seluruh Jenjang Pendidikan": { color: "gray" },
};

const jenjangOrder = Object.keys(jenjangConfig);

const modalConfig = {
    type: "flat",
    pivotVar: "itemCategory1",
    tabs: ["Fasilitas Pendidikan Terdampak"],
    columns: jenjangOrder,
};

const cardConfig = [
    {
        key: "Fasilitas Pendidikan Terdampak",
        icon: "i-heroicons-academic-cap",
        color: "amber",
    },
];

const formatNumber = (n) => new Intl.NumberFormat("id-ID").format(n || 0);
const records116 = reactive({ total: 0, breakdown: [] });

async function fetchData() {
    loading.value = true;
    try {
        const w = props.selectedWilayah;
        const endpoint = "/api/agregat-insight";
        const headers = useRequestHeaders(["cookie"]);
        const datasetId = 116;

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
        console.error("Error fetching Fasilitas Pendidikan Terdampak:", e);
        rawData.value = [];
    } finally {
        loading.value = false;
    }
}

const processedCards = computed(() => {
    const grouped = new Map();
    const targetKey = "Fasilitas Pendidikan Terdampak";

    rawData.value.forEach((r) => {
        const cat1 = r.itemCategory1?.nama || r.itemCategory1;
        if (!cat1) return;

        const jenjang = cat1 || "Jenjang Tidak Diketahui";
        const val = Number(r.value) || 0;

        if (!grouped.has(targetKey)) {
            const conf = cardConfig.find((c) => c.key === targetKey) || {
                icon: "i-heroicons-academic-cap",
                color: "indigo",
            };

            grouped.set(targetKey, {
                label: targetKey,
                icon: conf.icon,
                color: conf.color,
                total: 0,
                detailsMap: new Map(),
                unit: "Sekolah",
            });
        }

        const group = grouped.get(targetKey);

        if (cat1 === "Seluruh Jenjang Pendidikan") {
            group.total += val;
            return;
        }

        group.detailsMap.set(
            jenjang,
            (group.detailsMap.get(jenjang) || 0) + val,
        );
    });

    return Array.from(grouped.values()).map((group) => {
        const details = Array.from(group.detailsMap.entries())
            .map(([label, value]) => ({
                label,
                value,
                color: jenjangConfig?.[label]?.color || "blue",
            }))
            .sort((a, b) => b.value - a.value);

        return {
            label: group.label,
            icon: group.icon,
            color: group.color,
            total: group.total,
            unit: group.unit,
            details,
        };
    });
});

const chartDamageData = computed(() => {
    const map = {};

    records116.breakdown.forEach((item) => {
        map[item.label] = {
            usulan: item.total,
            dtsen: 0,
        };
    });

    records116.breakdown.forEach((item) => {
        if (!map[item.label]) {
            map[item.label] = { usulan: 0, dtsen: 0 };
        }
        map[item.label].value = item.total;
    });
    return map;
});

watch(
    () => props.selectedWilayah,
    () => fetchData(),
    { deep: true, immediate: true },
);
</script>
