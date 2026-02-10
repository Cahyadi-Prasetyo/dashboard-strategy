<template>
  <div class="space-y-8">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div v-if="pendingAgregat" class="flex items-center gap-4">
          <USkeleton class="h-14 w-14 rounded-xl" />
          <div class="space-y-2">
            <USkeleton class="h-4 w-24" /> <USkeleton class="h-8 w-32" />
          </div>
        </div>
        <div v-else class="flex items-center gap-4">
          <div class="p-3 bg-gray-100 rounded-xl text-gray-500">
            <UIcon name="i-heroicons-flag" class="w-8 h-8" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Target Keluarga</p>
            <h3 class="text-2xl font-bold text-gray-900">
              {{ formatNumber(summaryData.target) }}
            </h3>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div v-if="pendingAgregat" class="flex items-center gap-4">
          <USkeleton class="h-14 w-14 rounded-xl" />
          <div class="space-y-2">
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-8 w-24" />
          </div>
        </div>
        <div v-else class="flex items-center gap-4">
          <div class="p-3 bg-blue-50 rounded-xl text-blue-600">
            <UIcon
              name="i-heroicons-clipboard-document-check"
              class="w-8 h-8"
            />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">
              Realisasi (Approved)
            </p>
            <h3 class="text-2xl font-bold text-gray-900">
              {{ formatNumber(summaryData.realisasi) }}
            </h3>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div v-if="pendingAgregat" class="flex items-center gap-4">
          <USkeleton class="h-14 w-14 rounded-xl" />
          <div class="space-y-2 flex-1">
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-2/3" />
            <USkeleton class="h-2 w-full mt-2 rounded-full" />
          </div>
        </div>
        <div v-else class="flex items-center gap-4">
          <div class="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <UIcon name="i-heroicons-chart-bar" class="w-8 h-8" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-500">Progres Capaian</p>
            <div class="flex items-end gap-2 mb-2">
              <h3 class="text-3xl font-bold text-emerald-600">
                {{ summaryData.persentase }}%
              </h3>
              <span class="text-sm text-gray-400 mb-1.5">Selesai</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                class="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                :style="{ width: `${summaryData.persentase}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div class="mb-6">
          <h4 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <UIcon
              name="i-heroicons-document-text"
              class="text-gray-400 w-5 h-5"
            />
            Komposisi Status Dokumen
          </h4>
          <p class="text-xs text-gray-500 mt-1">
            Total akumulasi seluruh wilayah terpilih
          </p>
        </div>

        <div
          v-if="pendingAgregat"
          class="h-72 flex flex-col items-center justify-center gap-6"
        >
          <USkeleton class="h-48 w-48 rounded-full" />
          <div class="flex gap-4">
            <USkeleton class="h-3 w-16" />
            <USkeleton class="h-3 w-16" />
            <USkeleton class="h-3 w-16" />
          </div>
        </div>

        <ChartsPieChart
          v-else
          :data="chartStatusDokumen"
          series-name="Status"
          legend-position="bottom"
          inner-radius="40%"
          outer-radius="80%"
          :center="['50%', '45%']"
          height="h-72"
        />
      </div>

      <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div class="mb-6">
          <h4 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <UIcon
              name="i-heroicons-presentation-chart-bar"
              class="text-gray-400 w-5 h-5"
            />
            Status Progres per {{ levelLabel }}
          </h4>
          <p class="text-xs text-gray-500 mt-1">
            Breakdown jumlah dokumen berdasarkan status
          </p>
        </div>

        <div
          v-if="pendingWilayah"
          class="h-72 w-full px-4 flex flex-col justify-end gap-4 pb-4"
        >
          <div class="flex items-end gap-2 h-full">
            <USkeleton class="w-full h-[40%]" />
            <USkeleton class="w-full h-[70%]" />
            <USkeleton class="w-full h-[50%]" />
            <USkeleton class="w-full h-[80%]" />
            <USkeleton class="w-full h-[60%]" />
          </div>
          <USkeleton class="h-4 w-1/2 mx-auto" />
        </div>

        <ChartsBarChart
          v-else
          chartTitle=""
          source=""
          :categories="chartBarWilayah.categories"
          :series="chartBarWilayah.series"
          height="h-72"
          stacked
          :show-legend="true"
          legend-position="top"
        />
      </div>
    </div>

    <div>
      <ChartsDataTable
        :tableTitle="`Detail Data Keluarga per ${levelLabel}`"
        source="Sumber: Dashboard Monitoring BPS"
        enable-pagination
        :total-items="processedDataWilayah.length"
        :items-per-page="itemsPerPage"
        v-model="currentPage"
      >
        <template #header>
          <th
            v-if="showProvinsiColumn"
            class="px-6 py-4 text-left text-sm font-bold text-gray-900"
          >
            Provinsi
          </th>
          <th
            v-if="showKabupatenColumn"
            class="px-6 py-4 text-left text-sm font-bold text-gray-900"
          >
            Kabupaten
          </th>
          <th
            v-if="showKecamatanColumn"
            class="px-6 py-4 text-left text-sm font-bold text-gray-900"
          >
            Kecamatan
          </th>

          <th class="px-6 py-4 text-left text-sm font-bold text-gray-900">
            {{ levelLabel }}
          </th>
          <th
            class="px-4 py-4 text-center text-sm font-bold text-gray-900 bg-gray-50"
          >
            Target
          </th>
          <th class="px-4 py-4 text-center text-sm font-bold text-blue-600">
            Open
          </th>
          <th class="px-4 py-4 text-center text-sm font-bold text-gray-500">
            Draft
          </th>
          <th class="px-4 py-4 text-center text-sm font-bold text-orange-500">
            Submitted
          </th>
          <th class="px-4 py-4 text-center text-sm font-bold text-emerald-600">
            Approved
          </th>
          <th class="px-4 py-4 text-center text-sm font-bold text-red-500">
            Rejected
          </th>
          <th class="px-4 py-4 text-center text-sm font-bold text-gray-800">
            Revoked
          </th>
        </template>

        <template #body>
          <template v-if="pendingWilayah">
            <tr v-for="i in 5" :key="i" class="border-b border-gray-100">
              <td colspan="12" class="px-6 py-4">
                <div class="flex items-center gap-4">
                  <USkeleton class="h-4 w-[20%]" />
                  <USkeleton class="h-4 w-[10%]" />
                  <USkeleton class="h-4 w-[10%]" />
                  <USkeleton class="h-4 w-[10%]" />
                  <USkeleton class="h-4 w-[10%]" />
                  <USkeleton class="h-4 w-[10%]" />
                  <USkeleton class="h-4 w-[10%]" />
                </div>
              </td>
            </tr>
          </template>

          <template v-else>
            <tr
              v-for="(item, idx) in paginatedData"
              :key="idx"
              class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <td
                v-if="showProvinsiColumn"
                class="px-6 py-4 text-sm text-gray-600"
              >
                {{ item.provinsi }}
              </td>
              <td
                v-if="showKabupatenColumn"
                class="px-6 py-4 text-sm text-gray-600"
              >
                {{ item.kabupaten }}
              </td>
              <td
                v-if="showKecamatanColumn"
                class="px-6 py-4 text-sm text-gray-600"
              >
                {{ item.kecamatan }}
              </td>

              <td class="px-6 py-4 text-sm font-medium text-gray-900">
                {{ item.nama }}
              </td>

              <td
                class="px-4 py-4 text-center text-sm font-bold text-gray-900 bg-gray-50"
              >
                {{ formatNumber(item.target) }}
              </td>
              <td class="px-4 py-4 text-center text-sm text-gray-600">
                {{ formatNumber(item.open) }}
              </td>
              <td class="px-4 py-4 text-center text-sm text-gray-600">
                {{ formatNumber(item.draft) }}
              </td>
              <td class="px-4 py-4 text-center text-sm text-gray-600">
                {{ formatNumber(item.submitted) }}
              </td>
              <td
                class="px-4 py-4 text-center text-sm font-bold text-emerald-600"
              >
                {{ formatNumber(item.approved) }}
              </td>
              <td class="px-4 py-4 text-center text-sm text-red-600">
                {{ formatNumber(item.rejected) }}
              </td>
              <td class="px-4 py-4 text-center text-sm text-gray-600">
                {{ formatNumber(item.revoked) }}
              </td>
            </tr>
          </template>
        </template>
      </ChartsDataTable>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import ChartsPieChart from "~/components/charts/PieChart.vue";
import ChartsBarChart from "~/components/charts/BarChart.vue";
import ChartsDataTable from "~/components/charts/DataTable.vue";

const props = defineProps({
  regionIds: { type: Array, required: true, default: () => [] },
  tahun: { type: Number, default: 2026 },
});

const itemsPerPage = ref(10);
const currentPage = ref(1);
const formatNumber = (num) => new Intl.NumberFormat("id-ID").format(num);

const indicators = [
  "progres_keluarga_open",
  "progres_keluarga_draft",
  "progres_keluarga_submitted",
  "progres_keluarga_approved_pml",
  "progres_keluarga_rejected_pml",
  "progres_keluarga_revoked_pml",
];

// FETCH DATA
const { data: dataAgregat, pending: pendingAgregat } = await useFetch(
  "/api/data",
  {
    method: "POST",
    lazy: true,
    body: computed(() => ({
      regionIds: props.regionIds,
      indicatorIds: indicators,
      tahun: props.tahun,
    })),
    watch: [() => props.regionIds],
  }
);

const { data: dataWilayah, pending: pendingWilayah } = await useFetch(
  "/api/data-per-wilayah",
  {
    method: "POST",
    lazy: true,
    body: computed(() => ({
      regionIds: props.regionIds,
      indicatorIds: indicators,
      tahun: props.tahun,
    })),
    watch: [() => props.regionIds],
  }
);

// LOGIC SUMMARY
const getVal = (key) => {
  if (!dataAgregat.value) return 0;
  const item = dataAgregat.value.find((d) => d.id === key);
  return item ? Number(item.value) : 0;
};

const summaryData = computed(() => {
  const open = getVal("progres_keluarga_open");
  const draft = getVal("progres_keluarga_draft");
  const submitted = getVal("progres_keluarga_submitted");
  const approved = getVal("progres_keluarga_approved_pml");
  const rejected = getVal("progres_keluarga_rejected_pml");
  const revoked = getVal("progres_keluarga_revoked_pml");
  const target = open + draft + submitted + approved + rejected + revoked;
  const realisasi = approved;

  return {
    target,
    realisasi,
    persentase: target > 0 ? ((realisasi / target) * 100).toFixed(1) : "0.0",
  };
});

const chartStatusDokumen = computed(() => {
  return [
    { name: "Open", value: getVal("progres_keluarga_open"), color: "#3B82F6" },
    {
      name: "Draft",
      value: getVal("progres_keluarga_draft"),
      color: "#9CA3AF",
    },
    {
      name: "Submitted",
      value: getVal("progres_keluarga_submitted"),
      color: "#F59E0B",
    },
    {
      name: "Approved",
      value: getVal("progres_keluarga_approved_pml"),
      color: "#10B981",
    },
    {
      name: "Rejected",
      value: getVal("progres_keluarga_rejected_pml"),
      color: "#EF4444",
    },
    {
      name: "Revoked",
      value: getVal("progres_keluarga_revoked_pml"),
      color: "#1F2937",
    },
  ].filter((i) => i.value > 0);
});

// LOGIC WILAYAH & TABLE
const currentLevel = computed(
  () => dataWilayah.value?.[0]?.level || "provinsi"
);
const levelLabel = computed(() => {
  const map = {
    provinsi: "Provinsi",
    kabupaten: "Kabupaten",
    kecamatan: "Kecamatan",
    desa: "Desa",
  };
  return map[currentLevel.value] || "Wilayah";
});

const showProvinsiColumn = computed(() =>
  ["kabupaten", "kecamatan", "desa"].includes(currentLevel.value)
);
const showKabupatenColumn = computed(() =>
  ["kecamatan", "desa"].includes(currentLevel.value)
);
const showKecamatanColumn = computed(() => currentLevel.value === "desa");

const processedDataWilayah = computed(() => {
  if (!dataWilayah.value) return [];
  return dataWilayah.value.map((w) => {
    const open = w.progres_keluarga_open || 0;
    const draft = w.progres_keluarga_draft || 0;
    const submitted = w.progres_keluarga_submitted || 0;
    const approved = w.progres_keluarga_approved_pml || 0;
    const rejected = w.progres_keluarga_rejected_pml || 0;
    const revoked = w.progres_keluarga_revoked_pml || 0;
    const target = open + draft + submitted + approved + rejected + revoked;

    return {
      nama: w.nama,
      provinsi: w.provinsi,
      kabupaten: w.kabupaten,
      kecamatan: w.kecamatan,
      open,
      draft,
      submitted,
      approved,
      rejected,
      revoked,
      target,
      realisasi: approved,
    };
  });
});

const chartBarWilayah = computed(() => {
  const data = processedDataWilayah.value;
  const categories = data.map((i) => i.nama);
  return {
    categories,
    series: [
      { name: "Open", data: data.map((i) => i.open), color: "#3B82F6" },
      { name: "Draft", data: data.map((i) => i.draft), color: "#9CA3AF" },
      {
        name: "Submitted",
        data: data.map((i) => i.submitted),
        color: "#F59E0B",
      },
      { name: "Approved", data: data.map((i) => i.approved), color: "#10B981" },
      { name: "Rejected", data: data.map((i) => i.rejected), color: "#EF4444" },
      { name: "Revoked", data: data.map((i) => i.revoked), color: "#1F2937" },
    ],
  };
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return processedDataWilayah.value.slice(start, start + itemsPerPage.value);
});

watch(
  () => props.regionIds,
  () => {
    currentPage.value = 1;
  }
);
</script>
