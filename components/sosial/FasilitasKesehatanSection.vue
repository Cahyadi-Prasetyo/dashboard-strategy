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
                        name="i-heroicons-heart"
                        class="w-4 h-4 text-emerald-400"
                    />
                    <span
                        class="text-[12px] font-black text-emerald-700 uppercase tracking-wider"
                    >
                        Alat Kesehatan Terdampak
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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div class="flex flex-col gap-3">
                <!-- Data Fasilitas Kesehatan -->
                <StatCard
                    v-if="loading"
                    label="Memuat Data..."
                    :loading="true"
                />

                <!-- Data Alat Kesehatan -->
                <StatCard
                    v-if="loadingAlkes"
                    label="Memuat Data Alkes..."
                    :loading="true"
                />

                <StatCard
                    v-else
                    label="Total Alat Kesehatan Terdampak"
                    color="cyan"
                    label-size="sm"
                    icon="i-heroicons-wrench-screwdriver"
                    :isRound="true"
                >
                    <template #default>
                        <div
                            class="flex flex-col gap-2 bg-slate-50/50 p-3 rounded-lg border border-slate-100"
                        >
                            <div class="flex items-baseline gap-2 mb-1">
                                <span class="text-3xl font-black text-cyan-600">
                                    {{ formatNumber(totalAlkat) }}
                                </span>
                                <span
                                    class="text-[11px] text-cyan-500 font-bold uppercase"
                                    >Unit</span
                                >
                            </div>

                            <div
                                class="grid grid-cols-2 gap-2 text-[10px] uppercase"
                            >
                                <div
                                    class="bg-rose-50 p-1.5 rounded border border-rose-100"
                                >
                                    <span
                                        class="block text-rose-500 font-semibold mb-0.5"
                                        >Rusak Berat</span
                                    >
                                    <span
                                        class="font-bold text-rose-700 text-sm"
                                        >{{
                                            formatNumber(
                                                alkatStats["Rusak Berat"] || 0,
                                            )
                                        }}</span
                                    >
                                </div>
                                <div
                                    class="bg-amber-50 p-1.5 rounded border border-amber-100"
                                >
                                    <span
                                        class="block text-amber-500 font-semibold mb-0.5"
                                        >Rusak Ringan</span
                                    >
                                    <span
                                        class="font-bold text-amber-700 text-sm"
                                        >{{
                                            formatNumber(
                                                alkatStats["Rusak Ringan"] || 0,
                                            )
                                        }}</span
                                    >
                                </div>
                                <div
                                    class="bg-emerald-50 p-1.5 rounded border border-emerald-100"
                                >
                                    <span
                                        class="block text-emerald-500 font-semibold mb-0.5"
                                        >Bisa Dipakai</span
                                    >
                                    <span
                                        class="font-bold text-emerald-700 text-sm"
                                        >{{
                                            formatNumber(
                                                alkatStats["Bisa Dipakai"] || 0,
                                            )
                                        }}</span
                                    >
                                </div>
                            </div>
                            <SharedDatasetInfoCard
                                :source="datasetInfo?.sumber"
                                :last-update="datasetInfo?.terakhir_diupdate"
                            />
                        </div>
                    </template>
                </StatCard>
            </div>

            <div class="col-span-2 flex flex-col gap-3">
                <!-- ✅ Wrapper Card with Title -->
                <div
                    class="bg-gradient-to-br from-rose-50/50 via-white to-white border border-rose-200/50 rounded-xl shadow-sm overflow-hidden"
                >
                    <!-- Title Header -->
                    <div
                        class="px-4 py-3 border-b border-rose-200/50 bg-gradient-to-r from-rose-50 to-orange-50/30"
                    >
                        <div class="flex items-center gap-2.5">
                            <div
                                class="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 shadow-md shadow-rose-500/30"
                            >
                                <UIcon
                                    name="i-heroicons-exclamation-triangle"
                                    class="w-4 h-4 text-white"
                                />
                            </div>
                            <div>
                                <h4 class="text-sm font-bold text-gray-900">
                                    Jenis Alat Kesehatan dengan Status Rusak
                                    Berat Paling Banyak
                                </h4>
                                <p
                                    class="text-[10px] text-gray-500 font-medium mt-0.5"
                                >
                                    4 jenis alat kesehatan dengan kerusakan
                                    paling parah
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Cards Container -->
                    <div class="p-4">
                        <div
                            v-if="!loadingAlkes && top4RusakBerat.length > 0"
                            class="flex gap-3 overflow-x-auto pb-2"
                        >
                            <div
                                v-for="item in top4RusakBerat"
                                :key="item.name"
                                class="flex-1 min-w-[140px] bg-white border-2 border-rose-100 hover:border-rose-300 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center text-center justify-center gap-2.5"
                            >
                                <!-- Icon -->
                                <div
                                    class="w-10 h-10 rounded-full bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center ring-4 ring-rose-50"
                                >
                                    <UIcon
                                        name="i-heroicons-exclamation-triangle"
                                        class="w-5 h-5 text-rose-600"
                                    />
                                </div>

                                <!-- Name -->
                                <h5
                                    class="text-xs font-bold text-gray-700 line-clamp-2 leading-tight h-8 flex items-center"
                                >
                                    {{ item.name }}
                                </h5>

                                <!-- Value -->
                                <div class="flex flex-col items-center gap-1">
                                    <div
                                        class="text-2xl font-black text-rose-600"
                                    >
                                        {{ formatNumber(item.value) }}
                                    </div>
                                    <span
                                        class="text-[10px] text-rose-500 font-bold uppercase tracking-wide"
                                    >
                                        Unit
                                    </span>
                                </div>

                                <!-- Badge -->
                                <span
                                    class="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide"
                                >
                                    Rusak Berat
                                </span>
                            </div>
                        </div>

                        <!-- Empty State -->
                        <div
                            v-else-if="
                                !loadingAlkes && top4RusakBerat.length === 0
                            "
                            class="flex flex-col items-center justify-center py-8 text-center"
                        >
                            <div
                                class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3"
                            >
                                <UIcon
                                    name="i-heroicons-inbox"
                                    class="w-8 h-8 text-gray-400"
                                />
                            </div>
                            <p class="text-sm font-medium text-gray-600">
                                Tidak ada data alat kesehatan rusak berat
                            </p>
                            <p class="text-xs text-gray-400 mt-1">
                                Data akan muncul saat tersedia
                            </p>
                        </div>

                        <!-- Loading State -->
                        <div
                            v-else-if="loadingAlkes"
                            class="flex items-center justify-center py-8"
                        >
                            <div class="flex flex-col items-center gap-3">
                                <div
                                    class="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin"
                                ></div>
                                <p class="text-sm font-medium text-gray-600">
                                    Memuat data...
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Teleport to="body">
        <SharedDatasetInfoModal
            :is-open="isInfoOpen"
            :dataset-info="datasetInfo"
            @close="isInfoOpen = false"
        />

        <MapSpatialGenericModal
            :is-open="isMapOpen"
            :selected-wilayah="selectedWilayah"
            title="Peta Sebaran Fasilitas Kesehatan"
            :initial-dataset-id="111"
            :initial-indikator-id="210"
            @close="isMapOpen = false"
        />

        <FasilitasKesehatanChartModal
            :is-open="isChartOpen"
            :chart-data="chartData"
            :alkes-data="rawAlkes"
            :selected-period="selectedPeriod"
            :dataset-info="datasetInfo"
            :loading="loading || loadingAlkes"
            @close="isChartOpen = false"
        />

        <AlatKesehatanTable
            :is-open="isDetailOpen"
            title="Fasilitas Kesehatan Terdampak"
            @close="isDetailOpen = false"
        />
    </Teleport>
