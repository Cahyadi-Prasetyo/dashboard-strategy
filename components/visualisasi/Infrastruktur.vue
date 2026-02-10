<template>
    <div class="space-y-12 pb-12">
        <div>
            <div
                class="flex items-start gap-4 border-b border-gray-100 pb-4 mb-6"
            >
                <div class="p-2 bg-gray-100 rounded-lg text-gray-600">
                    <UIcon name="i-heroicons-bolt" class="w-6 h-6" />
                </div>
                <div>
                    <h3 class="text-lg font-bold text-[#1e2b58]">
                        Utilitas & Konektivitas
                    </h3>
                    <p class="text-sm text-gray-500">
                        Ketersediaan air, listrik, dan jaringan telekomunikasi.
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div
                    v-for="(item, i) in utilitasCharts"
                    :key="i"
                    class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
                >
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-3">
                            <div :class="['p-2 rounded-lg', item.iconColor]">
                                <UIcon :name="item.icon" class="w-5 h-5" />
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-800 text-sm">
                                    {{ item.title }}
                                </h4>
                                <p class="text-xs text-gray-400 truncate">
                                    {{ item.desc }}
                                </p>
                            </div>
                        </div>
                        <button
                            @click="openDetail('utilitas', i)"
                            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            :title="`Lihat detail ${item.title}`"
                        >
                            <UIcon
                                :name="
                                    activeDetail.type === 'utilitas' &&
                                    activeDetail.index === i
                                        ? 'i-heroicons-eye-slash'
                                        : 'i-heroicons-eye'
                                "
                                class="w-5 h-5 text-gray-600"
                            />
                        </button>
                    </div>

                    <div v-if="pendingMain" class="space-y-3">
                        <div class="flex justify-center items-center h-56">
                            <USkeleton class="h-40 w-40 rounded-full" />
                        </div>
                        <div class="flex justify-center gap-2">
                            <USkeleton class="h-3 w-12" />
                            <USkeleton class="h-3 w-12" />
                        </div>
                    </div>

                    <ChartsPieChart
                        v-else
                        :data="item.data"
                        :series-name="item.title"
                        height="h-56"
                        legend-position="bottom"
                        inner-radius="45%"
                        outer-radius="70%"
                        :center="['50%', '35%']"
                    />
                </div>
            </div>
        </div>

        <div class="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
            <div class="flex flex-col md:flex-row items-center gap-8">
                <div class="flex-1 space-y-2">
                    <div class="flex items-center gap-3">
                        <div
                            class="inline-flex p-3 bg-[#1e2b58] text-white rounded-lg"
                        >
                            <UIcon
                                name="i-heroicons-check-badge"
                                class="w-6 h-6"
                            />
                        </div>
                        <h3 class="text-xl font-bold text-[#1e2b58]">
                            Kondisi Fungsional Infrastruktur
                        </h3>
                    </div>
                    <p class="text-gray-600">
                        Proporsi total infrastruktur publik yang berfungsi
                        normal dan dapat digunakan sesuai fungsinya pasca
                        bencana.
                    </p>
                </div>
                <div class="w-full md:w-1/3 bg-white p-4 rounded-xl shadow-sm">
                    <button
                        @click="openDetail('fungsi', 0)"
                        class="p-2 hover:bg-white/50 rounded-lg transition-colors ml-auto"
                        :title="'Lihat detail Kondisi Fungsional'"
                    >
                        <UIcon
                            :name="
                                activeDetail.type === 'fungsi'
                                    ? 'i-heroicons-eye-slash'
                                    : 'i-heroicons-eye'
                            "
                            class="w-5 h-5 text-[#1e2b58]"
                        />
                    </button>

                    <div
                        v-if="pendingMain"
                        class="flex flex-col items-center justify-center h-56 gap-4"
                    >
                        <USkeleton class="h-44 w-44 rounded-full" />
                        <USkeleton class="h-4 w-32" />
                    </div>

                    <ChartsPieChart
                        v-else
                        :data="fungsiNormalData"
                        series-name="Fungsi Normal"
                        height="h-56"
                        legend-position="bottom"
                        inner-radius="40%"
                        outer-radius="80%"
                        :center="['50%', '40%']"
                    />
                </div>
            </div>
        </div>

        <div
            v-for="section in [
                {
                    id: 'pendidikan',
                    title: 'Pendidikan',
                    icon: 'i-heroicons-academic-cap',
                    color: 'blue',
                    charts: saranaChartsPendidikan,
                    desc: 'sekolah & lembaga pendidikan',
                },
                {
                    id: 'kesehatan',
                    title: 'Kesehatan',
                    icon: 'i-heroicons-heart',
                    color: 'rose',
                    charts: saranaChartsKesehatan,
                    desc: 'rumah sakit, puskesmas & klinik',
                },
                {
                    id: 'ekonomi',
                    title: 'Ekonomi',
                    icon: 'i-heroicons-currency-dollar',
                    color: 'emerald',
                    charts: saranaChartsEkonomi,
                    desc: 'pasar, toko & bank',
                },
                {
                    id: 'sosial',
                    title: 'Sosial',
                    icon: 'i-heroicons-user-group',
                    color: 'indigo',
                    charts: saranaChartsSosial,
                    desc: 'tempat ibadah & balai warga',
                },
            ]"
            :key="section.id"
            :class="[
                `bg-gradient-to-br from-${section.color}-100 to-white rounded-2xl p-6 border border-${section.color}-200 mb-8`,
            ]"
        >
            <div class="flex items-start gap-4 mb-6">
                <div
                    :class="[
                        `p-3 bg-${section.color}-600 text-white rounded-xl shadow-lg`,
                    ]"
                >
                    <UIcon :name="section.icon" class="w-7 h-7" />
                </div>
                <div>
                    <h3 class="text-xl font-bold text-[#1e2b58]">
                        Kondisi Sarana {{ section.title }}
                    </h3>
                    <p class="text-sm text-gray-600 mt-1">
                        Kondisi fisik lantai, dinding, dan atap pada
                        {{ section.desc }}
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    v-for="(item, i) in section.charts"
                    :key="i"
                    class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm"
                >
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-3 mb-4">
                            <div
                                :class="[
                                    `p-2 rounded-lg bg-${section.color}-50 text-${section.color}-600`,
                                ]"
                            >
                                <UIcon :name="item.icon" class="w-5 h-5" />
                            </div>
                            <h4 class="font-bold text-gray-800 text-sm">
                                {{ item.title }}
                            </h4>
                        </div>
                        <button
                            @click="openDetail(section.id, i)"
                            class="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                            :title="`Lihat detail ${item.title}`"
                        >
                            <UIcon
                                :name="
                                    activeDetail.type === section.id &&
                                    activeDetail.index === i
                                        ? 'i-heroicons-eye-slash'
                                        : 'i-heroicons-eye'
                                "
                                class="w-5 h-5 text-gray-400 group-hover:text-gray-600"
                            />
                        </button>
                    </div>

                    <div
                        v-if="pendingDetail"
                        class="flex flex-col items-center justify-center h-[280px] gap-6"
                    >
                        <USkeleton class="h-48 w-48 rounded-full" />
                        <div class="space-y-2 w-full px-8">
                            <USkeleton class="h-3 w-full" />
                            <USkeleton class="h-3 w-2/3 mx-auto" />
                        </div>
                    </div>

                    <ChartsPieChart
                        v-else
                        :data="item.data"
                        :series-name="item.title"
                        height="h-70"
                        legend-position="bottom"
                        inner-radius="40%"
                        outer-radius="60%"
                        :center="['50%', '30%']"
                    />
                </div>
            </div>
        </div>

        <Teleport to="body">
            <div
                v-if="activeDetail.isOpen"
                class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
            >
                <div
                    class="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
                    @click="closeDetail"
                ></div>

                <div
                    class="relative w-full max-w-6xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 z-10"
                >
                    <VisualisasiDetail
                        :title="activeDetail.title"
                        :region-ids="regionIds"
                        :tahun="tahun"
                        :column-config="activeDetail.columnConfig"
                        @close="closeDetail"
                    />
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
    regionIds: { type: Array, required: true, default: () => [] },
    tahun: { type: Number, default: 2026 },
});

