<template>
    <div class="flex flex-col gap-2 h-full pb-10">
        <!-- Sticky Internal Navigation -->
        <div class="sticky top-0 z-10 bg-white border-gray-200 mb-6">
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
            ref="perdaganganRef"
            :id="sections[0].id"
            class="flex-none scroll-mt-24"
        >
            <EkonomiPerdaganganSection :selected-wilayah="selectedWilayah" />
        </div>
        <div id="koperasi-umkm" ref="koperasiUmkmRef">
            <EkonomiKoperasiUmkmSection :selected-wilayah="selectedWilayah" />
        </div>
        <!-- <div
            ref="pertumbuhanEkonomiRef"
            :id="sections[1].id"
            class="flex-none scroll-mt-24"
        >
            <PertumbuhanEkonomiSection :selected-wilayah="selectedWilayah" />
        </div>

        <div
            ref="inflasiRef"
            :id="sections[2].id"
            class="flex-none scroll-mt-24"
        >
            <InflasiSection :selectedWilayah="selectedWilayah" />
        </div> -->

        <!-- <div
            ref="pengangguranKetenagakerjaanRef"
            :id="sections[1].id"
            class="flex-none scroll-mt-24"
        >
            <PengangguranKetenagakerjaanSection
                :selected-wilayah="selectedWilayah"
            />
        </div> 

        <div
            ref="sektorPertanianRef"
            :id="sections[2].id"
            class="flex-none scroll-mt-24"
        >
            <SektorPertanianSection :selected-wilayah="selectedWilayah" />
        </div>-->
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import PertumbuhanEkonomiSection from "~/components/ekonomi/PertumbuhanEkonomiSection.vue";
import InflasiSection from "~/components/ekonomi/InflasiSection.vue";
import PengangguranKetenagakerjaanSection from "~/components/ekonomi/PengangguranKetenagakerjaanSection.vue";
// import SektorPertanianSection from "~/components/ekonomi/PertanianSection.vue";

const props = defineProps({
    selectedWilayah: { type: Object, default: () => ({}) },
});

const sections = [
    {
        id: "perdagangan",
        label: "Perdagangan Terdampak",
        icon: "i-heroicons-presentation-chart-line",
        description: "Pertumbuhan Ekonomi",
    },
    {
        id: "koperasi-umkm",
        label: "Koperasi & UMKM Terdampak",
        icon: "i-heroicons-briefcase",
        description: "Koperasi & UMKM",
    },
    // {
    //     id: "pertumbuhanEkonomi",
    //     label: "Pertumbuhan Ekonomi",
    //     icon: "i-heroicons-presentation-chart-line",
    //     description: "Pertumbuhan Ekonomi",
    // },
    // {
    //     id: "inflasi",
    //     label: "Inflasi",
    //     icon: "i-heroicons-banknotes",
    //     description: "Inflasi",
    // },
    // {
    //     id: "pengangguranKetenagakerjaan",
    //     label: "Pengangguran & Ketenagakerjaan",
    //     icon: "i-heroicons-briefcase",
    //     description: "Pengangguran Ketenagakerjaan",
    // },
    // {
    //     id: "sektorPertanian",
    //     label: "Sektor Pertanian",
    //     icon: "i-heroicons-globe-asia-australia",
    //     description: "Sektor Pertanian",
    // },
];

// Refs for scroll spy
const perdaganganRef = ref(null);
const pertumbuhanEkonomiRef = ref(null);
const inflasiRef = ref(null);
const pengangguranKetenagakerjaanRef = ref(null);
// const sektorPertanianRef = ref(null);
const koperasiUmkmRef = ref(null);
const activeSection = ref("perdagangan");

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
    } else {
        console.warn(`Element with id '${sectionId}' not found`);
    }
}

// Scroll spy
function handleScroll() {
    const refs = {
        perdagangan: perdaganganRef.value,
        pertumbuhanEkonomi: pertumbuhanEkonomiRef.value,
        inflasi: inflasiRef.value,
        pengangguranKetenagakerjaan: pengangguranKetenagakerjaanRef.value,
        // sektorPertanian: sektorPertanianRef.value,
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
</script>
