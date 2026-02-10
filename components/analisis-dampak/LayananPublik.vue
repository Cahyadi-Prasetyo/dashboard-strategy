<template>
    <div class="space-y-8">
        <div class="mb-10 border-l-4 border-amber-500 pl-4 py-1">
            <div class="flex items-center gap-3 mb-1">
                <UIcon name="i-heroicons-map-pin" class="w-8 h-8 text-amber-500" />
                <h2 class="text-2xl font-bold text-gray-900">
                    Sektor Layanan Publik
                </h2>
            </div>
            <p class="text-gray-600">
                Visualisasi sektor layanan publik pada kondisi Pra dan Pasca Bencana
            </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <UCard class="bg-blue-50/50 border-blue-100 shadow-sm">
                <div class="flex flex-col items-center text-center p-4">
                    <div
                        class="p-3 bg-blue-100 rounded-full text-blue-600 mb-4"
                    >
                        <UIcon
                            name="i-heroicons-academic-cap"
                            class="w-8 h-8"
                        />
                    </div>
                    <p
                        class="text-sm font-bold text-blue-800 uppercase tracking-wider mb-1"
                    >
                        Total Sekolah
                    </p>
                    <div v-if="loading" class="h-10 w-24">
                        <USkeleton class="h-full w-full" />
                    </div>
                    <h2 v-else class="text-4xl font-black text-blue-900">
                        {{ formatNumber(chartData.pendidikan.total) }}
                    </h2>
                    <p class="text-[10px] text-blue-500 mt-2">
                        Pendidikan Negeri & Swasta
                    </p>
                </div>
            </UCard>

            <UCard class="bg-rose-50/50 border-rose-100 shadow-sm">
                <div class="flex flex-col items-center text-center p-4">
                    <div
                        class="p-3 bg-rose-100 rounded-full text-rose-600 mb-4"
                    >
                        <UIcon name="i-heroicons-heart" class="w-8 h-8" />
                    </div>
                    <p
                        class="text-sm font-bold text-rose-800 uppercase tracking-wider mb-1"
                    >
                        Fasilitas Kesehatan
                    </p>
                    <div v-if="loading" class="h-10 w-24">
                        <USkeleton class="h-full w-full" />
                    </div>
                    <h2 v-else class="text-4xl font-black text-rose-900">
                        {{ formatNumber(chartData.kesehatan.total) }}
                    </h2>
                    <p class="text-[10px] text-rose-500 mt-2">
                        Rumah Sakit, Puskesmas, dll.
                    </p>
                </div>
            </UCard>

            <UCard class="bg-emerald-50/50 border-emerald-100 shadow-sm">
                <div class="flex flex-col items-center text-center p-4">
                    <div
                        class="p-3 bg-emerald-100 rounded-full text-emerald-600 mb-4"
                    >
                        <UIcon name="i-heroicons-banknotes" class="w-8 h-8" />
                    </div>
                    <p
                        class="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-1"
                    >
                        Bank Pemerintah
                    </p>
                    <div v-if="loading" class="h-10 w-24">
                        <USkeleton class="h-full w-full" />
                    </div>
                    <h2 v-else class="text-4xl font-black text-emerald-900">
                        {{ formatNumber(chartData.ekonomi.total) }}
                    </h2>
                    <p class="text-[10px] text-emerald-500 mt-2">
                        BRI, BNI, Mandiri, BPD, BTN
                    </p>
                </div>
            </UCard>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UCard class="shadow-sm bg-white">
                <template #header
                    ><h3 class="font-bold text-gray-800 text-sm">
                        Ketersediaan Angkutan Umum
                    </h3></template
                >
                <ChartsPieChart :data="chartData.angkutanUmum" height="h-64" />
            </UCard>

            <UCard class="shadow-sm bg-white">
                <template #header
                    ><h3 class="font-bold text-gray-800 text-sm">
                        Keberadaan BTS
                    </h3></template
                >
                <ChartsPieChart :data="chartData.bts" height="h-64" />
            </UCard>

            <UCard class="shadow-sm bg-white">
                <template #header
                    ><h3 class="font-bold text-gray-800 text-sm">
                        Layanan Pos & Ekspedisi
                    </h3></template
                >
                <ChartsPieChart :data="chartData.pos" height="h-64" />
            </UCard>

            <UCard class="shadow-sm bg-white">
                <template #header
                    ><h3 class="font-bold text-gray-800 text-sm">
                        Kekuatan Sinyal Telepon
                    </h3></template
                >
                <ChartsPieChart :data="chartData.sinyalTelepon" height="h-64" />
            </UCard>

            <UCard class="shadow-sm bg-white">
                <template #header
                    ><h3 class="font-bold text-gray-800 text-sm">
                        Kekuatan Sinyal Internet
                    </h3></template
                >
                <ChartsPieChart
                    :data="chartData.sinyalInternet"
                    height="h-64"
                />
            </UCard>
        </div>

        <div class="w-full">
            <UCard class="shadow-sm bg-white">
                <template #header
                    ><h3 class="font-bold text-gray-800 text-sm">
                        Kegiatan Pengelolaan & Pelestarian Lingkungan
                    </h3></template
                >
                <ChartsBarChart
                    :categories="chartData.lingkungan.categories"
                    :series="chartData.lingkungan.series"
                    stacked
                    height="h-96"
                />
            </UCard>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, reactive } from "vue";

