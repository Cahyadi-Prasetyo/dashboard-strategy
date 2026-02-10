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

            <!-- Section Transportasi (NEW) -->
          <div 
                ref="transportasiRef"
                :id="sections[0].id"
                class="flex-none scroll-mt-24"
            >
                <TransportasiSection :selected-wilayah="selectedWilayah" />
          </div>

          <!-- <div 
                ref="telekomunikasiRef"
                :id="sections[1].id"
                class="flex-none scroll-mt-24"
            >
                <PosTelekomunikasiSection :selected-wilayah="selectedWilayah" />
          </div> -->

           <!-- <div 
                ref="infrastrukturRef"
                :id="sections[1].id"
                class="flex-none scroll-mt-24"
            >
                <InfrastrukturSection :selected-wilayah="selectedWilayah" />
            </div> -->

            <!-- <div 
                ref="angkatanUdararef"
                :id="sections[2].id"
                class="flex-none scroll-mt-24"
            >
                <AngkutanUdaraSeries :selected-wilayah="selectedWilayah" />
            </div> -->

            <!-- <div 
                ref="podesRef"
                :id="sections[3].id"
                class="flex-none scroll-mt-24"
            >
                <PodesSection :selected-wilayah="selectedWilayah" />
            </div> -->
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import TransportasiSection from "~/components/infrastruktur/TransportasiSection.vue";
import PosTelekomunikasiSection from "~/components/infrastruktur/PosTelekomunikasiSection.vue";

// import InfrastrukturSection from "~/components/infrastruktur/InfrastrukturSection.vue";
// import AngkutanUdaraSeries from "~/components/infrastruktur/AngkutanUdaraSeries.vue";
// import PodesSection from "~/components/infrastruktur/PodesSection.vue";

const props = defineProps({
    selectedWilayah: {
        type: Object,
        required: true,
        default: () => ({ provinsi: [], kabupaten: [] }),
    },
});

const sections = [
    {
        id: 'transportasi',
        label: 'Jalan dan Jembatan Terdampak',
        icon: 'i-heroicons-presentation-chart-line',
        description: 'Jalan dan Jembatan Terdampak'
    },
    // {
    //     id: 'telekomunikasi',
    //     label: 'Pos & Telekomunikasi',
    //     icon: 'i-heroicons-signal',
    //     description: 'Pos & Telekomunikasi'
    // }

    // },
    // {
    //     id: 'infrastruktur',
    //     label: 'Infrastruktur',
    //     icon: 'i-heroicons-presentation-chart-line',
    //     description: 'Infrastruktur'
    // }
    // },
    // {
    //     id: 'angkatanUdara',
    //     label: 'Angkatan Udara',
    //     icon: 'i-heroicons-paper-airplane',
    //     description: 'Angkatan Udara'
    // },
    // {
    //     id: 'podes',
    //     label: 'Pos & Telekomunikasi',
    //     icon: 'i-heroicons-signal',
    //     description: 'Pos & Telekomunikasi'
    // },
];

// Refs for scroll spy
const transportasiRef = ref(null);
const infrastrukturRef = ref(null);
const angkatanUdararef = ref(null);
const podesRef = ref(null);
const activeSection = ref('transportasi');

// Scroll to section function
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const offset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    } else {
        console.warn(`Element with id '${sectionId}' not found`);
    }
}

// Scroll spy
function handleScroll() {
    const refs = {
        transportasi: transportasiRef.value,
        infrastruktur: infrastrukturRef.value,
        angkatanUdara: angkatanUdararef.value,
        podes: podesRef.value,
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
</script>