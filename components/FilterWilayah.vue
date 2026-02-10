<template>
    <div class="relative flex justify-end">
        <!-- Trigger Button -->
        <button
            @click="isOpen = !isOpen"
            class="group flex items-center gap-2 px-3 py-2 rounded-xl bg-white/12 backdrop-blur-md border border-white/15 text-white hover:bg-white/18 transition-all duration-200 shadow-lg hover:shadow-xl w-full max-w-[320px] md:w-auto md:max-w-[450px]"
        >
            <UIcon name="i-heroicons-funnel" class="w-5 h-5 flex-shrink-0" />

            <div
                class="flex flex-col items-start leading-tight min-w-0 overflow-hidden flex-1 h-8 justify-center"
            >
                <span
                    v-if="locationDisplayShort.main !== 'Seluruh Wilayah'"
                    class="text-[9px] font-bold text-white/60 uppercase tracking-widest pl-0.5 block h-3"
                >
                    Wilayah Terpilih
                </span>

                <div class="flex items-center gap-1.5 w-full">
                    <span class="text-xs font-medium truncate">
                        {{ locationDisplayShort.main }}
                    </span>
                    <span
                        v-if="locationDisplayShort.more"
                        class="hidden sm:inline-flex px-1.5 py-0.5 bg-amber-500 text-[9px] font-bold text-white rounded-md shadow-sm whitespace-nowrap"
                    >
                        {{ locationDisplayShort.more }}
                    </span>
                </div>
            </div>

            <UIcon
                :name="
                    isOpen
                        ? 'i-heroicons-chevron-up'
                        : 'i-heroicons-chevron-down'
                "
                class="w-4 h-4 ml-auto transition-transform flex-shrink-0 text-white/50 group-hover:text-white"
            />
        </button>

        <!-- Floating Panel -->
        <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95 -translate-y-2"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 -translate-y-2"
        >
            <div
                v-if="isOpen"
                class="fixed top-27 right-6 w-[90vw] md:w-[420px] lg:w-[450px] bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5"
                style="
                    z-index: 9999;
                    box-shadow:
                        0 25px 50px -12px rgba(0, 0, 0, 0.5),
                        0 0 0 1px rgba(255, 255, 255, 0.05) inset;
                "
            >
                <!-- Header -->
                <div
                    class="flex items-center justify-between mb-4 pb-3 border-b border-white/10"
                >
                    <h3
                        class="text-lg font-bold text-white flex items-center gap-2"
                    >
                        <UIcon
                            name="i-heroicons-map-pin"
                            class="w-5 h-5 text-amber-400"
                        />
                        Pilih Wilayah
                    </h3>
                    <button
                        @click="isOpen = false"
                        class="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                    </button>
                </div>

                <!-- Filter Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <!-- Provinsi -->
                    <div class="relative">
                        <label
                            class="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5"
                        >
                            Provinsi
                        </label>
                        <VirtualSelectMenu
                            :model-value="getDisplayValue('provinsi')"
                            @update:model-value="
                                (val) => handleSelection('provinsi', val)
                            "
                            :items="['Seluruh Wilayah', ...provinsiOptions]"
                            :all-items="provinsiData"
                            placeholder="Pilih Provinsi"
                            :loading="loadingProvinsi"
                            :ui="selectUiConfig"
                        >
                            <template #label>
                                <span
                                    v-if="localFilters.provinsi.length === 0"
                                    class="text-white/80"
                                >
                                    Pilih Provinsi
                                </span>
                                <span
                                    v-else-if="
                                        localFilters.provinsi.includes(
                                            'Seluruh Wilayah',
                                        )
                                    "
                                    class="truncate"
                                >
                                    Seluruh Wilayah
                                </span>
                                <span
                                    v-else-if="
                                        localFilters.provinsi.filter(
                                            (x) => x !== 'Seluruh Wilayah',
                                        ).length === 1
                                    "
                                    class="truncate"
                                >
                                    {{
                                        localFilters.provinsi.filter(
                                            (x) => x !== "Seluruh Wilayah",
                                        )[0]
                                    }}
                                </span>
                                <span v-else class="truncate">
                                    {{
                                        localFilters.provinsi.filter(
                                            (x) => x !== "Seluruh Wilayah",
                                        ).length
                                    }}
                                    Provinsi
                                </span>
                            </template>
                        </VirtualSelectMenu>
                    </div>

                    <!-- Kabupaten/Kota -->
                    <div class="relative">
                        <label
                            class="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5"
                        >
                            Kabupaten/Kota
                        </label>
                        <VirtualSelectMenu
                            :model-value="getDisplayValue('kabupaten')"
                            @update:model-value="
                                (val) => handleSelection('kabupaten', val)
                            "
                            :items="['Seluruh Wilayah', ...kabupatenOptions]"
                            :all-items="kabupatenData"
                            placeholder="Pilih Kabupaten"
                            :disabled="localFilters.provinsi.length === 0"
                            :loading="loadingKabupaten"
                            :ui="selectUiConfigWithDisabled"
                        >
                            <template #label>
                                <span
                                    v-if="localFilters.kabupaten.length === 0"
                                    class="text-white/80"
                                >
                                    Pilih Kabupaten
                                </span>
                                <span
                                    v-else-if="
                                        localFilters.kabupaten.includes(
                                            'Seluruh Wilayah',
                                        )
                                    "
                                >
                                    Seluruh Wilayah
                                </span>
                                <span
                                    v-else-if="
                                        localFilters.kabupaten.filter(
                                            (x) => x !== 'Seluruh Wilayah',
                                        ).length === 1
                                    "
                                    class="truncate"
                                >
                                    {{
                                        localFilters.kabupaten.filter(
                                            (x) => x !== "Seluruh Wilayah",
                                        )[0]
                                    }}
                                </span>
                                <span v-else>
                                    {{
                                        localFilters.kabupaten.filter(
                                            (x) => x !== "Seluruh Wilayah",
                                        ).length
                                    }}
                                    Kabupaten
                                </span>
                            </template>
                        </VirtualSelectMenu>
                    </div>

                    <!-- Kecamatan -->
                    <div class="relative">
                        <label
                            class="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5"
                        >
                            Kecamatan
                        </label>
                        <UTooltip
                            text="Data untuk level Kecamatan belum tersedia"
                            :prevent="!disabledLevels.includes('kecamatan')"
                            :popper="{ placement: 'top' }"
                        >
                            <VirtualSelectMenu
                                :model-value="getDisplayValue('kecamatan')"
                                @update:model-value="
                                    (val) => handleSelection('kecamatan', val)
                                "
                                :items="[
                                    'Seluruh Wilayah',
                                    ...kecamatanOptions,
                                ]"
                                :all-items="kecamatanData"
                                placeholder="Pilih Kecamatan"
                                :disabled="
                                    localFilters.kabupaten.length === 0 ||
                                    disabledLevels.includes('kecamatan')
                                "
                                :loading="loadingKecamatan"
                                :ui="selectUiConfigWithDisabled"
                            >
                                <template #label>
                                    <span
                                        v-if="
                                            localFilters.kecamatan.length === 0
                                        "
                                        class="text-white/80"
                                    >
                                        Pilih Kecamatan
                                    </span>
                                    <span
                                        v-else-if="
                                            localFilters.kecamatan.includes(
                                                'Seluruh Wilayah',
                                            )
                                        "
                                    >
                                        Seluruh Wilayah
                                    </span>
                                    <span
                                        v-else-if="
                                            localFilters.kecamatan.filter(
                                                (x) => x !== 'Seluruh Wilayah',
                                            ).length === 1
                                        "
                                        class="truncate"
                                    >
                                        {{
                                            localFilters.kecamatan.filter(
                                                (x) => x !== "Seluruh Wilayah",
                                            )[0]
                                        }}
                                    </span>
                                    <span v-else>
                                        {{
                                            localFilters.kecamatan.filter(
                                                (x) => x !== "Seluruh Wilayah",
                                            ).length
                                        }}
                                        Kecamatan
                                    </span>
                                </template>
                            </VirtualSelectMenu>
                        </UTooltip>
                    </div>

                    <!-- Desa/Kelurahan -->
                    <div class="relative">
                        <label
                            class="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5"
                        >
                            Desa/Kelurahan
                        </label>
                        <UTooltip
                            text="Data untuk level Desa/Kelurahan belum tersedia"
                            :prevent="!disabledLevels.includes('desa')"
                            :popper="{ placement: 'top' }"
                        >
                            <VirtualSelectMenu
                                :model-value="getDisplayValue('desa')"
                                @update:model-value="
                                    (val) => handleSelection('desa', val)
                                "
                                :items="['Seluruh Wilayah', ...desaOptions]"
                                :all-items="desaData"
                                placeholder="Pilih Desa"
                                :disabled="
                                    localFilters.kecamatan.length === 0 ||
                                    disabledLevels.includes('desa')
                                "
                                :loading="loadingDesa"
                                :ui="selectUiConfigWithDisabled"
                            >
                                <template #label>
                                    <span
                                        v-if="localFilters.desa.length === 0"
                                        class="text-white/80"
                                    >
                                        Pilih Desa
                                    </span>
                                    <span
                                        v-else-if="
                                            localFilters.desa.includes(
                                                'Seluruh Wilayah',
                                            )
                                        "
                                    >
                                        Seluruh Wilayah
                                    </span>
                                    <span
                                        v-else-if="
                                            localFilters.desa.filter(
                                                (x) => x !== 'Seluruh Wilayah',
                                            ).length === 1
                                        "
                                        class="truncate"
                                    >
                                        {{
                                            localFilters.desa.filter(
                                                (x) => x !== "Seluruh Wilayah",
                                            )[0]
                                        }}
                                    </span>
                                    <span v-else>
                                        {{
                                            localFilters.desa.filter(
                                                (x) => x !== "Seluruh Wilayah",
                                            ).length
                                        }}
                                        Desa
                                    </span>
                                </template>
                            </VirtualSelectMenu>
                        </UTooltip>
                    </div>
                </div>

                <!-- Selected Summary Section -->
                <div
                    v-if="selectedFilterSummary.length > 0"
                    class="mb-4 p-3 rounded-xl bg-white/5 border border-white/10"
                >
                    <div
                        class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2"
                    >
                        Wilayah Terpilih Saat Ini
                    </div>
                    <div
                        class="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto custom-scrollbar"
                    >
                        <span
                            v-for="(item, index) in selectedFilterSummary"
                            :key="index"
                            class="inline-flex items-center px-2 py-1 rounded bg-amber-500/20 border border-amber-500/30 text-[10px] font-medium text-amber-200"
                        >
                            {{ item }}
                        </span>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div
                    class="flex items-center gap-3 pt-3 border-t border-white/10"
                >
                    <button
                        @click="applyFiltersAndClose"
                        :disabled="isApplyDisabled"
                        class="flex-1 flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-amber-500 text-white font-medium text-sm transition-all duration-200 shadow-md hover:bg-amber-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:hover:bg-slate-600"
                    >
                        <UIcon name="i-heroicons-check" class="w-4 h-4" />
                        <span>Terapkan Filter</span>
                    </button>

                    <button
                        @click="clearFilters"
                        class="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-white/10 text-slate-300 font-medium text-sm transition-all duration-200 shadow-md hover:bg-white/15 hover:text-white hover:shadow-lg"
                    >
                        <UIcon name="i-heroicons-x-circle" class="w-4 h-4" />
                        <span>Reset</span>
                    </button>
                </div>
            </div>
        </Transition>

        <!-- Backdrop with Vignette Effect -->
        <Transition
            enter-active-class="transition-opacity duration-200"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-150"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div
                v-if="isOpen"
                @click="isOpen = false"
                class="fixed inset-0"
                style="
                    z-index: 9990;
                    background: radial-gradient(
                        ellipse 800px 600px at 85% 25%,
                        rgba(0, 0, 0, 0.65) 0%,
                        transparent 100%
                    );
                "
            ></div>
        </Transition>
    </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from "vue";