// 1. STATE POPUP
const activeDetail = ref({
    isOpen: false,
    title: "",
    columnConfig: [],
});

// 2. FUNGSI BUKA POPUP (Configurator)
const openDetail = (category, index) => {
    let title = "";
    let config = [];

    // --- A. KATEGORI UTILITAS (Air, Listrik, Sinyal) ---
    if (category === "utilitas") {
        const item = utilitasCharts.value[index];
        title = `Detail Wilayah - ${item.title}`;

        if (index === 0) {
            // Air
            config = [
                { label: "Sebagian Besar", key: IDS.AIR.BESAR },
                { label: "Sebagian Kecil", key: IDS.AIR.KECIL },
                { label: "Tidak Ada", key: IDS.AIR.TIDAK },
            ];
        } else if (index === 1) {
            // Listrik
            config = [
                { label: "Sebagian Besar", key: IDS.LISTRIK.BESAR },
                { label: "Sebagian Kecil", key: IDS.LISTRIK.KECIL },
                { label: "Tidak Ada", key: IDS.LISTRIK.TIDAK },
            ];
        } else if (index === 2) {
            // Sinyal HP
            config = [
                { label: "Sangat Kuat", key: IDS.SINYAL.KUAT_BGT },
                { label: "Kuat", key: IDS.SINYAL.KUAT },
                { label: "Lemah", key: IDS.SINYAL.LEMAH },
                { label: "Tidak Ada", key: IDS.SINYAL.TIDAK },
            ];
        } else if (index === 3) {
            // Internet
            config = [
                { label: "4G/LTE", key: IDS.INTERNET["4G"] },
                { label: "3G", key: IDS.INTERNET["3G"] },
                { label: "2G", key: IDS.INTERNET["2G"] },
                { label: "Tidak Ada", key: IDS.INTERNET.TIDAK },
            ];
        }
    }

    // --- B. KATEGORI FUNGSI ---
    else if (category === "fungsi") {
        title = "Detail Kondisi Fungsional Infrastruktur";
        config = [
            { label: "Berfungsi Normal", key: IDS.FUNGSI.NORMAL },
            { label: "Rusak/Tdk Fungsi", key: IDS.FUNGSI.RUSAK },
        ];
    }

    // --- C. KATEGORI STATUS PENEMUAN ---
    else if (category === "sarana") {
        const item = saranaCharts.value[index];
        title = `Detail Status Penemuan - ${item.title}`;

        // Kunci ID ada/tidak ada sesuai urutan chart
        const keys = [
            { ada: IDS.SARANA.PEND_ADA, blm: IDS.SARANA.PEND_BLM }, // Pendidikan
            { ada: IDS.SARANA.KESH_ADA, blm: IDS.SARANA.KESH_BLM }, // Kesehatan
            { ada: IDS.SARANA.EKO_ADA, blm: IDS.SARANA.EKO_BLM }, // Ekonomi
            { ada: IDS.SARANA.SOS_ADA, blm: IDS.SARANA.SOS_BLM }, // Sosial
        ];

        config = [
            { label: "Ditemukan", key: keys[index].ada },
            { label: "Belum Ditemukan", key: keys[index].blm },
        ];
    }

    // --- D. KATEGORI FISIK BANGUNAN (Pendidikan, Kesehatan, dll) ---
    else {
        // category = 'pendidikan', 'kesehatan', 'ekonomi', 'sosial'
        // index = 0 (Lantai), 1 (Dinding), 2 (Atap)
        const types = ["LANTAI", "DINDING", "ATAP"];
        const compType = types[index];
        const saranaKey = category.toUpperCase();

        const componentName =
            compType.charAt(0) + compType.slice(1).toLowerCase(); // 'Lantai'
        const saranaName = category.charAt(0).toUpperCase() + category.slice(1); // 'Pendidikan'

        title = `Detail Kondisi ${componentName} - ${saranaName}`;

        const idObj = IDS.FISIK[saranaKey][compType];
        const labels = CATEGORY_LABELS[compType];

    config = [
      { label: labels[1], key: idObj[1] },
      { label: labels[2], key: idObj[2] },
      { label: labels[3], key: idObj[3] },
      { label: labels[4], key: idObj[4] },
    ];
    // console.log(config)
  }

    // Buka Modal
    activeDetail.value = {
        isOpen: true,
        title,
        columnConfig: config,
    };
};

