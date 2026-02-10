<template>
    <section class="bg-white py-20 px-6 lg:px-15">
        <div class="max-w-full mx-auto">
            <div class="text-center mb-12">
                <p
                    class="text-amber-500 font-medium tracking-wider uppercase text-sm mb-3"
                >
                    Sumber Data
                </p>
                <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    Metadata Kuesioner
                </h2>
                <div class="h-1 w-20 bg-amber-400 mx-auto rounded-full"></div>
                <p class="text-gray-600 mt-4 max-w-2xl mx-auto">
                    Informasi metadata dari kuesioner pendataan Pasca Bencana
                    yang digunakan dalam pengumpulan data
                </p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Kuesioner Keluarga -->
                <div
                    class="bg-gradient-to-br from-amber-50 to-white rounded-2xl shadow-sm border border-amber-100 p-8 hover:shadow-lg transition-all duration-300"
                >
                    <div class="flex items-start gap-4 mb-6">
                        <div
                            class="p-3 bg-amber-500 rounded-xl text-white shrink-0"
                        >
                            <UIcon name="i-heroicons-users" class="w-8 h-8" />
                        </div>
                        <div>
                            <h3
                                class="text-2xl font-bold text-gray-900 leading-tight"
                            >
                                Kuesioner Keluarga
                            </h3>
                            <p class="text-sm text-amber-600 mt-1">
                                PKL.K - Pendataan Keluarga
                            </p>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div
                            class="flex justify-between items-center py-3 border-b border-gray-100"
                        >
                            <span class="text-sm font-medium text-gray-600"
                                >Total Variabel</span
                            >
                            <span
                                class="text-lg font-bold text-gray-900 bg-amber-100 px-3 py-1 rounded-lg"
                                >XX variabel</span
                            >
                        </div>

                        <div class="bg-white rounded-xl p-4 space-y-3">
                            <h4
                                class="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-3"
                            >
                                Kategori Data
                            </h4>
                            <div
                                v-for="cat in keluargaCategories"
                                :key="cat.name"
                                class="flex items-start gap-3"
                            >
                                <UIcon
                                    :name="cat.icon"
                                    class="w-5 h-5 text-amber-500 mt-0.5"
                                />
                                <div class="flex-1">
                                    <p
                                        class="text-sm font-medium text-gray-800"
                                    >
                                        {{ cat.name }}
                                    </p>
                                    <p class="text-xs text-gray-500 mt-0.5">
                                        {{ cat.desc }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <UButton
                            label="Lihat Detail Metadata"
                            icon="i-heroicons-document-text"
                            color="amber"
                            variant="soft"
                            block
                            size="lg"
                            class="mt-6"
                        />
                    </div>
                </div>

                <!-- Kuesioner Infrastruktur -->
                <div
                    class="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-sm border border-blue-100 p-8 hover:shadow-lg transition-all duration-300"
                >
                    <div class="flex items-start gap-4 mb-6">
                        <div
                            class="p-3 bg-blue-500 rounded-xl text-white shrink-0"
                        >
                            <UIcon
                                name="i-heroicons-building-office-2"
                                class="w-8 h-8"
                            />
                        </div>
                        <div>
                            <h3
                                class="text-2xl font-bold text-gray-900 leading-tight"
                            >
                                Kuesioner Infrastruktur
                            </h3>
                            <p class="text-sm text-blue-600 mt-1">
                                PKL.I - Pendataan Infrastruktur
                            </p>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div
                            class="flex justify-between items-center py-3 border-b border-gray-100"
                        >
                            <span class="text-sm font-medium text-gray-600"
                                >Total Variabel</span
                            >
                            <span
                                class="text-lg font-bold text-gray-900 bg-blue-100 px-3 py-1 rounded-lg"
                                >XX variabel</span
                            >
                        </div>

                        <div class="bg-white rounded-xl p-4 space-y-3">
                            <h4
                                class="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-3"
                            >
                                Kategori Data
                            </h4>
                            <div
                                v-for="cat in infrastrukturCategories"
                                :key="cat.name"
                                class="flex items-start gap-3"
                            >
                                <UIcon
                                    :name="cat.icon"
                                    class="w-5 h-5 text-blue-500 mt-0.5"
                                />
                                <div class="flex-1">
                                    <p
                                        class="text-sm font-medium text-gray-800"
                                    >
                                        {{ cat.name }}
                                    </p>
                                    <p class="text-xs text-gray-500 mt-0.5">
                                        {{ cat.desc }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <UButton
                            label="Lihat Detail Metadata"
                            icon="i-heroicons-document-text"
                            color="blue"
                            variant="soft"
                            block
                            size="lg"
                            class="mt-6"
                        />
                    </div>
                </div>
            </div>

            <!-- Info tambahan -->
            <div
                class="mt-12 bg-gray-50 rounded-2xl p-6 lg:p-8 border border-gray-100"
            >
                <div class="flex items-start gap-4">
                    <UIcon
                        name="i-heroicons-information-circle"
                        class="w-6 h-6 text-amber-500 shrink-0 mt-1"
                    />
                    <div class="space-y-2">
                        <h4 class="font-semibold text-gray-900">
                            Tentang Kuesioner
                        </h4>
                        <p class="text-sm text-gray-600 leading-relaxed">
                            Kuesioner Pendataan Pasca Bencana merupakan
                            instrumen pengumpulan data yang digunakan untuk
                            mendapatkan informasi komprehensif mengenai dampak
                            bencana terhadap keluarga dan infrastruktur. Data
                            yang dikumpulkan mencakup informasi demografi,
                            kondisi rumah, tingkat kerusakan, dan kebutuhan
                            bantuan yang diperlukan untuk proses rehabilitasi
                            dan rekonstruksi.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
const keluargaCategories = [
    {
        name: "Identitas Keluarga",
        desc: "Data kepala keluarga dan anggota keluarga",
        icon: "i-heroicons-identification",
    },
    {
        name: "Demografi",
        desc: "Umur, jenis kelamin, status disabilitas",
        icon: "i-heroicons-chart-bar",
    },
    {
        name: "Kondisi Rumah",
        desc: "Tingkat kerusakan dan kerugian",
        icon: "i-heroicons-home",
    },
    {
        name: "Kebutuhan Bantuan",
        desc: "Jenis bantuan yang diperlukan",
        icon: "i-heroicons-hand-raised",
    },
];

const infrastrukturCategories = [
    {
        name: "Fasilitas Pendidikan",
        desc: "Sekolah, madrasah, dan lembaga pendidikan",
        icon: "i-heroicons-academic-cap",
    },
    {
        name: "Fasilitas Kesehatan",
        desc: "Puskesmas, posyandu, rumah sakit",
        icon: "i-heroicons-heart",
    },
    {
        name: "Fasilitas Ibadah",
        desc: "Masjid, gereja, dan tempat ibadah lainnya",
        icon: "i-heroicons-building-library",
    },
    {
        name: "Infrastruktur Umum",
        desc: "Jalan, jembatan, dan utilitas publik",
        icon: "i-heroicons-map",
    },
];
</script>
