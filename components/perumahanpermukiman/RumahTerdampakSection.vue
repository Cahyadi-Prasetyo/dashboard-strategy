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
                        name="i-heroicons-home"
                        class="w-4 h-4 text-blue-600"
                    />
                    <span
                        class="text-[12px] font-black text-blue-700 uppercase tracking-wider"
                    >
                        Hunian Keluarga Terdampak
                    </span>
                </div>
            </div>

            <div class="flex flex-row gap-2">
                <SharedActionButton
                    icon="i-heroicons-information-circle"
                    tooltip="Informasi Dataset"
                    :loading="loading"
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
                    :disabled="
                        !chartDamageData ||
                        Object.keys(chartDamageData).length === 0
                    "
                    @click="isChartOpen = true"
                />

                <SharedActionButton
                    icon="i-heroicons-table-cells"
                    tooltip="Lihat Tabel"
                    @click="isDetailOpen = true"
                />
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <template v-if="loading">
                <StatCard
                    v-for="n in 2"
                    :key="n"
                    label="Memuat Data..."
                    :loading="true"
                    sizeIcon="md"
                />
            </template>

            <template v-else>
                <StatCard
                    label="Jumlah Penerima Bantuan Stimulan Rumah Terdampak"
                    color="orange"
                    labelSize="sm"
                    icon="i-heroicons-home"
                    :isRound="true"
                >
                    <template #default>
                        <div
                            class="flex flex-col gap-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200 mt-2"
                        >
                            <div class="flex items-baseline gap-2">
                                <span
                                    class="text-4xl font-extrabold tracking-tight text-amber-700"
                                >
                                    {{
                                        records136.total == null
                                            ? "N/A"
                                            : formatNumber(records136.total)
                                    }}
                                </span>
                                <span
                                    class="text-[11px] text-slate-500 font-bold uppercase"
                                    >Records</span
                                >
                            </div>

                            <div
                                class="grid grid-cols-1 gap-2 text-[11px] uppercase font-semibold"
                            >
                                <div
                                    v-for="item in records136.breakdown"
                                    :key="item.key"
                                    class="flex items-center justify-between p-2 rounded-md border"
                                    :class="[item.bg, item.border]"
                                >
                                    <span
                                        class="font-semibold text-[10px] uppercase"
                                        :class="item.text"
                                    >
                                        {{ item.name }}
                                    </span>
                                    <span
                                        class="font-black text-[11px]"
                                        :class="item.textBold"
                                    >
                                        {{ formatNumber(item.total) }}
                                    </span>
                                </div>
                            </div>
                            <SharedDatasetInfoCard
                                :source="datasetInfo136?.sumber"
                                :last-update="datasetInfo136?.terakhir_diupdate"
                            />
                        </div>
                    </template>
                </StatCard>

                <StatCard
                    label="Jumlah Hunian Rusak Hasil Pemadanan DTSEN"
                    color="red"
                    labelSize="sm"
                    icon="i-heroicons-home"
                    :isRound="true"
                >
                    <template #default>
                        <div
                            class="flex flex-col gap-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200 mt-2"
                        >
                            <div class="flex items-baseline gap-2">
                                <span
                                    class="text-4xl font-extrabold tracking-tight text-rose-700"
                                >
                                    {{
                                        records137.total == null
                                            ? "N/A"
                                            : formatNumber(records137.total)
                                    }}
                                </span>
                                <span
                                    class="text-[11px] text-slate-500 font-bold uppercase"
                                    >Keluarga</span
                                >
                            </div>

                            <div
                                class="grid grid-cols-1 gap-2 text-[11px] uppercase font-semibold"
                            >
                                <div
                                    v-for="item in records137.breakdown"
                                    :key="item.key"
                                    class="flex items-center justify-between p-2 rounded-md border"
                                    :class="[item.bg, item.border]"
                                >
                                    <span
                                        class="font-semibold text-[10px] uppercase"
                                        :class="item.text"
                                    >
                                        {{ item.name }}
                                    </span>
                                    <span
                                        class="font-black text-[11px]"
                                        :class="item.textBold"
                                    >
                                        {{ formatNumber(item.total) }}
                                    </span>
                                </div>
                            </div>
                            <SharedDatasetInfoCard
                                :source="datasetInfo137?.sumber"
                                :last-update="datasetInfo137?.terakhir_diupdate"
                            />
                        </div>
                    </template>
                </StatCard>
            </template>
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
                @close="isMapOpen = false"
                @panel-opened="handleAutoFokus('pasca')"
                :initial-dataset-id="137"
                :initial-indikator-id="309"
            />
            <RumahTerdampakChartModal
                :is-open="isChartOpen"
                :data="chartDamageData"
                :dataset-info="datasetInfo"
                :loading="loading"
                @close="isChartOpen = false"
            />
            <ImproveDetailModal
                :is-open="isDetailOpen"
                title="Hunian Keluarga Terdampak"
                :region-ids="selectedWilayah || []"
                :dataset-id="[136, 137]"
                :config="modalConfig"
                @close="isDetailOpen = false"
            />
        </Teleport>
    </div>
</template>

<script setup>
import StatCard from "~/components/shared/StatCard.vue";
import ImproveDetailModal from "~/components/shared/ImproveDetailModal.vue";
import RumahTerdampakChartModal from "./RumahTerdampakChartModal.vue";
import SharedDatasetInfoModal from "~/components/shared/DatasetInfoModal.vue";
import SpatialGenericModal from "~/components/map/SpatialGenericModal.vue";