const closeDetail = () => {
    activeDetail.value.isOpen = false;
};
const getComponentType = (index) => {
    const types = ["lantai", "dinding", "atap"];
    return types[index] || "lantai";
};

// --- DEFINISI INDIKATOR LENGKAP ---
const IDS = {
    AIR: {
        BESAR: "fasilitas_air_sebagian_besar",
        KECIL: "fasilitas_air_sebagian_kecil",
        TIDAK: "fasilitas_air_tidak_ada",
    },
    LISTRIK: {
        BESAR: "jaringan_listrik_sebagian_besar",
        KECIL: "jaringan_listrik_sebagian_kecil",
        TIDAK: "jaringan_listrik_tidak_ada",
    },
    SINYAL: {
        KUAT_BGT: "sinyal_seluler_sangat_kuat",
        KUAT: "sinyal_seluler_kuat",
        LEMAH: "sinyal_seluler_lemah",
        TIDAK: "sinyal_seluler_tidak_ada",
    },
    INTERNET: {
        "4G": "sinyal_internet_a",
        "3G": "sinyal_internet_b",
        "2G": "sinyal_internet_c",
        TIDAK: "sinyal_internet_tidak_ada",
    },
    FUNGSI: {
        NORMAL: "sarana_sosial_berfungsi",
        RUSAK: "sarana_sosial_tidak_berfungsi",
    },
    SARANA: {
        PEND_ADA: "sarana_pendidikan_ditemukan",
        PEND_BLM: "sarana_pendidikan_tidak_ditemukan",
        KESH_ADA: "sarana_kesehatan_ditemukan",
        KESH_BLM: "sarana_kesehatan_tidak_ditemukan",
        EKO_ADA: "sarana_ekonomi_ditemukan",
        EKO_BLM: "sarana_ekonomi_tidak_ditemukan",
        SOS_ADA: "sarana_sosial_ditemukan",
        SOS_BLM: "sarana_sosial_tidak_ditemukan",
    },
    FISIK: {
        PENDIDIKAN: {
            LANTAI: {
                1: "sarana_pendidikan_lantai_baik",
                2: "sarana_pendidikan_lantai_lepas_sebagian_kecil",
                3: "sarana_pendidikan_lantai_lepas_sebagian_besar",
                4: "sarana_pendidikan_lantai_lepas_seluruh",
            },
            DINDING: {
                1: "sarana_pendidikan_dinding_baik",
                2: "sarana_pendidikan_dinding_sebagian_rusak",
                3: "sarana_pendidikan_dinding_roboh_sebagian_kecil",
                4: "sarana_pendidikan_dinding_roboh_sebagian_besar",
            },
            ATAP: {
                1: "sarana_pendidikan_atap_baik",
                2: "sarana_pendidikan_atap_lepas_sebagian_kecil",
                3: "sarana_pendidikan_atap_lepas_sebagian_besar",
                4: "sarana_pendidikan_atap_jatuh",
            },
        },
        KESEHATAN: {
            LANTAI: {
                1: "sarana_kesehatan_lantai_baik",
                2: "sarana_kesehatan_lantai_lepas_sebagian_kecil",
                3: "sarana_kesehatan_lantai_lepas_sebagian_besar",
                4: "sarana_kesehatan_lantai_lepas_seluruh",
            },
            DINDING: {
                1: "sarana_kesehatan_dinding_baik",
                2: "sarana_kesehatan_dinding_sebagian_rusak",
                3: "sarana_kesehatan_dinding_roboh_sebagian_kecil",
                4: "sarana_kesehatan_dinding_roboh_sebagian_besar",
            },
            ATAP: {
                1: "sarana_kesehatan_atap_baik",
                2: "sarana_kesehatan_atap_lepas_sebagian_kecil",
                3: "sarana_kesehatan_atap_lepas_sebagian_besar",
                4: "sarana_kesehatan_atap_jatuh",
            },
        },
        EKONOMI: {
            LANTAI: {
                1: "sarana_ekonomi_lantai_baik",
                2: "sarana_ekonomi_lantai_lepas_sebagian_kecil",
                3: "sarana_ekonomi_lantai_lepas_sebagian_besar",
                4: "sarana_ekonomi_lantai_lepas_seluruh",
            },
            DINDING: {
                1: "sarana_ekonomi_dinding_baik",
                2: "sarana_ekonomi_dinding_sebagian_rusak",
                3: "sarana_ekonomi_dinding_roboh_sebagian_kecil",
                4: "sarana_ekonomi_dinding_roboh_sebagian_besar",
            },
            ATAP: {
                1: "sarana_ekonomi_atap_baik",
                2: "sarana_ekonomi_atap_lepas_sebagian_kecil",
                3: "sarana_ekonomi_atap_lepas_sebagian_besar",
                4: "sarana_ekonomi_atap_jatuh",
            },
        },
        SOSIAL: {
            LANTAI: {
                1: "sarana_sosial_lantai_baik",
                2: "sarana_sosial_lantai_lepas_sebagian_kecil",
                3: "sarana_sosial_lantai_lepas_sebagian_besar",
                4: "sarana_sosial_lantai_lepas_seluruh",
            },
            DINDING: {
                1: "sarana_sosial_dinding_baik",
                2: "sarana_sosial_dinding_sebagian_rusak",
                3: "sarana_sosial_dinding_roboh_sebagian_kecil",
                4: "sarana_sosial_dinding_roboh_sebagian_besar",
            },
            ATAP: {
                1: "sarana_sosial_atap_baik",
                2: "sarana_sosial_atap_lepas_sebagian_kecil",
                3: "sarana_sosial_atap_lepas_sebagian_besar",
                4: "sarana_sosial_atap_jatuh",
            },
        },
    },
};