import VirtualSelectMenu from "~/components/VirtualSelectMenu.vue";

const toast = useToast();

const props = defineProps({
    modelValue: { type: Object, required: true },
    requiredLevel: { type: String, default: null },
    useNasional: { type: Boolean, default: true },
    disabledLevels: {
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits(["update:modelValue"]);

// Floating panel state
const isOpen = ref(false);

const locationDisplayShort = computed(() => {
    const w = props.modelValue;
    const names =
        (w.desaNames?.length && !w.desaNames.includes("Seluruh Wilayah")
            ? w.desaNames
            : null) ||
        (w.kecamatanNames?.length &&
        !w.kecamatanNames.includes("Seluruh Wilayah")
            ? w.kecamatanNames
            : null) ||
        (w.kabupatenNames?.length &&
        !w.kabupatenNames.includes("Seluruh Wilayah")
            ? w.kabupatenNames
            : null) ||
        (w.provinsiNames?.length && !w.provinsiNames.includes("Seluruh Wilayah")
            ? w.provinsiNames
            : null) ||
        [];

    if (!names.length) {
        return { main: "Seluruh Wilayah", more: null };
    }

    const maxItems = 3;
    const displayNames = names.slice(0, maxItems).join(", ");
    const remaining = names.length - maxItems;

    return {
        main: displayNames,
        more: remaining > 0 ? `+${remaining} Lainnya` : null,
    };
});

const selectedFilterSummary = computed(() => {
    const f = localFilters.value;
    // Determine the deepest level that has a selection
    let activeNames = [];

    if (f.desa.length > 0 && !f.desa.includes("Seluruh Wilayah")) {
        activeNames = f.desa;
    } else if (
        f.kecamatan.length > 0 &&
        !f.kecamatan.includes("Seluruh Wilayah")
    ) {
        activeNames = f.kecamatan;
    } else if (
        f.kabupaten.length > 0 &&
        !f.kabupaten.includes("Seluruh Wilayah")
    ) {
        activeNames = f.kabupaten;
    } else if (
        f.provinsi.length > 0 &&
        !f.provinsi.includes("Seluruh Wilayah")
    ) {
        activeNames = f.provinsi;
    } else if (
        f.desa.includes("Seluruh Wilayah") ||
        f.kecamatan.includes("Seluruh Wilayah") ||
        f.kabupaten.includes("Seluruh Wilayah") ||
        f.provinsi.includes("Seluruh Wilayah")
    ) {
        return ["Seluruh Wilayah"];
    }

    return activeNames;
});

// State untuk data wilayah
const provinsiData = ref([]);
const kabupatenData = ref([]);
const kecamatanData = ref([]);
const desaData = ref([]);

// State untuk loading
const loadingProvinsi = ref(false);
const loadingKabupaten = ref(false);
const loadingKecamatan = ref(false);
const loadingDesa = ref(false);

// Local filter state
const localFilters = ref({
    provinsi: [],
    kabupaten: [],
    kecamatan: [],
    desa: [],
});

// Flag untuk tracking "Seluruh Wilayah"
const isSelectAll = ref({
    provinsi: false,
    kabupaten: false,
    kecamatan: false,
    desa: false,
});

// Active filter count - removed since we use locationDisplayShort now, but keeping helper logic if needed elsewhere
const activeFilterCount = computed(() => {
    let count = 0;
    if (localFilters.value.provinsi.length > 0) count++;
    if (localFilters.value.kabupaten.length > 0) count++;
    if (localFilters.value.kecamatan.length > 0) count++;
    if (localFilters.value.desa.length > 0) count++;
    return count;
});

// ==================== HELPER FUNCTIONS ====================
const getIdsFromNames = (names, dataArray, isAll = false) => {
    if (isAll) {
        return dataArray.map((item) => item.id);
    }

    const realNames = names.filter((n) => n !== "Seluruh Wilayah");
    return dataArray
        .filter((item) => realNames.includes(item.nama))
        .map((item) => item.id);
};

const getDisplayValue = (level) => {
    const selected = localFilters.value[level];
    if (selected.includes("Seluruh Wilayah")) {
        return selected;
    }
    return selected;
};

// ==================== COMPUTED OPTIONS ====================
const provinsiOptions = computed(() => provinsiData.value.map((p) => p.nama));
const kabupatenOptions = computed(() => kabupatenData.value.map((k) => k.nama));
const kecamatanOptions = computed(() => kecamatanData.value.map((k) => k.nama));
const desaOptions = computed(() => desaData.value.map((d) => d.nama));

// ==================== FETCH FUNCTIONS ====================
const fetchProvinsi = async () => {
    try {
        loadingProvinsi.value = true;
        const data = await $fetch("/api/wilayah", {
            params: { level: "prov" },
        });

        let processedData = data || [];

        if (!props.useNasional) {
            processedData = processedData.filter(
                (p) =>
                    p.nama.toUpperCase() !== "NASIONAL" &&
                    p.nama.toUpperCase() !== "INDONESIA",
            );
        }

        provinsiData.value = processedData;
    } catch (error) {
        console.error("Error fetching provinsi:", error);
        toast.add({
            title: "Error",
            description: "Gagal memuat data provinsi",
            icon: "i-heroicons-exclamation-circle",
            color: "red",
        });
    } finally {
        loadingProvinsi.value = false;
    }
};

const fetchKabupaten = async (provinsiIds) => {
    try {
        loadingKabupaten.value = true;
        kabupatenData.value = [];

        const BATCH_SIZE = 30;
        const batches = [];

        for (let i = 0; i < provinsiIds.length; i += BATCH_SIZE) {
            batches.push(provinsiIds.slice(i, i + BATCH_SIZE));
        }

        for (const batch of batches) {
            try {
                const data = await $fetch("/api/wilayah-batch", {
                    params: {
                        level: "kab",
                        parentIds: batch.join(","),
                    },
                });

                if (Array.isArray(data)) {
                    kabupatenData.value.push(...data);
                }
            } catch (err) {
                console.warn(`Batch fetch kabupaten failed:`, err);
            }

            if (batches.indexOf(batch) < batches.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, 20));
            }
        }

        const seen = new Set();
        kabupatenData.value = kabupatenData.value.filter((item) => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
        });
    } catch (error) {
        console.error("Error fetching kabupaten:", error);
        toast.add({
            title: "Error",
            description: "Gagal memuat data kabupaten",
            icon: "i-heroicons-exclamation-circle",
            color: "red",
        });
    } finally {
        loadingKabupaten.value = false;
    }
};

