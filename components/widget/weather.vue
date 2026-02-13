<template>
  <div
    class="z-[9999]"
    :class="[
      'weather-widget-container',
      positionClasses,
      floating ? 'max-w-sm' : '',
    ]"
  >
    <button
      v-if="floating && !isMinimized"
      @click="isMinimized = true"
      class="absolute top-2 right-2 z-10 w-6 h-6 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all"
    >
      <UIcon name="i-heroicons-minus" class="w-4 h-4 text-gray-600" />
    </button>

    <div
      v-if="floating && isMinimized"
      @click="isMinimized = false"
      class="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full p-4 cursor-pointer shadow-2xl hover:scale-110 transition-transform"
    >
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-cloud" class="w-6 h-6 text-white" />
        <div v-if="currentWeather" class="text-white">
          <p class="font-bold">{{ currentWeather.temp }}°C</p>
        </div>
      </div>
    </div>

    <div
      v-else
      class="rounded-xl shadow-lg overflow-hidden flex flex-col max-h-[500px] transition-all bg-white/40 backdrop-blur-xl border border-white/40"
    >
      <div class="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 shrink-0">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-cloud" class="w-5 h-5 text-white" />
            <h2 class="text-base font-bold text-white">Prakiraan Cuaca</h2>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 mb-3">
          <select
            v-model="selectedProvince"
            class="w-full px-2 py-1.5 rounded text-xs bg-white/90 text-gray-800 font-medium"
          >
            <option
              v-for="opt in provinceOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
          <select
            v-model="selectedKabkot"
            class="w-full px-2 py-1.5 rounded text-xs bg-white/90 text-gray-800 font-medium"
          >
            <option
              v-for="opt in kabkotOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div v-if="!loading && currentWeather">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-white/80 text-xs">
                {{ currentWeather.area }}
              </p>
              <div class="flex items-center gap-2">
                <span class="text-3xl font-bold text-white"
                  >{{ currentWeather.temp }}°C</span
                >
                <p class="text-xs font-medium text-white/90">
                  {{ currentWeather.weather }}
                </p>
              </div>
            </div>
            <div class="text-4xl text-white">
              {{ getWeatherIcon(currentWeather.weatherCode) }}
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 mt-2">
            <div
              class="bg-white/10 rounded-lg p-1.5 backdrop-blur-sm text-center"
            >
              <span class="text-[10px] text-white/80 block">Maks</span>
              <p class="text-sm font-bold text-white">
                {{ currentWeather.tempMax }}°
              </p>
            </div>
            <div
              class="bg-white/10 rounded-lg p-1.5 backdrop-blur-sm text-center"
            >
              <span class="text-[10px] text-white/80 block">Min</span>
              <p class="text-sm font-bold text-white">
                {{ currentWeather.tempMin }}°
              </p>
            </div>
            <div
              class="bg-white/10 rounded-lg p-1.5 backdrop-blur-sm text-center"
            >
              <span class="text-[10px] text-white/80 block">Lembab</span>
              <p class="text-sm font-bold text-white">
                {{ currentWeather.humidity }}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="p-3 overflow-y-auto flex-1">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-bold text-sm text-gray-900">3 Hari Kedepan</h3>
          <button
            @click="isExpanded = !isExpanded"
            class="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            {{ isExpanded ? "Tutup" : "Detail" }}
          </button>
        </div>

        <div v-if="!loading && forecastData.length > 0" class="space-y-2">
          <div
            v-for="day in forecastData.slice(0, 3)"
            :key="day.date"
            class="rounded p-2 transition-colors border border-white/30 bg-white/40 hover:bg-white/60"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xl">{{
                  getWeatherIcon(day.weatherCode)
                }}</span>
                <div>
                  <p class="font-semibold text-xs text-gray-900">
                    {{ formatDate(day.date) }}
                  </p>
                  <p class="text-[10px] text-gray-600">
                    {{ day.weather }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-xs font-bold text-gray-900">
                  {{ day.tempMax }}°/{{ day.tempMin }}°
                </p>
              </div>
            </div>

            <div
              v-if="isExpanded"
              class="mt-2 pt-2 border-t border-gray-200/50 grid grid-cols-2 gap-1 text-[10px]"
            >
              <div class="text-gray-600">Angin: {{ day.windSpeed }} km/h</div>
              <div class="text-gray-600">Pandang: {{ day.visibility }} km</div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-4 text-gray-400 text-xs">
          Data tidak tersedia
        </div>
      </div>

      <div
        class="px-3 py-1.5 border-t flex items-center justify-between shrink-0 bg-white/30 border-white/30"
      >
        <p class="text-[10px] text-gray-500">Update: {{ lastUpdate }}</p>
        <a
          href="https://www.bmkg.go.id"
          target="_blank"
          class="text-[10px] text-blue-600 font-medium"
          >BMKG</a
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from "vue";

const props = defineProps({
  defaultProvince: { type: String, default: "21" },
  defaultKabkot: { type: String, default: null },
  floating: { type: Boolean, default: false },
  position: { type: String, default: "bottom-right" },
});

// State
const loading = ref(true);
const weatherData = ref([]);
const isExpanded = ref(false);
const isMinimized = ref(true);
const lastUpdate = ref("");
const selectedProvince = ref(props.defaultProvince);
const selectedKabkot = ref(props.defaultKabkot || null);

// Province & Kabkot Mapping

// Province & Kabkot Mapping
const provinceMap = {
  21: {
    name: "Kepulauan Riau",
    sampleDesa: [
      "21.71.10.1001", // Batam Kota
      "21.72.01.1001", // Tanjung Pinang Barat
      "21.01.06.1001", // Bintan Timur
      "21.02.02.1001", // Karimun
      "21.03.07.1001", // Bunguran Timur (Natuna)
      "21.04.01.1001", // Singkep (Lingga)
      "21.05.01.1001", // Siantan (Anambas)
    ],
  },
};
const kabkotMap = {
  // KEPULAUAN RIAU
  2101: { name: "KAB. BINTAN", sampleDesa: "21.01.06.1001" },
  2102: { name: "KAB. KARIMUN", sampleDesa: "21.02.02.1001" },
  2103: { name: "KAB. NATUNA", sampleDesa: "21.03.07.1001" },
  2104: { name: "KAB. LINGGA", sampleDesa: "21.04.01.1001" },
  2105: { name: "KAB. KEPULAUAN ANAMBAS", sampleDesa: "21.05.01.1001" },
  2171: { name: "KOTA BATAM", sampleDesa: "21.71.10.1001" },
  2172: { name: "KOTA TANJUNG PINANG", sampleDesa: "21.72.01.1001" },
};
// Computed
const kabkotOptions = computed(() => {
  if (!selectedProvince.value || !provinceMap[selectedProvince.value]) {
    return [{ label: "Pilih Provinsi...", value: null }];
  }

  const searchKey = String(selectedProvince.value);
  const filtered = Object.entries(kabkotMap)
    .filter(([code]) => code.startsWith(searchKey))
    .map(([code, data]) => ({
      label: data.name,
      value: code,
    }));

  return [
    {
      label: `Semua ${provinceMap[selectedProvince.value]?.name || ""}`,
      value: null,
    },
    ...filtered,
  ];
});

const provinceOptions = computed(() =>
  Object.entries(provinceMap).map(([code, data]) => ({
    label: data.name,
    value: code,
  })),
);

const currentWeather = computed(() => {
  if (weatherData.value.length === 0) return null;
  return weatherData.value[0];
});

const forecastData = computed(() => weatherData.value);

const positionClasses = computed(() => {
  if (!props.floating) return "";

  const positions = {
    "bottom-right": "fixed bottom-6 right-6 z-50",
    "bottom-left": "fixed bottom-6 left-6 z-50",
    "top-right": "fixed top-6 right-6 z-50",
    "top-left": "fixed top-6 left-6 z-50",
  };

  return positions[props.position] || positions["bottom-right"];
});

// Methods
const fetchWeatherData = async () => {
  loading.value = true;
  try {
    let sampleDesa = [];

    if (selectedKabkot.value && kabkotMap[selectedKabkot.value]) {
      sampleDesa = [kabkotMap[selectedKabkot.value].sampleDesa];
    } else if (selectedProvince.value && provinceMap[selectedProvince.value]) {
      sampleDesa = provinceMap[selectedProvince.value].sampleDesa;
    }

    if (sampleDesa.length === 0) {
      weatherData.value = [];
      return;
    }

    const fetchPromises = sampleDesa.map((id) =>
      fetch(`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${id}`).then(
        (res) => res.json(),
      ),
    );

    const results = await Promise.all(fetchPromises);
    weatherData.value = aggregateWeatherData(results);
    lastUpdate.value = new Date().toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Fetch Weather Error:", error);
  } finally {
    loading.value = false;
  }
};

const aggregateWeatherData = (results) => {
  const dateMap = new Map();

  results.forEach((result) => {
    if (!result.data || !result.data[0]?.cuaca) return;

    const cuacaData = result.data[0].cuaca;
    cuacaData.forEach((item) => {
      item.forEach((timeData) => {
        const date = timeData.local_datetime.split(" ")[0];

        if (!dateMap.has(date)) {
          dateMap.set(date, {
            temps: [],
            humidities: [],
            windSpeeds: [],
            visibilities: [],
            weathers: [],
            weatherCodes: [],
          });
        }

        const entry = dateMap.get(date);
        entry.temps.push(parseFloat(timeData.t));
        entry.humidities.push(parseInt(timeData.hu));
        entry.windSpeeds.push(parseFloat(timeData.ws));
        entry.visibilities.push(parseFloat(timeData.vs_text || 10));
        entry.weathers.push(timeData.weather_desc);
        entry.weatherCodes.push(parseInt(timeData.weather));
      });
    });
  });

  let areaName = "Wilayah Tidak Diketahui";

  if (selectedKabkot.value && kabkotMap[selectedKabkot.value]) {
    areaName = kabkotMap[selectedKabkot.value].name;
  } else if (selectedProvince.value && provinceMap[selectedProvince.value]) {
    areaName = provinceMap[selectedProvince.value].name;
  }

  const aggregated = Array.from(dateMap.entries()).map(([date, data]) => ({
    date,
    temp: average(data.temps),
    tempMax: Math.max(...data.temps),
    tempMin: Math.min(...data.temps),
    humidity: average(data.humidities),
    windSpeed: average(data.windSpeeds),
    visibility: average(data.visibilities),
    weather: mostCommon(data.weathers),
    weatherCode: mostCommon(data.weatherCodes),
    area: areaName,
  }));

  return aggregated.sort((a, b) => new Date(a.date) - new Date(b.date));
};

const average = (arr) => {
  const validNums = arr.filter((n) => !isNaN(n) && n !== null);
  return validNums.length > 0
    ? Math.round(
        (validNums.reduce((a, b) => a + b, 0) / validNums.length) * 10,
      ) / 10
    : 0;
};

const mostCommon = (arr) => {
  const frequency = {};
  let maxFreq = 0;
  let mostCommonItem = arr[0];

  arr.forEach((item) => {
    frequency[item] = (frequency[item] || 0) + 1;
    if (frequency[item] > maxFreq) {
      maxFreq = frequency[item];
      mostCommonItem = item;
    }
  });

  return mostCommonItem;
};

const getWeatherIcon = (code) => {
  if (!code) return "☁️";
  if (code === 0) return "☀️";
  if (code >= 1 && code <= 3) return "⛅";
  if (code >= 4 && code <= 19) return "☁️";
  if (code >= 20 && code <= 45) return "🌫️";
  if (code >= 60 && code <= 65) return "🌧️";
  if (code >= 80 && code <= 90) return "🌦️";
  if (code >= 95) return "⛈️";
  return "☁️";
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Hari Ini";
  if (date.toDateString() === tomorrow.toDateString()) return "Besok";

  return date.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

// Lifecycle
onMounted(() => {
  fetchWeatherData();
  const interval = setInterval(fetchWeatherData, 1800000); // 30 menit
  onBeforeUnmount(() => clearInterval(interval));
});

watch(selectedProvince, () => {
  selectedKabkot.value = null;
  fetchWeatherData();
});

watch(selectedKabkot, fetchWeatherData);
</script>

<style scoped>
.weather-widget-container {
  max-width: 100%;
}

.weather-widget-container.fixed {
  max-width: 400px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
