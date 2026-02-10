<template>
  <div
    class="relative bg-white border border-gray-200 rounded-xl shadow-sm p-5 pt-7 mt-4"
  >
    <div
      class="absolute -top-4 left-0 right-0 px-4 flex flex-wrap items-center justify-between gap-2 z-20"
    >
      <div class="flex flex-wrap items-center gap-2">
        <div
          class="flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-lg border border-blue-100 shadow-sm whitespace-nowrap"
        >
          <UIcon
            name="i-heroicons-building-office-2"
            class="w-4 h-4 text-amber-400"
          />
          <span
            class="text-[10px] font-black text-amber-700 uppercase tracking-wider"
          >
            Fasilitas Pendidikan
          </span>
        </div>

        <div
          class="flex items-center gap-1.5 bg-white/90 backdrop-blur px-2 py-1 rounded-lg border border-gray-200 shadow-sm"
        >
          <UBadge color="primary" variant="subtle" size="xs">
            Periode Pra-Bencana: {{ chartData?.pendidikan?.periode || "2025" }}
          </UBadge>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          @click="isDetailOpen = true"
          icon="i-heroicons-table-cells"
          size="md"
          color="gray"
          variant="solid"
          class="font-bold shadow-md text-white bg-gray-900 hover:bg-gray-800"
          :ui="{
            rounded: 'rounded-lg',
            padding: { md: 'px-4 py-2.5' },
            font: 'font-bold',
            icon: { size: { md: 'w-5 h-5' } },
          }"
        >
          Lihat Detail Tabel
        </UButton>
        
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <StatCard
            v-if="loading"
            label="Jumlah Sekolah"
            color="amber"
            icon="i-heroicons-academic-cap"
            :isRound="true"
          >
            <template #default>
              <div
                class="flex items-center gap-2 bg-slate-50/50 p-2 rounded-lg border border-slate-100 overflow-hidden"
              >
                <div class="px-1 flex-1 min-w-0">
                  <span
                    class="text-[9px] uppercase font-semibold text-slate-500 block mb-1 truncate"
                  >
                    Pra (PODES)
                  </span>
                  <div class="flex items-baseline gap-1">
                    <USkeleton class="h-6 w-16 bg-slate-200" />
                    <span class="text-[9px] text-slate-500 font-bold uppercase"
                      >Unit</span
                    >
                  </div>
                </div>

                <div class="h-8 w-px bg-slate-200 shrink-0"></div>

                <div class="px-1 flex-1 min-w-0">
                  <span
                    class="text-[9px] uppercase font-semibold text-orange-500 block mb-1 truncate"
                  >
                    Terdampak (KEMENDIKDASMEN)
                  </span>
                  <div class="flex items-baseline gap-1">
                    <USkeleton class="h-6 w-16 bg-orange-100" />
                    <span class="text-[9px] text-orange-500 font-bold uppercase"
                      >Unit</span
                    >
                  </div>
                </div>
              </div>
            </template>
          </StatCard>
          <StatCard
            v-else
            label="Jumlah Sekolah"
            color="amber"
            icon="i-heroicons-academic-cap"
            :isRound="true"
          >
            <template #default>
              <div
                class="flex items-center gap-2 bg-slate-50/50 p-2 rounded-lg border border-slate-100 overflow-hidden"
              >
                <div class="px-1 flex-1 min-w-0">
                  <span
                    class="text-[9px] uppercase font-semibold text-slate-500 block mb-1 truncate"
                  >
                    Pra (PODES)
                  </span>
                  <div class="flex items-baseline gap-1">
                    <span class="text-xl font-black text-slate-600 truncate">
                      {{
                        datapra.pendidikan?.total == null
                          ? "N/A"
                          : formatNumber(datapra.pendidikan?.total)
                      }}
                    </span>
                    <span class="text-[9px] text-slate-500 font-bold uppercase"
                      >Unit</span
                    >
                  </div>
                </div>

                <div class="h-8 w-px bg-slate-200 shrink-0"></div>

                <div class="px-1 flex-1 min-w-0">
                  <span
                    class="text-[9px] uppercase font-semibold text-orange-500 block mb-1 truncate"
                    title="Terdampak (KEMENDIKDASMEN)"
                  >
                    Terdampak (KEMENDIKDASMEN)
                  </span>
                  <div class="flex items-baseline gap-1">
                    <span class="text-xl font-black text-orange-600 truncate">
                      {{
                        totalKemendikdasmen == null
                          ? "N/A"
                          : formatNumber(totalKemendikdasmen)
                      }}
                    </span>
                    <span class="text-[9px] text-orange-500 font-bold uppercase"
                      >Unit</span
                    >
                  </div>
                </div>
              </div>
            </template>
          </StatCard>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            v-if="loading"
            label="Fasilitas Pendidikan Negeri"
            color="amber"
            icon="i-heroicons-academic-cap"
            :isRound="true"
          >
            <template #default>
              <div
                class="flex items-center gap-4 bg-slate-50/50 p-2 rounded-lg border border-slate-100"
              >
                <div class="flex-1 px-2">
                  <span
                    class="text-[9px] uppercase font-semibold text-slate-500 block mb-1"
                    >Pra (PODES)</span
                  >
                  <div class="flex items-baseline gap-1">
                    <USkeleton class="h-8 w-24 bg-slate-200" />
                    <span class="text-[10px] text-slate-500 font-bold uppercase"
                      >Unit</span
                    >
                  </div>
                </div>
              </div>
            </template>
          </StatCard>
          <StatCard
            v-else
            label="Fasilitas Pendidikan Negeri"
            color="amber"
            icon="i-heroicons-academic-cap"
            :isRound="true"
          >
            <template #default>
              <div
                class="flex items-center gap-4 bg-slate-50/50 p-2 rounded-lg border border-slate-100"
              >
                <div class="flex-1 px-2">
                  <span
                    class="text-[9px] uppercase font-semibold text-slate-500 block mb-1"
                    >Pra (PODES)</span
                  >
                  <div class="flex items-baseline gap-1">
                    <span class="text-2xl font-black text-slate-600">{{
                      datapra.pendidikanNegeri?.total == null
                        ? "N/A"
                        : formatNumber(datapra.pendidikanNegeri?.total)
                    }}</span>
                    <span class="text-[10px] text-slate-500 font-bold uppercase"
                      >Unit</span
                    >
                  </div>
                </div>
              </div>
            </template>
          </StatCard>

          <StatCard
            v-if="loading"
            label="Fasilitas Pendidikan Swasta"
            color="blue"
            icon="i-heroicons-building-library"
            :isRound="true"
          >
            <template #default>
              <div
                class="flex items-center gap-4 bg-slate-50/50 p-2 rounded-lg border border-slate-100"
              >
                <div class="flex-1 px-2">
                  <span
                    class="text-[9px] uppercase font-semibold text-slate-500 block mb-1"
                    >Pra (PODES)</span
                  >
                  <div class="flex items-baseline gap-1">
                    <USkeleton class="h-8 w-24 bg-slate-200" />
                    <span class="text-[10px] text-slate-500 font-bold uppercase"
                      >Unit</span
                    >
                  </div>
                </div>
              </div>
            </template>
          </StatCard>
          <StatCard
            v-else
            label="Fasilitas Pendidikan Swasta"
            color="blue"
            icon="i-heroicons-building-library"
            :isRound="true"
          >
            <template #default>
              <div
                class="flex items-center gap-4 bg-slate-50/50 p-2 rounded-lg border border-slate-100"
              >
                <div class="flex-1 px-2">
                  <span
                    class="text-[9px] uppercase font-semibold text-slate-500 block mb-1"
                    >Pra (PODES)</span
                  >
                  <div class="flex items-baseline gap-1">
                    <span class="text-2xl font-black text-slate-600">{{
                      datapra.pendidikanSwasta?.total == null
                        ? "N/A"
                        : formatNumber(datapra.pendidikanSwasta?.total)
                    }}</span>
                    <span class="text-[10px] text-slate-500 font-bold uppercase"
                      >Unit</span
                    >
                  </div>
                </div>
              </div>
            </template>
          </StatCard>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ChartSekolahTerdampakBNPB
          :chart-data="chartData"
          :dataset-info="chartData.datasetInfoBNPB"
        />
        <ChartSekolahTerdampakKemendikdasmen
          :chart-data="chartData"
          :dataset-info="chartData.datasetInfoKemendikdasmen"
        />
      </div>
    </div>

    <!-- <div
            class="mt-4 flex flex-col md:flex-row items-center justify-between text-[10px] text-gray-400 border-t border-gray-100 pt-3 px-2 gap-3"
        >
            <div class="flex items-center gap-2">
                <div
                    class="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-bold uppercase tracking-wider text-[9px]"
                >
                    <UIcon name="i-heroicons-clock" class="w-3 h-3" />
                    Periode Pra-Bencana:
                    {{ chartData?.pendidikan?.periode || "2025" }}
                </div>
            </div>
        </div> -->
  </div>

  <Teleport to="body">
    <SharedDetailModal
      :is-open="isDetailOpen"
      title="Detail Sekolah Terdampak"
      :region-ids="selectedWilayah"
      :tahun="2026"
      :dataset-id="116"
      :column-config="[
        { key: 'PAUD', label: 'PAUD' },
        { key: 'SD', label: 'SD' },
        { key: 'SMP', label: 'SMP' },
        { key: 'SMA', label: 'SMA' },
        { key: 'SMK', label: 'SMK' },
        { key: 'SLB', label: 'SLB' },
        { key: 'Total', label: 'Total' },
      ]"
      pivot-field="itemCategory1"
      @close="isDetailOpen = false"
    />
  </Teleport>