const fetchKecamatan = async (kabupatenIds) => {
    try {
        loadingKecamatan.value = true;
        kecamatanData.value = [];

        if (kabupatenIds.length > 50) {
            toast.add({
                title: "Loading Data Kecamatan",
                description: `Memuat data dari ${kabupatenIds.length} kabupaten...`,
                icon: "i-heroicons-clock",
                color: "amber",
                timeout: 2000,
            });
        }

        const BATCH_SIZE = 100;
        const batches = [];

        for (let i = 0; i < kabupatenIds.length; i += BATCH_SIZE) {
            batches.push(kabupatenIds.slice(i, i + BATCH_SIZE));
        }

        for (const batch of batches) {
            try {
                const data = await $fetch("/api/wilayah-batch", {
                    params: {
                        level: "kec",
                        parentIds: batch.join(","),
                    },
                });

                if (Array.isArray(data)) {
                    kecamatanData.value.push(...data);
                }
            } catch (err) {
                console.warn(`Batch fetch kecamatan failed:`, err);
            }

            if (batches.indexOf(batch) < batches.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, 30));
            }
        }

        const seen = new Set();
        kecamatanData.value = kecamatanData.value.filter((item) => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
        });
    } catch (error) {
        console.error("Error fetching kecamatan:", error);
        toast.add({
            title: "Error",
            description: "Gagal memuat data kecamatan",
            icon: "i-heroicons-exclamation-circle",
            color: "red",
        });
    } finally {
        loadingKecamatan.value = false;
    }
};

