<template>
    <div
        class="relative bg-white border border-gray-200 rounded-xl shadow-sm p-4 pt-4 mt-6"
    >
        <div
            class="absolute -top-4 left-0 right-0 px-4 flex flex-wrap items-center justify-between gap-2 z-20"
        >
            <div class="flex flex-wrap items-center gap-2">
                <div
                    class="flex items-center gap-2 px-4 py-1.5 bg-cyan-50 rounded-lg border border-cyan-100 shadow-sm whitespace-nowrap"
                >
                    <UIcon
                        name="i-heroicons-building-storefront"
                        class="w-4 h-4 text-cyan-600"
                    />
                    <span
                        class="text-[12px] font-black text-cyan-700 uppercase tracking-wider"
                    >
                        Koperasi dan UMKM Terdampak
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
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatCard label="Memuat..." :loading="true" />
                    <StatCard label="Memuat..." :loading="true" />
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
                                    {{ formatNumber(item.total) }}
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
                    Data Koperasi & UMKM tidak tersedia
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

        <MapSpatialGenericModal
            :is-open="isMapOpen"
            :selected-wilayah="selectedWilayah"
            title="Peta Sebaran Koperasi & UMKM"
            :initial-dataset-id="130"
            :initial-indikator-id="308"
            @close="isMapOpen = false"
        />

        <KoperasiUmkmChartModal
            :is-open="isChartOpen"
            :raw-data="rawData"
            :dataset-info="datasetInfo"
            :loading="loading"
            @close="isChartOpen = false"
        />

        <SharedImproveDetailModal
            :is-open="isDetailOpen"
            title="Detail Koperasi & UMKM Terdampak"
            :dataset-id="130"
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
import KoperasiUmkmChartModal from "~/components/ekonomi/KoperasiUmkmChartModal.vue";

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

const DAMAGE_LABEL_MAP = {
    "Rusak Hanyut": "Hanyut",
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
    "Tidak Ada Informasi": { color: "slate" },
};

const damageOrder = Object.keys(damageConfig);

const cardConfig = [
    { key: "Koperasi", icon: "i-heroicons-building-office-2", color: "indigo" },
    { key: "UMKM", icon: "i-heroicons-shopping-bag", color: "purple" },
];

// Flat table for distinct categories
const modalConfig = {
    type: "flat",
    pivotVar: "itemCategory4",
    tabs: ["Koperasi", "UMKM"],
    columns: damageOrder,
};
// --- 1. Ganti function fetchData dengan yang ini ---
async function fetchData() {
    loading.value = true;
    try {
        const w = props.selectedWilayah;
        const endpoint = "/api/agregat-insight";
        const headers = useRequestHeaders(["cookie"]);
        const datasetId = 130;

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

        // --- FILTERING LOGIC (STRICT) ---
        rawData.value = responses
            .flatMap((r) => r?.data?.records || [])
            .filter((r) => {
                // 1. Cek ItemCategory1: Harus "Koperasi dan UMKM"
                const cat1Name = (
                    r.itemCategory1?.nama ||
                    r.itemCategory1 ||
                    ""
                )
                    .toLowerCase()
                    .trim();
                const isCat1Valid = cat1Name === "koperasi dan umkm";

                // Jika nama tidak pas, cek apakah mengandung kedua kata kunci (fallback aman)
                const isCat1Flexible =
                    cat1Name.includes("koperasi") && cat1Name.includes("umkm");

                if (!isCat1Valid && !isCat1Flexible) return false;

                // 2. Cek ItemCategory2: HARUS PERSIS "Koperasi"
                const cat2Name = (
                    r.itemCategory2?.nama ||
                    r.itemCategory2 ||
                    ""
                )
                    .toLowerCase()
                    .trim();

                const isKoperasi = cat2Name === "koperasi";
                const isUmkm = cat2Name === "umkm";

                return isKoperasi || isUmkm;
            });

        if (responses[0]?.data?.meta) {
            datasetInfo.value = responses[0].data.meta.dataset;
        }
    } catch (e) {
        console.error("Error fetching Koperasi/UMKM:", e);
        rawData.value = [];
    } finally {
        loading.value = false;
    }
}

// --- 2. Ganti computed processedCards dengan yang ini ---
const processedCards = computed(() => {
    // Setup Result Structure
    const result = {
        Koperasi: { total: 0, details: {} },
        UMKM: { total: 0, details: {} },
    };

    const records = rawData.value;

    for (const r of records) {
        // Bersihkan string
        const cat2Name = (r.itemCategory2?.nama || r.itemCategory2 || "")
            .toLowerCase()
            .trim();

        let targetKey = null;

        if (cat2Name === "koperasi") {
            targetKey = "Koperasi";
        } else if (cat2Name === "umkm") {
            targetKey = "UMKM";
        }

        if (!targetKey) continue;

        // Get Damage Status from itemCategory4 (sesuai request)
        const cat4Raw =
            r.itemCategory4?.nama ||
            r.itemCategory4 ||
            "Rusak Tidak Ada Informasi";

        const cat4 = mapDamageLabel(cat4Raw); // ← Mapping label di sini
        const val = Number(r.value) || 0;

        // Accumulate
        result[targetKey].total += val;
        result[targetKey].details[cat4] =
            (result[targetKey].details[cat4] || 0) + val;
    }

    // Format for Template
    return Object.keys(result)
        .map((key) => {
            const group = result[key];
            const conf = cardConfig.find((c) => c.key === key);

            const details = Object.entries(group.details)
                .map(([label, value]) => ({
                    label,
                    value,
                    color: damageConfig[label]?.color || "gray",
                }))
                .sort((a, b) => {
                    const indexA = damageOrder.indexOf(a.label);
                    const indexB = damageOrder.indexOf(b.label);
                    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                    return b.value - a.value;
                });

            return {
                label: key,
                icon: conf?.icon || "i-heroicons-cube",
                color: conf?.color || "gray",
                total: group.total,
                unit: "Unit",
                details: details,
            };
        })
        .filter((c) => true); // Tampilkan kartu meskipun kosong (0 unit) agar layout tetap ada
});

const formatNumber = (n) => new Intl.NumberFormat("id-ID").format(n || 0);

watch(() => props.selectedWilayah, fetchData, { deep: true, immediate: true });
</script>
