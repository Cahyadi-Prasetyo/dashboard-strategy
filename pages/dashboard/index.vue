
<template>
    <div class="h-full w-full">
        <!-- Loading State -->
        <div v-if="pending" class="flex items-center justify-center h-[calc(100vh-100px)]">
            <div class="flex flex-col items-center gap-4">
               <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
               <p class="text-gray-500 animate-pulse">Memuat Peta Kepri...</p>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="p-8">
            <UAlert color="error" variant="soft" title="Gagal Memuat Data" :description="error.message || 'Terjadi kesalahan saat memuat data peta'" />
        </div>

        <!-- Map Component -->
        <KepriMap v-else :data="mapData || []" />
    </div>
</template>

<script setup lang="ts">
import { useFetch } from '#app';
import KepriMap from '~/components/dashboard/KepriMap.vue';

definePageMeta({
  layout: 'dashboard'
});

// Fetch map data from our local API
const { data: mapData, pending, error } = await useFetch('/api/bps/map-data');
</script>
