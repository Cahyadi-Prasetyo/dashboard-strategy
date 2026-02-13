<template>
    <div class="min-h-screen bg-gray-50 font-sans">
        <section
            class="relative pt-18 pb-32 lg:pt-18 lg:pb-32 bg-cover bg-center overflow-hidden"
            style="background-image: url(&quot;/images/hero-bg.png&quot;)"
        >
            <div
                class="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-gray-50"
            ></div>

            <div class="relative z-10 max-w-full mx-auto px-6 lg:px-15">
                <div class="mb-10 text-center lg:text-left">
                    <h2 class="text-3xl font-bold text-white tracking-tight">
                        Monitoring Pendataan Lapangan
                    </h2>
                    <p class="text-slate-300 mt-2">
                        Data terkini berdasarkan laporan lapangan
                    </p>
                </div>

                <div class="mb-10">
                    <FilterWilayah
                        v-model="selectedWilayah"
                        :use-nasional="false"
                    />
                </div>

                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    <div
                        class="group relative overflow-hidden rounded-2xl bg-white/5 p-6 text-white shadow-xl ring-1 ring-white/10 backdrop-blur-md transition-all hover:bg-white/10"
                    >
                        <div class="flex items-center gap-4 mb-4">
                            <div
                                class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400"
                            >
                                <UIcon name="i-heroicons-map" class="h-6 w-6" />
                            </div>
                            <h3
                                class="text-sm font-medium text-slate-300 uppercase tracking-wider"
                            >
                                Desa Terdampak
                            </h3>
                        </div>
                        <div v-if="pending">
                            <USkeleton
                                class="h-12 w-32 bg-white/10 rounded-lg"
                            />
                            <div
                                class="mt-4 h-1 w-12 bg-white/10 rounded-full"
                            ></div>
                        </div>
                        <div v-else>
                            <p
                                class="text-5xl font-bold text-white tracking-tight"
                            >
                                {{ formatNumber(getVal("desa_terdampak")) }}
                            </p>
                            <div
                                class="mt-4 h-1 w-12 bg-amber-500 rounded-full"
                            ></div>
                        </div>
                    </div>

                    <div
                        class="group relative overflow-hidden rounded-2xl bg-white/5 p-6 text-white shadow-xl ring-1 ring-white/10 backdrop-blur-md transition-all hover:bg-white/10"
                    >
                        <div class="flex items-center gap-4 mb-2">
                            <div
                                class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400"
                            >
                                <UIcon
                                    name="i-heroicons-building-office"
                                    class="h-6 w-6"
                                />
                            </div>
                            <h3
                                class="text-sm font-medium text-slate-300 uppercase tracking-wider"
                            >
                                Infrastruktur
                            </h3>
                        </div>
                        <div v-if="pending" class="space-y-6">
                            <USkeleton
                                class="h-10 w-24 bg-white/10 rounded-lg mb-6"
                            />
                            <div
                                class="space-y-3 pt-4 border-t border-white/10"
                            >
                                <div
                                    class="flex justify-between"
                                    v-for="i in 4"
                                    :key="i"
                                >
                                    <USkeleton class="h-4 w-24 bg-white/5" />
                                    <USkeleton class="h-4 w-10 bg-white/10" />
                                </div>
                            </div>
                        </div>
                        <div v-else>
                            <p class="text-4xl font-bold text-white mb-6">
                                {{ formatNumber(getVal("sarana")) }}
                            </p>
                            <div
                                class="space-y-1 border-t border-white/10 pt-4 text-sm"
                            >
                                <div class="flex justify-between items-center">
                                    <span
                                        class="text-slate-300 flex items-center gap-2"
                                        ><span
                                            class="w-1.5 h-1.5 rounded-full bg-blue-400"
                                        ></span
                                        >Pendidikan</span
                                    ><span class="font-semibold font-mono">{{
                                        formatNumber(
                                            getVal("sarana_pendidikan"),
                                        )
                                    }}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span
                                        class="text-slate-300 flex items-center gap-2"
                                        ><span
                                            class="w-1.5 h-1.5 rounded-full bg-emerald-400"
                                        ></span
                                        >Kesehatan</span
                                    ><span class="font-semibold font-mono">{{
                                        formatNumber(getVal("sarana_kesehatan"))
                                    }}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span
                                        class="text-slate-300 flex items-center gap-2"
                                        ><span
                                            class="w-1.5 h-1.5 rounded-full bg-amber-400"
                                        ></span
                                        >Sosial</span
                                    ><span class="font-semibold font-mono">{{
                                        formatNumber(getVal("sarana_sosial"))
                                    }}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span
                                        class="text-slate-300 flex items-center gap-2"
                                        ><span
                                            class="w-1.5 h-1.5 rounded-full bg-cyan-400"
                                        ></span
                                        >Ekonomi</span
                                    ><span class="font-semibold font-mono">{{
                                        formatNumber(getVal("sarana_ekonomi"))
                                    }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        class="group relative overflow-hidden rounded-2xl bg-white/5 p-6 text-white shadow-xl ring-1 ring-white/10 backdrop-blur-md transition-all hover:bg-white/10"
                    >
                        <div class="flex items-center gap-4 mb-2">
                            <div
                                class="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400"
                            >
                                <UIcon
                                    name="i-heroicons-home-modern"
                                    class="h-6 w-6"
                                />
                            </div>
                            <h3
                                class="text-sm font-medium text-slate-300 uppercase tracking-wider"
                            >
                                Tempat Tinggal Terdampak Rusak
                            </h3>
                        </div>
                        <div v-if="pending" class="space-y-6">
                            <USkeleton
                                class="h-10 w-24 bg-white/10 rounded-lg mb-6"
                            />
                            <div
                                class="space-y-3 pt-4 border-t border-white/10"
                            >
                                <div
                                    class="flex justify-between"
                                    v-for="i in 3"
                                    :key="i"
                                >
                                    <USkeleton class="h-4 w-24 bg-white/5" />
                                    <USkeleton class="h-4 w-10 bg-white/10" />
                                </div>
                            </div>
                        </div>
                        <div v-else>
                            <p class="text-4xl font-bold text-white mb-6">
                                {{
                                    formatNumber(
                                        getVal(
                                            "keberadaan_tempat_tinggal_terdampak_rusak",
                                        ),
                                    )
                                }}
                            </p>
                            <div
                                class="space-y-1 border-t border-white/10 pt-4 text-sm"
                            >
                                <div class="flex justify-between items-center">
                                    <span class="text-slate-300"
                                        >Atap (Jatuh)</span
                                    ><span
                                        class="font-semibold text-white font-mono"
                                        >{{
                                            formatNumber(getVal("atap_jatuh"))
                                        }}</span
                                    >
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-slate-300"
                                        >Dinding (Roboh)</span
                                    ><span
                                        class="font-semibold text-white font-mono"
                                        >{{
                                            formatNumber(
                                                getVal(
                                                    "dinding_roboh_sebagian_besar",
                                                ),
                                            )
                                        }}</span
                                    >
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-slate-300"
                                        >Lantai (Lepas)</span
                                    ><span
                                        class="font-semibold text-white font-mono"
                                        >{{
                                            formatNumber(
                                                getVal("lantai_lepas_seluruh"),
                                            )
                                        }}</span
                                    >
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        class="group relative overflow-hidden rounded-2xl bg-white/5 p-6 text-white shadow-xl ring-1 ring-white/10 backdrop-blur-md transition-all hover:bg-white/10"
                    >
                        <div class="flex items-center gap-4 mb-2">
                            <div
                                class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400"
                            >
                                <UIcon
                                    name="i-heroicons-users"
                                    class="h-6 w-6"
                                />
                            </div>
                            <h3
                                class="text-sm font-medium text-slate-300 uppercase tracking-wider"
                            >
                                Penduduk Terdampak
                            </h3>
                        </div>
                        <div v-if="pending" class="space-y-6">
                            <div class="flex items-end gap-2 mb-6">
                                <USkeleton
                                    class="h-10 w-24 bg-white/10 rounded-lg"
                                />
                                <USkeleton class="h-4 w-8 bg-white/5 mb-1" />
                            </div>
                            <div
                                class="space-y-3 pt-4 border-t border-white/10"
                            >
                                <div
                                    class="flex justify-between"
                                    v-for="i in 2"
                                    :key="i"
                                >
                                    <USkeleton class="h-4 w-20 bg-white/5" />
                                    <USkeleton class="h-4 w-10 bg-white/10" />
                                </div>
                            </div>
                        </div>
                        <div v-else>
                            <p class="text-4xl font-bold text-white mb-6">
                                {{ formatNumber(getVal("penduduk"))
                                }}<span
                                    class="text-sm font-normal text-slate-400"
                                    >Jiwa</span
                                >
                            </p>
                            <div
                                class="space-y-1 border-t border-white/10 pt-4 text-sm"
                            >
                                <div class="flex justify-between items-center">
                                    <span class="text-slate-300">Meninggal</span
                                    ><span
                                        class="font-semibold text-white font-mono"
                                        >{{
                                            formatNumber(
                                                getVal(
                                                    "penduduk_keberadaan_meninggal_bencana",
                                                ),
                                            )
                                        }}</span
                                    >
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-slate-300">Mengungsi</span
                                    ><span
                                        class="font-semibold text-white font-mono"
                                        >{{
                                            formatNumber(
                                                getVal(
                                                    "penduduk_keberadaan_mengungsi",
                                                ),
                                            )
                                        }}</span
                                    >
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="relative z-20 px-6 lg:px-15 -mt-24 pb-20">
            <div class="max-w-full mx-auto">
                <div
                    class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                >
                    <div class="p-8 pb-0">
                        <div class="flex items-center gap-3 mb-2">
                            <div
                                class="h-8 w-1.5 bg-amber-500 rounded-full"
                            ></div>
                            <h3 class="text-2xl font-bold text-gray-900">
                                Progres Pendataan
                            </h3>
                        </div>
                        <div
                            class="ml-5 mt-1 text-xs text-gray-400 flex items-center gap-1.5"
                        >
                            <UIcon
                                name="i-heroicons-clock"
                                class="w-3.5 h-3.5"
                            />
                            <span
                                >Data terakhir diperbarui: 16 Januari 2025,
                                06.00 WIB</span
                            >
                        </div>
                        <div
                            class="mb-6 ml-5 flex items-start gap-2 text-sm text-gray-500"
                        >
                            <UIcon
                                name="i-heroicons-map-pin"
                                class="w-4 h-4 mt-0.5 text-amber-500 flex-shrink-0"
                            />
                            <p>
                                Wilayah terpilih:
                                <span
                                    class="font-bold text-gray-800 border-b-2 border-amber-100 pb-0.5"
                                    >{{ formattedLocation }}</span
                                >
                            </p>
                        </div>

                        <div class="flex gap-2 border-b border-gray-200">
                            <button
                                @click="activeTab = 'keluarga'"
                                :class="[
                                    'px-6 py-3 font-semibold text-sm transition-all relative',
                                    activeTab === 'keluarga'
                                        ? 'text-amber-600'
                                        : 'text-gray-600 hover:text-gray-900',
                                ]"
                            >
                                Keluarga
                                <div
                                    v-if="activeTab === 'keluarga'"
                                    class="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"
                                ></div>
                            </button>
                            <button
                                @click="activeTab = 'infrastruktur'"
                                :class="[
                                    'px-6 py-3 font-semibold text-sm transition-all relative',
                                    activeTab === 'infrastruktur'
                                        ? 'text-amber-600'
                                        : 'text-gray-600 hover:text-gray-900',
                                ]"
                            >
                                Infrastruktur
                                <div
                                    v-if="activeTab === 'infrastruktur'"
                                    class="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"
                                ></div>
                            </button>
                        </div>
                    </div>
                    <div class="p-8">
                        <KeepAlive>
                            <ProgressKeluarga
                                v-if="activeTab === 'keluarga'"
                                :region-ids="currentRegionIds"
                                :tahun="2026"
                            />
                            <ProgressInfrastruktur
                                v-else-if="activeTab === 'infrastruktur'"
                                :region-ids="currentRegionIds"
                                :tahun="2026"
                            />
                        </KeepAlive>
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
    title: "Monitoring Pendataan",
});