const fetchDesa = async (kecamatanIds) => {
    try {
        loadingDesa.value = true;
        desaData.value = [];

        if (kecamatanIds.length > 100) {
            toast.add({
                title: "Loading Data Desa",
                description: `Memuat data dari ${kecamatanIds.length} kecamatan...`,
                icon: "i-heroicons-clock",
                color: "amber",
                timeout: 3000,
            });
        }

        const BATCH_SIZE = 150;
        const batches = [];

        for (let i = 0; i < kecamatanIds.length; i += BATCH_SIZE) {
            batches.push(kecamatanIds.slice(i, i + BATCH_SIZE));
        }

        for (const batch of batches) {
            try {
                const data = await $fetch("/api/wilayah-batch", {
                    params: {
                        level: "desa",
                        parentIds: batch.join(","),
                    },
                });

                if (Array.isArray(data)) {
                    desaData.value.push(...data);
                }
            } catch (err) {
                console.warn(`Batch fetch desa failed:`, err);
            }

            if (batches.indexOf(batch) < batches.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, 50));
            }
        }

        const seen = new Set();
        desaData.value = desaData.value.filter((item) => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
        });

        toast.add({
            title: "Selesai",
            description: `${desaData.value.length} desa berhasil dimuat`,
            icon: "i-heroicons-check-circle",
            color: "green",
            timeout: 2000,
        });
    } catch (error) {
        console.error("Error fetching desa:", error);
        toast.add({
            title: "Error",
            description: "Gagal memuat data desa",
            icon: "i-heroicons-exclamation-circle",
            color: "red",
        });
    } finally {
        loadingDesa.value = false;
    }
};

