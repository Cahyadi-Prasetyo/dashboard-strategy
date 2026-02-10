<template>
    <div
        class="relative bg-white border border-gray-200 rounded-xl shadow-sm p-4 pt-10 mt-6"
    >
        <!-- Header Badge -->
        <div
            class="absolute -top-4 left-0 right-0 px-4 flex flex-wrap items-center justify-between gap-2 z-20"
        >
            <div class="flex flex-wrap items-center gap-2">
                <div
                    class="flex items-center gap-2 px-4 py-1.5 bg-amber-50 rounded-lg border border-amber-100 shadow-sm whitespace-nowrap"
                >
                    <UIcon
                        name="i-heroicons-signal"
                        class="w-4 h-4 text-amber-600"
                    />
                    <span
                        class="text-[10px] font-black text-amber-700 uppercase tracking-wider"
                    >
                        Kerusakan Pos & Telekomunikasi
                    </span>
                </div>
            </div>

            <div class="flex items-center gap-2">
                <UButton
                    @click="isInfoOpen = true"
                    icon="i-heroicons-information-circle"
                    size="sm"
                    color="gray"
                    variant="solid"
                    class="font-bold shadow-md text-white bg-gray-900 hover:bg-gray-800"
                >
                </UButton>
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
                    disabled
                />
                <UButton
                    @click="isChartOpen = true"
                    icon="i-heroicons-chart-bar"
                    size="sm"
                    color="gray"
                    variant="solid"
                    class="font-bold shadow-md text-white bg-gray-900 hover:bg-gray-800"
                >
                </UButton>
                <UButton
                    @click="isDetailOpen = true"
                    icon="i-heroicons-table-cells"
                    size="sm"
                    color="gray"
                    variant="solid"
                    class="font-bold shadow-md text-white bg-gray-900 hover:bg-gray-800"
                >
                </UButton>
            </div>
        </div>

        <!-- Summary Statistics -->
        <div class="mt-2">
            <div class="grid grid-cols-1 gap-4">
                <template v-if="loading">
                    <StatCard
                        label="Memuat Data..."
                        :loading="true"
                        sizeIcon="md"
                    />
                </template>

                <template v-else>
                    <StatCard
                        :label="summaryCard.label"
                        :color="summaryCard.color"
                        labelSize="sm"
                        :icon="summaryCard.icon"
                        :isRound="true"
                    >
                        <template #default>
                            <div
                                class="flex flex-col gap-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200 mt-2"
                            >
                                <div class="flex items-baseline gap-2">
                                    <span
                                        :class="`text-4xl font-extrabold tracking-tight text-${summaryCard.color}-700`"
                                    >
                                        {{
                                            summaryCard.total == null
                                                ? "N/A"
                                                : formatNumber(
                                                      summaryCard.total,
                                                  )
                                        }}
                                    </span>
                                    <span
                                        class="text-[11px] text-slate-500 font-bold uppercase"
                                    >
                                        Unit
                                    </span>
                                </div>

                                <div
                                    class="grid grid-cols-2 md:grid-cols-5 gap-2 text-[11px] uppercase font-semibold"
                                >
                                    <div
                                        v-for="detail in summaryCard.breakdown"
                                        :key="detail.key"
                                        class="flex items-center justify-between p-2 rounded-md border"
                                        :class="[detail.bg, detail.border]"
                                    >
                                        <span
                                            class="font-semibold text-[10px] uppercase"
                                            :class="detail.text"
                                        >
                                            {{ detail.label }}
                                        </span>
                                        <span
                                            class="font-black text-[11px]"
                                            :class="detail.textBold"
                                        >
                                            {{ formatNumber(detail.total) }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </StatCard>
                </template>
            </div>
        </div>

        <!-- Chart Modal -->
        <Teleport to="body">
            <div
                v-if="isChartOpen"
                class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
            >
                <div
                    class="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
                    @click="isChartOpen = false"
                ></div>

                <div
                    class="relative w-full max-w-6xl max-h-[90vh] flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10"
                >
                    <div
                        class="px-6 pt-6 pb-2 flex items-center justify-between gap-4 border-b border-gray-100"
                    >
                        <h3 class="text-lg font-bold text-gray-800">
                            Distribusi Kerusakan Pos & Telekomunikasi
                            berdasarkan Tingkat Kerusakan
                        </h3>

                        <UButton
                            color="error"
                            variant="soft"
                            icon="i-heroicons-x-mark"
                            @click="isChartOpen = false"
                            class="bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md"
                        />
                    </div>

                    <div class="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                        <div
                            v-if="loading"
                            class="flex items-center justify-center py-12"
                        >
                            <div class="text-center">
                                <div
                                    class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"
                                ></div>
                                <p class="text-sm text-gray-600">
                                    Memuat data chart...
                                </p>
                            </div>
                        </div>

                        <div v-else class="bg-white rounded-lg p-4">
                            <BarChart
                                :categories="chartCategories"
                                :series="chartSeries"
                                height="h-[500px]"
                                :showLegend="true"
                                legendPosition="bottom"
                                :stacked="false"
                                :horizontal="true"
                                :grid="{
                                    left: '3%',
                                    right: '4%',
                                    bottom: '15%',
                                    top: '10%',
                                    containLabel: true,
                                }"
                            />
                        </div>
                    </div>

                    <!-- Metadata Footer -->
                    <div
                        v-if="metaData.dataset?.sumber || metaData.dataset?.sumber_data || metaData.dataset?.instansi"
                        class="px-6 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500 shrink-0 z-20"
                    >
                        <div v-if="metaData.dataset?.sumber || metaData.dataset?.sumber_data" class="flex items-center gap-1">
                            <span class="font-bold">Sumber:</span>
                            <span>{{ metaData.dataset.sumber || metaData.dataset.sumber_data }}</span>
                        </div>
                        <div v-if="metaData.dataset?.instansi" class="flex items-center gap-1">
                            <span class="font-bold">Instansi:</span>
                            <span>{{ metaData.dataset.instansi }}</span>
                        </div>
                        <div v-if="metaData.dataset?.terakhir_diupdate" class="flex items-center gap-1">
                            <span class="font-bold">Update Terakhir:</span>
                            <span>{{ formatDate(metaData.dataset.terakhir_diupdate) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Dataset Info Modal -->
        <Teleport to="body">
            <SharedDatasetInfoModal
                :is-open="isInfoOpen"
                :dataset-info="metaData.dataset"
                @close="isInfoOpen = false"
            />
        </Teleport>

        <!-- Map Modal -->
        <Teleport to="body">
            <SpatialGenericModal
                :is-open="isMapOpen"
                :selected-wilayah="selectedWilayah"
                @close="isMapOpen = false"
                @panel-opened="handleAutoFokus('pasca')"
                :initial-dataset-id="132"
                :initial-indikator-id="308"
            />
        </Teleport>

        <!-- Detail Modal -->
        <Teleport to="body">
            <PosTelekomunikasiDetailModal
                :is-open="isDetailOpen"
                :region-ids="regionIds"
                :meta-data="metaData"
                @close="isDetailOpen = false"
            />
        </Teleport>
    </div>
</template>

<script setup>
import StatCard from "~/components/shared/StatCard.vue";
import BarChart from "~/components/charts/BarChart.vue";
import SharedDatasetInfoModal from "~/components/shared/DatasetInfoModal.vue";
import PosTelekomunikasiDetailModal from "~/components/infrastruktur/PosTelekomunikasiDetailModal.vue";
import SpatialGenericModal from "~/components/map/SpatialGenericModal.vue";

const props = defineProps({
    selectedWilayah: {
        type: Object,
        required: true,
        default: () => ({ provinsi: [], kabupaten: [] }),
    },
});

const headers = useRequestHeaders(["cookie"]);

const isMapOpen = ref(false);
const loading = ref(false);
const isChartOpen = ref(false);
const isDetailOpen = ref(false);
const isInfoOpen = ref(false);
const rawData = ref([]);
const metaData = ref({
    dataset: null,
    sektor: null,
    period: null,
});

const statusKerusakan = [
    { key: "Rusak Ringan", color: "#10B981" },
    { key: "Rusak Sedang", color: "#F59E0B" },
    { key: "Rusak Berat", color: "#F97316" },
    { key: "Rusak Hanyut", color: "#EF4444" },
    { key: "Rusak Tidak Ada Informasi", color: "#6B7280" },
];

const damageList = [
    {
        key: "rusakringan",
        label: "Rusak Ringan",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        textBold: "text-emerald-900",
    },
    {
        key: "rusaksedang",
        label: "Rusak Sedang",
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        textBold: "text-amber-900",
    },
    {
        key: "rusakberat",
        label: "Rusak Berat",
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-700",
        textBold: "text-orange-900",
    },
    {
        key: "rusakhanyut",
        label: "Rusak Hanyut",
        bg: "bg-rose-50",
        border: "border-rose-200",
        text: "text-rose-700",
        textBold: "text-rose-900",
    },
    {
        key: "rusaktidakadainformasi",
        label: "Rusak Tidak Ada Informasi",
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-700",
        textBold: "text-gray-900",
    },
];

const formatNumber = (num) => {
    if (num == null || isNaN(num)) return "0";
    return new Intl.NumberFormat("id-ID").format(num);
};

const regionIds = computed(() => {
    const w = props.selectedWilayah;
    if (w.kabupaten?.length > 0) return w.kabupaten;
    if (w.provinsi?.length > 0) return w.provinsi;
    return [];
});

// Fetch data
async function fetchPosTelekomunikasiData() {
    loading.value = true;
    try {
        const w = props.selectedWilayah;
        const endpoint = "/api/agregat-insight";

        let requests = [];

        if (w.kabupaten?.length > 0) {
            requests = w.kabupaten.map((kabId) =>
                $fetch(endpoint, {
                    query: { id_dataset: 132, id_kab: kabId },
                    headers: headers,
                }),
            );
        } else if (w.provinsi?.length > 0) {
            requests = w.provinsi.map((provId) =>
                $fetch(endpoint, {
                    query: { id_dataset: 132, id_prov: provId },
                    headers: headers,
                }),
            );
        } else {
            requests = [
                $fetch(endpoint, {
                    query: { id_dataset: 132 },
                    headers: headers,
                }),
            ];
        }

        const responses = await Promise.all(requests);
        const allRecords = responses.flatMap((r) => r?.data?.records || []);

        rawData.value = allRecords.filter((record) => {
            return record.itemCategory1?.kode === "1465" || record.itemCategory1?.nama === "POS DAN TELEKOMUNIKASI";
        });

        if (responses[0]?.data?.meta) {
            metaData.value = responses[0].data.meta;
        }
    } catch (error) {
        console.error("Error fetching pos & telekomunikasi data:", error);
        rawData.value = [];
    } finally {
        loading.value = false;
    }
}

// Summary card
const summaryCard = computed(() => {
    const total = rawData.value.reduce(
        (sum, r) => sum + (Number(r.value) || 0),
        0,
    );

    const breakdown = damageList.map((damage) => {
        const damageTotal = rawData.value
            .filter((r) => r.itemCategory4?.nama === damage.label)
            .reduce((sum, r) => sum + (Number(r.value) || 0), 0);

        return {
            key: damage.key,
            label: damage.label,
            total: damageTotal,
            bg: damage.bg,
            border: damage.border,
            text: damage.text,
            textBold: damage.textBold,
        };
    });

    return {
        label: "Total Pos & Telekomunikasi Terdampak",
        total: total || null,
        icon: "i-heroicons-signal",
        color: "indigo",
        breakdown: breakdown,
    };
});

// Chart data
const chartCategories = computed(() => {
    return statusKerusakan.map((s) => s.key);
});

const chartSeries = computed(() => {
    const data = statusKerusakan.map((status) => {
        return rawData.value
            .filter((r) => r.itemCategory4?.nama === status.key)
            .reduce((sum, r) => sum + (Number(r.value) || 0), 0);
    });

    return [
        {
            name: "Pos & Telekomunikasi",
            data: data,
            color: "#6366F1",
        },
    ];
});

const formatDate = (isoString) => {
    if (!isoString) return "-";
    try {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(date);
    } catch (e) {
        return isoString;
    }
};

watch(
    () => props.selectedWilayah,
    async () => {
        await fetchPosTelekomunikasiData();
    },
    { deep: true, immediate: true },
);
</script>