// --- PEMISAHAN INDIKATOR ---

// 1. MAIN (Prioritas Tinggi - Utilitas & Fungsi)
const mainIndicatorIds = [
    ...Object.values(IDS.AIR),
    ...Object.values(IDS.LISTRIK),
    ...Object.values(IDS.SINYAL),
    ...Object.values(IDS.INTERNET),
    ...Object.values(IDS.FUNGSI),
];

// 2. DETAIL (Prioritas Rendah - Fisik Sarana & Status)
const detailIndicatorIds = [
    ...Object.values(IDS.SARANA),
    ...Object.values(IDS.FISIK.PENDIDIKAN.LANTAI),
    ...Object.values(IDS.FISIK.PENDIDIKAN.DINDING),
    ...Object.values(IDS.FISIK.PENDIDIKAN.ATAP),
    ...Object.values(IDS.FISIK.KESEHATAN.LANTAI),
    ...Object.values(IDS.FISIK.KESEHATAN.DINDING),
    ...Object.values(IDS.FISIK.KESEHATAN.ATAP),
    ...Object.values(IDS.FISIK.EKONOMI.LANTAI),
    ...Object.values(IDS.FISIK.EKONOMI.DINDING),
    ...Object.values(IDS.FISIK.EKONOMI.ATAP),
    ...Object.values(IDS.FISIK.SOSIAL.LANTAI),
    ...Object.values(IDS.FISIK.SOSIAL.DINDING),
    ...Object.values(IDS.FISIK.SOSIAL.ATAP),
];