// ==================== HANDLE SELECTION ====================
const handleSelection = async (level, newVal) => {
    const allTag = "Seluruh Wilayah";
    const oldVal = localFilters.value[level];

    let fullList;
    if (level === "provinsi") fullList = provinsiOptions.value;
    else if (level === "kabupaten") fullList = kabupatenOptions.value;
    else if (level === "kecamatan") fullList = kecamatanOptions.value;
    else fullList = desaOptions.value;

    const justSelectedAll = newVal.includes(allTag) && !oldVal.includes(allTag);
    const justRemovedAll = !newVal.includes(allTag) && oldVal.includes(allTag);

    let result = [];

    if (justSelectedAll) {
        result = [allTag, ...fullList];
        isSelectAll.value[level] = true;
    } else if (justRemovedAll) {
        result = [];
        isSelectAll.value[level] = false;
    } else {
        const realItems = newVal.filter((x) => x !== allTag);

        if (realItems.length === fullList.length && fullList.length > 0) {
            result = [allTag, ...realItems];
            isSelectAll.value[level] = true;
        } else {
            result = realItems;
            isSelectAll.value[level] = false;
        }
    }

    localFilters.value[level] = result;

    if (level === "provinsi") {
        localFilters.value.kabupaten = [];
        localFilters.value.kecamatan = [];
        localFilters.value.desa = [];
        isSelectAll.value.kabupaten = false;
        isSelectAll.value.kecamatan = false;
        isSelectAll.value.desa = false;

        const provinsiIds = getIdsFromNames(
            result,
            provinsiData.value,
            isSelectAll.value[level],
        );

        if (provinsiIds.length > 0) {
            await fetchKabupaten(provinsiIds);
        } else {
            kabupatenData.value = [];
            kecamatanData.value = [];
            desaData.value = [];
        }
    } else if (level === "kabupaten") {
        localFilters.value.kecamatan = [];
        localFilters.value.desa = [];
        isSelectAll.value.kecamatan = false;
        isSelectAll.value.desa = false;

        const kabupatenIds = getIdsFromNames(
            result,
            kabupatenData.value,
            isSelectAll.value[level],
        );

        if (kabupatenIds.length > 0) {
            await fetchKecamatan(kabupatenIds);
        } else {
            kecamatanData.value = [];
            desaData.value = [];
        }
    } else if (level === "kecamatan") {
        localFilters.value.desa = [];
        isSelectAll.value.desa = false;

        const kecamatanIds = getIdsFromNames(
            result,
            kecamatanData.value,
            isSelectAll.value[level],
        );

        if (kecamatanIds.length > 0) {
            await fetchDesa(kecamatanIds);
        } else {
            desaData.value = [];
        }
    }
};

