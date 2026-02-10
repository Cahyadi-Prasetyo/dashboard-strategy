<template>
    <div class="flex flex-col gap-2 h-full pb-10">
        <!-- Sticky Internal Navigation -->
        <div class="sticky top-0 z-10 bg-white border-gray-200 mb-4">
            <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span class="text-sm text-gray-500 font-medium mr-2 uppercase racking-wider flex-shrink-0">
                    subsektor:
                </span>
                
                <button
                    v-for="section in sections"
                    :key="section.id"
                    @click="scrollToSection(section.id)"
                    :class="[
                        'px-3 py-1.5 rounded-full text-sm font-medium transition-all flex-shrink-0',
                        activeSection === section.id
                            ? 'bg-gray-900 text-white border-gray-500 shadow-md shadow-gray-500/20 transform scale-105'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-900 hover:text-white hover:shadow-sm',
                    ]"
                >
                    <span class="flex items-center gap-1.5">
                        <UIcon :name="section.icon" class="w-3.5 h-3.5" />
                        {{ section.label }}
                    </span>
                </button>
            </div>
        </div>

         <div 
            ref="ibadahRef"
            :id="sections[0].id"
            class="flex-none scroll-mt-24"
        >
            <RumahIbadahSection
                :selected-wilayah="selectedWilayah"
                :chart-data="chartData"
                :loading="loading"
                :available-periods="availablePeriods"
            />
        </div>

        <div 
            ref="pendidikanRef"
            :id="sections[1].id"
            class="flex-none scroll-mt-24"
        >
            <FasilitasPendidikanSection
                :selected-wilayah="selectedWilayah"
                :chart-data="chartData"
                :loading="loading"
                :available-periods="availablePeriods"
            />
        </div>

        <div 
            ref="kesehatanRef"
            :id="sections[2].id"
            class="flex-none scroll-mt-24"
        >
            <FasilitasKesehatanSection
                :selected-wilayah="selectedWilayah"
                :chart-data="chartData"
                :loading="loading"
                :available-periods="availablePeriods"
            />
        </div>

        <div 
            ref="budayaRef"
            :id="sections[3].id"
            class="flex-none scroll-mt-24"
        >
            <FasilitasBudayaSection
                :selected-wilayah="selectedWilayah"
                :chart-data="chartData"
                :loading="loading"
                :available-periods="availablePeriods"
            />
        </div>
    </div>
</template>

<script setup>
import RumahIbadahSection from "../sosial/RumahIbadahSection.vue";
import FasilitasPendidikanSection from "../sosial/FasilitasPendidikanSection.vue";
import FasilitasKesehatanSection from "../sosial/FasilitasKesehatanSection.vue";
import FasilitasBudayaSection from "../sosial/FasilitasBudayaSection.vue";

const props = defineProps({
    selectedWilayah: { type: Object, default: () => ({}) },
});

// Section configuration
const sections = [
    {
        id: 'ibadah',
        label: 'Rumah Ibadah',
        icon: 'i-heroicons-building-library',
        description: 'Tempat ibadah dan keagamaan'
    },
    {
        id: 'pendidikan',
        label: 'Pendidikan',
        icon: 'i-heroicons-academic-cap',
        description: 'Fasilitas dan infrastruktur pendidikan'
    },
    {
        id: 'kesehatan',
        label: 'Kesehatan',
        icon: 'i-heroicons-heart',
        description: 'Fasilitas dan layanan kesehatan'
    },
    {
        id: 'budaya',
        label: 'Kebudayaan',
        icon: 'i-heroicons-language',
        description: 'Cagar Budaya dan Objek Kebudayaan'
    }
];

// Refs for scroll spy
const pendidikanRef = ref(null);
const kesehatanRef = ref(null);
const ibadahRef = ref(null);
const budayaRef = ref(null);
const activeSection = ref('ibadah');

// Scroll to section function
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const offset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Scroll spy
function handleScroll() {
    const refs = {
        pendidikan: pendidikanRef.value,
        kesehatan: kesehatanRef.value,
        ibadah: ibadahRef.value,
        budaya: budayaRef.value
    };

    const scrollPosition = window.scrollY + 150;

    for (const [id, element] of Object.entries(refs)) {
        if (element) {
            const { offsetTop, offsetHeight } = element;
            if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                activeSection.value = id;
                break;
            }
        }
    }
}

