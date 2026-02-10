<template>
    <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative">
        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg text-blue-500 bg-blue-50">
                    <UIcon name="i-heroicons-square-3-stack-3d" class="w-5 h-5" />
                </div>
                <div>
                    <h4 class="font-bold text-gray-800 text-sm">
                        Jumlah Keluarga Terdampak Menurut Daerah dan Kondisi
                        Lantai Terluas Rumah yang Ditempati Setelah Bencana
                    </h4>
                    <div class="flex flex-wrap items-center gap-2 text-sm">
                        <UBadge color="primary" variant="subtle" size="xs">
                            Hasil Pendataan
                        </UBadge>

                        <UBadge color="primary" variant="subtle" size="xs">
                            Badan Pusat Statistik
                        </UBadge>

                        <span class="text-xs text-gray-500 flex items-center gap-1 ml-1">
                            <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5" />
                            Diperbarui: {{ informationDate.pendataan_pkl_last_update }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Filter Jenis Lantai -->
            <div class="w-48">
                <USelectMenu class="w-full" v-model="selectedJenisLantai" :items="jenisLantaiOptions"
                    placeholder="Pilih Jenis Lantai" value-attribute="value" option-attribute="label">
                    <template #label>
                        <span class="flex items-center gap-2">
                            <UIcon :name="selectedJenisLantai.icon" class="w-4 h-4" />
                            {{ selectedJenisLantai.label }}
                        </span>
                    </template>
                    <template #option="{ option }">
                        <span class="flex items-center gap-2">
                            <UIcon :name="option.icon" class="w-4 h-4" />
                            {{ option.label }}
                        </span>
                    </template>
                </USelectMenu>
            </div>
        </div>

        <div v-if="pendingPerWilayah" class="h-96 flex flex-col items-center justify-center gap-4">
            <div class="flex items-end gap-2 h-full w-full px-8 pb-8">
                <USkeleton class="w-full h-[40%]" />
                <USkeleton class="w-full h-[70%]" />
                <USkeleton class="w-full h-[50%]" />
                <USkeleton class="w-full h-[80%]" />
                <USkeleton class="w-full h-[60%]" />
            </div>
        </div>

        <div v-else-if="chartSeries.length > 0">
            <BarChart :categories="wilayahLabels" :series="chartSeries" height="h-96" stacked :show-legend="true"
                legend-position="top" />
        </div>

        <div v-else class="h-96 flex items-center justify-center">
            <p class="text-gray-400">Tidak ada data</p>
        </div>

        <!-- Info Box -->
        <div class="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <div class="flex items-start gap-2">
                <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div class="text-xs text-blue-800">
                    <p class="font-semibold mb-1">Tentang Data:</p>
                    <p>
                        Menampilkan jumlah keluarga yang bangunan utama lantai terluasnya adalah
                        <strong>{{ selectedJenisLantai.label }}</strong>
                        berdasarkan kondisi lantai tersebut (Baik, Lepas Sebagian Kecil,
                        Lepas Sebagian Besar, Lepas Seluruhnya).
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import BarChart from "~/components/charts/BarChart.vue";
import informationDate from "~/data/information-date.json";

const props = defineProps({
    regionIds: { type: Array, required: true, default: () => [] },
    tahun: { type: Number, default: 2026 },
});

// --- JENIS LANTAI OPTIONS ---
const jenisLantaiOptions = [
    {
        value: "marmer",
        label: "Marmer/Granit",
        icon: "i-heroicons-sparkles",
        prefix: "lantai_marmer_granit",
    },
    {
        value: "keramik",
        label: "Keramik",
        icon: "i-heroicons-square-2-stack",
        prefix: "lantai_keramik",
    },
    {
        value: "parket",
        label: "Parket/Vinil/Karpet",
        icon: "i-heroicons-rectangle-stack",
        prefix: "lantai_parket_vinil",
    },
    {
        value: "ubin",
        label: "Ubin/Tegel/Teraso",
        icon: "i-heroicons-squares-2x2",
        prefix: "lantai_ubin",
    },
    {
        value: "kayu",
        label: "Kayu/Papan",
        icon: "i-heroicons-cube",
        prefix: "lantai_kayu",
    },
    {
        value: "semen",
        label: "Semen/Bata Merah",
        icon: "i-heroicons-square-3-stack-3d",
        prefix: "lantai_semen",
    },
];

const selectedJenisLantai = ref(jenisLantaiOptions[0]);

// --- GENERATE INDICATOR IDS BASED ON SELECTED TYPE ---
const currentIndicators = computed(() => {
    const prefix = selectedJenisLantai.value.prefix;
    return [
        `${prefix}_baik`,
        `${prefix}_lepas_sebagian_kecil`,
        `${prefix}_lepas_sebagian_besar`,
        `${prefix}_lepas_seluruh`,
    ];
});

// --- FETCH DATA PER WILAYAH ---
const {
    data: dataPerWilayah,
    pending: pendingPerWilayah,
    refresh,
} = useFetch("/api/data-per-wilayah", {
    method: "POST",
    lazy: true,
    body: computed(() => ({
        regionIds: props.regionIds,
        indicatorIds: currentIndicators.value,
        tahun: props.tahun,
    })),
    watch: false, // Disable auto-watch, we'll manually refresh
});

// Watch for changes in regionIds or selectedJenisLantai
watch(
    [() => props.regionIds, selectedJenisLantai],
    () => {
        refresh();
    },
    { deep: true, immediate: true },
);

// --- COMPUTED PROPS ---
const wilayahLabels = computed(() => {
    if (!dataPerWilayah.value) return [];
    return dataPerWilayah.value.map((w) => w.nama);
});

// Mapping data to series
const chartSeries = computed(() => {
    if (!dataPerWilayah.value || !dataPerWilayah.value.length) return [];

    const prefix = selectedJenisLantai.value.prefix;

    return [
        {
            name: "Baik",
            data: dataPerWilayah.value.map((w) => w[`${prefix}_baik`] || 0),
            color: "#10B981", // Green
        },
        {
            name: "Lepas Sebagian Kecil",
            data: dataPerWilayah.value.map(
                (w) => w[`${prefix}_lepas_sebagian_kecil`] || 0,
            ),
            color: "#F59E0B", // Amber
        },
        {
            name: "Lepas Sebagian Besar",
            data: dataPerWilayah.value.map(
                (w) => w[`${prefix}_lepas_sebagian_besar`] || 0,
            ),
            color: "#F97316", // Orange
        },
        {
            name: "Lepas Seluruhnya",
            data: dataPerWilayah.value.map(
                (w) => w[`${prefix}_lepas_seluruh`] || 0,
            ),
            color: "#EF4444", // Red
        },
    ];
});
</script>