// ==================== APPLY & CLEAR FILTERS ====================
const isApplyDisabled = computed(() => {
    if (!props.requiredLevel) return false;
    const f = localFilters.value;
    if (props.requiredLevel === "provinsi") return f.provinsi.length === 0;
    if (props.requiredLevel === "kabupaten") return f.kabupaten.length === 0;
    if (props.requiredLevel === "kecamatan") return f.kecamatan.length === 0;
    if (props.requiredLevel === "desa") return f.desa.length === 0;
    return false;
});

const applyFilters = () => {
    if (isApplyDisabled.value) return;

    const provinsiIds = getIdsFromNames(
        localFilters.value.provinsi,
        provinsiData.value,
        isSelectAll.value.provinsi,
    );
    const kabupatenIds = getIdsFromNames(
        localFilters.value.kabupaten,
        kabupatenData.value,
        isSelectAll.value.kabupaten,
    );
    const kecamatanIds = getIdsFromNames(
        localFilters.value.kecamatan,
        kecamatanData.value,
        isSelectAll.value.kecamatan,
    );
    const desaIds = getIdsFromNames(
        localFilters.value.desa,
        desaData.value,
        isSelectAll.value.desa,
    );

    const filterData = {
        provinsi: provinsiIds,
        kabupaten: kabupatenIds,
        kecamatan: kecamatanIds,
        desa: desaIds,
        provinsiNames: isSelectAll.value.provinsi
            ? ["Seluruh Wilayah"]
            : localFilters.value.provinsi,
        kabupatenNames: isSelectAll.value.kabupaten
            ? ["Seluruh Wilayah"]
            : localFilters.value.kabupaten,
        kecamatanNames: isSelectAll.value.kecamatan
            ? ["Seluruh Wilayah"]
            : localFilters.value.kecamatan,
        desaNames: isSelectAll.value.desa
            ? ["Seluruh Wilayah"]
            : localFilters.value.desa,
    };

    emit("update:modelValue", filterData);

    toast.add({
        title: "Filter Diterapkan",
        description: "Visualisasi diperbarui.",
        icon: "i-heroicons-map",
        color: "emerald",
    });
};

