<template>
    <div class="flex flex-col gap-2 h-full pb-10">
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

        <!-- Sections with ref for scroll spy -->
        <div
            ref="rumahTerdampakRef"
            :id="sections[0].id"
            class="flex-none scroll-mt-24"
        >
            <RumahTerdampakSection :selected-wilayah="selectedWilayah" />
        </div>

         <div
            ref="keluargaTerdampakRef"
            :id="sections[1].id"
            class="flex-none scroll-mt-24"
        >
            <PendudukTerdampakSection :selected-wilayah="selectedWilayah" />
        </div>

        <div
            ref="rumahKesehatanTerdampakRef"
            :id="sections[2].id"
            class="flex-none scroll-mt-24"
        >
            <RumahKesehatanTerdampakSection
                :selected-wilayah="selectedWilayah"
            />
        </div>

         <div
            ref="prasaranaLingkunganRef"
            :id="sections[3].id"
            class="flex-none scroll-mt-24"
        >
            <PrasaranaLingkunganSection
                :selected-wilayah="selectedWilayah"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import RumahTerdampakSection from "~/components/perumahanpermukiman/RumahTerdampakSection.vue";
import RumahKesehatanTerdampakSection from "~/components/perumahanpermukiman/RumahKesehatanTerdampakSection.vue";
import PrasaranaLingkunganSection from "../perumahanpermukiman/PrasaranaLingkunganSection.vue";
import PendudukTerdampakSection from "../perumahanpermukiman/PendudukTerdampakSection.vue";

const sections = [
    {
        id: "rumahTerdampak",
        label: "Hunian Keluarga Terdampak",
        icon: "i-heroicons-home",
        description: "Hunian Keluarga yang terdampak",
    },
    {
        id: "pendudukTerdampak",
        label: "Penduduk Terdampak",
        icon: "i-heroicons-user-group",
        description: "Penduduk yang terdampak",
    },
    {
        id: "rumahKesehatanTerdampak",
        label: "Rumah Tenaga Kesehatan Terdampak",
        icon: "i-heroicons-home-modern",
        description: "Rumah tenaga kesehatan yang terdampak",
    },
    {
        id: "prasaranaLingkungan",
        label: "Prasarana Lingkungan Terdampak",
        icon: "i-heroicons-building-office",
        description: "Prasarana lingkungan yang terdampak",
    }
];

// Refs for scroll spy
const rumahTerdampakRef = ref(null);
const pendudukTerdampakRef = ref(null);
const rumahKesehatanTerdampakRef = ref(null);
const prasaranaLingkunganRef = ref(null);
const activeSection = ref("rumahTerdampak");

const props = defineProps({
    selectedWilayah: { type: Object, default: () => ({}) },
});


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

// Scroll spy
function handleScroll() {
    const refs = {
        rumahTerdampak: rumahTerdampakRef.value,
        pendudukTerdampak: pendudukTerdampakRef.value,
        rumahKesehatanTerdampak: rumahKesehatanTerdampakRef.value,
        prasaranaLingkungan: prasaranaLingkunganRef.value
    };

    const scrollPosition = window.scrollY + 120;

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