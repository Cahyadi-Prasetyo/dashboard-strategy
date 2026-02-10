<template>
    <div
        class="relative bg-white border border-gray-200 rounded-xl shadow-sm p-5 pt-10 mt-4"
    >
        <div
            class="absolute -top-4 left-0 right-0 px-4 flex flex-wrap items-center justify-between gap-2 z-20"
        >
            <div
                class="flex items-center gap-2 px-4 py-1.5 bg-amber-50 rounded-lg border border-amber-100 shadow-sm whitespace-nowrap"
            >
                <UIcon
                    name="i-heroicons-users"
                    class="w-4 h-4 text-amber-600"
                />
                <span
                    class="text-[10px] font-black text-amber-700 uppercase tracking-wider"
                >
                    Kondisi Penduduk Terdampak
                </span>
            </div>

            <div
                class="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-gray-200 shadow-sm transition-all focus-within:ring-2 focus-within:ring-amber-500/20"
            >
                <UIcon
                    name="i-heroicons-calendar"
                    class="w-4 h-4 text-gray-400 ml-1"
                />

                <USelectMenu
                    v-model="selectedTanggal"
                    :items="tanggalOptions"
                    placeholder="Pilih Tanggal"
                    class="min-w-[140px]"
                    size="xs"
                    :ui="{
                        base: 'relative',
                        trigger:
                            'border-none shadow-none focus:ring-0 text-xs font-medium text-gray-700 py-1',
                        option: {
                            base: 'px-3 py-2 text-xs',
                            active: 'bg-amber-50 text-amber-900',
                            selected: 'font-bold',
                        },
                    }"
                >
                    <template #label>
                        <span class="truncate">
                            {{
                                selectedTanggal
                                    ? formatDateLabel(selectedTanggal)
                                    : "Pilih Tanggal"
                            }}
                        </span>
                    </template>
                </USelectMenu>
            </div>
        </div>

        <div
            v-if="status === 'pending'"
            class="flex items-center justify-center py-10"
        >
            <div class="text-center space-y-2">
                <div
                    class="w-8 h-8 mx-auto border-2 border-gray-200 border-t-amber-500 rounded-full animate-spin"
                ></div>
                <p class="text-xs text-gray-600">Memuat data...</p>
            </div>
        </div>

        <div
            v-else-if="status === 'error'"
            class="bg-red-50 border border-red-200 rounded-lg p-4"
        >
            <div class="flex items-center gap-3">
                <UIcon
                    name="i-heroicons-exclamation-circle"
                    class="w-5 h-5 text-red-600"
                />
                <div>
                    <p class="text-sm font-medium text-red-900">
                        Gagal memuat data
                    </p>
                </div>
            </div>
        </div>

        <div
            v-else-if="selectedTanggal"
            class="grid grid-cols-1 md:grid-cols-3 gap-3"
        >
            <div
                class="bg-white border border-red-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
            >
                <UIcon
                    name="i-heroicons-heart"
                    class="absolute -right-6 -bottom-6 w-32 h-32 text-red-600 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none transform -rotate-12"
                />

                <div class="relative z-10 flex items-center gap-3">
                    <div
                        class="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors"
                    >
                        <UIcon
                            name="i-heroicons-heart"
                            class="w-5 h-5 text-red-600"
                        />
                    </div>
                    <div>
                        <p
                            class="text-[10px] font-bold text-red-600 uppercase tracking-wide"
                        >
                            Meninggal Dunia
                        </p>
                        <div class="flex items-baseline gap-1">
                            <p class="text-2xl font-bold text-gray-900">
                                {{ formatNumber(korbanStats.meninggal) }}
                            </p>
                            <span class="text-xs text-gray-500 font-medium"
                                >JIWA</span
                            >
                        </div>
                    </div>
                </div>
                <div
                    class="relative z-10 mt-2 pt-2 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400"
                >
                    <span class="flex items-center gap-1">
                        <UIcon
                            name="i-heroicons-building-library"
                            class="w-3 h-3"
                        />
                        {{ datasetInfo?.instansi || "-" }}
                    </span>
                    <span>{{
                        datasetInfo?.terakhir_diupdate
                            ? formatUpdateDate(datasetInfo.terakhir_diupdate)
                            : ""
                    }}</span>
                </div>
            </div>

            <div
                class="bg-white border border-orange-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
            >
                <UIcon
                    name="i-heroicons-question-mark-circle"
                    class="absolute -right-6 -bottom-6 w-32 h-32 text-orange-600 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none transform -rotate-12"
                />

                <div class="relative z-10 flex items-center gap-3">
                    <div
                        class="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors"
                    >
                        <UIcon
                            name="i-heroicons-question-mark-circle"
                            class="w-5 h-5 text-orange-600"
                        />
                    </div>
                    <div>
                        <p
                            class="text-[10px] font-bold text-orange-600 uppercase tracking-wide"
                        >
                            Hilang
                        </p>
                        <div class="flex items-baseline gap-1">
                            <p class="text-2xl font-bold text-gray-900">
                                {{ formatNumber(korbanStats.hilang) }}
                            </p>
                            <span class="text-xs text-gray-500 font-medium"
                                >JIWA</span
                            >
                        </div>
                    </div>
                </div>
                <div
                    class="relative z-10 mt-2 pt-2 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400"
                >
                    <span class="flex items-center gap-1">
                        <UIcon
                            name="i-heroicons-building-library"
                            class="w-3 h-3"
                        />
                        {{ datasetInfo?.instansi || "-" }}
                    </span>
                    <span>{{
                        datasetInfo?.terakhir_diupdate
                            ? formatUpdateDate(datasetInfo.terakhir_diupdate)
                            : ""
                    }}</span>
                </div>
            </div>

            <div
                class="bg-white border border-amber-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
            >
                <UIcon
                    name="i-heroicons-user-group"
                    class="absolute -right-6 -bottom-6 w-32 h-32 text-amber-600 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none transform -rotate-12"
                />

                <div class="relative z-10 flex items-center gap-3">
                    <div
                        class="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors"
                    >
                        <UIcon
                            name="i-heroicons-user-group"
                            class="w-5 h-5 text-amber-600"
                        />
                    </div>
                    <div>
                        <p
                            class="text-[10px] font-bold text-amber-600 uppercase tracking-wide"
                        >
                            Pengungsi
                        </p>
                        <div class="flex items-baseline gap-1">
                            <p class="text-2xl font-bold text-gray-900">
                                {{ formatNumber(korbanStats.pengungsi) }}
                            </p>
                            <span class="text-xs text-gray-500 font-medium"
                                >JIWA</span
                            >
                        </div>
                    </div>
                </div>
                <div
                    class="relative z-10 mt-2 pt-2 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400"
                >
                    <span class="flex items-center gap-1">
                        <UIcon
                            name="i-heroicons-building-library"
                            class="w-3 h-3"
                        />
                        {{ datasetInfo?.instansi || "-" }}
                    </span>
                    <span>{{
                        datasetInfo?.terakhir_diupdate
                            ? formatUpdateDate(datasetInfo.terakhir_diupdate)
                            : ""
                    }}</span>
                </div>
            </div>
        </div>

        <div
            v-else
            class="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center"
        >
            <div
                class="w-12 h-12 mx-auto mb-3 bg-white rounded-xl flex items-center justify-center border border-gray-200 shadow-sm"
            >
                <UIcon
                    name="i-heroicons-calendar"
                    class="w-6 h-6 text-gray-400"
                />
            </div>
            <h3 class="text-sm font-bold text-gray-900 mb-1">Pilih Tanggal</h3>
            <p class="text-xs text-gray-500">
                Pilih tanggal di atas untuk melihat data statistik
            </p>
        </div>

        <div
            class="mt-4 flex flex-col md:flex-row items-center justify-between text-[10px] text-gray-400 border-t border-gray-100 pt-3 px-2 gap-3"
        >
            <div class="flex flex-col gap-1.5">
                <div
                    class="flex items-center gap-2 text-[9px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full w-fit font-medium"
                >
                    <UIcon name="i-heroicons-plus-circle" class="w-3 h-3" />
                    <span
                        >Jumlah Penduduk terdampak bencana yang ditampilkan
                        adalah
                        <b class="uppercase tracking-wider"
                            >akumulasi tingkat provinsi</b
                        >
                        hingga tanggal
                        <b class="uppercase tracking-wider">{{
                            selectedTanggal
                        }}</b></span
                    >
                </div>
            </div>

            <div class="flex flex-wrap gap-4">
                <span class="flex items-center gap-1.5">
                    <div class="w-2 h-2 bg-rose-500 rounded-sm"></div>
                    <span class="font-medium text-rose-600"
                        >Total Terdampak: BNPB (Akumulasi)</span
                    >
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useAgregatInsightEnhanced } from "~/composables/useAgregatInsightEnhanced";

