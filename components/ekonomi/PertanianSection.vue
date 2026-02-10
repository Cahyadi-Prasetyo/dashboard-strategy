<template>
    <div
        class="relative bg-white border border-gray-200 rounded-xl shadow-sm p-4 pt-10 mt-6"
    >
        <div
            class="absolute -top-4 left-0 right-0 px-4 flex flex-wrap items-center justify-between gap-2 z-20"
        >
            <div class="flex flex-wrap items-center gap-2">
                <div
                    class="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100 shadow-sm whitespace-nowrap"
                >
                    <UIcon
                        name="i-heroicons-globe-asia-australia"
                        class="w-4 h-4 text-emerald-600"
                    />
                    <span
                        class="text-[10px] font-black text-emerald-700 uppercase tracking-wider"
                    >
                        Sektor Pertanian & Perikanan
                    </span>
                </div>
            </div>

            <div class="flex flex-row gap-2">
                <UButton
                    @click="isInfoOpen = true"
                    icon="i-heroicons-information-circle"
                    size="sm"
                    color="gray"
                    variant="solid"
                    class="font-bold shadow-md text-white bg-gray-900 hover:shadow-lg hover:shadow-gray-500/40 hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300"
                    :ui="{
                        rounded: 'rounded-lg',
                        padding: { sm: 'px-3 py-2' },
                        font: 'font-bold',
                        icon: { size: { sm: 'w-4 h-4' } },
                    }"
                />

                <UButton
                    @click="isMapOpen = true"
                    icon="i-heroicons-map"
                    size="sm"
                    color="gray"
                    variant="solid"
                    class="font-bold shadow-md text-white bg-gray-900 hover:shadow-lg hover:shadow-gray-500/40 hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300"
                    :ui="{
                        rounded: 'rounded-lg',
                        padding: { sm: 'px-3 py-2' },
                        font: 'font-bold',
                        icon: { size: { sm: 'w-4 h-4' } },
                    }"
                />

                <UButton
                    @click="isChartOpen = true"
                    icon="i-heroicons-chart-bar"
                    size="sm"
                    color="gray"
                    variant="solid"
                    class="font-bold shadow-md text-white bg-gray-900 hover:shadow-lg hover:shadow-gray-500/40 hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300"
                    :ui="{
                        rounded: 'rounded-lg',
                        padding: { sm: 'px-3 py-2' },
                        font: 'font-bold',
                        icon: { size: { sm: 'w-4 h-4' } },
                    }"
                />

                <UButton
                    @click="isDetailOpen = true"
                    icon="i-heroicons-table-cells"
                    size="sm"
                    color="gray"
                    variant="solid"
                    class="font-bold shadow-md text-white bg-gray-900 hover:shadow-lg hover:shadow-gray-500/40 hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300"
                    :ui="{
                        rounded: 'rounded-lg',
                        padding: { sm: 'px-3 py-2' },
                        font: 'font-bold',
                        icon: { size: { sm: 'w-4 h-4' } },
                    }"
                />
            </div>
        </div>

        <div class="mt-2">
            <div
                class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-gray-100 pb-3"
            >
                <div>
                    <h3 class="text-xl font-bold text-gray-900">
                        Nilai Tukar Petani (NTP) Berdasarkan Komoditas Tahun
                        2025
                    </h3>
                </div>

                <div class="flex items-center gap-2">
                    <USelect
                        v-model="activeMonth"
                        :items="months"
                        size="sm"
                        color="white"
                        icon="i-heroicons-calendar"
                        class="min-w-[130px]"
                        :ui="{
                            color: {
                                white: {
                                    outline:
                                        'shadow-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-emerald-500',
                                },
                            },
                        }"
                    />

                    <USelect
                        v-model="activeYear"
                        :items="years"
                        size="sm"
                        color="white"
                        class="min-w-[90px]"
                        :ui="{
                            color: {
                                white: {
                                    outline:
                                        'shadow-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-emerald-500',
                                },
                            },
                        }"
                    />
                </div>
            </div>

            <div
                v-if="loading"
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
                <StatCard
                    v-for="n in 3"
                    :key="n"
                    label="Memuat..."
                    :loading="true"
                />
            </div>

            <div
                v-else
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
                <StatCard
                    v-for="item in processedCards"
                    :key="item.label"
                    :label="item.label"
                    :icon="item.icon"
                    :color="item.color"
                    :isRound="true"
                >
                    <template #default>
                        <div
                            class="flex flex-col gap-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200 h-full"
                        >
                            <div class="flex items-baseline gap-2">
                                <span
                                    class="text-3xl font-extrabold tracking-tight"
                                    :class="`text-${item.color}-600`"
                                >
                                    {{ formatNumber(item.value) }}
                                </span>
                            </div>
                            <div
                                class="mt-auto flex justify-between items-center"
                            >
                                <span
                                    class="text-[10px] font-bold text-gray-400 uppercase"
                                    >Indeks NTP</span
                                >
                                <span
                                    class="text-[9px] px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-500 font-medium"
                                >
                                    {{ activeMonth }} {{ activeYear }}
                                </span>
                            </div>
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
                    Data tidak tersedia untuk periode {{ activeMonth }}
                    {{ activeYear }}
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
            title="Peta Sektor Pertanian"
            :initial-dataset-id="11"
            :initial-indikator-id="14"
            @close="isMapOpen = false"
        />

        <PertanianChartModal
            :is-open="isChartOpen"
            :raw-data="rawData"
            :dataset-info="datasetInfo"
            :loading="loading"
            @close="isChartOpen = false"
        />

        <SharedImproveDetailModal
            :is-open="isDetailOpen"
            title="Detail Sektor Pertanian"
            :dataset-id="11"
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
import SpatialGenericModal from "~/components/map/SpatialGenericModal.vue";
import PertanianChartModal from "~/components/ekonomi/pertanian/PertanianChartModal.vue";

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

