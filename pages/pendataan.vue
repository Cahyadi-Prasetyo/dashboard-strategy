<template>
    <div class="min-h-screen bg-gray-50 font-sans">
        <section
            class="relative pt-4 pb-10 lg:pt-4 lg:pb-14 bg-cover bg-center overflow-hidden"
            style="background-image: url(&quot;/images/hero-bg.png&quot;)"
        >
            <div
                class="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-gray-50 via-[70%]"
            ></div>

            <div class="relative z-50 max-w-full mx-auto px-6 lg:px-15">
                <!-- Flex container untuk judul dan filter -->
                <div
                    class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-3"
                >
                    <!-- Judul -->
                    <h2 class="text-3xl font-bold text-white tracking-tight">
                        Monitoring Pendataan
                    </h2>

                    <!-- Filter Wilayah - sejajar dengan judul di kanan -->
                    <div class="flex-shrink-0">
                        <FilterWilayah
                            v-model="selectedWilayah"
                            :disabled-levels="['kecamatan', 'desa']"
                            :use-nasional="false"
                        />
                    </div>
                </div>
            </div>
        </section>

        <section class="relative z-20 px-6 lg:px-15 -mt-10 pb-20">
            <div class="max-w-full mx-auto">
                <div
                    class="bg-white rounded-2xl shadow-xl border border-gray-100"
                >
                    <div class="p-5 pb-0">
                        <!-- <div
                            class="mb-5 flex items-center gap-1 text-[10px] text-gray-600"
                        >
                            <UIcon
                                name="i-heroicons-map-pin"
                                class="w-3 h-3 text-amber-500 flex-shrink-0"
                            />
                            <div class="flex items-center gap-1 flex-wrap">
                                <span>Wilayah terpilih:</span>
                                <span class="font-bold text-gray-900">{{
                                    locationDetails.text
                                }}</span>
                                <span
                                    v-if="locationDetails.showMore"
                                    class="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5"
                                >
                                    +{{ locationDetails.count }} Lainnya
                                </span>
                            </div>
                        </div> -->
                        <div class="flex gap-2 border-b border-gray-200 overflow-x-auto no-scrollbar">
                            <button
                                v-for="tab in tabs"
                                :key="tab.key"
                                @click="activeTab = tab.key"
                                :class="[
                                    'px-4 py-2 font-bold text-md transition-all relative whitespace-nowrap rounded-t-lg',
                                    activeTab === tab.key
                                        ? 'text-amber-700 bg-amber-50 shadow-md scale-105'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
                                ]"
                            >
                                {{ tab.label }}
                                <div
                                    v-if="activeTab === tab.key"
                                    class="absolute bottom-0 left-0 right-0 h-1 bg-amber-600 rounded-t-lg"
                                ></div>
                            </button>
                        </div>
                    </div>

                    <div class="p-5">
                        <!-- <div v-show="activeTab === 'keluarga'">
              <VisualisasiKeluarga
                :region-ids="regionIds"
                :tahun="2026"
              />
            </div> -->
                        <div v-show="activeTab === 'keluarga'">
                            <VisualisasiPenerimaBantuan
                                :region-ids="regionIds"
                                :tahun="2026"
                            />
                        </div>
                        <div v-show="activeTab === 'infrastruktur'">
                            <VisualisasiInfrastruktur
                                :region-ids="regionIds"
                                :tahun="2026"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <BackToTop />
    </div>
</template>

<script setup>
import { DEFAULT_PROVINCE_IDS } from "~/constants/region-config";
useHead({
    title: "Pendataan",
});

definePageMeta({
    keepalive: {
        max: 10,
    },
});

import { ref, computed } from "vue";

// STATE TABS
const activeTab = ref("keluarga");

const tabs = [
    { key: "keluarga", label: "Keluarga" },
    { key: "infrastruktur", label: "Infrastruktur" },
];

const selectedWilayah = ref({
    provinsi: [],
    kabupaten: [],
    kecamatan: [],
    desa: [],
    provinsiNames: [],
    kabupatenNames: [],
    kecamatanNames: [],
    desaNames: [],
});

// --- LOGIKA UTAMA: GET REGION ID ---
const regionIds = computed(() => {
    const w = selectedWilayah.value;

    if (w.desa && w.desa.length > 0) return w.desa;
    if (w.kecamatan && w.kecamatan.length > 0) return w.kecamatan;
    if (w.kabupaten && w.kabupaten.length > 0) return w.kabupaten;
    if (w.provinsi && w.provinsi.length > 0) return w.provinsi;

    // Default: Semua Provinsi (11, 12, 13)
    return DEFAULT_PROVINCE_IDS;
});

const locationDetails = computed(() => {
    const w = selectedWilayah.value;
    let names = [];
    let label = "";

    // Priority: Desa > Kecamatan > Kabupaten > Provinsi
    if (w.desaNames?.length && !w.desaNames.includes("Seluruh Wilayah")) {
        names = w.desaNames;
        label = "Desa";
    } else if (
        w.kecamatanNames?.length &&
        !w.kecamatanNames.includes("Seluruh Wilayah")
    ) {
        names = w.kecamatanNames;
        label = "Kecamatan";
    } else if (
        w.kabupatenNames?.length &&
        !w.kabupatenNames.includes("Seluruh Wilayah")
    ) {
        names = w.kabupatenNames;
        label = "Kabupaten";
    } else if (
        w.provinsiNames?.length &&
        !w.provinsiNames.includes("Seluruh Wilayah")
    ) {
        names = w.provinsiNames;
        label = "Provinsi";
    } else {
        return {
            text: "Kepulauan Riau",
            count: 0,
            showMore: false,
            items: [],
        };
    }

    const limit = 5;
    if (names.length <= limit) {
        return {
            text: `${names.join(", ")}`,
            count: 0,
            showMore: false,
            items: names,
        };
    }

    return {
        text: `${names.slice(0, limit).join(", ")}`,
        count: names.length - limit,
        showMore: true,
        items: names,
    };
});
</script>