const props = defineProps({
    regionIds: { type: Array, required: true },
    tahun: { type: Number, default: 2026 },
});

// DATASET ID for Dampak Bencana
const DATASET_ID = 91;

// --- STATE ---
const selectedTanggal = ref("");

// --- DATA FETCHING ---
// Reconstruct a mock "selectedWilayah" object because the composable expects it
const selectedWilayahComputed = computed(() => {
    // The composable logic will parse regionIds internally if we pass it correctly or if we mock the structure
    // But since useAgregatInsightEnhanced expects a specific structure, let's map regionIds back to it
    const w = { provinsi: [], kabupaten: [], kecamatan: [], desa: [] };
    props.regionIds.forEach((id) => {
        if (!id) return;
        const len = id.toString().length;
        if (len === 2) w.provinsi.push(id);
        else if (len === 4 || len === 5) w.kabupaten.push(id);
        else if (len === 6 || len === 7) w.kecamatan.push(id);
        else if (len >= 10) w.desa.push(id);
    });
    return w;
});

const { rawRecords, status, datasetInfo } = useAgregatInsightEnhanced(
    DATASET_ID,
    selectedWilayahComputed,
);

// --- FILTER OPTIONS ---
const tanggalOptions = computed(() => {
    if (!rawRecords.value || rawRecords.value.length === 0) return [];
    return rawRecords.value
        .map((r) => r.tanggal)
        .filter(Boolean)
        .map((d) => formatDateLabel(d))
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort((a, b) => new Date(b) - new Date(a));
});

