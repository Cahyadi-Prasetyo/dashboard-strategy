<template>
    <div
        class="flex flex-col h-full bg-white rounded-xl shadow-2xl overflow-hidden"
    >
        <div class="px-6 pt-6 pb-2 flex items-center justify-between gap-4">
            <div class="flex items-center gap-2">
                <button
                    v-if="historyStack.length > 0"
                    @click="handleBack"
                    class="flex items-center gap-1 text-sm font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                    <UIcon name="i-heroicons-arrow-left" />
                    Kembali
                </button>
                <!-- <h3 v-else class="text-lg font-bold text-gray-800">{{ title }}</h3> -->
            </div>

            <div class="w-44">
                <UInput
                    v-model="searchQuery"
                    icon="i-heroicons-magnifying-glass"
                    placeholder="Cari wilayah..."
                    size="sm"
                    :ui="{ icon: { trailing: { pointer: '' } } }"
                >
                    <template #trailing v-if="searchQuery">
                        <UButton
                            color="gray"
                            variant="link"
                            icon="i-heroicons-x-mark"
                            :padded="false"
                            @click="searchQuery = ''"
                        />
                    </template>
                </UInput>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto p-3 min-h-0 pt-2">
            <ChartsDataTable
                :table-title="
                    historyStack.length > 0 ? 'Detail Wilayah' : title
                "
                :enable-pagination="true"
                :total-items="filteredData.length"
                :items-per-page="itemsPerPage"
                v-model="currentPage"
                class="h-full"
                enable-download
                :download-data="filteredData"
                :download-columns="excelColumns"
                :file-name="excelFileName"
            >
                <template #header>
                    <th
                        class="sticky top-0 z-10 bg-white px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase w-12 border-b border-gray-200"
                    >
                        No
                    </th>
                    <th
                        v-if="showProv"
                        class="sticky top-0 z-10 bg-white px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase border-b border-gray-200"
                    >
                        Provinsi
                    </th>
                    <th
                        v-if="showKab"
                        class="sticky top-0 z-10 bg-white px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase border-b border-gray-200"
                    >
                        Kabupaten
                    </th>
                    <th
                        v-if="showKec"
                        class="sticky top-0 z-10 bg-white px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase border-b border-gray-200"
                    >
                        Kecamatan
                    </th>
                    <th
                        class="sticky top-0 z-10 bg-blue-50/50 px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase border-b border-gray-200"
                    >
                        {{ currentLevelLabel }}
                    </th>
                    <th
                        v-for="col in columnConfig"
                        :key="col.key"
                        class="sticky top-0 z-10 bg-white px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase whitespace-nowrap border-b border-gray-200"
                    >
                        {{ col.label }}
                    </th>
                    <th
                        class="sticky top-0 z-10 bg-gray-50 px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase border-b border-gray-200"
                    >
                        Total
                    </th>
                </template>

                <template #body>
                    <template v-if="pending">
                        <tr
                            v-for="i in 5"
                            :key="i"
                            class="border-b border-gray-100"
                        >
                            <td :colspan="totalColumns" class="px-4 py-4">
                                <div class="flex gap-4">
                                    <USkeleton class="h-4 w-8" />
                                    <USkeleton class="h-4 w-1/4" />
                                    <USkeleton class="h-4 w-full" />
                                </div>
                            </td>
                        </tr>
                    </template>

                    <template v-else-if="filteredData.length === 0">
                        <tr>
                            <td
                                :colspan="totalColumns"
                                class="px-4 py-12 text-center text-gray-400"
                            >
                                {{
                                    searchQuery
                                        ? "Tidak ada wilayah yang cocok dengan pencarian"
                                        : "Tidak ada data detail"
                                }}
                            </td>
                        </tr>
                    </template>

                    <template v-else>
                        <tr
                            v-for="(row, idx) in paginatedData"
                            :key="row.id"
                            @click="handleDrillDown(row)"
                            :class="[
                                'border-b border-gray-100 transition-colors',
                                canDrillDown(row.id)
                                    ? 'hover:bg-blue-50 cursor-pointer'
                                    : 'hover:bg-gray-50 cursor-default',
                                isLoadingDrillDown
                                    ? 'opacity-50 pointer-events-none'
                                    : '',
                            ]"
                        >
                            <td class="px-4 py-3 text-sm text-gray-500">
                                {{ (currentPage - 1) * itemsPerPage + idx + 1 }}
                            </td>
                            <td
                                v-if="showProv"
                                class="px-4 py-3 text-sm text-gray-600"
                            >
                                {{ row.provinsi }}
                            </td>
                            <td
                                v-if="showKab"
                                class="px-4 py-3 text-sm text-gray-600"
                            >
                                {{ row.kabupaten }}
                            </td>
                            <td
                                v-if="showKec"
                                class="px-4 py-3 text-sm text-gray-600"
                            >
                                {{ row.kecamatan }}
                            </td>

                            <td
                                class="px-4 py-3 text-sm font-semibold text-gray-900 bg-blue-50/10 flex items-center justify-between gap-2"
                            >
                                {{ row.nama }}
                                <UIcon
                                    v-if="canDrillDown(row.id)"
                                    name="i-heroicons-chevron-right"
                                    class="w-4 h-4 text-gray-300"
                                />
                            </td>

                            <td
                                v-for="col in columnConfig"
                                :key="col.key"
                                class="px-4 py-3 text-sm text-right text-gray-600 font-mono"
                            >
                                {{ formatNumber(row.values[col.key] || 0) }}
                            </td>
                            <td
                                class="px-4 py-3 text-sm text-right font-bold text-gray-900 bg-gray-50/50 font-mono"
                            >
                                {{ formatNumber(row.total) }}
                            </td>
                        </tr>
                    </template>
                </template>
            </ChartsDataTable>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
    title: { type: String, default: "Detail Data" },
    regionIds: { type: Array, required: true },
    tahun: { type: Number, required: true },
    columnConfig: { type: Array, required: true },
});

