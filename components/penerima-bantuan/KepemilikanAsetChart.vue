<template>
    <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative">
        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg text-blue-500 bg-blue-50">
                    <UIcon name="i-heroicons-square-3-stack-3d" class="w-5 h-5" />
                </div>
                <div>
                    <h4 class="font-bold text-gray-800 text-sm">
                        Jumlah Keluarga Terdampak Menurut Daerah dan Kepemilikan Aset Sebelum dan Setelah Bencana
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

            <!-- Filter Jenis Aset -->
            <div class="w-48">
                <USelectMenu class="w-full" v-model="selectedJenisAset" :items="jenisAsetOptions"
                    placeholder="Pilih Jenis Aset" value-attribute="value" option-attribute="label">
                    <template #label>
                        <span class="flex items-center gap-2">
                            <UIcon :name="selectedJenisAset.icon" class="w-4 h-4" />
                            {{ selectedJenisAset.label }}
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
            <BarChart :categories="wilayahLabels" :series="chartSeries" height="h-96" :show-legend="true"
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
                        Menampilkan jumlah keluarga yang memiliki jenis aset
                        <strong>{{ selectedJenisAset.label }}</strong> sebelum dan sesudah bencana.
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

// --- JENIS ASET OPTIONS ---
const jenisAsetOptions = [
    {
        value: "sepeda_motor",
        label: "Sepeda Motor",
        icon: "i-heroicons-sparkles",
        prefix: "sepeda_motor",
    },
    {
        value: "mobil",
        label: "Mobil",
        icon: "i-heroicons-square-2-stack",
        prefix: "mobil",
    },
    {
        value: "lahan_pertanian",
        label: "Lahan Pertanian",
        icon: "i-heroicons-rectangle-stack",
        prefix: "lahan_pertanian",
    },
    {
        value: "ternak",
        label: "Ternak",
        icon: "i-heroicons-squares-2x2",
        prefix: "ternak",
    },
    {
        value: "bangunan_usaha",
        label: "Bangunan Usaha",
        icon: "i-heroicons-cube",
        prefix: "bangunan_usaha",
    },
];
const selectedJenisAset = ref(jenisAsetOptions[0]);

// --- GENERATE INDICATOR IDS BASED ON SELECTED TYPE ---
const currentIndicators = computed(() => {
    const prefix = selectedJenisAset.value.prefix;
    return [
        `${prefix}_sebelum_punya_setelah_punya`,
        `${prefix}_sebelum_punya_seletah_tidak`,
        `${prefix}_sebelum_tidak_setelah_punya`,
        `${prefix}_sebelum_tidak_setelah_tidak`,
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

// Watch for changes in regionIds or selectedJenisAset
watch(
    [() => props.regionIds, selectedJenisAset],
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

    const p = selectedJenisAset.value.prefix;

    const sebelum = dataPerWilayah.value.map((w) =>
        (w[`${p}_sebelum_punya_setelah_punya`] || 0) +
        (w[`${p}_sebelum_punya_seletah_tidak`] || 0)
    );

    const setelah = dataPerWilayah.value.map((w) =>
        (w[`${p}_sebelum_punya_setelah_punya`] || 0) +
        (w[`${p}_sebelum_tidak_setelah_punya`] || 0)
    );

    return [
        {
            name: "Sebelum Bencana",
            data: sebelum,
            color: "#10B981", //Green
        },
        {
            name: "Setelah Bencana",
            data: setelah,
            color: "#EF4444", //Red
        },
    ];
});
</script>
