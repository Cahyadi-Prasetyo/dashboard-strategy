<template>
    <section class="bg-gray-50 py-20 px-6 lg:px-15">
        <div
            class="max-w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 items-start"
        >
            <div
                class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow duration-300 flex flex-col"
            >
                <div class="flex items-start gap-4 mb-6">
                    <div
                        class="p-3 bg-amber-50 rounded-xl text-amber-500 shrink-0"
                    >
                        <UIcon name="i-heroicons-map" class="w-8 h-8" />
                    </div>
                    <div>
                        <h2
                            class="text-xl lg:text-2xl font-bold text-gray-900 leading-tight"
                        >
                            Peta Tematik
                        </h2>
                        <div
                            class="h-1 w-12 bg-amber-400 mt-3 rounded-full"
                        ></div>
                    </div>
                </div>

                <div
                    class="space-y-4 text-gray-600 leading-relaxed text-justify"
                >
                    <!-- <p>
                        Kegiatan pengumpulan, pengolahan, dan penyajian data
                        pasca bencana di wilayah Sumatera untuk memperoleh
                        gambaran dampak secara
                        <span class="font-semibold text-gray-800"
                            >cepat, akurat, dan terukur</span
                        >.
                    </p>
                    <p>
                        Bertujuan mendukung keputusan pemerintah dalam
                        penanganan darurat, rehabilitasi, dan rekonstruksi.
                    </p> -->
                    <p>
                        Peta tematik strategis menyajikan kondisi
                        wilayah
                        <span class="font-semibold text-gray-800">terkini</span>
                        berdasarkan indikator-indikator utama pembangunan.
                        Informasi yang ditampilkan mencakup indikator
                        kependudukan, sosial, ekonomi, dan infrastruktur
                        di Provinsi Kepulauan Riau.
                    </p>

                    <p>
                         Peta ini juga dilengkapi dengan visualisasi spasial
                         interaktif untuk mendukung analisis kewilayahan
                         yang lebih mendalam.
                    </p>
                </div>

                <transition
                    enter-active-class="transition-all duration-300 ease-out overflow-hidden"
                    enter-from-class="max-h-0 opacity-0"
                    enter-to-class="max-h-[500px] opacity-100"
                    leave-active-class="transition-all duration-200 ease-in overflow-hidden"
                    leave-from-class="max-h-[500px] opacity-100"
                    leave-to-class="max-h-0 opacity-0"
                >
                    <div
                        v-if="showDetail1"
                        class="border-t border-gray-100 mt-6 pt-6"
                    >
                        <div class="space-y-6">
                            <div>
                                <h4
                                    class="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide"
                                >
                                    <UIcon
                                        name="i-heroicons-check-circle"
                                        class="w-5 h-5 text-amber-500"
                                    />
                                    Tujuan Utama
                                </h4>
                                <ul class="space-y-2 text-sm text-gray-600">
                                    <li
                                        v-for="(item, i) in tujuanList"
                                        :key="i"
                                        class="flex gap-3"
                                    >
                                        <span
                                            class="w-1.5 h-1.5 bg-gray-300 rounded-full mt-2 shrink-0"
                                        ></span>
                                        <span>{{ item }}</span>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4
                                    class="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide"
                                >
                                    <UIcon
                                        name="i-heroicons-map-pin"
                                        class="w-5 h-5 text-amber-500"
                                    />
                                    Cakupan Wilayah
                                </h4>
                                <div class="flex flex-wrap gap-2">
                                    <span
                                        v-for="prov in [
                                            'Kepulauan Riau'
                                        ]"
                                        :key="prov"
                                        class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                                    >
                                        {{ prov }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </transition>

                <div class="mt-4 pt-4 text-amber-500">
                    <UButton
                        :label="
                            showDetail1 ? 'Tutup Detail' : 'Baca Selengkapnya'
                        "
                        :icon="
                            showDetail1
                                ? 'i-heroicons-chevron-up'
                                : 'i-heroicons-chevron-down'
                        "
                        color="amber"
                        variant="ghost"
                        trailing
                        size="md"
                        class="font-semibold hover:bg-amber-50 -ml-2.5 px-3"
                        @click="showDetail1 = !showDetail1"
                    />
                </div>
            </div>

            <div
                class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow duration-300 flex flex-col"
            >
                <div class="flex items-start gap-4 mb-6">
                    <div
                        class="p-3 bg-amber-50 rounded-xl text-amber-500 shrink-0"
                    >
                        <UIcon
                            name="i-heroicons-presentation-chart-bar"
                            class="w-8 h-8"
                        />
                    </div>
                    <div>
                        <h2
                            class="text-xl lg:text-2xl font-bold text-gray-900 leading-tight"
                        >
                            Statistik Bencana
                        </h2>
                        <div
                            class="h-1 w-12 bg-amber-400 mt-3 rounded-full"
                        ></div>
                    </div>
                </div>

                <div
                    class="space-y-4 text-gray-600 leading-relaxed text-justify"
                >
                    <!-- <p>
                        Menyajikan analisis berbasis
                        <span class="font-semibold text-gray-800"
                            >peta tematik level desa</span
                        >
                        yang menggambarkan kondisi dampak bencana secara
                        komprehensif (Penduduk & Keluarga).
                    </p>
                    <p>
                        Mencakup data infrastruktur, tingkat kerusakan rumah,
                        serta demografi penduduk terdampak (Lansia, Balita,
                        Disabilitas).
                    </p> -->

                    <p>
                        Statistik Bencana menyajikan indikator dampak bencana
                        yang dikelompokkan ke dalam lima sektor utama:
                        <span class="font-semibold text-gray-800"
                            >perumahan dan permukiman, infrastruktur, ekonomi,
                            sosial, dan lintas sektor.</span
                        >
                    </p>

                    <p>
                        Setiap indikator ditampilkan dalam perbandingan kondisi
                        pra dan pasca bencana untuk membantu memahami perubahan,
                        tingkat kerusakan, serta dampak terhadap masyarakat dan
                        wilayah terdampak secara menyeluruh.
                    </p>
                </div>

                <transition
                    enter-active-class="transition-all duration-300 ease-out overflow-hidden"
                    enter-from-class="max-h-0 opacity-0"
                    enter-to-class="max-h-[500px] opacity-100"
                    leave-active-class="transition-all duration-200 ease-in overflow-hidden"
                    leave-from-class="max-h-[500px] opacity-100"
                    leave-to-class="max-h-0 opacity-0"
                >
                    <div
                        v-if="showDetail2"
                        class="border-t border-gray-100 mt-6 pt-6"
                    >
                        <div class="space-y-6">
                            <div>
                                <h4
                                    class="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide"
                                >
                                    Fitur Unggulan
                                </h4>
                                <div class="grid grid-cols-1 gap-4">
                                    <div class="flex gap-3">
                                        <div class="mt-1">
                                            <UIcon
                                                name="i-heroicons-users"
                                                class="w-5 h-5 text-amber-500"
                                            />
                                        </div>
                                        <div>
                                            <h5
                                                class="font-semibold text-gray-800 text-sm"
                                            >
                                                Analisis Penduduk
                                            </h5>
                                            <p
                                                class="text-xs text-gray-500 mt-1"
                                            >
                                                Korban jiwa, kelompok umur,
                                                gender, & disabilitas.
                                            </p>
                                        </div>
                                    </div>

                                    <div class="flex gap-3">
                                        <div class="mt-1">
                                            <UIcon
                                                name="i-heroicons-home-modern"
                                                class="w-5 h-5 text-amber-500"
                                            />
                                        </div>
                                        <div>
                                            <h5
                                                class="font-semibold text-gray-800 text-sm"
                                            >
                                                Infrastruktur & Rumah
                                            </h5>
                                            <p
                                                class="text-xs text-gray-500 mt-1"
                                            >
                                                Tingkat kerusakan
                                                (Berat/Sedang/Ringan) &
                                                fasilitas publik.
                                            </p>
                                        </div>
                                    </div>

                                    <div class="flex gap-3">
                                        <div class="mt-1">
                                            <UIcon
                                                name="i-heroicons-map"
                                                class="w-5 h-5 text-amber-500"
                                            />
                                        </div>
                                        <div>
                                            <h5
                                                class="font-semibold text-gray-800 text-sm"
                                            >
                                                Peta Tematik Interaktif
                                            </h5>
                                            <p
                                                class="text-xs text-gray-500 mt-1"
                                            >
                                                Visualisasi geografis dengan
                                                filter wilayah & kategori.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </transition>

                <div class="mt-4 pt-4 text-amber-500">
                    <UButton
                        :label="
                            showDetail2 ? 'Tutup Detail' : 'Lihat Fitur Lengkap'
                        "
                        :icon="
                            showDetail2
                                ? 'i-heroicons-chevron-up'
                                : 'i-heroicons-chevron-down'
                        "
                        color="amber"
                        variant="ghost"
                        trailing
                        size="md"
                        class="font-semibold hover:bg-amber-50 -ml-2.5 px-3"
                        @click="showDetail2 = !showDetail2"
                    />
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref } from "vue";

const showDetail1 = ref(false);
const showDetail2 = ref(false);

const tujuanList = [
    "Mendukung keputusan penanganan darurat",
    "Data akurat untuk rehabilitasi & rekonstruksi",
    "Fasilitasi koordinasi antar instansi",
    "Identifikasi kebutuhan bantuan tepat sasaran",
];
</script>