defineEmits(["close"]);

// --- STATE: PAGINATION & SEARCH ---
const currentPage = ref(1);
const itemsPerPage = ref(15);
const searchQuery = ref("");

// --- STATE: DRILL DOWN (Internal ID Management) ---
const activeRegionIds = ref([...props.regionIds]);
const historyStack = ref([]);

const indicatorIds = computed(() => props.columnConfig.map((c) => c.key));

// Reset view if Parent Props change
watch(
    () => props.regionIds,
    (newVal) => {
        activeRegionIds.value = [...newVal];
        historyStack.value = [];
        searchQuery.value = "";
        currentPage.value = 1;
    },
);

// --- API FETCH ---
const { data: rawData, pending } = useFetch("/api/data-per-wilayah", {
    method: "POST",
    lazy: true,
    body: computed(() => ({
        regionIds: activeRegionIds.value, // Use internal IDs
        indicatorIds: indicatorIds.value,
        tahun: props.tahun,
    })),
});

// --- LOGIC: LEVEL DETECTION ---
const detectedLevel = computed(() => {
    if (!rawData.value || rawData.value.length === 0) return "unknown";
    const len = rawData.value[0].id?.length || 0;
    if (len === 2) return "provinsi";
    if (len === 4) return "kabupaten";
    if (len === 7) return "kecamatan";
    if (len >= 10) return "desa";
    return "unknown";
});

const showProv = computed(() =>
    ["kabupaten", "kecamatan", "desa"].includes(detectedLevel.value),
);
const showKab = computed(() =>
    ["kecamatan", "desa"].includes(detectedLevel.value),
);
const showKec = computed(() => ["desa"].includes(detectedLevel.value));

const currentLevelLabel = computed(() => {
    switch (detectedLevel.value) {
        case "provinsi":
            return "Provinsi";
        case "kabupaten":
            return "Kabupaten/Kota";
        case "kecamatan":
            return "Kecamatan";
        case "desa":
            return "Desa/Kelurahan";
        default:
            return "Wilayah";
    }
});