// FETCHING PARALLEL
const { data: dataMain, pending: pendingMain } = useFetch("/api/data", {
    method: "POST",
    lazy: true,
    key: "infra-main", // Kasih key unik biar cache-nya ga bentrok
    body: computed(() => ({
        regionIds: props.regionIds,
        indicatorIds: mainIndicatorIds,
        tahun: props.tahun,
    })),
    watch: [() => props.regionIds],
});

const { data: dataDetail, pending: pendingDetail } = useFetch("/api/data", {
    method: "POST",
    lazy: true,
    key: "infra-detail",
    body: computed(() => ({
        regionIds: props.regionIds,
        indicatorIds: detailIndicatorIds,
        tahun: props.tahun,
    })),
    watch: [() => props.regionIds],
});

const getValue = (id) => {
    if (dataMain.value) {
        const foundMain = dataMain.value.find((item) => item.id === id);
        if (foundMain) return foundMain.value;
    }
    if (dataDetail.value) {
        const foundDetail = dataDetail.value.find((item) => item.id === id);
        if (foundDetail) return foundDetail.value;
    }

    return 0;
};

// --- CHART DATA CONFIGURATION ---
const C_NAVY = "#1e2b58";
const C_BLUE_LIGHT = "#93c5fd";
const C_YELLOW = "#eab308";
const C_GRAY = "#cbd5e1";
const C_RED = "#ef4444";