</template>

<script setup>
import StatCard from "~/components/shared/StatCard.vue";
import FasilitasKesehatanChartModal from "~/components/sosial/FasilitasKesehatanChartModal.vue";
import AlatKesehatanTable from "./AlatKesehatanTable.vue";

const props = defineProps({
    selectedWilayah: { type: Object, required: true },
    chartData: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    availablePeriods: { type: Array, default: () => [] },
});

const isInfoOpen = ref(false);
const isDetailOpen = ref(false);
const isChartOpen = ref(false);
const isMapOpen = ref(false);
const datasetInfo = ref(null);

const selectedPeriod = ref("");

watch(
    () => props.availablePeriods,
    (newPeriods) => {
        if (newPeriods?.length > 0 && !selectedPeriod.value) {
            selectedPeriod.value = newPeriods[0];
        }
    },
    { immediate: true },
);

const formatDate = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
};

const loadingAlkes = ref(false);
const rawAlkes = ref([]);

async function fetchAlatKesehatan() {
    loadingAlkes.value = true;
    try {
        const w = props.selectedWilayah;
        const endpoint = "/api/agregat-insight";
        const headers = useRequestHeaders(["cookie"]);

        let requests = [];
        const baseQuery = { id_dataset: 110 };

        if (w.kabupaten?.length > 0) {
            requests = w.kabupaten.map((kabId) =>
                $fetch(endpoint, {
                    query: { ...baseQuery, id_kab: kabId },
                    headers: headers,
                }),
            );
        } else if (w.provinsi?.length > 0) {
            requests = w.provinsi.map((provId) =>
                $fetch(endpoint, {
                    query: { ...baseQuery, id_prov: provId },
                    headers: headers,
                }),
            );
        } else {
            requests = [$fetch(endpoint, { query: baseQuery, headers })];
        }

        const responses = await Promise.all(requests);
        rawAlkes.value = responses.flatMap((r) => r?.data?.records || []);

        if (responses[0]?.data?.meta) {
            datasetInfo.value = responses[0].data.meta.dataset;
        }
    } catch (e) {
        console.error("Error Fetching Alkes", e);
        rawAlkes.value = [];
    } finally {
        loadingAlkes.value = false;
    }
}