const applyFiltersAndClose = () => {
    applyFilters();
    isOpen.value = false;
};

const clearFilters = () => {
    localFilters.value = {
        provinsi: [],
        kabupaten: [],
        kecamatan: [],
        desa: [],
    };

    isSelectAll.value = {
        provinsi: false,
        kabupaten: false,
        kecamatan: false,
        desa: false,
    };

    kabupatenData.value = [];
    kecamatanData.value = [];
    desaData.value = [];

    emit("update:modelValue", {
        provinsi: [],
        kabupaten: [],
        kecamatan: [],
        desa: [],
        provinsiNames: [],
        kabupatenNames: [],
        kecamatanNames: [],
        desaNames: [],
    });

    toast.add({
        title: "Filter Dihapus",
        description: "Semua filter wilayah telah direset.",
        icon: "i-heroicons-x-circle",
        color: "blue",
    });
};

// ==================== LIFECYCLE ====================
// ==================== LIFECYCLE ====================
onMounted(async () => {
    // 1. Fetch data master provinsi dulu
    await fetchProvinsi();

    // 2. LOGIKA BARU: Cek apakah ada default value dari Parent (props.modelValue)
    if (
        props.modelValue &&
        props.modelValue.provinsi &&
        props.modelValue.provinsi.length > 0
    ) {
        // Normalisasi input: Ubah object {id:'11'} atau string "11" menjadi array ID string ["11"]
        const inputIds = props.modelValue.provinsi
            .map((item) =>
                typeof item === "object" ? item.id || item.kode : item,
            )
            .map(String);

        // Cari Nama Provinsi yang ID-nya cocok dengan input
        const matchedNames = provinsiData.value
            .filter((p) => inputIds.includes(String(p.id)))
            .map((p) => p.nama);

        // Jika ada yang cocok, update localFilters
        if (matchedNames.length > 0) {
            localFilters.value.provinsi = matchedNames;

            // Note: Tidak perlu panggil fetchKabupaten manual disini,
            // karena watcher 'localFilters.value.provinsi' akan otomatis berjalan
            // dan mengambil data kabupaten setelah baris ini.
        }
    }
});