const CATEGORY_LABELS = {
    LANTAI: {
        1: "Baik",
        2: "Sebagian kecil lantai lepas",
        3: "Sebagian besar lantai lepas",
        4: "Seluruh lantai lepas",
    },
    DINDING: {
        1: "Baik",
        2: "Sebagian plester terkelupas",
        3: "Balok/kolom patah",
        4: "Dinding runtuh total",
    },
    ATAP: {
        1: "Baik",
        2: "Sebagian kecil atap lepas",
        3: "Sebagian rangka atap patah",
        4: "Atap jatuh/tidak ada atap",
    },
};

const getConditionData = (idConfig, type) => {
    const labels = CATEGORY_LABELS[type];
    return [
        { value: getValue(idConfig[1]), name: labels[1], color: C_NAVY },
        { value: getValue(idConfig[2]), name: labels[2], color: C_BLUE_LIGHT },
        { value: getValue(idConfig[3]), name: labels[3], color: C_YELLOW },
        { value: getValue(idConfig[4]), name: labels[4], color: C_RED },
    ];
};

const utilitasCharts = computed(() => [
    {
        title: "Air Bersih",
        desc: "Ketersediaan fasilitas air",
        icon: "i-heroicons-sparkles",
        iconColor: "text-blue-500 bg-blue-50",
        data: [
            {
                value: getValue(IDS.AIR.BESAR),
                name: "Sebagian besar",
                color: C_NAVY,
            },
            {
                value: getValue(IDS.AIR.KECIL),
                name: "Sebagian kecil",
                color: C_YELLOW,
            },
            { value: getValue(IDS.AIR.TIDAK), name: "Tidak ada", color: C_RED },
        ],
    },
    {
        title: "Listrik",
        desc: "Ketersediaan jaringan listrik",
        icon: "i-heroicons-bolt",
        iconColor: "text-amber-500 bg-amber-50",
        data: [
            {
                value: getValue(IDS.LISTRIK.BESAR),
                name: "Sebagian besar",
                color: C_NAVY,
            },
            {
                value: getValue(IDS.LISTRIK.KECIL),
                name: "Sebagian kecil",
                color: C_YELLOW,
            },
            {
                value: getValue(IDS.LISTRIK.TIDAK),
                name: "Tidak ada",
                color: C_RED,
            },
        ],
    },
    {
        title: "Sinyal HP",
        desc: "Kekuatan sinyal seluler",
        icon: "i-heroicons-signal",
        iconColor: "text-emerald-500 bg-emerald-50",
        data: [
            {
                value: getValue(IDS.SINYAL.KUAT_BGT),
                name: "Sangat kuat",
                color: C_NAVY,
            },
            {
                value: getValue(IDS.SINYAL.KUAT),
                name: "Kuat",
                color: C_BLUE_LIGHT,
            },
            {
                value: getValue(IDS.SINYAL.LEMAH),
                name: "Lemah",
                color: C_YELLOW,
            },
            {
                value: getValue(IDS.SINYAL.TIDAK),
                name: "Tidak ada",
                color: C_RED,
            },
        ],
    },
    {
        title: "Internet",
        desc: "Jenis sinyal internet dominan",
        icon: "i-heroicons-wifi",
        iconColor: "text-violet-500 bg-violet-50",
        data: [
            {
                value: getValue(IDS.INTERNET["4G"]),
                name: "5G/4G/LTE",
                color: C_NAVY,
            },
            {
                value: getValue(IDS.INTERNET["3G"]),
                name: "3G/H/H+",
                color: C_BLUE_LIGHT,
            },
            {
                value: getValue(IDS.INTERNET["2G"]),
                name: "2G/E/GPRS",
                color: C_GRAY,
            },
            {
                value: getValue(IDS.INTERNET.TIDAK),
                name: "Tidak ada",
                color: C_RED,
            },
        ],
    },
]);

const fungsiNormalData = computed(() => [
    {
        value: getValue(IDS.FUNGSI.NORMAL),
        name: "Berfungsi Normal",
        color: C_NAVY,
    },
    {
        value: getValue(IDS.FUNGSI.RUSAK),
        name: "Rusak/Tdk Fungsi",
        color: C_YELLOW,
    },
]);