watch(
    () => props.selectedWilayah,
    () => {
        fetchAlatKesehatan();
    },
    { deep: true, immediate: true },
);

const totalAlkat = computed(() => {
    return rawAlkes.value.reduce(
        (acc, curr) => acc + (Number(curr.value) || 0),
        0,
    );
});

const alkatStats = computed(() => {
    const stats = {};
    rawAlkes.value.forEach((r) => {
        // Assume Status is ItemCategory5 or Category4 based on previous file exploration
        // Based on AlatKesehatanTerdampakSection: itemCategory4 is Kerusakan, itemCategory5 is Status
        // User requested: Rusak Berat, Rusak Ringan, Bisa Dipakai.
        // Usually "Rusak Berat/Ringan" are in Kerusakan (Cat4), "Bisa Dipakai" in Status (Cat5).
        // Let's check keys.
        const cat4 = r.itemCategory4?.nama; // Kerusakan
        const cat5 = r.itemCategory5?.nama; // Status

        if (cat4) {
            stats[cat4] = (stats[cat4] || 0) + (Number(r.value) || 0);
        }

        // Also check status if needed separately, but usually they are orthogonal or related.
        // If "Bisa Dipakai" is a STATUS, we should sum it up too.
        if (cat5 === "Bisa Dipakai") {
            stats["Bisa Dipakai"] =
                (stats["Bisa Dipakai"] || 0) + (Number(r.value) || 0);
        }
    });
    return stats;
});

const top4RusakBerat = computed(() => {
    const grouped = new Map(); // Name -> Value
    rawAlkes.value.forEach((r) => {
        const kerusakan = r.itemCategory4?.nama;
        if (kerusakan === "Rusak Berat") {
            const name = r.itemCategory2?.nama || "Alat Lainnya";
            const val = Number(r.value) || 0;
            grouped.set(name, (grouped.get(name) || 0) + val);
        }
    });

    return Array.from(grouped.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 4);
});

const modalConfig = [
    {
        type: "flat",
        pivotVar: "itemCategory4",
        tabs: ["Kondisi Kerusakan"],
        columns: ["Rusak Berat", "Rusak Ringan", "Rusak Sedang"],
    },
    {
        type: "flat",
        pivotVar: "itemCategory5",
        tabs: ["Status Alat"],
        columns: ["Bisa Dipakai"],
    },
];
</script>
