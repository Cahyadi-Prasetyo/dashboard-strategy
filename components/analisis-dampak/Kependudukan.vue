<template>
    <div>
        <div class="space-y-16">
            <div class="flex flex-col gap-8">
                
                <section class="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div class="p-8">
                        <div class="mb-6">
                            <div class="flex items-center gap-3">
                                <div class="h-8 w-1.5 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
                                <h3 class="text-2xl font-bold text-gray-900">Statistik Dampak Bencana</h3>
                            </div>
                            <div class="ml-5 mt-2 flex flex-col gap-1">
                                <div class="flex items-start gap-2 text-sm text-gray-600">
                                    <UIcon name="i-heroicons-map-pin" class="w-4 h-4 mt-0.5 text-amber-500" />
                                    <p>Wilayah terpilih: <span class="font-bold text-gray-900 border-b-2 border-amber-100">{{ formattedLocation }}</span></p>
                                </div>
                            </div>
                        </div>

                        <SummaryDampakBencana
                            :region-ids="regionIds"
                            :tahun="2026"
                            :formatted-location="formattedLocation"
                        />
                    </div>
                </section>
            </div>
        </div>
        <BackToTop />
    </div>
</template>

<script setup>
definePageMeta({
    keepalive: {
        max: 10,
    },
});

import {computed } from "vue";

// Props WILAYAH (Model Value dari FilterWilayah)
const props = defineProps({
    selectedWilayah: {
        type: Object,
        default: () => ({
            provinsi: [],
            kabupaten: [],
            kecamatan: [],
            desa: [],
        }),
    },
    tahun: { type: Number },
});

// --- LOGIKA UTAMA: GET REGION ID ---
const regionIds = computed(() => {
    const w = props.selectedWilayah;

    if (w.desa && w.desa.length > 0) return w.desa;
    if (w.kecamatan && w.kecamatan.length > 0) return w.kecamatan;
    if (w.kabupaten && w.kabupaten.length > 0) return w.kabupaten;
    if (w.provinsi && w.provinsi.length > 0) return w.provinsi;

    // Default: Semua Provinsi (11, 12, 13)
    return ["11", "12", "13"];
});

// --- FORMATTED LOCATION (LABEL) ---
const formattedLocation = computed(() => {
    const w = props.selectedWilayah;

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

watch(
    () => props.selectedWilayah,
    { immediate: true, deep: true }
);
</script>