</template>

<script setup>
import StatCard from "~/components/shared/StatCard.vue";
import ChartSekolahTerdampakBNPB from "~/components/sosial/ChartSekolahTerdampakBNPB.vue";
// Import the new component
import ChartSekolahTerdampakKemendikdasmen from "~/components/sosial/ChartSekolahTerdampakKemendikdasmen.vue";

const props = defineProps({
  selectedWilayah: { type: Object, required: true },
  chartData: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
  availablePeriods: { type: Array, default: () => [] },
});

const viewMode = ref("focus");
const emit = defineEmits(["update:viewMode", "update:focusedMap"]);

const handleAutoFokus = (mapType) => {
  emit("update:viewMode", "focus");
  emit("update:focusedMap", mapType);
};

const manualSwitchMap = (targetMap) => {
  emit("update:focusedMap", targetMap);
};

const getLayoutClass = (mapType) => {
  if (props.viewMode === "split") {
    return mapType === "pra" ? "left-0 w-1/2" : "left-1/2 w-1/2";
  }
  const isTarget = props.focusedMap === mapType;
  if (isTarget) {
    return "left-0 w-full z-20";
  } else {
    return mapType === "pra" ? "-left-full w-full" : "left-full w-full";
  }
};

watch(
  () => props.viewMode,
  () => {
    setTimeout(() => window.dispatchEvent(new Event("resize")), 550);
  },
);
const isDetailOpen = ref(false);
const isMapOpen = ref(false);

