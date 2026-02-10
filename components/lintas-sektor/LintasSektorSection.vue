<template>
    <div class="flex flex-col gap-3">
        <SummaryLintasSektor :region-ids="regionIds" :tahun="tahun" />
        <div class="grid grid-cols-1 lg:grid-cols-1 gap-3">
            <div class="h-full">
                <InfrastrukturStatusChart :selected-wilayah="selectedWilayah" />
            </div>

            <div class="h-full">
                <KerusakanKerugianSection :selected-wilayah="selectedWilayah" />
            </div>

            <div class="h-full">
                <KerusakanHunianChart :selected-wilayah="selectedWilayah" />
            </div>

            <div class="h-full">
                <FasilitasKelautanTerdampakSection :selected-wilayah="selectedWilayah" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";
import InfrastrukturStatusChart from "~/components/lintas-sektor/InfrastrukturStatusChart.vue";
import KerusakanHunianChart from "~/components/lintas-sektor/KerusakanHunianChart.vue";
import FasilitasKelautanTerdampakSection from "~/components/lintas-sektor/FasilitasKelautanTerdampakSection.vue";
import SummaryLintasSektor from "~/components/lintas-sektor/SummaryLintasSektor.vue";
import KerusakanKerugianSection from "~/components/lintas-sektor/KerusakanKerugianSection.vue";

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
    tahun: { type: Number, default: 2026 },
});

// --- LOGIKA UTAMA: GET REGION ID ---
const regionIds = computed(() => {
    const w = props.selectedWilayah;
    const { provinsi, kabupaten, kecamatan, desa } = w;

    if (desa?.length > 0) return desa;
    if (kecamatan?.length > 0) return kecamatan;
    if (kabupaten?.length > 0) return kabupaten;
    if (provinsi?.length > 0) return provinsi;

    // Default: Semua Provinsi (11, 12, 13)
    return ["11", "12", "13"];
});
</script>