const damageList = [
    {
        key: "rusakringan",
        label: "Rusak Ringan",
        name: "Rusak Ringan",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        textBold: "text-emerald-900",
    },
    {
        key: "rusaksedang",
        label: "Rusak Sedang",
        name: "Rusak Sedang",
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        textBold: "text-amber-900",
    },
    {
        key: "rusakberat",
        label: "Rusak Berat",
        name: "Rusak Berat",
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-700",
        textBold: "text-orange-900",
    },
    {
        key: "rusakhanyut",
        label: "Rusak Hanyut",
        name: "Hanyut",
        bg: "bg-rose-50",
        border: "border-rose-200",
        text: "text-rose-700",
        textBold: "text-rose-900",
    },
    {
        key: "rusaklainnya",
        label: "Rusak Lainnya",
        name: "Lainnya",
        bg: "bg-slate-50",
        border: "border-slate-200",
        text: "text-slate-700",
        textBold: "text-slate-900",
    },
    {
        key: "rusaktidakadainformasi",
        label: "Rusak Tidak Ada Informasi",
        name: "Tidak Ada Informasi",
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-700",
        textBold: "text-gray-900",
    },
];

const modalConfig = [
    {
        type: "flat",
        tabs: ["Jumlah Penerima Bantuan Stimulan Rumah Terdampak"],
        pivotVar: "itemCategory1",
        columns: damageList.map((d) => d.name),
        columnMapping: Object.fromEntries(
            damageList.map((d) => [d.name, d.label]),
        ),
    },
    {
        type: "flat",
        tabs: ["Jumlah Hunian Rusak Hasil Pemadanan DTSEN"],
        pivotVar: "itemCategory1",
        columns: damageList.map((d) => d.name),
        columnMapping: Object.fromEntries(
            damageList.map((d) => [d.name, d.label]),
        ),
    },
];

// --- Props ---
const props = defineProps({
    selectedWilayah: { type: Array, required: true },
});

const headers = useRequestHeaders(["cookie"]);

// --- State ---
const loading = ref(false);
const datasetInfo = ref(null);
const isDetailOpen = ref(false);
const isInfoOpen = ref(false);
const isChartOpen = ref(false);
const isMapOpen = ref(false); // ← state baru untuk map modal

const records136 = reactive({ total: 0, breakdown: [] });
const records137 = reactive({ total: 0, breakdown: [] });
const datasetInfo136 = ref(null); // Dataset info untuk card 1
const datasetInfo137 = ref(null); // Dataset info untuk card 2

const formatNumber = (num) => {
    if (num == null || isNaN(num)) return "0";
    return new Intl.NumberFormat("id-ID").format(num);
};

// --- Fetch ---
async function fetchDataset(idDataset, idIndikator) {
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

    try {
        const endpoint = "/api/agregat-insight";
        let requests = [];

        if (idWilayah.length > 0) {
            requests = idWilayah.map((wilayahId) =>
                $fetch(endpoint, {
                    headers,
                    query: {
                        id_dataset: idDataset,
                        ...(idIndikator
                            ? { id_indikator_insight: idIndikator }
                            : {}),
                        [level]: wilayahId,
                    },
                }),
            );
        } else {
            requests = [
                $fetch(endpoint, {
                    headers,
                    query: {
                        id_dataset: idDataset,
                        ...(idIndikator
                            ? { id_indikator_insight: idIndikator }
                            : {}),
                    },
                }),
            ];
        }

        const responses = await Promise.all(requests);
        const allRecords = responses.flatMap((r) => r?.data?.records || []);

        const datasetMeta = responses[0]?.data?.meta?.dataset || null;
        if (responses[0]?.data?.meta) {
            datasetInfo.value = responses[0].data.meta.dataset;
        }

        return { records: allRecords, datasetInfo: datasetMeta };
    } catch (e) {
        console.error(e);
        return [];
    }
}

function processRecords(records) {
    let grandTotal = 0;
    const breakdown = [];

    damageList.forEach((kat) => {
        const sum = records
            .filter((r) => r.itemCategory1?.nama === kat.label)
            .reduce((acc, r) => acc + (Number(r.value) || 0), 0);

        breakdown.push({
            key: kat.key,
            label: kat.label,
            name: kat.name,
            total: sum,
            bg: kat.bg,
            border: kat.border,
            text: kat.text,
            textBold: kat.textBold,
        });

        grandTotal += sum;
    });

    return { total: grandTotal, breakdown };
}

// --- Load ---
async function loadAllData() {
    loading.value = true;
    try {
        const [result136, result137] = await Promise.all([
            fetchDataset(136),
            fetchDataset(137),
        ]);

        datasetInfo136.value = result136.datasetInfo;
        datasetInfo137.value = result137.datasetInfo;

        // Process records
        const processed136 = processRecords(result136.records);
        records136.total = processed136.total;
        records136.breakdown = processed136.breakdown;

        const processed137 = processRecords(result137.records);
        records137.total = processed137.total;
        records137.breakdown = processed137.breakdown;
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
}

const chartDamageData = computed(() => {
    const usulanData = {};
    records136.breakdown.forEach((item) => {
        usulanData[item.label] = item.total;
    });

    const dtsenData = {};
    records137.breakdown.forEach((item) => {
        dtsenData[item.label] = item.total;
    });

    return {
        "Jumlah Penerima Bantuan Stimulan Rumah Terdampak": usulanData,
        "Jumlah Hunian Rusak Hasil Pemadanan DTSEN": dtsenData,
    };
});

watch(
    () => props.selectedWilayah,
    () => loadAllData(),
    { deep: true, immediate: true },
);
</script>
