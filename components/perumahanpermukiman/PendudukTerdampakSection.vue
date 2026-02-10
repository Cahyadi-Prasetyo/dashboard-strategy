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
                        name="i-heroicons-user-group"
                        class="w-4 h-4 text-blue-600"
                    />
                    <span
                        class="text-[12px] font-black text-blue-700 uppercase tracking-wider"
                    >
                        Penduduk Terdampak
                    </span>
                </div>
            </div>

            <div class="flex flex-row gap-2">
                <SharedActionButton
                    icon="i-heroicons-information-circle"
                    tooltip="Informasi Dataset"
                    @click="isInfoOpen = true"
                    :disabled="loading"
                />

                <SharedActionButton
                    icon="i-heroicons-map"
                    tooltip="Lihat Peta"
                    @click="isMapOpen = true"
                    :disabled="true"
                />

                <SharedActionButton
                    icon="i-heroicons-chart-bar"
                    tooltip="Lihat Grafik"
                    @click="isChartOpen = true"
                    :disabled="loading"
                />

                <SharedActionButton
                    icon="i-heroicons-table-cells"
                    tooltip="Lihat Tabel"
                    @click="isDetailOpen = true"
                    :disabled="loading"
                />
            </div>
        </div>

        <div
            class="grid grid-cols-1 md:grid-cols-3 items-start w-full gap-4 mt-3"
        >
            <template v-if="loading">
                <StatCard
                    v-for="n in 1"
                    :key="n"
                    label="Memuat Data..."
                    :loading="true"
                    sizeIcon="md"
                />
            </template>

            <template v-else>
                <StatCard
                    class="col-span-1 md:col-span-2"
                    label="Jumlah Penduduk Terdampak"
                    color="orange"
                    labelSize="sm"
                    icon="i-heroicons-user-group"
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
                                        records138.total == null
                                            ? "N/A"
                                            : formatNumber(records138.total)
                                    }}
                                </span>
                                <span
                                    class="text-[11px] text-slate-500 font-bold uppercase"
                                    >Orang</span
                                >
                            </div>

                            <div
                                class="grid grid-cols-2 gap-2 text-[11px] uppercase font-semibold"
                            >
                                <div
                                    v-for="item in records138.breakdown"
                                    :key="item.key"
                                    class="flex items-center justify-between p-2 rounded-md"
                                    :class="[item.bg, item.border]"
                                >
                                    <span
                                        class="font-semibold text-[10px] uppercase"
                                        :class="item.text"
                                    >
                                        {{ item.label }}
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
                                :source="datasetInfo?.sumber"
                                :last-update="datasetInfo?.terakhir_diupdate"
                            />
                        </div>
                    </template>
                </StatCard>
                <StatCard
                    label="Jumlah Penduduk Terdampak di Tiga Provinsi"
                    color="blue"
                    labelSize="sm"
                    icon="i-heroicons-map"
                    :isRound="true"
                >
                    <template #default>
                        <div class="flex flex-col gap-2 mt-2">
                            <div
                                v-for="(prov, i) in top3Provinsi"
                                :key="prov.id || i"
                                class="flex items-center justify-between p-3 rounded-lg border bg-slate-50"
                            >
                                <div class="flex items-center gap-2">
                                    <span
                                        class="w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-black text-white"
                                        :class="
                                            i === 0
                                                ? 'bg-amber-500'
                                                : i === 1
                                                  ? 'bg-slate-400'
                                                  : 'bg-orange-400'
                                        "
                                    >
                                        {{ i + 1 }}
                                    </span>
                                    <span
                                        class="text-[12px] font-bold text-slate-700"
                                    >
                                        {{ prov.label }}
                                    </span>
                                </div>

                                <span
                                    class="text-[12px] font-black text-slate-800"
                                >
                                    {{ formatNumber(prov.total) }}
                                </span>
                            </div>
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
            <!-- <SpatialGenericModal
                :is-open="isMapOpen"
                :selected-wilayah="selectedWilayah"
                @close="isMapOpen = false"
                @panel-opened="handleAutoFokus('pasca')"
                :initial-dataset-id="137"
                :initial-indikator-id="309"
            /> -->
            <ImproveDetailModal
                :is-open="isDetailOpen"
                title="Jumlah Penduduk Terdampak"
                :dataset-id="138"
                :region-ids="selectedWilayah || []"
                :config="modalConfig"
                @close="isDetailOpen = false"
            />
            <PendudukTerdampakChartModal
                :is-open="isChartOpen"
                :dataset-info="datasetInfo"
                :selected-wilayah="selectedWilayah || []"
                @close="isChartOpen = false"
            />
        </Teleport>
    </div>
</template>

<script setup>
import StatCard from "~/components/shared/StatCard.vue";
import ImproveDetailModal from "~/components/shared/ImproveDetailModal.vue";
import PendudukTerdampakChartModal from "./PendudukTerdampakChartModal.vue";
import SharedDatasetInfoModal from "~/components/shared/DatasetInfoModal.vue";
import SpatialGenericModal from "~/components/map/SpatialGenericModal.vue";

const modalConfig = {
    type: "flat",
    tabs: ["Jumlah Penduduk Terdampak"],
    columns: [],
};

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

const records138 = reactive({ total: 0, breakdown: [] });

const formatNumber = (num) => {
    if (num == null || isNaN(num)) return "0";
    return new Intl.NumberFormat("id-ID").format(num);
};

// --- Fetch ---
async function fetchDataset(idDataset, idIndikator, region = null) {
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

        if (responses[0]?.data?.meta) {
            datasetInfo.value = responses[0].data.meta.dataset;
        }

        return allRecords;
    } catch (e) {
        console.error(e);
        return [];
    }
}

const top3Provinsi = ref([]);
async function loadAllData() {
    loading.value = true;
    try {
        const res138 = await fetchDataset(138);

        const sum = res138.reduce((acc, r) => acc + (Number(r.value) || 0), 0);
        records138.total = sum;

        const provMap = {};

        res138.forEach((r) => {
            const namaProv = r?.kd_prov?.nama;
            if (!namaProv) return;

            if (!provMap[namaProv]) {
                provMap[namaProv] = 0;
            }

            provMap[namaProv] += Number(r.value) || 0;
        });

        top3Provinsi.value = Object.entries(provMap).map(([label, total]) => ({
            label,
            total,
        }));
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
}

// --- Watch ---
watch(
    () => props.selectedWilayah,
    () => loadAllData(),
    { deep: true, immediate: true },
);
</script>
