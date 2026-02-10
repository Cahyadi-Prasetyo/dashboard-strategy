<template>
    <div class="space-y-6">
        <!-- Section Pos & Telekomunikasi -->
        <PosTelekomunikasiSubsection :selected-wilayah="selectedWilayah" />
    </div>
</template>

<script setup>
import PosTelekomunikasiSubsection from '~/components/infrastruktur/PosTelekomunikasiSubsection.vue';

const props = defineProps({
    selectedWilayah: {
        type: Object,
        required: true,
        default: () => ({ provinsi: [], kabupaten: [] }),
    },
});
</script>