const props = defineProps({
    selectedWilayah: { type: Object, required: true },
});

const loading = ref(false);

const chartData = reactive({
    pendidikan: { total: 0 },
    kesehatan: { total: 0 },
    ekonomi: { total: 0 },
    lingkungan: { categories: [], series: [] },
    angkutanUmum: [],
    bts: [],
    sinyalTelepon: [],
    sinyalInternet: [],
    pos: [],
});

const formatNumber = (val) => new Intl.NumberFormat("id-ID").format(val);

async function fetchDataset(idDataset, idIndikator) {
    const w = props.selectedWilayah;
    const idWilayah =
        w.desa?.[0] || w.kecamatan?.[0] || w.kabupaten?.[0] || w.provinsi?.[0];
    const level = w.desa?.length
        ? "id_desa"
        : w.kecamatan?.length
          ? "id_kec"
          : w.kabupaten?.length
            ? "id_kab"
            : "id_prov";

    const query = {
        id_dataset: idDataset,
        id_indikator_insight: idIndikator,
    };

    if (idWilayah) {
        query[level] = idWilayah;
    }

    try {
        const res = await $fetch("/api/agregat-insight", { query });
        return res?.data?.records || [];
    } catch (e) {
        return [];
    }
}

async function loadAllData() {
    loading.value = true;

    const [ds13, ds14, ds15, ds16, ds17, ds19, ds20, ds21, ds22] =
        await Promise.all([
            fetchDataset(13, 18), // Pendidikan
            fetchDataset(14, 38), // Kesehatan
            fetchDataset(15, 50), // Ekonomi
            fetchDataset(16, 17), // Lingkungan
            fetchDataset(17, 17), // Angkutan Umum
            fetchDataset(19, 17), // BTS
            fetchDataset(20, 17), // Sinyal Telepon
            fetchDataset(21, 17), // Sinyal Internet
            fetchDataset(22, 17), // Pos & Ekspedisi
        ]);

    // --- Proses Big Numbers ---
    chartData.pendidikan.total = ds13.reduce(
        (acc, curr) => acc + (curr.value || 0),
        0,
    );
    chartData.kesehatan.total = ds14.reduce(
        (acc, curr) => acc + (curr.value || 0),
        0,
    );
    chartData.ekonomi.total = ds15.reduce(
        (acc, curr) => acc + (curr.value || 0),
        0,
    );

    // --- Proses Pie Charts ---
    const processPie = (records) => {
        const map = new Map();
        records.forEach((r) => {
            const label =
                r.itemCategory2?.nama || r.itemCategory3?.nama || "Lainnya";
            map.set(label, (map.get(label) || 0) + r.value);
        });
        return Array.from(map.entries()).map(([name, value]) => ({
            name,
            value,
        }));
    };

    chartData.angkutanUmum = processPie(ds17);
    chartData.bts = processPie(ds19);
    chartData.sinyalTelepon = processPie(ds20);
    chartData.sinyalInternet = processPie(ds21);
    chartData.pos = processPie(ds22);

    // --- Proses Stacked Bar (Lingkungan) ---
    const lingMap = new Map();
    const statusSet = new Set();
    ds16.forEach((r) => {
        const kegiatan = r.itemCategory2?.nama || "Lainnya";
        const status = r.itemCategory3?.nama || "Status N/A";
        statusSet.add(status);
        if (!lingMap.has(kegiatan)) lingMap.set(kegiatan, {});
        lingMap.get(kegiatan)[status] =
            (lingMap.get(kegiatan)[status] || 0) + r.value;
    });

    chartData.lingkungan.categories = Array.from(lingMap.keys());
    chartData.lingkungan.series = Array.from(statusSet).map((status) => ({
        name: status,
        data: chartData.lingkungan.categories.map(
            (keg) => lingMap.get(keg)[status] || 0,
        ),
    }));

    loading.value = false;
}

watch(
    () => props.selectedWilayah,
    () => {
        loadAllData();
    },
    { deep: true, immediate: true },
);
</script>
