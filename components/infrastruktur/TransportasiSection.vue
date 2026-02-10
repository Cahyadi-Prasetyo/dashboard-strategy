<template>
    <div class="space-y-6">
        <!-- Section Jalan -->
        <JalanSubsection :selected-wilayah="selectedWilayah" />
        
        <!-- Section Jembatan -->
        <JembatanSubsection :selected-wilayah="selectedWilayah" />
    </div>
</template>

<script setup>
import JalanSubsection from '~/components/infrastruktur/JalanSubsection.vue';
import JembatanSubsection from '~/components/infrastruktur/JembatanSubsection.vue';

const props = defineProps({
    selectedWilayah: {
        type: Object,
        required: true,
        default: () => ({ provinsi: [], kabupaten: [] }),
    },
});
</script>