definePageMeta({
    keepalive: { max: 10 },
});

import { ref, computed } from "vue";

const activeTab = ref("keluarga");

// STATE
// Ini otomatis keisi ID (bukan nama) dari FilterWilayah
const selectedWilayah = ref({
    provinsi: [],
    kabupaten: [],
    kecamatan: [],
    desa: [],
    // Names akan dikirim juga oleh FilterWilayah, buat display label
    provinsiNames: [],
    kabupatenNames: [],
    kecamatanNames: [],
    desaNames: [],
});

// --- LOGIKA UTAMA: GET REGION ID ---
// Langsung ambil dari state, karena isinya SUDAH ID
const currentRegionIds = computed(() => {
    const w = selectedWilayah.value;

    if (w.desa && w.desa.length > 0) return w.desa;
    if (w.kecamatan && w.kecamatan.length > 0) return w.kecamatan;
    if (w.kabupaten && w.kabupaten.length > 0) return w.kabupaten;
    if (w.provinsi && w.provinsi.length > 0) return w.provinsi;

    return DEFAULT_PROVINCE_IDS; // Default ID
});

const allIndicatorIds = [
    "desa_terdampak",
    "sarana",
    "sarana_pendidikan",
    "sarana_kesehatan",
    "sarana_sosial",
    "sarana_ekonomi",
    "keberadaan_tempat_tinggal_terdampak_rusak",
    "atap_jatuh",
    "dinding_roboh_sebagian_besar",
    "lantai_lepas_seluruh",
    "penduduk",
    "penduduk_keberadaan_meninggal_bencana",
    "penduduk_keberadaan_mengungsi",
];

