<template>
  <div class="relative w-full">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-4">
      <div
        class="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-300"
      ></div>
    </div>

    <!-- Content -->
    <template v-else-if="groupedSlides.length > 0">
      <!-- Navigation Buttons - tampil jika carousel mode (2 provinsi atau 3+ provinsi) -->
      <button
        v-if="isCarouselMode && groupedSlides.length > 1"
        @click="previousSlide"
        class="absolute left-1 top-1/2 -translate-y-1/2 z-20 text-white/40 hover:text-white transition-colors"
      >
        <UIcon name="i-heroicons-chevron-left-20-solid" class="w-5 h-5" />
      </button>

      <button
        v-if="isCarouselMode && groupedSlides.length > 1"
        @click="nextSlide"
        class="absolute right-1 top-1/2 -translate-y-1/2 z-20 text-white/40 hover:text-white transition-colors"
      >
        <UIcon name="i-heroicons-chevron-right-20-solid" class="w-5 h-5" />
      </button>

      <!-- Container -->
      <div class="overflow-hidden px-6">
        <!-- Mode: 1 atau 2 Provinsi - Horizontal Layout (No Scroll) -->
        <div v-if="selectedProvinceCount === 1 || selectedProvinceCount === 2">
          <div
            v-if="selectedProvinceCount === 2"
            class="transition-transform duration-500 ease-in-out"
            :style="{
              transform: `translateX(-${currentIndex * 100}%)`,
            }"
          >
            <div class="flex">
              <div
                v-for="(slideGroup, groupIdx) in groupedSlides"
                :key="groupIdx"
                class="w-full flex-shrink-0 py-1"
              >
                <!-- Province Title -->
                <div class="text-center mb-1">
                  <h3
                    class="text-xs font-bold text-amber-300/90 uppercase tracking-wider"
                  >
                    {{ slideGroup[0]?.provinces[0]?.name }}
                  </h3>
                </div>

                <!-- Cards Container -->
                <div class="flex justify-center gap-2 flex-wrap">
                  <div
                    v-for="(slide, idx) in slideGroup"
                    :key="idx"
                    class="flex-shrink-0"
                  >
                    <div
                      class="relative bg-white/10 backdrop-blur-md rounded-md p-3 border border-white/20 hover:border-amber-400/50 transition-all duration-300 overflow-hidden shadow-sm flex items-center gap-2"
                      style="width: 240px; height: 80px"
                    >
                      <div
                        :class="`p-1 rounded bg-opacity-20 ${slide.iconBgClass}`"
                      >
                        <UIcon
                          :name="slide.icon"
                          :class="`w-5 h-5 ${slide.iconColorClass}`"
                        />
                      </div>

                      <div class="flex-1 min-w-0 flex flex-col justify-center">
                        <h4
                          class="text-[10px] font-bold text-white/70 leading-tight uppercase mb-1"
                        >
                          {{ slide.indicatorName }}
                        </h4>

                        <div class="flex items-baseline gap-1">
                          <span
                            class="text-2xl font-black text-white leading-none tracking-tight"
                          >
                            {{
                              formatNumber(
                                slide.provinces[0].value,
                                slide.useDecimal,
                              )
                            }}
                          </span>
                          <span
                            class="text-md font-bold text-amber-400 uppercase leading-none"
                          >
                            {{ formatSatuan(slide.satuan) }}
                          </span>
                        </div>
                        <div
                          class="flex items-center justify-between gap-2 mt-1"
                        >
                          <p
                            v-if="slide.sumber"
                            class="text-[9px] text-white/70 leading-tight"
                          >
                            SUMBER: {{ slide.sumber }}
                          </p>
                          <p
                            v-if="slide.lastUpdate"
                            class="text-[9px] text-white/70 leading-tight"
                          >
                            UPDATE: {{ formatLastUpdate(slide.lastUpdate) }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Single Province (No Carousel) -->
          <div v-else class="flex justify-center gap-2.5 flex-wrap">
            <div v-for="(slide, idx) in groupedSlides[0]" :key="idx">
              <div class="relative group my-2">
                <!-- Card -->
                <div
                  class="relative bg-white/10 backdrop-blur-md rounded-md p-3 border border-white/20 hover:border-amber-400/50 transition-all duration-300 overflow-hidden shadow-sm flex items-center gap-2"
                  style="width: 240px; height: 80px"
                >
                  <div
                    :class="`p-1 rounded bg-opacity-20 ${slide.iconBgClass}`"
                  >
                    <UIcon
                      :name="slide.icon"
                      :class="`w-5 h-5 ${slide.iconColorClass}`"
                    />
                  </div>

                  <div class="flex-1 min-w-0 flex flex-col justify-center">
                    <h4
                      class="text-[10px] font-bold text-white/70 leading-none uppercase mb-1"
                    >
                      {{ slide.indicatorName }}
                    </h4>

                    <div class="flex items-baseline gap-1">
                      <span
                        class="text-2xl font-black text-white leading-none tracking-tight"
                      >
                        {{
                          formatNumber(
                            slide.provinces[0].value,
                            slide.useDecimal,
                          )
                        }}
                      </span>
                      <span
                        class="text-md font-bold text-amber-400 uppercase leading-none"
                      >
                        {{ formatSatuan(slide.satuan) }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between gap-2 mt-1">
                      <p
                        v-if="slide.sumber"
                        class="text-[9px] text-white/70 leading-tight"
                      >
                        SUMBER: {{ slide.sumber }}
                      </p>
                      <p
                        v-if="slide.lastUpdate"
                        class="text-[9px] text-white/70 leading-tight"
                      >
                        UPDATE: {{ formatLastUpdate(slide.lastUpdate) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mode: 0 atau 3+ Provinsi - Grid Carousel -->
        <div
          v-else
          class="transition-transform duration-700 ease-in-out"
          :style="{
            transform: `translateX(-${currentIndex * 100}%)`,
          }"
        >
          <div class="flex">
            <div
              v-for="(slideGroup, groupIdx) in groupedSlides"
              :key="groupIdx"
              class="w-full flex-shrink-0"
            >
              <!-- Cards Grid - Centered -->
              <div class="flex justify-center">
                <div
                  class="inline-grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
                >
                  <div v-for="(slide, slideIdx) in slideGroup" :key="slideIdx">
                    <div class="relative group">
                      <!-- Province Name Header -->
                      <div class="mb-2 px-2">
                        <div class="flex items-center gap-1.5 justify-center">
                          <h3
                            class="text-xs font-bold text-amber-300/90 uppercase tracking-wider"
                          >
                            {{
                              getProvinceForSlide(
                                slide,
                                Number(Number(slideIdx)),
                              ).name
                            }}
                          </h3>
                        </div>
                      </div>

                      <!-- Card -->
                      <div
                        class="relative bg-white/10 backdrop-blur-md rounded-md p-2 border border-white/20 hover:border-amber-400/50 transition-all duration-300 overflow-hidden shadow-sm flex items-center gap-2"
                        style="width: 300px"
                      >
                        <div class="flex items-start gap-2">
                          <div class="flex items-center gap-2">
                            <div
                              :class="`p-1 rounded bg-opacity-20 ${slide.iconBgClass}`"
                            >
                              <UIcon
                                :name="slide.icon"
                                :class="`w-5 h-5 ${slide.iconColorClass}`"
                              />
                            </div>

                            <div
                              class="flex-1 min-w-0 flex flex-col justify-center"
                            >
                              <h4
                                class="text-sm font-bold text-white/70 leading-none uppercase mb-1"
                              >
                                {{ slide.indicatorName }}
                              </h4>

                              <div class="flex items-baseline gap-1">
                                <span
                                  class="text-4xl font-black text-white leading-none tracking-tight"
                                >
                                  {{
                                    formatNumber(
                                      Number(
                                        getProvinceForSlide(
                                          slide,
                                          Number(slideIdx),
                                        ).value,
                                      ),
                                      slide.useDecimal,
                                    )
                                  }}
                                </span>
                                <span
                                  class="text-md font-bold text-amber-400 uppercase leading-none"
                                >
                                  {{ formatSatuan(slide.satuan) }}
                                </span>
                              </div>

                              <div
                                class="flex items-center justify-between gap-2 mt-1"
                              >
                                <p
                                  v-if="slide.sumber"
                                  class="text-[9px] text-white/70 leading-tight"
                                >
                                  SUMBER: {{ slide.sumber }}
                                </p>
                                <p
                                  v-if="slide.lastUpdate"
                                  class="text-[9px] text-white/70 leading-tight"
                                >
                                  UPDATE:
                                  {{ formatLastUpdate(slide.lastUpdate) }}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Decorative gradient -->
                        <div
                          class="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination Dots -->
      <div
        v-if="isCarouselMode && groupedSlides.length > 1"
        class="flex justify-center gap-1.5 mt-4"
      >
        <button
          v-for="(_, index) in groupedSlides"
          :key="index"
          @click="goToSlide(index)"
          class="transition-all duration-300"
          :class="
            currentIndex === index
              ? 'bg-amber-300 w-6 h-1.5 rounded-full'
              : 'bg-white/40 hover:bg-white/60 w-1.5 h-1.5 rounded-full'
          "
          :aria-label="`Go to slide ${index + 1}`"
        />
      </div>
    </template>

    <!-- Empty State -->
    <div v-else class="text-center py-8 text-white/80">
      <p class="text-sm">Tidak ada data tersedia</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";

const props = defineProps<{
  selectedWilayah: any;
}>();

// Mapping indikator ke dataset ID
const INDICATOR_DATASET_MAP = [
  // {
  //     id: 1,
  //     name: "Hunian Rusak",
  //     datasetId: 137,
  //     keyword: "Rumah Terdampak",
  //     useDecimal: false,
  // },
  {
    id: 1,
    name: "Hunian Rusak",
    datasetId: 137,
    keyword: "Jumlah Hunian Terdampak Bencana",
    useDecimal: false,
    aggregateKabupaten: true,
    useAggregatEndpoint: true,
  },
  {
    id: 2,
    name: "Korban Meninggal",
    datasetId: 91,
    keyword: "Meninggal Dunia",
    useDecimal: false,
  },
  {
    id: 3,
    name: "Korban Hilang",
    datasetId: 91,
    keyword: "Hilang",
    useDecimal: false,
  },
  {
    id: 4,
    name: "Pengungsi",
    datasetId: 91,
    keyword: "Pengungsi",
    useDecimal: false,
  },
  // {
  //     id: 5,
  //     name: "Pertumbuhan Ekonomi Q3 (q-to-q) 2025",
  //     datasetId: 42,
  //     keyword: "PDRB",
  //     exactMatch: true,
  //     useDecimal: true,
  // },
  // {
  //     id: 6,
  //     name: "Inflasi Desember (y-to-y) 2025",
  //     datasetId: 27,
  //     keyword: "Inflasi y-on-y",
  //     exactMatch: true,
  //     filterProvinceLevel: true,
  //     useDecimal: true,
  // },
];

const currentIndex = ref(0);
const autoPlayInterval = ref<NodeJS.Timeout | null>(null);
const apiData = ref<Map<number, any[]>>(new Map());
const datasetMetadata = ref<Map<number, any>>(new Map());
const loading = ref(true);

// Debounce handle for repeated prop changes and a simple fetch key cache
let fetchTimeout: ReturnType<typeof setTimeout> | null = null;
const lastFetchKey = ref<string | null>(null);

// Provinsi yang akan ditampilkan (exclude NASIONAL)
const TARGET_PROVINCES = ["11", "12", "13"]; // Aceh, Sumut, Sumbar

// Icon mapping
const getIconConfig = (indicatorName: string) => {
  const name = indicatorName.toLowerCase();

  if (name.includes("meninggal")) {
    return {
      icon: "i-heroicons-user-minus",
      bg: "bg-red-100/90",
      color: "text-red-600",
    };
  }
  if (name.includes("hilang")) {
    return {
      icon: "i-heroicons-question-mark-circle",
      bg: "bg-orange-100/90",
      color: "text-orange-600",
    };
  }
  if (name.includes("pengungsi")) {
    return {
      icon: "i-heroicons-users",
      bg: "bg-blue-100/90",
      color: "text-blue-600",
    };
  }
  if (name.includes("rumah") || name.includes("hunian")) {
    return {
      icon: "i-heroicons-home",
      bg: "bg-purple-100/90",
      color: "text-purple-600",
    };
  }
  if (name.includes("pdrb") || name.includes("pertumbuhan")) {
    return {
      icon: "i-heroicons-chart-bar",
      bg: "bg-emerald-100/90",
      color: "text-emerald-600",
    };
  }
  if (name.includes("inflasi")) {
    return {
      icon: "i-heroicons-arrow-trending-up",
      bg: "bg-amber-100/90",
      color: "text-amber-600",
    };
  }

  return {
    icon: "i-heroicons-chart-bar",
    bg: "bg-gray-100/90",
    color: "text-gray-600",
  };
};

// Cek filter provinsi
const hasProvinsiFilter = computed(() => {
  const w = props.selectedWilayah;
  if (!w?.provinsi || w.provinsi.length === 0) return false;

  const hasAllTag = w.provinsiNames?.some(
    (name: string) =>
      name === "Seluruh Wilayah" || name === "Semua Wilayah" || name === "All",
  );

  return !hasAllTag && w.provinsi[0] !== 0 && w.provinsi[0] !== null;
});

// Provinsi yang dipilih
const filteredProvinces = computed(() => {
  if (hasProvinsiFilter.value) {
    const w = props.selectedWilayah;
    return w.provinsi.map((id: number) => String(id).padStart(2, "0"));
  }
  return TARGET_PROVINCES;
});

// Jumlah provinsi yang dipilih
const selectedProvinceCount = computed(() => filteredProvinces.value.length);

// Apakah mode carousel
const isCarouselMode = computed(() => {
  // Carousel jika: tidak ada filter (0), 2 provinsi, atau 3+ provinsi
  return (
    selectedProvinceCount.value === 0 ||
    selectedProvinceCount.value === 2 ||
    selectedProvinceCount.value >= 3
  );
});

// Fetch data
const fetchData = async () => {
  loading.value = true;
  try {
    const datasetIds = [
      ...new Set(INDICATOR_DATASET_MAP.map((i) => i.datasetId)),
    ];

    // Tentukan provinsi yang dikirim ke server (kurangi payload)
    const provincesToQuery = hasProvinsiFilter.value
      ? filteredProvinces.value
      : TARGET_PROVINCES;

    // Simple cache: jika fetch sebelumnya sama, skip
    const fetchKey = JSON.stringify({ provinces: provincesToQuery });
    if (lastFetchKey.value === fetchKey && apiData.value.size > 0) {
      loading.value = false;
      return;
    }

    const fetchPromises = datasetIds.map(async (datasetId) => {
      const params: any = { id_dataset: datasetId };

      if (Array.isArray(provincesToQuery) && provincesToQuery.length > 0) {
        // API mendukung array untuk id_prov
        params.id_prov = provincesToQuery;
      }

      // Cek apakah dataset ini perlu endpoint berbeda
      const indicator = INDICATOR_DATASET_MAP.find(
        (i) => i.datasetId === datasetId,
      );
      const endpoint = indicator?.useAggregatEndpoint
        ? "/api/agregat-insight"
        : "/api/agregat-insight-latest";

      try {
        const response = await $fetch(endpoint, {
          method: "GET",
          query: params,
        });

        if (
          response &&
          typeof response === "object" &&
          "data" in response &&
          response.success
        ) {
          const respWithData = response as {
            data: any;
            success: boolean;
          };
          if (respWithData.data?.meta) {
            datasetMetadata.value.set(datasetId, respWithData.data.meta);
          }

          const filteredRecords = (respWithData.data?.records || []).filter(
            (record: any) => {
              const provCode = record.kd_prov?.kode;
              const value = parseFloat(record.value || 0);

              if (!provCode) return false;
              if (provCode === "00") return false;
              if (value === 0) return false;

              // Client-side guard juga tetap ada
              if (hasProvinsiFilter.value) {
                return filteredProvinces.value.includes(provCode);
              }

              return TARGET_PROVINCES.includes(provCode);
            },
          );

          apiData.value.set(datasetId, filteredRecords);
        }
      } catch (error) {
        console.error(`Error fetching dataset ${datasetId}:`, error);
      }
    });

    await Promise.all(fetchPromises);

    lastFetchKey.value = fetchKey;
  } catch (error) {
    console.error("Error fetching big number data:", error);
  } finally {
    loading.value = false;
  }
};

// Transform data
const allSlides = computed(() => {
  const result: any[] = [];

  INDICATOR_DATASET_MAP.forEach((indicator) => {
    const datasetRecords = apiData.value.get(indicator.datasetId) || [];
    const meta = datasetMetadata.value.get(indicator.datasetId);

    let indicatorRecords = datasetRecords.filter((record: any) => {
      const indicatorName = record.indikator?.nama || "";

      if (indicator.exactMatch) {
        if (indicatorName.trim() !== indicator.keyword) return false;
      } else {
        if (!indicatorName.includes(indicator.keyword)) return false;
      }

      // Filter untuk inflasi: hanya ambil data PROVINSI (kd_kab = null)
      if (indicator.filterProvinceLevel) {
        if (record.kd_kab !== null) return false;
      }

      return true;
    });

    if (indicatorRecords.length === 0) return;

    const provinceMap = new Map<string, number>();

    // Untuk dataset yang perlu agregasi kabupaten
    if (indicator.aggregateKabupaten) {
      indicatorRecords.forEach((record: any) => {
        const provCode = record.kd_prov?.kode;
        if (!provCode) return;

        // Hanya ambil data level kabupaten (kd_kab tidak null)
        if (record.kd_kab === null) return;

        const currentValue = provinceMap.get(provCode) || 0;
        provinceMap.set(provCode, currentValue + parseFloat(record.value || 0));
      });
    } else {
      // Logika existing untuk dataset lainnya
      indicatorRecords.forEach((record: any) => {
        const provCode = record.kd_prov?.kode;
        if (!provCode) return;

        const currentValue = provinceMap.get(provCode) || 0;
        provinceMap.set(provCode, currentValue + parseFloat(record.value || 0));
      });
    }

    const provinces = filteredProvinces.value.map((provCode: string) => {
      const value = provinceMap.get(provCode) || 0;
      const provName =
        provCode === "11"
          ? "ACEH"
          : provCode === "12"
            ? "SUMATERA UTARA"
            : provCode === "13"
              ? "SUMATERA BARAT"
              : "UNKNOWN";

      return { code: provCode, name: provName, value };
    });

    if (provinces.every((p: any) => p.value === 0)) return;

    let totalRecord;
    if (indicator.aggregateKabupaten) {
      // Untuk dataset agregat, ambil record pertama saja (period sama semua)
      totalRecord = indicatorRecords[0];
    } else {
      // Cari record dengan itemCategory1 = "Total" untuk dataset lainnya
      totalRecord =
        indicatorRecords.find(
          (record: any) => record.itemCategory1?.nama === "Total",
        ) || indicatorRecords[0];
    }

    const satuan = totalRecord?.indikator?.satuan || "";
    const iconConfig = getIconConfig(indicator.name);

    // Ambil sumber dari metadata
    const sumber = meta?.dataset?.instansi || "";

    // Untuk dataset agregat kabupaten, ambil dari meta.terakhir_diupdate
    // Untuk dataset lainnya, ambil dari record.tanggal
    const lastUpdate = indicator.aggregateKabupaten
      ? meta?.dataset?.terakhir_diupdate || ""
      : totalRecord?.tanggal || "";

    result.push({
      id: indicator.id,
      indicatorName: indicator.name,
      satuan,
      provinces,
      useDecimal: indicator.useDecimal,
      icon: iconConfig.icon,
      iconBgClass: iconConfig.bg,
      iconColorClass: iconConfig.color,
      sumber,
      lastUpdate,
    });
  });

  return result;
});

// Group slides berdasarkan mode
const groupedSlides = computed(() => {
  if (selectedProvinceCount.value === 1) {
    // 1 provinsi: semua indikator dalam 1 group
    return [allSlides.value];
  } else if (selectedProvinceCount.value === 2) {
    // 2 provinsi: group per provinsi (carousel)
    const groups: any[][] = [[], []];
    allSlides.value.forEach((slide) => {
      if (
        Array.isArray(slide.provinces) &&
        slide.provinces.length >= 2 &&
        slide.provinces[0] !== undefined &&
        slide.provinces[1] !== undefined
      ) {
        groups[0].push({ ...slide, provinces: [slide.provinces[0]] });
        groups[1].push({ ...slide, provinces: [slide.provinces[1]] });
      }
    });
    return groups;
  } else {
    // 0 atau 3+ provinsi: group per indikator dengan 3 provinsi
    // 1 slide = 1 indikator dengan 3 provinsi
    return allSlides.value.map((slide) => {
      // Return 3 copies dengan masing-masing 1 provinsi
      return slide.provinces.map((prov: any, idx: number) => ({
        ...slide,
        provinceIndex: idx,
      }));
    });
  }
});

// Helper untuk get provinsi di carousel mode
const getProvinceForSlide = (slide: any, slideIdx: number) => {
  if (selectedProvinceCount.value === 2) {
    return slide.provinces[0];
  }
  // Default: 3 provinsi mode
  return slide.provinces[slideIdx] || slide.provinces[0];
};

// Navigation
const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % groupedSlides.value.length;
};

const previousSlide = () => {
  currentIndex.value =
    currentIndex.value === 0
      ? groupedSlides.value.length - 1
      : currentIndex.value - 1;
};

const goToSlide = (index: number) => {
  currentIndex.value = index;
};

// Auto-play
const startAutoPlay = () => {
  if (!isCarouselMode.value || groupedSlides.value.length <= 1) return;
  autoPlayInterval.value = setInterval(() => {
    nextSlide();
  }, 6500);
};

const stopAutoPlay = () => {
  if (autoPlayInterval.value) {
    clearInterval(autoPlayInterval.value);
    autoPlayInterval.value = null;
  }
};

// Format number
const formatNumber = (value: number, useDecimal: boolean = false): string => {
  if (useDecimal) {
    return value.toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return value.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// Format satuan
const formatSatuan = (satuan: string): string => {
  if (!satuan) return "";

  // Convert "persentase (%)" -> "%"
  if (satuan.toLowerCase().includes("persentase") || satuan.includes("(%)")) {
    return "%";
  }

  return satuan.toUpperCase();
};

// Format tanggal last update
const formatLastUpdate = (dateString: string): string => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

// Lifecycle
onMounted(() => {
  fetchData();
});

watch(
  () => props.selectedWilayah,
  () => {
    currentIndex.value = 0;
    stopAutoPlay();
    if (fetchTimeout) clearTimeout(fetchTimeout);
    fetchTimeout = setTimeout(() => {
      fetchData();
    }, 200);
  },
  { deep: true },
);

watch(
  () => groupedSlides.value.length,
  () => {
    stopAutoPlay();
    if (isCarouselMode.value && groupedSlides.value.length > 1) {
      startAutoPlay();
    }
  },
);

watch(isCarouselMode, (newVal) => {
  if (!newVal) {
    stopAutoPlay();
    currentIndex.value = 0;
  } else if (groupedSlides.value.length > 1) {
    startAutoPlay();
  }
});

onUnmounted(() => {
  stopAutoPlay();
});
</script>
