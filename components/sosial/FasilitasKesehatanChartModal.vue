<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
    >
        <div
            class="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
            @click="$emit('close')"
        ></div>

        <div
            class="relative w-full max-w-5xl flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10 max-h-[90vh]"
        >
            <div
                class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white"
            >
                <div>
                    <h3 class="font-bold text-gray-800 text-lg">
                        {{
                            isHousingMode
                                ? "Grafik Rumah Tenaga Kesehatan Terdampak"
                                : "Grafik Fasilitas & Alat Kesehatan Terdampak"
                        }}
                    </h3>
                    <p v-if="selectedPeriod" class="text-xs text-gray-500 mt-1">
                        Periode: {{ formatDate(selectedPeriod) }}
                    </p>
                </div>
                <UButton
                    color="error"
                    variant="soft"
                    icon="i-heroicons-x-mark"
                    @click="$emit('close')"
                    class="bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md hover:scale-[1.02] transition-all duration-300 border-none ring-0 h-[31px]"
                />
            </div>

            <div class="p-6 bg-slate-50/30 overflow-y-auto">
                <div
                    v-if="loading"
                    class="h-80 flex items-center justify-center"
                >
                    <div class="flex flex-col items-center gap-3">
                        <div
                            class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"
                        ></div>
                        <span class="text-sm text-gray-500"
                            >Memuat Grafik...</span
                        >
                    </div>
                </div>

                <div v-else>
                    <!-- Global Search Filter with Autocomplete -->
                    <div class="mb-4 px-1">
                        <div class="flex flex-col gap-1.5">
                            <label
                                class="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1"
                            >
                                Pencarian
                            </label>
                            <div class="relative">
                                <input
                                    v-model="searchInput"
                                    @input="onSearchInput"
                                    @focus="showSuggestions = true"
                                    @keydown.enter="applySearch"
                                    @keydown.escape="showSuggestions = false"
                                    @keydown.down.prevent="
                                        navigateSuggestions(1)
                                    "
                                    @keydown.up.prevent="
                                        navigateSuggestions(-1)
                                    "
                                    type="text"
                                    placeholder="Cari berdasarkan RS, Alat, Ruangan, Kondisi, atau Status..."
                                    class="w-full bg-white px-3 py-2 pl-10 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm placeholder:text-gray-400"
                                />
                                <svg
                                    class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                <button
                                    v-if="appliedSearch"
                                    @click="clearSearch"
                                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg
                                        class="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>

                                <!-- Autocomplete Dropdown -->
                                <div
                                    v-if="
                                        showSuggestions &&
                                        filteredSuggestions.length > 0
                                    "
                                    class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                >
                                    <div
                                        v-for="(
                                            suggestion, index
                                        ) in filteredSuggestions"
                                        :key="index"
                                        @click="selectSuggestion(suggestion)"
                                        @mouseenter="
                                            selectedSuggestionIndex = index
                                        "
                                        :class="[
                                            'px-3 py-2 cursor-pointer text-xs flex items-center justify-between hover:bg-indigo-50 transition-colors',
                                            selectedSuggestionIndex === index
                                                ? 'bg-indigo-50'
                                                : '',
                                        ]"
                                    >
                                        <div class="flex items-center gap-2">
                                            <span
                                                class="font-medium text-gray-700"
                                                >{{ suggestion.value }}</span
                                            >
                                        </div>
                                        <span
                                            class="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium"
                                        >
                                            {{ suggestion.category }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center justify-between pl-1">
                                <div
                                    v-if="
                                        appliedSearch &&
                                        filteredRecordsCount !== null
                                    "
                                    class="text-[10px] text-gray-500"
                                >
                                    Ditemukan {{ filteredRecordsCount }} data
                                    untuk "{{ appliedSearch }}"
                                </div>
                                <div
                                    v-else
                                    class="text-[10px] text-gray-400 italic"
                                >
                                    Ketik minimal 2 karakter untuk melihat saran
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Chart Controls -->
                    <div
                        class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 px-1"
                    >
                        <!-- Group By Selector -->
                        <div class="flex flex-col gap-1.5">
                            <label
                                class="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1"
                                >Grup Berdasarkan</label
                            >
                            <select
                                v-model="groupBy"
                                class="w-full bg-white px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer shadow-sm"
                            >
                                <option value="Kondisi">
                                    Kondisi Kerusakan
                                </option>
                                <option value="Status">Status Alat</option>
                                <option value="Alat">Jenis Alat</option>
                                <option value="RS">Rumah Kesehatan</option>
                                <option value="Ruangan">Jenis Ruangan</option>
                            </select>
                        </div>

                        <!-- Filter RS -->
                        <div class="flex flex-col gap-1.5">
                            <label
                                class="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1"
                                >Filter RS</label
                            >
                            <select
                                v-model="filterRumahKesehatan"
                                class="w-full bg-white px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer shadow-sm"
                            >
                                <option value="">Semua RS</option>
                                <option
                                    v-for="item in availableOptions.rs"
                                    :key="item"
                                    :value="item"
                                >
                                    {{ item }}
                                </option>
                            </select>
                        </div>

                        <!-- Filter Alat -->
                        <div class="flex flex-col gap-1.5">
                            <label
                                class="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1"
                                >Filter Alat</label
                            >
                            <select
                                v-model="filterAlatKesehatan"
                                class="w-full bg-white px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer shadow-sm"
                            >
                                <option value="">Semua Alat</option>
                                <option
                                    v-for="item in availableOptions.alat"
                                    :key="item"
                                    :value="item"
                                >
                                    {{ item }}
                                </option>
                            </select>
                        </div>

                        <!-- Filter Ruangan -->
                        <div class="flex flex-col gap-1.5">
                            <label
                                class="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1"
                                >Filter Ruangan</label
                            >
                            <select
                                v-model="filterRuangan"
                                class="w-full bg-white px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer shadow-sm"
                            >
                                <option value="">Semua Ruangan</option>
                                <option
                                    v-for="item in availableOptions.ruangan"
                                    :key="item"
                                    :value="item"
                                >
                                    {{ item }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <div class="flex flex-col gap-6">
                        <!-- Chart 2: Alat Kesehatan -->
                        <div
                            class="bg-white rounded-xl border border-gray-100 p-6 shadow-sm"
                        >
                            <div class="flex items-center justify-between mb-6">
                                <div class="text-[10px] text-gray-400 italic">
                                    * Menampilkan Top 15 Data
                                </div>
                            </div>
                            <BarChart
                                :categories="chartDataAlkes.categories"
                                :series="chartDataAlkes.series"
                                height="h-80"
                                :showLegend="false"
                                legendPosition="bottom"
                                :stacked="false"
                                :horizontal="true"
                                :grid="{
                                    left: '3%',
                                    right: '4%',
                                    bottom: '0%',
                                    top: '0%',
                                    containLabel: true,
                                }"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer Metadata -->
            <div
                v-if="
                    datasetInfo?.sumber ||
                    datasetInfo?.instansi ||
                    datasetInfo?.sumber_data
                "
                class="px-6 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500 shrink-0 z-20"
            >
                <div
                    v-if="datasetInfo?.sumber || datasetInfo?.sumber_data"
                    class="flex items-center gap-1"
                >
                    <span class="font-bold">Sumber:</span>
                    <span>{{
                        datasetInfo.sumber || datasetInfo.sumber_data
                    }}</span>
                </div>
                <div
                    v-if="datasetInfo?.instansi"
                    class="flex items-center gap-1"
                >
                    <span class="font-bold">Instansi:</span>
                    <span>{{ datasetInfo.instansi }}</span>
                </div>
                <div
                    v-if="datasetInfo?.terakhir_diupdate"
                    class="flex items-center gap-1"
                >
                    <span class="font-bold">Update Terakhir:</span>
                    <span>{{ formatDate(datasetInfo.terakhir_diupdate) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import BarChart from "~/components/charts/BarChart.vue";

const props = defineProps({
    isOpen: Boolean,
    chartData: { type: Object, default: () => ({}) },
    alkesData: { type: Array, default: () => [] },
    rawData: { type: Array, default: () => [] },
    selectedPeriod: String,
    datasetInfo: { type: Object, default: () => ({}) },
    loading: Boolean,
});

defineEmits(["close"]);

const formatDate = (isoString) => {
    if (!isoString) return "-";
    try {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(date);
    } catch (e) {
        return isoString;
    }
};

const groupBy = ref("Kondisi");
const filterRumahKesehatan = ref("");
const filterAlatKesehatan = ref("");
const filterRuangan = ref("");
const searchInput = ref("");
const appliedSearch = ref("");
const showSuggestions = ref(false);
const selectedSuggestionIndex = ref(0);

// Build all suggestions
const allSuggestions = computed(() => {
    const suggestions = [];
    const seen = new Set();

    props.alkesData.forEach((r) => {
        const items = [
            { value: r.itemCategory1?.nama, category: "RS" },
            { value: r.itemCategory2?.nama, category: "Alat" },
            { value: r.itemCategory3?.nama, category: "Ruangan" },
            { value: r.itemCategory4?.nama, category: "Kondisi" },
            { value: r.itemCategory5?.nama, category: "Status" },
        ];

        items.forEach((item) => {
            if (item.value && !seen.has(item.value)) {
                seen.add(item.value);
                suggestions.push(item);
            }
        });
    });

    return suggestions.sort((a, b) => a.value.localeCompare(b.value));
});

// Filter suggestions based on input
const filteredSuggestions = computed(() => {
    if (!searchInput.value || searchInput.value.length < 2) {
        return [];
    }

    const searchTerm = searchInput.value.toLowerCase();
    return allSuggestions.value
        .filter((s) => s.value.toLowerCase().includes(searchTerm))
        .slice(0, 20); // Limit to 20 suggestions
});

const onSearchInput = () => {
    showSuggestions.value = true;
    selectedSuggestionIndex.value = 0;
};

const selectSuggestion = (suggestion) => {
    searchInput.value = suggestion.value;
    appliedSearch.value = suggestion.value;
    showSuggestions.value = false;
};

const applySearch = () => {
    appliedSearch.value = searchInput.value;
    showSuggestions.value = false;
};

const clearSearch = () => {
    searchInput.value = "";
    appliedSearch.value = "";
    showSuggestions.value = false;
};

const navigateSuggestions = (direction) => {
    if (filteredSuggestions.value.length === 0) return;

    selectedSuggestionIndex.value += direction;

    if (selectedSuggestionIndex.value < 0) {
        selectedSuggestionIndex.value = filteredSuggestions.value.length - 1;
    } else if (
        selectedSuggestionIndex.value >= filteredSuggestions.value.length
    ) {
        selectedSuggestionIndex.value = 0;
    }
};

// Close suggestions when clicking outside
const handleClickOutside = (event) => {
    if (!event.target.closest(".relative")) {
        showSuggestions.value = false;
    }
};

onMounted(() => {
    document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener("click", handleClickOutside);
});

const availableOptions = computed(() => {
    const rs = new Set();
    const alat = new Set();
    const ruangan = new Set();
    const kondisi = new Set();
    const status = new Set();

    props.alkesData.forEach((r) => {
        if (r.itemCategory1?.nama) rs.add(r.itemCategory1.nama);
        if (r.itemCategory2?.nama) alat.add(r.itemCategory2.nama);
        if (r.itemCategory3?.nama) ruangan.add(r.itemCategory3.nama);
        if (r.itemCategory4?.nama) kondisi.add(r.itemCategory4.nama);
        if (r.itemCategory5?.nama) status.add(r.itemCategory5.nama);
    });

    return {
        rs: Array.from(rs).sort(),
        alat: Array.from(alat).sort(),
        ruangan: Array.from(ruangan).sort(),
        kondisi: Array.from(kondisi).sort(),
        status: Array.from(status).sort(),
    };
});

const colorMap = {
    "Rusak Ringan": "#10B981",
    "Rusak Sedang": "#F59E0B",
    "Rusak Berat": "#F97316",
    Hilang: "#EF4444",
    "Bisa Dipakai": "#3B82F6",
    "Harus di Ganti (BAP)": "#EF4444",
};

const filteredRecordsCount = ref(null);

const chartDataAlkes = computed(() => {
    let records = props.alkesData || [];

    // Apply Global Search Filter (only when applied)
    if (appliedSearch.value) {
        const searchTerm = appliedSearch.value.toLowerCase();
        records = records.filter((r) => {
            const rs = (r.itemCategory1?.nama || "").toLowerCase();
            const alat = (r.itemCategory2?.nama || "").toLowerCase();
            const ruangan = (r.itemCategory3?.nama || "").toLowerCase();
            const kondisi = (r.itemCategory4?.nama || "").toLowerCase();
            const status = (r.itemCategory5?.nama || "").toLowerCase();

            return (
                rs.includes(searchTerm) ||
                alat.includes(searchTerm) ||
                ruangan.includes(searchTerm) ||
                kondisi.includes(searchTerm) ||
                status.includes(searchTerm)
            );
        });
    }

    // Apply Specific Filters
    if (filterRumahKesehatan.value) {
        records = records.filter(
            (r) => r.itemCategory1?.nama === filterRumahKesehatan.value,
        );
    }
    if (filterAlatKesehatan.value) {
        records = records.filter(
            (r) => r.itemCategory2?.nama === filterAlatKesehatan.value,
        );
    }
    if (filterRuangan.value) {
        records = records.filter(
            (r) => r.itemCategory3?.nama === filterRuangan.value,
        );
    }

    // Update filtered count
    filteredRecordsCount.value = records.length;

    const groupMap = new Map();

    records.forEach((r) => {
        let key = "-";
        if (groupBy.value === "RS") key = r.itemCategory1?.nama || "Lainnya";
        else if (groupBy.value === "Alat")
            key = r.itemCategory2?.nama || "Lainnya";
        else if (groupBy.value === "Ruangan")
            key = r.itemCategory3?.nama || "Lainnya";
        else if (groupBy.value === "Kondisi")
            key = r.itemCategory4?.nama || "Lainnya";
        else if (groupBy.value === "Status")
            key = r.itemCategory5?.nama || "Lainnya";

        const val = Number(r.value) || 0;
        groupMap.set(key, (groupMap.get(key) || 0) + val);
    });

    const sortedData = Array.from(groupMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);

    return {
        categories: sortedData.map((d) => d[0]),
        series: [
            {
                name: "Jumlah Unit",
                data: sortedData.map((d) => ({
                    value: d[1],
                    itemStyle: {
                        color: colorMap[d[0]] || "#6366F1",
                    },
                })),
            },
        ],
    };
});
</script>
