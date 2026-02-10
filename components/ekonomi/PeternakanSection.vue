<template>
    <div class="relative bg-white border border-gray-200 rounded-xl shadow-sm p-4 pt-10 mt-4">
        <div class="absolute -top-4 left-0 right-0 px-4 flex flex-wrap items-center justify-between gap-2 z-20">
            <div class="flex flex-wrap items-center gap-2">
                <div class="flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-lg border border-blue-100 shadow-sm whitespace-nowrap">
                    <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-blue-600" />
                    <span class="text-[10px] font-black text-blue-700 uppercase tracking-wider">
                        Subsektor Peternakan
                    </span>
                </div>
            </div>

            <div class="flex flex-row gap-2">
                <UButton
                    @click="isDetailOpen = true"
                    icon="i-heroicons-information-circle"
                    size="sm"
                    color="gray"
                    variant="solid"
                    class="font-bold shadow-md text-white bg-gray-900 hover:shadow-lg hover:shadow-gray-500/40 hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300"
                    :ui="{
                        rounded: 'rounded-lg',
                        padding: { sm: 'px-3 py-2' },
                        font: 'font-bold',
                        icon: { size: { sm: 'w-4 h-4' } }
                    }"
                />

                <UButton
                    @click="isChartOpen = true"
                    icon="i-heroicons-chart-bar"
                    size="sm"
                    color="gray"
                    variant="solid"
                    class="font-bold shadow-md text-white bg-gray-900 hover:shadow-lg hover:shadow-gray-500/40 hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300"
                    :ui="{
                        rounded: 'rounded-lg',
                        padding: { sm: 'px-3 py-2' },
                        font: 'font-bold',
                        icon: { size: { sm: 'w-4 h-4' } }
                    }"
                />

                <UButton
                    @click="isDetailOpen = true"
                    icon="i-heroicons-table-cells"
                    size="sm"
                    color="gray"
                    variant="solid"
                    class="font-bold shadow-md text-white bg-gray-900 hover:shadow-lg hover:shadow-gray-500/40 hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300"
                    :ui="{
                        rounded: 'rounded-lg',
                        padding: { sm: 'px-3 py-2' },
                        font: 'font-bold',
                        icon: { size: { sm: 'w-4 h-4' } }
                    }"
                />
            </div>
        </div>

        <div v-if="loading" class="mt-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard v-for="n in 6" :key="n" label="Memuat..." :loading="true" />
            </div>
        </div>

        <template v-else-if="dynamicRows.length > 0">
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
                <StatCard
                    v-for="(row, index) in dynamicRows"
                    :key="index"
                    :label="`${row.title} Terdampak`"
                    :color="getColorForIndex(index)"
                    icon="i-heroicons-building-storefront"
                    :isRound="true"
                >
                    <template #default>
                        <div
                            class="flex flex-col gap-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200"
                        >
                            <!-- Total -->
                            <div class="flex items-baseline gap-2">
                                <span
                                    class="text-4xl font-extrabold tracking-tight"
                                    :class="`text-${getColorForIndex(index)}-600`"
                                >
                                    {{ row.total == null ? "N/A" : formatNumber(row.total) }}
                                </span>
                                <span
                                    class="text-[11px] text-slate-500 font-bold uppercase"
                                >
                                    Unit
                                </span>
                            </div>

                            <!-- Breakdown Grid (3x2 auto) -->
                            <div
                                class="grid grid-cols-2 gap-3 text-[11px] uppercase font-semibold"
                            >
                                <div
                                    v-for="item in row.cards"
                                    :key="item.key"
                                    class="flex items-center justify-between p-2 rounded-md border"
                                    :class="[
                                        `bg-${item.color}-50`,
                                        `border-${item.color}-200`
                                    ]"
                                >
                                    <span
                                        class="font-semibold text-[10px]"
                                        :class="`text-${item.color}-700`"
                                    >
                                        {{ item.label }}
                                    </span>

                                    <span
                                        class="font-black text-[11px]"
                                        :class="`text-${item.color}-900`"
                                    >
                                        {{ formatNumber(item.value) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </template>
                </StatCard>
            </div>
        </template>

        <div v-else class="py-12 text-center">
            <UIcon name="i-heroicons-inbox" class="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p class="text-sm text-gray-500">Tidak ada data peternakan terdampak</p>
        </div>

        <Teleport to="body">
            <SharedDatasetInfoModal
                v-if="datasetInfo"
                :is-open="isInfoOpen"
                :dataset-info="datasetInfo"
                @close="isInfoOpen = false"
            />
        </Teleport>
        <Teleport to="body">
            <SharedDetailModal
                :is-open="isDetailOpen"
                title="Detail Peternakan Terdampak"
                :dataset-id="130"
                :indikator-insight-id="308"
                :region-ids="selectedWilayah || []"
                :column-config="dynamicRows"
                @close="isDetailOpen = false"
            />
        </Teleport>
    </div>
</template>

<script setup>
import StatCard from "~/components/shared/StatCard.vue";
import SharedDetailModal from "~/components/shared/DetailModal.vue"
import SharedDatasetInfoModal from "~/components/shared/DatasetInfoModal.vue"

const props = defineProps({
    selectedWilayah: { type: Object, required: true },
});

const headers = useRequestHeaders(["cookie"]);

const loading = ref(false);
const datasetInfo = ref(null);
const isDetailOpen = ref(false);

// helper
// const formatDate = (isoString) => {
//     if (!isoString) return "-";
//     try {
//         const date = new Date(isoString);
//         return new Intl.DateTimeFormat("id-ID", {
//             day: "numeric",
//             month: "long",
//             year: "numeric",
//         }).format(date);
//     } catch (e) {
//         return isoString;
//     }
// };

async function fetchDataJitupasna() {
    let w = props.selectedWilayah;

    let idWilayah = w.desa?.length
        ? w.desa
        : w.kecamatan?.length
          ? w.kecamatan
          : w.kabupaten?.length
            ? w.kabupaten
            : w.provinsi?.length
              ? w.provinsi
              : null

    let level = w.desa?.length
        ? "id_desa"
        : w.kecamatan?.length
          ? "id_kec"
          : w.kabupaten?.length
            ? "id_kab"
            : "id_prov";

    try {
        const endpoint = "/api/agregat-insight";
        let requests = [];

        if (idWilayah) {
            requests = idWilayah?.map((wilayahId) => {
                return $fetch(endpoint, {
                headers: headers,
                query: {
                    id_dataset: 130,
                    id_indikator_insight: 308,
                    [level]: wilayahId,
                },
            });
        });
        } else {
            requests = [
                $fetch(endpoint, {
                    headers,
                    query: {
                        id_dataset: 130,
                        id_indikator_insight: 308,
                    },
                }),
            ];
        }

        const responses = await Promise.all(requests);
        const allRecords = responses.flatMap((r) => r?.data?.records || []);

        if (responses[0]?.data?.meta) {
            datasetInfo.value = responses[0].data.meta.dataset;
        }
        return allRecords;
    } catch (e) {
        console.error(e);
        return [];
    } finally {
        loading.value = false;
    }
}


const rowMatcher = (r) => {
    const subsektor = r.itemCategory1?.nama;
    if (subsektor !== 'Peternakan') return null;

    const kerusakan = r.itemCategory2?.kode || "";
    
    if (kerusakan === 'rusak_berat') return 'rusakberat';
    if (kerusakan === 'rusak_sedang') return 'rusaksedang';
    if (kerusakan === 'rusak_ringan') return 'rusakringan';

    return null;
};

const dynamicRows = ref([]);
async function processedData() {
    loading.value = true;
    try {
        let records = await fetchDataJitupasna();
        
        const peternakanRecords = records.filter(item => item.itemCategory1?.nama === 'Peternakan');

        const listSubsektor = Array.from(new Map(peternakanRecords.map(r => [r.itemCategory2?.nama, r.itemCategory2])).values()).filter(Boolean);

        dynamicRows.value = listSubsektor.map((sub) => {
            const subRecords = peternakanRecords.filter(
                r => r.itemCategory2?.nama === sub.nama
            );

            const rusakRingan = subRecords
                .filter(r => r.itemCategory3?.nama === 'Rusak Ringan')
                .reduce((a, c) => a + (Number(c.value) || 0), 0);

            const rusakSedang = subRecords
                .filter(r => r.itemCategory3?.nama === 'Rusak Sedang')
                .reduce((a, c) => a + (Number(c.value) || 0), 0);

            const rusakBerat = subRecords
                .filter(r => r.itemCategory3?.nama === 'Rusak Berat')
                .reduce((a, c) => a + (Number(c.value) || 0), 0);

            const total = rusakRingan + rusakSedang + rusakBerat;

            return {
                title: sub.nama,
                total,
                cards: [
                    {
                        key: "rusak_ringan",
                        label: "Rusak Ringan",
                        value: rusakRingan,
                        color: "emerald",
                    },
                    {
                        key: "rusak_sedang",
                        label: "Rusak Sedang",
                        value: rusakSedang,
                        color: "amber",
                    },
                    {
                        key: "rusak_berat",
                        label: "Rusak Berat",
                        value: rusakBerat,
                        color: "rose",
                    },
                ],
            };
        });


    } catch (e) {
        console.error("Error processing data:", e);
    } finally {
        loading.value = false;
    }
}

// Color palette for cards
const colorPalette = [
    'blue', 'purple', 'emerald', 'amber', 'rose', 'indigo', 
    'cyan', 'teal', 'orange', 'pink', 'violet', 'fuchsia'
];

const getColorForIndex = (index) => {
    return colorPalette[index % colorPalette.length];
};

const formatNumber = (num) => {
    if (num == null || isNaN(num)) return "0";
    return new Intl.NumberFormat("id-ID").format(num);
};

// const statCardsDTSEN = computed(() => {
//     const w = props.selectedWilayah;
//     let filteredData = [];

//     const selectedProvIds = Array.isArray(w?.provinsi) 
//         ? w.provinsi 
//         : w?.provinsi ? [w.provinsi] : [];

//     const selectedKabName = w?.kabupaten || '';

//     if (selectedKabName.length > 0) {
//         const match = dataRumahJSON.find(d => d.id === selectedKabName);
//         if (match) filteredData = [match];
//     } else if (selectedProvIds.length > 0) {
//         filteredData = dataRumahJSON.filter(d => {
//             return selectedProvIds.some(provId => {
//                 const idString = String(d.id); 
//                 const provIdString = String(provId);
//                 return idString === provIdString;
//             });
//         });
//     }

//     const hasData = filteredData.length > 0;
//     const sumData = (key) => hasData ? filteredData.reduce((acc, curr) => acc + (Number(curr[key]) || 0), 0) : null;
//     const defaultTotal = {
//         rusakringan: 2403, rusaksedang: 898, rusakberat: 3622, rusakhanyut: 30, rusaklainnya: 200, jumlah: 7153
//     };

//     const cards = [];

//     cards.push({
//         key: 'total',
//         label: 'Total Terdampak',
//         padan: chartData.total?.groups?.Padan_DTSEN?.total ?? 0,
//         usulan: hasData ? sumData('jumlah') : defaultTotal.jumlah,
//         icon: 'i-heroicons-home',
//         color: 'indigo',
//     });

//     // Card Per Kategori
//     mappingDampak.forEach(kat => {
//         cards.push({
//             key: kat.key,
//             label: kat.title,
//             padan: chartData[kat.key]?.groups?.Padan_DTSEN?.total ?? 0,
//             usulan: hasData ? sumData(kat.key) : defaultTotal[kat.key],
//             icon: 'i-heroicons-home',
//             color: kat.color,
//         });
//     });

//     return cards;
// });

watch(
    () => props.selectedWilayah,
    async () => {
        await processedData();
    },
    { deep: true, immediate: true },
);
</script>