const formatNumber = (value) => {
  if (value == null) return "-";
  return new Intl.NumberFormat("id-ID").format(value);
};

// --- Computed Data: Pra (PODES) ---
const listNegeri = [
  "Jumlah TK Negeri",
  "Jumlah RA/BA Negeri",
  "Jumlah SD Negeri",
  "Jumlah MI Negeri",
  "Jumlah SMP Negeri",
  "Jumlah MTs Negeri",
  "Jumlah SMA Negeri",
  "Jumlah MA Negeri",
  "Jumlah SMK Negeri",
  "Jumlah Akademi/Perguruan Tinggi Negeri",
];
const listSwasta = [
  "Jumlah TK Swasta",
  "Jumlah RA/BA Swasta",
  "Jumlah SD Swasta",
  "Jumlah MI Swasta",
  "Jumlah SMP Swasta",
  "Jumlah MTs Swasta",
  "Jumlah SMA Swasta",
  "Jumlah MA Swasta",
  "Jumlah SMK Swasta",
  "Jumlah Akademi/Perguruan Tinggi Swasta",
];

const datapra = computed(() => {
  const result = {
    pendidikan: { total: null, periode: "2025" },
    pendidikanNegeri: { total: null, periode: "2025" },
    pendidikanSwasta: { total: null, periode: "2025" },
  };
  if (!props.chartData || !props.chartData.pendidikan) return result;

  const rawData = props.chartData.pendidikan.pra || [];
  const totalNegeri = rawData
    .filter((item) => listNegeri.includes(item.indikator?.nama))
    .reduce((acc, curr) => acc + (curr.value || 0), 0);
  const totalSwasta = rawData
    .filter((item) => listSwasta.includes(item.indikator?.nama))
    .reduce((acc, curr) => acc + (curr.value || 0), 0);

  result.pendidikanNegeri.total = totalNegeri || null;
  result.pendidikanSwasta.total = totalSwasta || null;
  result.pendidikan.total = totalNegeri + totalSwasta || null;
  return result;
});