// Filters Options
const years = ["2025"];
const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
    "Tahunan",
];

// Active State
const activeYear = ref("2025");
const activeMonth = ref("Tahunan");

const sectorConfig = [
    { key: "pangan", icon: "i-heroicons-cake", color: "emerald" },
    { key: "hortikultura", icon: "i-heroicons-sparkles", color: "amber" },
    { key: "perkebunan", icon: "i-heroicons-beaker", color: "green" },
    { key: "peternakan", icon: "i-heroicons-beaker", color: "amber" },
    { key: "perikanan", icon: "i-heroicons-lifebuoy", color: "cyan" },
    { key: "gabungan", icon: "i-heroicons-scale", color: "indigo" },
];

const modalConfig = {
    type: "flat",
    pivotVar: "itemCategory1",
    tabs: [],
    columns: ["Nilai"],
};

async function fetchData() {
    loading.value = true;
    try {
        const w = props.selectedWilayah;
        const endpoint = "/api/agregat-insight";
        const headers = useRequestHeaders(["cookie"]);
        const datasetId = 11;
        const indikatorId = 14;

        let requests = [];
        const baseQuery = {
            id_dataset: datasetId,
            id_indikator_insight: indikatorId,
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
        rawData.value = responses.flatMap((r) => r?.data?.records || []);

        if (responses[0]?.data?.meta) {
            datasetInfo.value = responses[0].data.meta.dataset;
        }
    } catch (e) {
        console.error("Error fetching Pertanian:", e);
        rawData.value = [];
    } finally {
        loading.value = false;
    }
}

const processedCards = computed(() => {
    // 1. Filter by Active Period
    const filtered = rawData.value.filter((r) => {
        const rYear = (
            r.itemCategory2?.nama ||
            r.itemCategory2 ||
            ""
        ).toString();
        const rMonth = r.itemCategory3?.nama || r.itemCategory3 || "";
        return (
            rYear === activeYear.value &&
            rMonth.toLowerCase() === activeMonth.value.toLowerCase()
        );
    });

    // 2. Map Data by Sector (ItemCategory1)
    const grouped = new Map();

    filtered.forEach((r) => {
        const sectorName =
            r.itemCategory1?.nama || r.itemCategory1 || "Lainnya";
        const val = Number(r.value) || 0;

        // LOGIC BARU:
        // Hanya ambil data PERTAMA yang ditemukan untuk sektor ini.
        // Jangan dijumlah (+=), jangan dirata-rata. Langsung pakai val.
        if (!grouped.has(sectorName)) {
            const lowerName = sectorName.toLowerCase();
            const conf = sectorConfig.find((c) =>
                lowerName.includes(c.key),
            ) || { icon: "i-heroicons-cube", color: "gray" };

            grouped.set(sectorName, {
                label: sectorName,
                value: val, // <--- Pakai nilai langsung dari API
                icon: conf.icon,
                color: conf.color,
            });
        }
        // Jika grouped.has(sectorName) sudah true, kita abaikan data duplikat/lanjutan
        // agar tidak terjadi double counting (jadi tidak akan muncul angka 500 lagi).
    });

    return Array.from(grouped.values()).sort((a, b) => b.value - a.value);
});

// Formatter standar
const formatNumber = (n) =>
    new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 2, // Opsional: Tampilkan 2 desimal jika ada koma
    }).format(n || 0);

watch(() => props.selectedWilayah, fetchData, { deep: true, immediate: true });
</script>
