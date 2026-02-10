<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
    >
        <div
            class="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
            @click="$emit('close')"
        ></div>

        <div
            class="relative w-full max-w-5xl flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10"
        >
            <div
                class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white"
            >
                <h3 class="font-bold text-gray-800 text-lg">
                    Grafik Fasilitas Pendidikan Terdampak
                </h3>
                <UButton
                    color="error"
                    variant="soft"
                    icon="i-heroicons-x-mark"
                    @click="$emit('close')"
                    class="bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md hover:scale-[1.02] transition-all duration-300 border-none ring-0 h-[31px]"
                />
            </div>

            <div class="p-6 bg-slate-50/30">
                <div
                    v-if="loading"
                    class="h-80 flex items-center justify-center"
                >
                    <div class="flex flex-col items-center gap-3">
                        <div
                            class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"
                        ></div>
                        <span class="text-sm text-gray-500"
                            >Memuat Grafik...</span
                        >
                    </div>
                </div>

                <div
                    v-else
                    class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                >
                    <BarChart
                        :categories="chartData.categories"
                        :series="chartData.series"
                        height="h-96"
                        :showLegend="false"
                        legendPosition="bottom"
                        :stacked="false"
                        :horizontal="false"
                        :grid="{
                            left: '3%',
                            right: '4%',
                            bottom: '5%',
                            top: '10%',
                            containLabel: true,
                        }"
                    />

                    <div class="mt-4 text-center text-xs text-gray-400 italic">
                        * Grafik menampilkan total Fasilitas Pendidikan yang terdampak berdasarkan jenjangnya
                    </div>
                </div>
            </div>

            <!-- Footer Metadata -->
            <div
                v-if="datasetInfo?.sumber || datasetInfo?.instansi"
                class="px-6 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500 shrink-0 z-20"
            >
                <div v-if="datasetInfo?.sumber" class="flex items-center gap-1">
                    <span class="font-bold">Sumber:</span>
                    <span>{{ datasetInfo.sumber }}</span>
                </div>
                <div v-if="datasetInfo?.instansi" class="flex items-center gap-1">
                        <span class="font-bold">Instansi:</span>
                    <span>{{ datasetInfo.instansi }}</span>
                </div>
                <div v-if="datasetInfo?.terakhir_diupdate" class="flex items-center gap-1">
                        <span class="font-bold">Update Terakhir:</span>
                    <span>{{ formatDate(datasetInfo.terakhir_diupdate) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";
import BarChart from "~/components/charts/BarChart.vue";

const props = defineProps({
    isOpen: Boolean,
    rawData: { type: Array, default: () => [] },
    loading: Boolean,
    datasetInfo: { type: Object, default: () => ({}) },
});

defineEmits(["close"]);

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

// Configuration
const jenjangLevels = [
  "Pendidikan Anak Usia Dini",
  "Sekolah Dasar",
  "Sekolah Menengah Pertama",
  "Sekolah Menengah Atas",
  "Sekolah Menengah Kejuruan",
  "Sekolah Luar Biasa",
  "Lembaga Kursus dan Pelatihan",
  "Pusat Kegiatan Belajar Masyarakat",
  "Pendidikan kesetaraan",
]

const colorMap = {
    "Pendidikan Anak Usia Dini": "#F59E0B", // Emerald 600
    "Sekolah Dasar": "#F59E0B",            // Emerald 500
    "Sekolah Menengah Pertama": "#F59E0B", // Emerald 400
    "Sekolah Menengah Atas": "#F59E0B",    // Emerald 300
    "Sekolah Menengah Kejuruan": "#F59E0B", // Emerald 200
    "Sekolah Luar Biasa": "#F59E0B",        // Slate 400 (Netral)
    "Lembaga Kursus dan Pelatihan": "#F59E0B", // Slate 500
    "Pusat Kegiatan Belajar Masyarakat": "#F59E0B", // Slate 600
    "Pendidikan kesetaraan": "#F59E0B",     // Slate 700
};

const chartData = computed(() => {
    if (!props.rawData?.length) {
        return { categories: [], series: [] };
    }

    const jenjangMap = new Map();
    jenjangLevels.forEach(j => jenjangMap.set(j, 0));

    props.rawData.forEach((r) => {
        const jenjang =
            r.itemCategory1?.nama ||
            r.itemCategory1;

        if (jenjang === "Total") return;

        if (!jenjangMap.has(jenjang)) return;

        const val = Number(r.value) || 0;
        jenjangMap.set(jenjang, jenjangMap.get(jenjang) + val);
    });

    return {
        categories: jenjangLevels,
        series: [
            {
                name: "Jumlah",
                type: "bar",
                data: jenjangLevels.map((j) => ({
                    value: jenjangMap.get(j),
                    itemStyle: {
                        color: colorMap[j] || "#cbd5e1",
                    },
                })),
            },
        ],
    };
});

</script>