const totalKemendikdasmen = computed(() => {
  // 1. Get the raw data
  const raw = props.chartData.pendidikan?.kemendikdasmen || [];
  if (!raw || raw.length === 0) return null;

  // 2. Group by District (Kabupaten) Unique Code
  // We use a composite key (ProvCode-KabCode) to avoid any collision
  const groupedData = {};

  raw.forEach((r) => {
    // Handle potential null values for Province level data
    const provCode = r.kd_prov?.kode || "00";
    const kabCode = r.kd_kab?.kode || "00";
    const key = `${provCode}-${kabCode}`;

    if (!groupedData[key]) groupedData[key] = [];
    groupedData[key].push(r);
  });

  // 3. Sum up the values
  let grandTotal = 0;

  Object.values(groupedData).forEach((regionRows) => {
    // A. Priority: Find the explicit "Total" row for this region
    // We use .trim() and .toLowerCase() to be very safe against API inconsistencies
    const totalRow = regionRows.find((r) => {
      const kode = r.itemCategory1?.kode
        ? String(r.itemCategory1.kode).trim().toLowerCase()
        : "";
      const nama = r.itemCategory1?.nama
        ? String(r.itemCategory1.nama).trim().toLowerCase()
        : "";
      return kode === "total" || nama.includes("seluruh jenjang");
    });

    if (totalRow) {
      // Use the API's pre-calculated total for this region
      grandTotal += Number(totalRow.value) || 0;
    } else {
      // B. Fallback: Sum the components (SD, SMP, etc.) for this region
      const regionSum = regionRows.reduce((acc, curr) => {
        // Ensure we don't double count if a "Total" row exists but wasn't caught by the filter above
        const k = curr.itemCategory1?.kode
          ? String(curr.itemCategory1.kode).toLowerCase()
          : "";
        if (k === "total") return acc;

        return acc + (Number(curr.value) || 0);
      }, 0);
      grandTotal += regionSum;
    }
  });

  return grandTotal;
});

// --- Table Logic ---
const itemsPerPage = ref(10);
const currentPage = ref(1);

const pivotTableRows = computed(() => {
  const records = props.chartData.pendidikan?.pra || [];
  const w = props.selectedWilayah;
  const groups = {};

  const getStatus = (rawName) => {
    if (!rawName) return null;
    const n = rawName.toLowerCase();
    if (listNegeri.some((s) => s.toLowerCase() === n)) return "negeri";
    if (listSwasta.some((s) => s.toLowerCase() === n)) return "swasta";
    return null;
  };

  let level = "provinsi";
  if (w.kabupaten?.length > 0) level = "kabupaten";
  else if (w.provinsi?.length > 0) level = "kabupaten";

  records.forEach((r) => {
    const pName = r.kd_prov?.nama ?? r.provinsi?.nama ?? r.provinsi_nama ?? "-";
    const kName =
      r.kd_kab?.nama ?? r.kabupaten?.nama ?? r.kabupaten_nama ?? "-";
    const pCode = r.kd_prov?.kode ?? r.id_prov ?? "XX";
    const kCode = r.kd_kab?.kode ?? r.id_kab ?? "XX";

    let key = level === "provinsi" ? `P-${pCode}` : `K-${pCode}-${kCode}`;

    if (!groups[key]) {
      groups[key] = {
        provinsi: pName,
        kabupaten: level !== "provinsi" ? kName : "-",
        negeri_total: 0,
        swasta_total: 0,
        total: 0,
      };
    }

    const indName = r.indikator?.nama || "";
    const status = getStatus(indName);
    if (status) {
      const val = Number(r.value) || 0;
      groups[key].total += val;
      if (status === "negeri") groups[key].negeri_total += val;
      else groups[key].swasta_total += val;
    }
  });

  let result = Object.values(groups);
  if (level === "provinsi" && (!w.provinsi || w.provinsi.length === 0)) {
    const target = ["ACEH", "SUMATERA UTARA", "SUMATERA BARAT"];
    result = result.filter((g) => target.includes(g.provinsi.toUpperCase()));
  }

  return result.sort(
    (a, b) =>
      a.provinsi.localeCompare(b.provinsi) ||
      a.kabupaten.localeCompare(b.kabupaten),
  );
});

const grandTotal = computed(() => {
  return pivotTableRows.value.reduce(
    (acc, row) => {
      acc.negeri += row.negeri_total || 0;
      acc.swasta += row.swasta_total || 0;
      acc.total += row.total || 0;
      return acc;
    },
    { negeri: 0, swasta: 0, total: 0 },
  );
});

const totalPages = computed(() =>
  Math.ceil(pivotTableRows.value.length / itemsPerPage.value),
);

const displayedPages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push("...");
      pages.push(total);
    } else if (current >= total - 2) {
      pages.push(1);
      pages.push("...");
      for (let i = total - 3; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push("...");
      pages.push(total);
    }
  }
  return pages;
});

const paginatedTableRows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return pivotTableRows.value.slice(start, start + itemsPerPage.value);
});

const startItem = computed(
  () => (currentPage.value - 1) * itemsPerPage.value + 1,
);

const endItem = computed(() =>
  Math.min(currentPage.value * itemsPerPage.value, pivotTableRows.value.length),
);

const changePage = (p) => {
  if (p >= 1 && p <= totalPages.value) currentPage.value = p;
};
</script>