onMounted(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll();
});

onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll);
});


// Data logic (sama seperti original)
const headers = useRequestHeaders(["cookie"]);
const loading = ref(false);
const availablePeriods = ref(null);
let currentDate = ref(new Date());

const chartData = reactive({
    pendidikan: { total: 0, kemendikdasmen: [] },
    kesehatan: { total: 0 },
    ibadah: { total: 0 },
    datasetInfoBNPB: null,
    datasetInfoKemendikdasmen: null,
});

async function fetchDataset(idDataset, idIndikator) {
    const w = props.selectedWilayah;
    const idWilayah =
        (w.desa?.length ? w.desa : null) ||
        (w.kecamatan?.length ? w.kecamatan : null) ||
        (w.kabupaten?.length ? w.kabupaten : null) ||
        (w.provinsi?.length ? w.provinsi : null) ||
        [];

    const level = w.desa?.length
        ? "id_desa"
        : w.kecamatan?.length
          ? "id_kec"
          : w.kabupaten?.length
            ? "id_kab"
            : "id_prov";

    const query = {
        id_dataset: idDataset,
        id_indikator_insight: idIndikator,
    };

    if (idWilayah) {
        query[level] = idWilayah;
    }

    try {
        let requests = [];
        const endpoint = "/api/agregat-insight";
        if (idWilayah.length > 0) {
            requests = idWilayah?.map((wilayahId) => {
                return $fetch(endpoint, {
                    headers: headers,
                    query: {
                        id_dataset: idDataset,
                        id_indikator_insight: idIndikator,
                        [level]: wilayahId,
                    },
                });
            });
        } else {
            requests = [$fetch(endpoint, { headers: headers, query })];
        }

        const responses = await Promise.all(requests);
        const allRecords = responses.flatMap((r) => r?.data?.records || []);

        return allRecords;
    } catch (e) {
        console.error("Error in fetchDataset:", e);
        return [];
    }
}

async function fetchTerdampak(idDataset, idIndikator) {
    const w = props.selectedWilayah;

    let idWilayah = w.desa?.length
        ? w.desa
        : w.kecamatan?.length
          ? w.kecamatan
          : w.kabupaten?.length
            ? w.kabupaten
            : w.provinsi?.length
              ? w.provinsi
              : null;

    let level = w.desa?.length
        ? "id_desa"
        : w.kecamatan?.length
          ? "id_kec"
          : w.kabupaten?.length
            ? "id_kab"
            : "id_prov";

    try {
        const endpoint = "/api/agregat-insight";

        let requests;

        if (idWilayah && idWilayah.length > 0) {
            requests = idWilayah.map((wilayahId) => {
                const queryParams = {
                    id_dataset: idDataset,
                    [level]: wilayahId,
                };

                if (idIndikator) {
                    queryParams.id_indikator_insight = idIndikator;
                }

                return $fetch(endpoint, {
                    headers: headers,
                    query: queryParams,
                });
            });
        } else {
            const queryParams = {
                id_dataset: idDataset,
            };

            if (idIndikator) {
                queryParams.id_indikator_insight = idIndikator;
            }

            requests = [
                $fetch(endpoint, {
                    headers: headers,
                    query: queryParams,
                }),
            ];
        }

        const responses = await Promise.all(requests);

        if (idDataset === 116 && responses[0]?.data?.meta?.dataset) {
            chartData.datasetInfoKemendikdasmen =
                responses[0].data.meta.dataset;
        }

        const allRecords = responses.flatMap((r) => r?.data?.records || []);

        if (responses[0]?.data?.tanggal) {
            currentDate.value = responses[0]?.data?.tanggal;
        }

        return allRecords;
    } catch (e) {
        console.error("Error fetching terdampak:", e);
        return [];
    }
}