watch(
    () => localFilters.value.provinsi,
    async (newVal, oldVal) => {
        if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return;

        const allTag = "Seluruh Wilayah";
        const fullList = provinsiOptions.value;

        const justSelectedAll =
            newVal.includes(allTag) && !oldVal.includes(allTag);
        const justRemovedAll =
            !newVal.includes(allTag) && oldVal.includes(allTag);

        let result = newVal;

        if (justSelectedAll) {
            result = [allTag, ...fullList];
            localFilters.value.provinsi = result;
            isSelectAll.value.provinsi = true;
        } else if (justRemovedAll) {
            result = [];
            localFilters.value.provinsi = result;
            isSelectAll.value.provinsi = false;
        } else {
            const realItems = newVal.filter((x) => x !== allTag);
            if (realItems.length === fullList.length && fullList.length > 0) {
                result = [allTag, ...realItems];
                localFilters.value.provinsi = result;
                isSelectAll.value.provinsi = true;
            } else {
                isSelectAll.value.provinsi = false;
            }
        }

        localFilters.value.kabupaten = [];
        localFilters.value.kecamatan = [];
        localFilters.value.desa = [];
        isSelectAll.value.kabupaten = false;
        isSelectAll.value.kecamatan = false;
        isSelectAll.value.desa = false;

        const provinsiIds = getIdsFromNames(
            result,
            provinsiData.value,
            isSelectAll.value.provinsi,
        );

        if (provinsiIds.length > 0) {
            await fetchKabupaten(provinsiIds);
        } else {
            kabupatenData.value = [];
            kecamatanData.value = [];
            desaData.value = [];
        }
    },
);

watch(
    () => props.modelValue,
    (newVal) => {
        if (
            newVal.provinsi?.length === 0 &&
            newVal.kabupaten?.length === 0 &&
            newVal.kecamatan?.length === 0 &&
            newVal.desa?.length === 0
        ) {
            localFilters.value = {
                provinsi: [],
                kabupaten: [],
                kecamatan: [],
                desa: [],
            };
            isSelectAll.value = {
                provinsi: false,
                kabupaten: false,
                kecamatan: false,
                desa: false,
            };
        }
    },
    { deep: true },
);

// ==================== UI CONFIG ====================
const selectUiConfig = {
    trigger: `
    h-[36px]
    px-3
    rounded-lg
    bg-slate-800
    border border-slate-600
    text-slate-100
    hover:bg-slate-700
    hover:border-slate-500
    focus:outline-none
    focus:ring-2
    focus:ring-primary-500/60
    transition-all
  `,
    base: `
    bg-slate-800
    border border-slate-700
    rounded-lg
    shadow-xl
  `,
    option: {
        base: `
      px-3 py-2
      text-slate-200
      hover:bg-slate-700
      transition-colors
    `,
    },
};

const selectUiConfigWithDisabled = {
    ...selectUiConfig,
    trigger:
        selectUiConfig.trigger +
        " disabled:opacity-50 disabled:cursor-not-allowed",
};
</script>
