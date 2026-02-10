<template>
  <div class="flex flex-col gap-6 h-full pb-10">
    <!-- Table SK -->
    <!-- <div class="flex-none scroll-mt-24">
            <PerumahanpermukimanKeluargaPenerimaBantuan
                :selected-wilayah="selectedWilayah"
                :chart-data="chartData"
                :loading="loading"
                :available-periods="availablePeriods"
            />
        </div> -->

    <!-- Chart 0: Status Tempat Tinggal -->
    <div class="flex-none scroll-mt-24">
      <PenerimaBantuanR3pChart :region-ids="regionIds" :tahun="tahun" />
    </div>

    <!-- Chart 1: Status Tempat Tinggal -->
    <div class="flex-none scroll-mt-24">
      <PenerimaBantuanKondisiBangunanChart
        :region-ids="regionIds"
        :tahun="tahun"
      />
    </div>

    <!-- Chart 2: Kondisi Lantai Rumah -->
    <div class="flex-none scroll-mt-24">
      <PenerimaBantuanKondisiLantaiChart
        :region-ids="regionIds"
        :tahun="tahun"
      />
    </div>

    <!-- Chart 3: Kondisi Dinding Rumah -->
    <div class="flex-none scroll-mt-24">
      <PenerimaBantuanKondisiDindingChart
        :region-ids="regionIds"
        :tahun="tahun"
      />
    </div>

    <!-- Chart 4: Kondisi Atap Rumah -->
    <div class="flex-none scroll-mt-24">
      <PenerimaBantuanKondisiAtapChart :region-ids="regionIds" :tahun="tahun" />
    </div>

    <!-- Chart 6: Fasilitas Bab -->
    <div class="flex-none scroll-mt-24">
      <PenerimaBantuanFasilitasBabChart
        :region-ids="regionIds"
        :tahun="tahun"
      />
    </div>

    <!-- Chart 7: Sumber Air Minum -->
    <div class="flex-none scroll-mt-24">
      <PenerimaBantuanSumberAirMinumChart
        :region-ids="regionIds"
        :tahun="tahun"
      />
    </div>

    <!-- Chart 8: Sumber Utama Penerangan -->
    <div class="flex-none scroll-mt-24">
      <PenerimaBantuanSumberUtamaPeneranganChart
        :region-ids="regionIds"
        :tahun="tahun"
      />
    </div>

    <!-- Chart 9: Kepemilikan Aset -->
    <div class="flex-none scroll-mt-24">
      <PenerimaBantuanKepemilikanAsetChart
        :region-ids="regionIds"
        :tahun="tahun"
      />
    </div>

    <!-- Chart 10: Keaktifan Sekolah -->
    <div class="flex-none scroll-mt-24">
      <PenerimaBantuanKeaktifanSekolah :region-ids="regionIds" :tahun="tahun" />
    </div>
    <!-- Chart 2: Kondisi Lantai Rumah -->
    <div class="flex-none scroll-mt-24">
      <PenerimaBantuanKondisiLantaiChart
        :region-ids="regionIds"
        :tahun="tahun"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  regionIds: { type: Array, required: true, default: () => [] },
  tahun: { type: Number, default: 2026 },

  selectedWilayah: { type: Object, default: () => ({}) },
  chartData: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  availablePeriods: { type: Array, default: () => [] },
});
</script>