const saranaCharts = computed(() => [
    {
        title: "Sarana Pendidikan",
        desc: "Sekolah & Lembaga",
        icon: "i-heroicons-academic-cap",
        data: [
            {
                value: getValue(IDS.SARANA.PEND_ADA),
                name: "Ditemukan",
                color: C_YELLOW,
            },
            {
                value: getValue(IDS.SARANA.PEND_BLM),
                name: "Belum",
                color: C_GRAY,
            },
        ],
    },
    {
        title: "Sarana Kesehatan",
        desc: "RS, Puskesmas, Klinik",
        icon: "i-heroicons-heart",
        data: [
            {
                value: getValue(IDS.SARANA.KESH_ADA),
                name: "Ditemukan",
                color: C_YELLOW,
            },
            {
                value: getValue(IDS.SARANA.KESH_BLM),
                name: "Belum",
                color: C_GRAY,
            },
        ],
    },
    {
        title: "Sarana Ekonomi",
        desc: "Pasar, Toko, Bank",
        icon: "i-heroicons-currency-dollar",
        data: [
            {
                value: getValue(IDS.SARANA.EKO_ADA),
                name: "Ditemukan",
                color: C_YELLOW,
            },
            {
                value: getValue(IDS.SARANA.EKO_BLM),
                name: "Belum",
                color: C_GRAY,
            },
        ],
    },
    {
        title: "Sarana Sosial",
        desc: "Ibadah & Balai Warga",
        icon: "i-heroicons-user-group",
        data: [
            {
                value: getValue(IDS.SARANA.SOS_ADA),
                name: "Ditemukan",
                color: C_YELLOW,
            },
            {
                value: getValue(IDS.SARANA.SOS_BLM),
                name: "Belum",
                color: C_GRAY,
            },
        ],
    },
]);

const saranaChartsPendidikan = computed(() => [
    {
        title: "Kondisi Lantai",
        icon: "i-heroicons-squares-2x2",
        data: getConditionData(IDS.FISIK.PENDIDIKAN.LANTAI, "LANTAI"),
    },
    {
        title: "Kondisi Dinding",
        icon: "i-heroicons-building-office",
        data: getConditionData(IDS.FISIK.PENDIDIKAN.DINDING, "DINDING"),
    },
    {
        title: "Kondisi Atap",
        icon: "i-heroicons-home",
        data: getConditionData(IDS.FISIK.PENDIDIKAN.ATAP, "ATAP"),
    },
]);

const saranaChartsKesehatan = computed(() => [
    {
        title: "Kondisi Lantai",
        icon: "i-heroicons-squares-2x2",
        data: getConditionData(IDS.FISIK.KESEHATAN.LANTAI, "LANTAI"),
    },
    {
        title: "Kondisi Dinding",
        icon: "i-heroicons-building-office",
        data: getConditionData(IDS.FISIK.KESEHATAN.DINDING, "DINDING"),
    },
    {
        title: "Kondisi Atap",
        icon: "i-heroicons-home",
        data: getConditionData(IDS.FISIK.KESEHATAN.ATAP, "ATAP"),
    },
]);

const saranaChartsEkonomi = computed(() => [
    {
        title: "Kondisi Lantai",
        icon: "i-heroicons-squares-2x2",
        data: getConditionData(IDS.FISIK.EKONOMI.LANTAI, "LANTAI"),
    },
    {
        title: "Kondisi Dinding",
        icon: "i-heroicons-building-office",
        data: getConditionData(IDS.FISIK.EKONOMI.DINDING, "DINDING"),
    },
    {
        title: "Kondisi Atap",
        icon: "i-heroicons-home",
        data: getConditionData(IDS.FISIK.EKONOMI.ATAP, "ATAP"),
    },
]);

const saranaChartsSosial = computed(() => [
    {
        title: "Kondisi Lantai",
        icon: "i-heroicons-squares-2x2",
        data: getConditionData(IDS.FISIK.SOSIAL.LANTAI, "LANTAI"),
    },
    {
        title: "Kondisi Dinding",
        icon: "i-heroicons-building-office",
        data: getConditionData(IDS.FISIK.SOSIAL.DINDING, "DINDING"),
    },
    {
        title: "Kondisi Atap",
        icon: "i-heroicons-home",
        data: getConditionData(IDS.FISIK.SOSIAL.ATAP, "ATAP"),
    },
]);
</script>
