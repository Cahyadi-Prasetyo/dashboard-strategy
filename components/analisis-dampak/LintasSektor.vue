<template>
    <div class="flex flex-col gap-2 h-full pb-10">
        <!-- Sticky Internal Navigation -->
        <div class="sticky top-0 z-10 bg-white border-gray-200 mb-4">
            <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span
                    class="text-sm text-gray-500 font-medium mr-2 uppercase racking-wider flex-shrink-0"
                >
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

        <!-- Sections with ref for scroll spy -->
        <div
            ref="pemerintahanRef"
            :id="sections[0].id"
            class="flex-none scroll-mt-24"
        >
            <PemerintahanSection :selectedWilayah="selectedWilayah" />
        </div>
        <div
            ref="kelautanRef"
            :id="sections[1].id"
            class="flex-none scroll-mt-24 mb-6"
        >
            <KelautanSection :selectedWilayah="selectedWilayah" />
        </div>
        <!-- <div
            ref="pendudukTerdampakRef"
            :id="sections[1].id"
            class="flex-none scroll-mt-24 mb-6"
        >
            <PendudukTerdampakSection :region-ids="regionIds" :tahun="tahun" />
        </div> -->

        <!-- <div
            ref="fasilitasKelautanRef"
            :id="sections[2].id"
            class="flex-none scroll-mt-24 mb-6"
        >
            <FasilitasKelautanTerdampakSection
                :selected-wilayah="selectedWilayah"
            />
        </div> -->
        <!--
        <div
            ref="kerusakanKerugianRef"
            :id="sections[2].id"
            :id="sections[2].id"
            class="flex-none scroll-mt-24"
        >
            <KerusakanKerugianSection :selected-wilayah="selectedWilayah" />
        </div>

        <div
            ref="kajianKebutuhanRef"
            :id="sections[3].id"
            :id="sections[3].id"
            class="flex-none scroll-mt-24 mb-6"
        >
            <KajianKebutuhanSection :selected-wilayah="selectedWilayah" />
        </div> -->
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import PendudukTerdampakSection from "~/components/lintas-sektor/PendudukTerdampakSection.vue";
import FasilitasKelautanTerdampakSection from "~/components/lintas-sektor/FasilitasKelautanTerdampakSection.vue";
import KerusakanKerugianSection from "~/components/lintas-sektor/KerusakanKerugianSection.vue";
import KajianKebutuhanSection from "~/components/lintas-sektor/KajianKebutuhanSection.vue";
import PemerintahanSection from "~/components/lintas-sektor/PemerintahanSection.vue";
import KelautanSection from "~/components/lintas-sektor/KelautanSection.vue";

const props = defineProps({
    selectedWilayah: {
        type: Object,
        default: () => ({
            provinsi: [],
            kabupaten: [],
            kecamatan: [],
            desa: [],
        }),
    },
    tahun: { type: Number },
});

const sections = [
    {
        id: "pemerintahan",
        label: "Kantor Pemerintahan Terdampak",
        icon: "i-heroicons-currency-dollar",
        description: "Dampak pada sektor pemerintahan",
    },
    {
        id: "kelautan",
        label: "Sektor Kelautan dan Perikanan Terdampak",
        icon: "i-heroicons-lifebuoy",
        description: "Dampak pada sektor kelautan",
    },
    // {
    //     id: "pendudukTerdampak",
    //     label: "Kondisi Penduduk Terdampak",
    //     icon: "i-heroicons-users",
    //     description: "Kondisi penduduk yang terdampak",
    // },
    // {
    //     id: "fasilitasKelautan",
    //     label: "Fasilitas Kelautan dan Perikanan",
    //     icon: "i-heroicons-lifebuoy",
    //     description: "Fasilitas kelautan dan perikanan yang terdampak",
    // },
    // {
    //     id: "kerusakanKerugian",
    //     label: "Penilaian Kerusakan & Kerugian",
    //     icon: "i-heroicons-banknotes",
    //     description: "Penilaian kerusakan dan kerugian pasca bencana",
    // },
    // {
    //     id: "kajianKebutuhan",
    //     label: "Kajian Kebutuhan",
    //     icon: "i-heroicons-document-text",
    //     description: "Kajian kebutuhan pasca bencana",
    // },
];

// Refs for scroll spy
const pemerintahanRef = ref(null);
const kelautanRef = ref(null);
const pendudukTerdampakRef = ref(null);
const fasilitasKelautanRef = ref(null);
const kerusakanKerugianRef = ref(null);
const kajianKebutuhanRef = ref(null);
const activeSection = ref("pemerintahan");

// Scroll to section function
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const offset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
        });
    }
}
import { DEFAULT_PROVINCE_IDS } from "~/constants/region-config";
// Scroll spy
function handleScroll() {
    const refs = {
        pemerintahan: pemerintahanRef.value,
        kelautan: kelautanRef.value,
        pendudukTerdampak: pendudukTerdampakRef.value,
        fasilitasKelautan: fasilitasKelautanRef.value,
        kerusakanKerugian: kerusakanKerugianRef.value,
        kajianKebutuhan: kajianKebutuhanRef.value,
    };

    const scrollPosition = window.scrollY + 150;

    for (const [id, element] of Object.entries(refs)) {
        if (element) {
            const { offsetTop, offsetHeight } = element;
            if (
                scrollPosition >= offsetTop &&
                scrollPosition < offsetTop + offsetHeight
            ) {
                activeSection.value = id;
                break;
            }
        }
    }
}

onMounted(() => {
    window.addEventListener("scroll", handleScroll);
    handleScroll();
});

onBeforeUnmount(() => {
    window.removeEventListener("scroll", handleScroll);
});

const regionIds = computed(() => {
    const w = props.selectedWilayah;
    const { provinsi, kabupaten, kecamatan, desa } = w;

    if (desa?.length > 0) return desa;
    if (kecamatan?.length > 0) return kecamatan;
    if (kabupaten?.length > 0) return kabupaten;
    if (provinsi?.length > 0) return provinsi;

    // Default: Semua Provinsi (11, 12, 13)
    return DEFAULT_PROVINCE_IDS;
});
</script>
