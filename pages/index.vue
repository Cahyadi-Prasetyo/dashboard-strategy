<template>
  <div class="flex flex-col h-full w-full bg-gray-50 font-sans">
    <main class="flex-1 relative overflow-hidden">
      <VisualisasiMap
        v-model:activeTab="activeTab"
        :enabled-tab-ids="['spatial']"
        :wilayah-pendataan="wilayahPendataan"
        :wilayah-insight="wilayahInsight"
        :wilayah-spatial="wilayahSpatial"
      />
    </main>

    <!-- <MapStickyInfo v-if="activeTab === 'spatial'" :wilayah="wilayahSpatial" /> -->
    <BackToTop />
  </div>
</template>

<script setup>
import { DEFAULT_PROVINCE_IDS } from "~/constants/region-config";
import { ref, onMounted, nextTick } from "vue";

useHead({ title: "Peta Tematik Fullscreen" });
definePageMeta({ layout: "peta" }); // Pastikan layout handle navbar

const activeTab = ref("spatial");
// Data wilayah tetap sama
const wilayahPendataan = ref({
  provinsi: [],
  kabupaten: [],
  kecamatan: [],
  desa: [],
});
const wilayahInsight = ref({
  provinsi: [],
  kabupaten: [],
  kecamatan: [],
  desa: [],
});
const wilayahSpatial = ref({
  provinsi: [],
  kabupaten: [],
  kecamatan: [],
  desa: [],
});

onMounted(async () => {
  await nextTick();
  // Mock Data Wilayah (Sesuai kode lama)
  wilayahSpatial.value.provinsi = DEFAULT_PROVINCE_IDS;
});
</script>