// Fetch Data API
const { data: rawApiData, pending } = useFetch("/api/data", {
    method: "POST",
    lazy: true,
    body: computed(() => ({
        regionIds: currentRegionIds.value,
        indicatorIds: allIndicatorIds,
        tahun: new Date().getFullYear(),
    })),
    watch: [currentRegionIds],
});

// Helper Get Value
const getVal = (key) => {
    if (!rawApiData.value || !Array.isArray(rawApiData.value)) return 0;
    const foundItem = rawApiData.value.find((item) => item.id === key);
    return foundItem ? Number(foundItem.value) : 0;
};

const formatNumber = (num) => new Intl.NumberFormat("id-ID").format(num);

// --- FORMATTED LOCATION ---
const formattedLocation = computed(() => {
    const w = selectedWilayah.value;

    const formatList = (list, label) => {
        if (!list || list.length === 0) return "";
        if (list.length === 1) return list[0];
        if (list.length <= 2) return list.join(", ");
        return `${list.length} ${label} Terpilih`;
    };

    const hasAllTag = (arr) =>
        arr && arr.some((item) => item === "Seluruh Wilayah");

    if (w.desaNames && w.desaNames.length > 0) {
        if (hasAllTag(w.desaNames)) return "Desa: Seluruh Wilayah";
        return `Desa: ${formatList(w.desaNames, "Desa")}`;
    }
    if (w.kecamatanNames && w.kecamatanNames.length > 0) {
        if (hasAllTag(w.kecamatanNames)) return "Kecamatan: Seluruh Wilayah";
        return `Kecamatan: ${formatList(w.kecamatanNames, "Kecamatan")}`;
    }
    if (w.kabupatenNames && w.kabupatenNames.length > 0) {
        if (hasAllTag(w.kabupatenNames)) return "Kabupaten: Seluruh Wilayah";
        return `Kabupaten: ${formatList(w.kabupatenNames, "Kabupaten")}`;
    }
    if (w.provinsiNames && w.provinsiNames.length > 0) {
        if (hasAllTag(w.provinsiNames)) return "Provinsi: Seluruh Wilayah";
        return `Provinsi: ${formatList(w.provinsiNames, "Provinsi")}`;
    }

    return "3 Provinsi (Aceh, Sumut, Sumbar)";
});
</script>