// --- FILTERED DATA ---
const filteredRecords = computed(() => {
    if (!rawRecords.value || rawRecords.value.length === 0) return [];
    let filtered = [...rawRecords.value];
    if (selectedTanggal.value) {
        filtered = filtered.filter((r) => {
            if (!r.tanggal) return false;
            const recordDate = formatDateLabel(r.tanggal);
            return recordDate === selectedTanggal.value;
        });
    }
    return filtered;
});

// --- STATS CALCULATION ---
const korbanStats = computed(() => {
    const stats = { meninggal: 0, hilang: 0, pengungsi: 0 };
    if (!filteredRecords.value.length) return stats;

    filteredRecords.value.forEach((record) => {
        const indikatorName = (record.indikator?.nama || "").toLowerCase();
        const value = Number(record.value || 0);
        if (indikatorName.includes("meninggal")) stats.meninggal += value;
        else if (indikatorName.includes("hilang")) stats.hilang += value;
        else if (indikatorName.includes("pengungsi")) stats.pengungsi += value;
    });
    return stats;
});

// --- HELPERS ---
const formatNumber = (value) => {
    if (!value || value === 0) return "0";
    return Number(value).toLocaleString("id-ID");
};

const formatDateLabel = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
};

const formatUpdateDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

// Auto-select newest date
watch(
    tanggalOptions,
    (newOptions) => {
        if (newOptions.length > 0 && !selectedTanggal.value) {
            selectedTanggal.value = newOptions[0];
        }
    },
    { immediate: true },
);
</script>