async function fetchLatest(idDataset, idIndikator) {
    const w = props.selectedWilayah;

    let idWilayah = w.desa?.length
        ? w.desa
        : w.kecamatan?.length
          ? w.kecamatan
          : w.kabupaten?.length
            ? w.kabupaten
            : w.provinsi?.length
              ? w.provinsi
              : null;

    let level = w.desa?.length
        ? "id_desa"
        : w.kecamatan?.length
          ? "id_kec"
          : w.kabupaten?.length
            ? "id_kab"
            : "id_prov";

    try {
        const endpoint = "/api/agregat-insight-latest";

        let requests;

        if (idWilayah && idWilayah.length > 0) {
            requests = idWilayah.map((wilayahId) => {
                return $fetch(endpoint, {
                    query: {
                        id_dataset: idDataset,
                        id_indikator_insight: idIndikator,
                        [level]: wilayahId,
                    },
                    headers: headers,
                });
            });
        } else {
            const queryParams = {
                id_dataset: idDataset,
            };

            if (idIndikator) {
                queryParams.id_indikator_insight = idIndikator;
            }

            requests = [
                $fetch(endpoint, {
                    query: queryParams,
                    headers: headers,
                }),
            ];
        }

        const responses = await Promise.all(requests);

        if (idDataset === 91 && responses[0]?.data?.meta?.dataset) {
            chartData.datasetInfoBNPB = responses[0].data.meta.dataset;
        }

        const allRecords = responses.flatMap((r) => r?.data?.records || []);
        const firstRecord = allRecords[0];

        if (firstRecord?.tanggal) {
            const latestDate = new Date(firstRecord.tanggal);
            currentDate.value = latestDate;

            const startDate = new Date("2026-01-20");
            const dates = [];

            let tempDate = new Date(latestDate);

            while (tempDate >= startDate) {
                dates.push(
                    tempDate.toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                    }),
                );
                tempDate.setDate(tempDate.getDate() - 1);
            }

            availablePeriods.value = dates;
        }

        return allRecords;
    } catch (e) {
        console.error(e);
        return [];
    }
}

async function loadPodesData() {
    loading.value = true;
    try {
        const mappingPra = [
            { key: "pendidikan", id: 143 },
            { key: "kesehatan", id: 144 },
            { key: "ibadah", id: 145 },
        ];

        const resPra = await Promise.all([fetchDataset(13), fetchDataset(14)]);

        resPra.forEach((records, index) => {
            const targetKey = mappingPra[index].key;
            chartData[targetKey].pra = records || [];
        });
    } catch (error) {
        console.error("Error loading PODES data:", error);
    } finally {
        loading.value = false;
    }
}

async function loadDampakData() {
    loading.value = true;
    try {
        const mappingDampak = [
            { key: "pendidikan", id: 143 },
            { key: "kesehatan", id: 144 },
            { key: "ibadah", id: 145 },
        ];

        const kemendikdasmenPromise = fetchTerdampak(116, null);

        let resDampak = await Promise.all(
            mappingDampak.map((item) => fetchLatest(91, item.id)),
        );

        let resKesehatanLatest = await fetchLatest(91, 144);

        const firstIndikatorRecords = resDampak[0] || [];
        const latestRecordDate = firstIndikatorRecords[0]?.tanggal;

        const currentFormatted =
            currentDate.value instanceof Date
                ? currentDate.value.toISOString().split("T")[0]
                : currentDate.value;

        if (latestRecordDate && latestRecordDate !== currentFormatted) {
            resDampak = await Promise.all(
                mappingDampak.map((item) => fetchTerdampak(91, item.id)),
            );
        }

        resDampak.forEach((records, index) => {
            const targetKey = mappingDampak[index].key;
            if (chartData[targetKey]) {
                chartData[targetKey].pasca = records || [];
            }
        });

        const kemendikdasmenRes = await kemendikdasmenPromise;
        if (chartData.pendidikan) {
            chartData.pendidikan.kemendikdasmen = kemendikdasmenRes || [];
        }

        const kesehatanLatest = resKesehatanLatest[0];
        if (chartData.kesehatan) {
            chartData.kesehatan.pascaLatest = kesehatanLatest || [];
        }
    } finally {
        loading.value = false;
    }
}

watch(
    () => props.selectedWilayah,
    async () => {
        await loadPodesData();
        await loadDampakData();
    },
    { deep: true, immediate: true },
);
</script>