const totalColumns = computed(() => {
    let count = 2;
    if (showProv.value) count++;
    if (showKab.value) count++;
    if (showKec.value) count++;
    count += props.columnConfig.length + 1;
    return count;
});

// --- DATA PROCESSING ---
const tableData = computed(() => {
    if (!rawData.value) return [];
    return rawData.value.map((region) => {
        const values = {};
        let total = 0;
        props.columnConfig.forEach((col) => {
            const val = Number(region[col.key] || 0);
            values[col.key] = val;
            total += val;
        });
        return {
            id: region.id,
            nama: region.nama,
            provinsi: region.provinsi,
            kabupaten: region.kabupaten,
            kecamatan: region.kecamatan,
            values,
            total,
        };
    });
});

// --- LOGIC: SEARCH FILTER ---
const filteredData = computed(() => {
    if (!searchQuery.value) return tableData.value;
    const lowerQuery = searchQuery.value.toLowerCase();
    return tableData.value.filter(
        (row) =>
            row.nama?.toLowerCase().includes(lowerQuery) ||
            row.id?.includes(lowerQuery),
    );
});

// --- LOGIC: PAGINATION ---
watch(searchQuery, () => (currentPage.value = 1));

const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    return filteredData.value.slice(start, start + itemsPerPage.value);
});
const isLoadingDrillDown = ref(false); // Tambah state loading agar UX lebih enak

const canDrillDown = (id) => id && id.length < 10; // Stop at Desa (10 chars)

const handleDrillDown = async (row) => {
    // Cek apakah wilayah ini bisa di-drill down
    if (!canDrillDown(row.id) || isLoadingDrillDown.value) return;

    isLoadingDrillDown.value = true;

    try {
        // 1. Panggil API Helper untuk mendapatkan daftar ID anak (Children)
        // Contoh: Klik Aceh (11), dapat list ID Kab (1101, 1102, ...)
        const childrenList = await $fetch("/api/children", {
            method: "POST",
            body: { parentId: row.id },
        });

        if (childrenList && childrenList.length > 0) {
            // 2. Simpan state sekarang ke history (untuk tombol kembali)
            historyStack.value.push([...activeRegionIds.value]);

            // 3. Update activeRegionIds dengan list ID anak yang baru didapat
            // Ini akan otomatis men-trigger useFetch utama karena activeRegionIds berubah
            const newIds = childrenList.map((c) => c.id);
            activeRegionIds.value = newIds;

            // 4. Reset UI
            searchQuery.value = "";
            currentPage.value = 1;
        } else {
            // Optional: Beri notifikasi jika tidak ada data anak
            console.warn("Tidak ada wilayah di bawah region ini");
        }
    } catch (error) {
        console.error("Gagal mengambil detail wilayah:", error);
    } finally {
        isLoadingDrillDown.value = false;
    }
};

const handleBack = () => {
    if (historyStack.value.length === 0) return;

    // Restore previous state
    const prevIds = historyStack.value.pop();
    activeRegionIds.value = prevIds;
    searchQuery.value = "";
    currentPage.value = 1;
};

// --- UTILS ---
const formatNumber = (num) => new Intl.NumberFormat("id-ID").format(num);

const excelFileName = computed(
    () =>
        `${props.title.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}`,
);

const excelColumns = computed(() => {
    const cols = [];
    if (showProv.value) cols.push({ header: "Provinsi", key: "provinsi" });
    if (showKab.value) cols.push({ header: "Kabupaten", key: "kabupaten" });
    if (showKec.value) cols.push({ header: "Kecamatan", key: "kecamatan" });
    cols.push({ header: currentLevelLabel.value, key: "nama" });
    props.columnConfig.forEach((col) => {
        cols.push({
            header: col.label,
            key: (row) => row.values[col.key] || 0,
        });
    });
    cols.push({ header: "Total", key: "total" });
    return cols;
});
</script>
