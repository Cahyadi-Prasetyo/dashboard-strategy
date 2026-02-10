<template>
    <div class="space-y-12 pb-12">
        <div>
            <div
                class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-6"
            >
                <div class="flex items-start gap-4">
                    <div class="p-2 bg-gray-100 rounded-lg text-gray-600">
                        <UIcon name="i-heroicons-bolt" class="w-6 h-6" />
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-[#1e2b58]">
                            Kependudukan & Pengungsian
                        </h3>
                        <p class="text-sm text-gray-500">
                            Status Pengungsian dan Sebaran Kelompok Rentan
                        </p>
                    </div>
                </div>

                <div class="w-full md:w-72 mr-6">
                    <USelectMenu
                        placeholder="Pilih data tabel"
                        v-model="activeTable"
                        value-key="id"
                        :items="tableOptions"
                        color="primary"
                        variant="outline"
                        icon="i-heroicons-table-cells"
                    />
                </div>
            </div>

            <div v-if="activeTable === 'kepulangan'">
                <ChartsDataTable
                    tableTitle="Persentase Penduduk Terdampak Kembali ke Tempat Tinggal"
                    source="Kuesioner BENCANA26-K r21a-b (Bagian 3)"
                    enable-pagination
                    :total-items="tableDataKepulangan.length"
                    :items-per-page="itemsPerPage"
                    v-model="pageTabel1"
                    enable-download
                    :download-data="tableDataKepulangan"
                    file-name="Laporan_Kepulangan_Penduduk"
                    :download-columns="columnsKepulangan"
                >
                    <template #header>
                        <th
                            v-if="showProvinsiColumn"
                            class="px-6 py-4 text-left text-sm font-bold text-gray-900"
                        >
                            Provinsi
                        </th>
                        <th
                            v-if="showKabupatenColumn"
                            class="px-6 py-4 text-left text-sm font-bold text-gray-900"
                        >
                            Kabupaten
                        </th>
                        <th
                            v-if="showKecamatanColumn"
                            class="px-6 py-4 text-left text-sm font-bold text-gray-900"
                        >
                            Kecamatan
                        </th>
                        <th
                            class="px-6 py-4 text-left text-sm font-bold text-gray-900"
                        >
                            {{ levelLabel }}
                        </th>
                        <th
                            class="px-6 py-4 text-center text-sm font-bold text-gray-900"
                        >
                            Penduduk Terdampak
                        </th>
                        <th
                            class="px-6 py-4 text-center text-sm font-bold text-gray-900"
                        >
                            Pernah Mengungsi
                        </th>
                        <th
                            class="px-6 py-4 text-center text-sm font-bold text-gray-900"
                        >
                            Sudah Kembali
                        </th>
                        <th
                            class="px-6 py-4 text-center text-sm font-bold text-gray-900"
                        >
                            Belum Kembali
                        </th>
                        <th
                            class="px-6 py-4 text-center text-sm font-bold text-gray-900"
                        >
                            % Kembali
                        </th>
                    </template>
                    <template #body>
                        <template v-if="pendingPerWilayah">
                            <tr
                                v-for="i in 5"
                                :key="i"
                                class="border-b border-gray-100"
                            >
                                <td :colspan="totalColumns" class="px-6 py-4">
                                    <div class="flex items-center gap-4">
                                        <USkeleton
                                            class="h-4 w-1/4"
                                        /><USkeleton
                                            class="h-4 w-1/6"
                                        /><USkeleton
                                            class="h-4 w-1/6"
                                        /><USkeleton
                                            class="h-4 w-1/6"
                                        /><USkeleton class="h-4 w-1/12" />
                                    </div>
                                </td>
                            </tr>
                        </template>
                        <template v-else>
                            <tr
                                v-for="(data, idx) in paginatedDataTabel1"
                                :key="idx"
                                class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                <td
                                    v-if="showProvinsiColumn"
                                    class="px-6 py-4 text-sm text-gray-600"
                                >
                                    {{ data.provinsi }}
                                </td>
                                <td
                                    v-if="showKabupatenColumn"
                                    class="px-6 py-4 text-sm text-gray-600"
                                >
                                    {{ data.kabupaten }}
                                </td>
                                <td
                                    v-if="showKecamatanColumn"
                                    class="px-6 py-4 text-sm text-gray-600"
                                >
                                    {{ data.kecamatan }}
                                </td>
                                <td
                                    class="px-6 py-4 text-sm font-semibold text-gray-800"
                                >
                                    {{ data.nama }}
                                </td>
                                <td
                                    class="px-6 py-4 text-center text-sm font-semibold text-gray-800"
                                >
                                    {{ data.pendudukTerdampak }}
                                </td>
                                <td
                                    class="px-6 py-4 text-center text-sm font-semibold text-gray-800"
                                >
                                    {{ data.pernahMengungsi }}
                                </td>
                                <td
                                    class="px-6 py-4 text-center text-sm font-semibold text-green-700"
                                >
                                    {{ data.sudahKembali }}
                                </td>
                                <td
                                    class="px-6 py-4 text-center text-sm font-semibold text-red-700"
                                >
                                    {{ data.belumKembali }}
                                </td>
                                <td
                                    class="px-6 py-4 text-center text-sm font-bold text-blue-700"
                                >
                                    {{ data.persentaseKembali }}%
                                </td>
                            </tr>
                        </template>
                    </template>
                </ChartsDataTable>
            </div>

            <div v-else-if="activeTable === 'pengungsian'">
                <ChartsDataTable
                    tableTitle="Persentase Keluarga Masih Mengungsi"
                    source="Kuesioner BENCANA26-K r4 kode 2-7 (Bagian 2)"
                    enable-pagination
                    :total-items="tableDataMengungsi.length"
                    :items-per-page="itemsPerPage"
                    v-model="pageTabel2"
                    enable-download
                    :download-data="tableDataMengungsi"
                    file-name="Laporan_Status_Pengungsian"
                    :download-columns="columnsPengungsian"
                >
                    <template #header>
                        <th
                            v-if="showProvinsiColumn"
                            class="px-6 py-4 text-left text-sm font-bold text-gray-900"
                        >
                            Provinsi
                        </th>
                        <th
                            v-if="showKabupatenColumn"
                            class="px-6 py-4 text-left text-sm font-bold text-gray-900"
                        >
                            Kabupaten
                        </th>
                        <th
                            v-if="showKecamatanColumn"
                            class="px-6 py-4 text-left text-sm font-bold text-gray-900"
                        >
                            Kecamatan
                        </th>
                        <th
                            class="px-6 py-4 text-left text-sm font-bold text-gray-900"
                        >
                            {{ levelLabel }}
                        </th>
                        <th
                            class="px-6 py-4 text-center text-sm font-bold text-gray-900"
                        >
                            Total Keluarga
                        </th>
                        <th
                            class="px-6 py-4 text-center text-sm font-bold text-gray-900"
                        >
                            Rumah Sendiri
                        </th>
                        <th
                            class="px-6 py-4 text-center text-sm font-bold text-gray-900"
                        >
                            Masih Mengungsi
                        </th>
                        <th
                            class="px-6 py-4 text-center text-sm font-bold text-gray-900"
                        >
                            % Mengungsi
                        </th>
                    </template>
                    <template #body>
                        <template v-if="pendingPerWilayah">
                            <tr
                                v-for="i in 5"
                                :key="i"
                                class="border-b border-gray-100"
                            >
                                <td :colspan="totalColumns2" class="px-6 py-4">
                                    <div class="flex items-center gap-4">
                                        <USkeleton
                                            class="h-4 w-1/4"
                                        /><USkeleton
                                            class="h-4 w-1/6"
                                        /><USkeleton
                                            class="h-4 w-1/6"
                                        /><USkeleton
                                            class="h-4 w-1/6"
                                        /><USkeleton class="h-4 w-1/12" />
                                    </div>
                                </td>
                            </tr>
                        </template>
                        <template v-else>
                            <tr
                                v-for="(data, idx) in paginatedDataTabel2"
                                :key="idx"
                                class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                <td
                                    v-if="showProvinsiColumn"
                                    class="px-6 py-4 text-sm text-gray-600"
                                >
                                    {{ data.provinsi }}
                                </td>
                                <td
                                    v-if="showKabupatenColumn"
                                    class="px-6 py-4 text-sm text-gray-600"
                                >
                                    {{ data.kabupaten }}
                                </td>
                                <td
                                    v-if="showKecamatanColumn"
                                    class="px-6 py-4 text-sm text-gray-600"
                                >
                                    {{ data.kecamatan }}
                                </td>
                                <td
                                    class="px-6 py-4 text-sm font-semibold text-gray-800"
                                >
                                    {{ data.nama }}
                                </td>
                                <td
                                    class="px-6 py-4 text-center text-sm font-semibold text-gray-800"
                                >
                                    {{ data.totalKeluarga }}
                                </td>
                                <td
                                    class="px-6 py-4 text-center text-sm font-semibold text-green-700"
                                >
                                    {{ data.rumahSendiri }}
                                </td>
                                <td
                                    class="px-6 py-4 text-center text-sm font-semibold text-red-700"
                                >
                                    {{ data.masihMengungsi }}
                                </td>
                                <td
                                    class="px-6 py-4 text-center text-sm font-bold text-orange-700"
                                >
                                    {{ data.persentaseMengungsi }}%
                                </td>
                            </tr>
                        </template>
                    </template>
                </ChartsDataTable>
            </div>

            <div v-else-if="activeTable === 'rentan'">
                <ChartsDataTable
                    tableTitle="Keluarga dengan Kondisi Kelompok Rentan"
                    source="Kuesioner BENCANA26-K r17, r30a - r30f"
                    enable-pagination
                    :total-items="tableDataKelompokRentan.length"
                    :items-per-page="itemsPerPage"
                    v-model="pageTabel3"
                    enable-download
                    :download-data="tableDataKelompokRentan"
                    file-name="Laporan_Kelompok_Rentan"
                    :download-columns="columnsRentan"
                >
                    <template #header>
                        <th
                            v-if="showProvinsiColumn"
                            class="px-6 py-4 text-left text-sm font-bold text-gray-900"
                        >
                            Provinsi
                        </th>
                        <th
                            v-if="showKabupatenColumn"
                            class="px-6 py-4 text-left text-sm font-bold text-gray-900"
                        >
                            Kabupaten
                        </th>
                        <th
                            v-if="showKecamatanColumn"
                            class="px-6 py-4 text-left text-sm font-bold text-gray-900"
                        >
                            Kecamatan
                        </th>
                        <th
                            class="px-6 py-4 text-left text-sm font-bold text-gray-900"
                        >
                            {{ levelLabel }}
                        </th>
                        <th
                            class="px-6 py-4 text-center text-sm font-bold text-gray-900"
                        >
                            Total Keluarga
                        </th>
                        <th
                            class="px-6 py-4 text-center text-sm font-bold text-gray-900"
                        >
                            Keluarga Balita
                        </th>
                        <th
                            class="px-6 py-4 text-center text-sm font-bold text-gray-900"
                        >
                            Keluarga Lansia
                        </th>
                        <th
                            class="px-6 py-4 text-center text-sm font-bold text-gray-900"
                        >
                            Keluarga Disabilitas
                        </th>
                    </template>
                    <template #body>
                        <template v-if="pendingPerWilayah">
                            <tr
                                v-for="i in 5"
                                :key="i"
                                class="border-b border-gray-100"
                            >
                                <td :colspan="totalColumns3" class="px-6 py-4">
                                    <div class="flex items-center gap-4">
                                        <USkeleton
                                            class="h-4 w-1/4"
                                        /><USkeleton
                                            class="h-4 w-1/6"
                                        /><USkeleton
                                            class="h-4 w-1/6"
                                        /><USkeleton class="h-4 w-1/6" />
                                    </div>
                                </td>
                            </tr>
                        </template>
                        <template v-else>
                            <tr
                                v-for="(data, idx) in paginatedDataTabel3"
                                :key="idx"
                                class="border-b border-gray-200"
                            >
                                <td
                                    v-if="showProvinsiColumn"
                                    class="px-6 py-4 text-sm text-gray-600"
                                >
                                    {{ data.provinsi }}
                                </td>
                                <td
                                    v-if="showKabupatenColumn"
                                    class="px-6 py-4 text-sm text-gray-600"
                                >
                                    {{ data.kabupaten }}
                                </td>
                                <td
                                    v-if="showKecamatanColumn"
                                    class="px-6 py-4 text-sm text-gray-600"
                                >
                                    {{ data.kecamatan }}
                                </td>
                                <td
                                    class="px-6 py-4 text-sm font-semibold text-gray-800"
                                >
                                    {{ data.nama }}
                                </td>
                                <td
                                    class="px-6 py-4 text-center text-sm font-semibold text-gray-800"
                                >
                                    {{ data.totalKeluarga }}
                                </td>
                                <td
                                    class="px-6 py-4 text-center text-sm font-semibold text-gray-800"
                                >
                                    {{ data.balita }}
                                </td>
                                <td
                                    class="px-6 py-4 text-center text-sm font-semibold text-gray-800"
                                >
                                    {{ data.lansia }}
                                </td>
                                <td
                                    class="px-6 py-4 text-center text-sm font-bold text-gray-800"
                                >
                                    {{ data.disabilitas }}
                                </td>
                            </tr>
                        </template>
                    </template>
                </ChartsDataTable>
            </div>

            <div v-if="pendingPerWilayah" class="mt-8">
                <div
                    class="h-96 w-full flex flex-col justify-end gap-4 px-4 bg-white p-6 rounded-2xl border border-gray-100"
                >
                    <div class="flex items-end gap-2 h-full">
                        <USkeleton class="w-full h-[40%]" /><USkeleton
                            class="w-full h-[70%]"
                        /><USkeleton class="w-full h-[50%]" /><USkeleton
                            class="w-full h-[80%]"
                        /><USkeleton class="w-full h-[60%]" />
                    </div>
                    <USkeleton class="h-4 w-1/2 mx-auto" />
                </div>
            </div>
            <div v-else-if="jenisHunianSeries.length > 0">
                <ChartsBarChart
                    chartTitle="Jumlah Keluarga Menurut Jenis Hunian"
                    source="Kuesioner BENCANA26-K r4"
                    :categories="wilayahLabels"
                    :series="jenisHunianSeries"
                    height="h-96"
                    stacked
                    :show-legend="true"
                    legend-position="top"
                />
            </div>
            <div
                v-else
                class="bg-white p-12 rounded-2xl border border-gray-100 text-center"
            >
                <p class="text-gray-400">Tidak ada data</p>
            </div>
        </div>

        <div class="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
            <div class="flex flex-col md:flex-row items-center gap-8">
                <div class="flex-1 space-y-2">
                    <div class="flex items-center gap-3">
                        <div
                            class="inline-flex p-3 bg-[#1e2b58] text-white rounded-lg"
                        >
                            <UIcon
                                name="i-heroicons-check-badge"
                                class="w-6 h-6"
                            />
                        </div>
                        <h3 class="text-xl font-bold text-[#1e2b58]">
                            Kondisi Ekonomi Pasca Bencana
                        </h3>
                    </div>
                    <p class="text-gray-600">
                        Persentase penduduk yang masih bisa melanjutkan
                        bekerja/berusaha seperti saat sebelum bencana.
                    </p>
                </div>
                <div
                    class="w-full md:w-1/3 bg-white p-4 rounded-xl shadow-sm relative group"
                >
                    <button
                        @click="openDetail('ekonomi')"
                        class="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
                        title="Lihat detail data ekonomi"
                    >
                        <UIcon
                            name="i-heroicons-eye"
                            class="w-5 h-5 text-gray-400 group-hover:text-blue-600"
                        />
                    </button>

                    <div
                        v-if="pendingAgregat"
                        class="h-56 flex flex-col items-center justify-center gap-4"
                    >
                        <USkeleton class="h-32 w-32 rounded-full" />
                        <div class="flex gap-2">
                            <USkeleton class="h-3 w-16" /><USkeleton
                                class="h-3 w-16"
                            />
                        </div>
                    </div>

                    <ChartsPieChart
                        v-else-if="pendudukMasihBisaBekerja.length > 0"
                        :data="pendudukMasihBisaBekerja"
                        series-name="Status Pekerjaan"
                        height="h-56"
                        legend-position="bottom"
                        inner-radius="40%"
                        outer-radius="80%"
                        :center="['50%', '45%']"
                    />
                    <div v-else class="h-56 flex items-center justify-center">
                        <div class="text-gray-400">Tidak ada data</div>
                    </div>
                </div>
            </div>
        </div>

        <div>
            <div
                class="flex items-start gap-4 border-b border-gray-100 pb-4 mb-6"
            >
                <div class="p-2 bg-gray-100 rounded-lg text-gray-600">
                    <UIcon name="i-heroicons-bolt" class="w-6 h-6" />
                </div>
                <div>
                    <h3 class="text-lg font-bold text-[#1e2b58]">
                        Kondisi Hunian
                    </h3>
                    <p class="text-sm text-gray-500">
                        Status Keberadaan Bangunan dan Kelayakan Fisik
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div
                    class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative"
                >
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-3">
                            <div
                                class="p-2 rounded-lg text-blue-500 bg-blue-50"
                            >
                                <UIcon
                                    name="i-heroicons-sparkles"
                                    class="w-5 h-5"
                                />
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-800 text-sm">
                                    Kondisi Lantai
                                </h4>
                                <p class="text-xs text-gray-400">
                                    Persentase bangunan menurut kondisi lantai
                                </p>
                            </div>
                        </div>
                        <button
                            @click="openDetail('hunian', 'lantai')"
                            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Lihat detail"
                        >
                            <UIcon
                                name="i-heroicons-eye"
                                class="w-5 h-5 text-gray-400 hover:text-blue-600"
                            />
                        </button>
                    </div>

                    <div
                        v-if="pendingAgregat"
                        class="h-80 flex flex-col items-center justify-center gap-6"
                    >
                        <USkeleton class="h-40 w-40 rounded-full" />
                        <div class="w-full px-8 space-y-2">
                            <USkeleton class="h-3 w-full" /><USkeleton
                                class="h-3 w-2/3"
                            />
                        </div>
                    </div>

                    <ChartsPieChart
                        v-else-if="kondisiLantaiData.length > 0"
                        :data="kondisiLantaiData"
                        series-name="Kondisi Lantai"
                        height="h-80"
                        legend-position="bottom"
                        inner-radius="45%"
                        outer-radius="70%"
                        :center="['50%', '35%']"
                    />
                    <div v-else class="h-80 flex items-center justify-center">
                        <div class="text-gray-400">Tidak ada data</div>
                    </div>
                </div>

                <div
                    class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative"
                >
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-3">
                            <div
                                class="p-2 rounded-lg text-amber-500 bg-amber-50"
                            >
                                <UIcon
                                    name="i-heroicons-bolt"
                                    class="w-5 h-5"
                                />
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-800 text-sm">
                                    Kondisi Dinding
                                </h4>
                                <p class="text-xs text-gray-400">
                                    Persentase bangunan menurut kondisi dinding
                                </p>
                            </div>
                        </div>
                        <button
                            @click="openDetail('hunian', 'dinding')"
                            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Lihat detail"
                        >
                            <UIcon
                                name="i-heroicons-eye"
                                class="w-5 h-5 text-gray-400 hover:text-amber-600"
                            />
                        </button>
                    </div>

                    <div
                        v-if="pendingAgregat"
                        class="h-80 flex flex-col items-center justify-center gap-6"
                    >
                        <USkeleton class="h-40 w-40 rounded-full" />
                        <div class="w-full px-8 space-y-2">
                            <USkeleton class="h-3 w-full" /><USkeleton
                                class="h-3 w-2/3"
                            />
                        </div>
                    </div>

                    <ChartsPieChart
                        v-else-if="kondisiDindingData.length > 0"
                        :data="kondisiDindingData"
                        series-name="Kondisi Dinding"
                        height="h-80"
                        legend-position="bottom"
                        inner-radius="45%"
                        outer-radius="70%"
                        :center="['50%', '35%']"
                    />
                    <div v-else class="h-80 flex items-center justify-center">
                        <div class="text-gray-400">Tidak ada data</div>
                    </div>
                </div>

                <div
                    class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative"
                >
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-3">
                            <div
                                class="p-2 rounded-lg text-emerald-500 bg-emerald-50"
                            >
                                <UIcon
                                    name="i-heroicons-signal"
                                    class="w-5 h-5"
                                />
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-800 text-sm">
                                    Kondisi Atap
                                </h4>
                                <p class="text-xs text-gray-400">
                                    Persentase bangunan menurut kondisi atap
                                </p>
                            </div>
                        </div>
                        <button
                            @click="openDetail('hunian', 'atap')"
                            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Lihat detail"
                        >
                            <UIcon
                                name="i-heroicons-eye"
                                class="w-5 h-5 text-gray-400 hover:text-emerald-600"
                            />
                        </button>
                    </div>

                    <div
                        v-if="pendingAgregat"
                        class="h-80 flex flex-col items-center justify-center gap-6"
                    >
                        <USkeleton class="h-40 w-40 rounded-full" />
                        <div class="w-full px-8 space-y-2">
                            <USkeleton class="h-3 w-full" /><USkeleton
                                class="h-3 w-2/3"
                            />
                        </div>
                    </div>

                    <ChartsPieChart
                        v-else-if="kondisiAtapData.length > 0"
                        :data="kondisiAtapData"
                        series-name="Kondisi Atap"
                        height="h-80"
                        legend-position="bottom"
                        inner-radius="45%"
                        outer-radius="70%"
                        :center="['50%', '35%']"
                    />
                    <div v-else class="h-80 flex items-center justify-center">
                        <div class="text-gray-400">Tidak ada data</div>
                    </div>
                </div>
            </div>
        </div>

        <Teleport to="body">
            <div
                v-if="activeDetail.isOpen"
                class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
            >
                <div
                    class="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
                    @click="closeDetail"
                ></div>
                <div
                    class="relative w-full max-w-6xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 z-10"
                >
                    <VisualisasiDetail
                        :title="activeDetail.title"
                        :region-ids="regionIds"
                        :tahun="tahun"
                        :column-config="activeDetail.columnConfig"
                        @close="closeDetail"
                    />
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";

const props = defineProps({
    regionIds: { type: Array, required: true, default: () => [] },
    tahun: { type: Number, default: 2026 },
});

// --- STATE MODAL DETAIL ---
const activeDetail = ref({
    isOpen: false,
    title: "",
    columnConfig: [],
});

// --- DEFINISI ID INDIKATOR (UNTUK DETAIL) ---
const IDS_KELUARGA = {
    EKONOMI: {
        MASIH: "penduduk_masih_bekerja",
        KENDALA: "penduduk_terkendala_bekerja",
    },
    HUNIAN: {
        LANTAI: {
            BAIK: "lantai_baik",
            KECIL: "lantai_lepas_sebagian_kecil",
            BESAR: "lantai_lepas_sebagian_besar",
            TOTAL: "lantai_lepas_seluruh",
        },
        DINDING: {
            BAIK: "dinding_baik",
            RUSAK: "dinding_sebagian_rusak",
            KECIL: "dinding_roboh_sebagian_kecil",
            BESAR: "dinding_roboh_sebagian_besar",
        },
        ATAP: {
            BAIK: "atap_baik",
            KECIL: "atap_lepas_sebagian_kecil",
            BESAR: "atap_lepas_sebagian_besar",
            JATUH: "atap_jatuh",
        },
    },
};

// --- SPLIT INDICATORS UNTUK OPTIMASI ---
const coreIndicatorIds = [
    // Penduduk & Pengungsian (untuk table kepulangan & pengungsian)
    "penduduk",
    "penduduk_pernah_mengungsi",
    "penduduk_pernah_mengungsi_kembali",
    // Keluarga (untuk semua table)
    "keluarga",
    "keluarga_tinggal_rumah_sendiri",
    "keluarga_masih_mengungsi",
    "keluarga_balita",
    "keluarga_lansia",
    "keluarga_disabilitas",
    // Ekonomi (untuk pie chart ekonomi)
    "penduduk_masih_bekerja",
    "penduduk_terkendala_bekerja",
    // Jenis Hunian (untuk bar chart)
    "keluarga_tinggal_rumah_keluarga",
    "keluarga_tinggal_pengungsian",
    "keluarga_tinggal_rumah_tumpangan",
    "keluarga_tinggal_fasilitas_umum",
    "keluarga_tinggal_huntara",
    "keluarga_tinggal_lainnya",
];

const hunianIndicatorIds = [
    // Kondisi Fisik Bangunan (untuk pie chart kondisi hunian)
    "atap_baik",
    "atap_jatuh",
    "atap_lepas_sebagian_besar",
    "atap_lepas_sebagian_kecil",
    "lantai_baik",
    "lantai_lepas_sebagian_kecil",
    "lantai_lepas_sebagian_besar",
    "lantai_lepas_seluruh",
    "dinding_baik",
    "dinding_sebagian_rusak",
    "dinding_roboh_sebagian_kecil",
    "dinding_roboh_sebagian_besar",
];

const allIndicatorIds = [...coreIndicatorIds, ...hunianIndicatorIds];

// --- LOGIKA BUKA DETAIL ---
const openDetail = (type, subType) => {
    let title = "";
    let config = [];

    if (type === "ekonomi") {
        title = "Detail Kondisi Ekonomi Penduduk";
        config = [
            { label: "Masih Bisa Bekerja", key: IDS_KELUARGA.EKONOMI.MASIH },
            { label: "Mengalami Kendala", key: IDS_KELUARGA.EKONOMI.KENDALA },
        ];
    } else if (type === "hunian") {
        const label = subType.charAt(0).toUpperCase() + subType.slice(1);
        title = `Detail Kondisi ${label} Bangunan`;

        if (subType === "lantai") {
            config = [
                { label: "Baik", key: IDS_KELUARGA.HUNIAN.LANTAI.BAIK },
                { label: "Lepas Kecil", key: IDS_KELUARGA.HUNIAN.LANTAI.KECIL },
                { label: "Lepas Besar", key: IDS_KELUARGA.HUNIAN.LANTAI.BESAR },
                {
                    label: "Lepas Seluruh",
                    key: IDS_KELUARGA.HUNIAN.LANTAI.TOTAL,
                },
            ];
        } else if (subType === "dinding") {
            config = [
                { label: "Baik", key: IDS_KELUARGA.HUNIAN.DINDING.BAIK },
                {
                    label: "Rusak Ringan",
                    key: IDS_KELUARGA.HUNIAN.DINDING.RUSAK,
                },
                {
                    label: "Roboh Kecil",
                    key: IDS_KELUARGA.HUNIAN.DINDING.KECIL,
                },
                {
                    label: "Roboh Besar",
                    key: IDS_KELUARGA.HUNIAN.DINDING.BESAR,
                },
            ];
        } else if (subType === "atap") {
            config = [
                { label: "Baik", key: IDS_KELUARGA.HUNIAN.ATAP.BAIK },
                { label: "Lepas Kecil", key: IDS_KELUARGA.HUNIAN.ATAP.KECIL },
                { label: "Lepas Besar", key: IDS_KELUARGA.HUNIAN.ATAP.BESAR },
                { label: "Jatuh Total", key: IDS_KELUARGA.HUNIAN.ATAP.JATUH },
            ];
        }
    }

    activeDetail.value = {
        isOpen: true,
        title,
        columnConfig: config,
    };
};

const closeDetail = () => {
    activeDetail.value.isOpen = false;
};

const tableOptions = [
    { label: "Penduduk Kembali ke Tempat Tinggal", id: "kepulangan" },
    { label: "Keluarga Masih Mengungsi", id: "pengungsian" },
    { label: "Keluarga dengan Kondisi Kelompok Rentan", id: "rentan" },
];
const activeTable = ref("kepulangan");

const C_NAVY = "#1e2b58";
const C_BLUE_LIGHT = "#93c5fd";
const C_YELLOW = "#eab308";
const C_RED = "#ef4444";

// --- FETCH CORE DATA (PRIORITY) ---
const { data: dataAgregat, pending: pendingAgregat } = useFetch("/api/data", {
    method: "POST",
    lazy: true,
    body: computed(() => ({
        regionIds: props.regionIds,
        indicatorIds: coreIndicatorIds,
        tahun: props.tahun,
    })),
});

// --- FETCH HUNIAN DATA (LAZY LOAD) ---
const {
    data: dataHunian,
    pending: pendingHunian,
    execute: executeHunian, // <-- Ambil ini
} = useFetch("/api/data", {
    method: "POST",
    lazy: true,
    immediate: false, // 1. Tahan fetch di awal
    // 2. Body tetap computed agar reaktif kalau props berubah nanti
    body: computed(() => ({
        regionIds: props.regionIds,
        indicatorIds: hunianIndicatorIds,
        tahun: props.tahun,
    })),
    // ❌ Hapus opsi watch manual
});

// Trigger load hunian data setelah core data selesai
onMounted(() => {
    setTimeout(() => {
        executeHunian();
    }, 300);
});

// --- MERGE DATA AGREGAT ---
const mergedAgregatData = computed(() => {
    const merged = [...(dataAgregat.value || [])];
    if (dataHunian.value) {
        merged.push(...dataHunian.value);
    }
    return merged;
});

// --- OPTIMASI: MAP UNTUK LOOKUP CEPAT ---
const agregatMap = computed(() => {
    if (!mergedAgregatData.value.length) return new Map();
    return new Map(
        mergedAgregatData.value.map((d) => [d.id, Number(d.value) || 0]),
    );
});

const getValueFromAgregat = (key) => {
    return agregatMap.value.get(key) || 0;
};

// --- PAGINATION STATE ---
const itemsPerPage = ref(10);
const pageTabel1 = ref(1);
const pageTabel2 = ref(1);
const pageTabel3 = ref(1);

// --- FETCH DATA PER WILAYAH ---
const { data: dataPerWilayah, pending: pendingPerWilayah } = useFetch(
    "/api/data-per-wilayah",
    {
        method: "POST",
        lazy: true,
        body: {
            regionIds: toRef(props, "regionIds"),
            indicatorIds: allIndicatorIds,
            tahun: toRef(props, "tahun"),
        },
    },
);

// --- COMPUTED: LEVEL & LABELS ---
const currentLevel = computed(() => {
    if (!dataPerWilayah.value || dataPerWilayah.value.length === 0)
        return "provinsi";
    return dataPerWilayah.value[0].level || "provinsi";
});

const levelLabel = computed(() => {
    const labels = {
        provinsi: "Provinsi",
        kabupaten: "Kabupaten",
        kecamatan: "Kecamatan",
        desa: "Desa",
    };
    return labels[currentLevel.value] || "Wilayah";
});

const showProvinsiColumn = computed(() =>
    ["kabupaten", "kecamatan", "desa"].includes(currentLevel.value),
);
const showKabupatenColumn = computed(() =>
    ["kecamatan", "desa"].includes(currentLevel.value),
);
const showKecamatanColumn = computed(() => currentLevel.value === "desa");

const totalColumns = computed(() => {
    let count = 7;
    if (showProvinsiColumn.value) count++;
    if (showKabupatenColumn.value) count++;
    if (showKecamatanColumn.value) count++;
    return count;
});

const totalColumns2 = computed(() => {
    let count = 6;
    if (showProvinsiColumn.value) count++;
    if (showKabupatenColumn.value) count++;
    if (showKecamatanColumn.value) count++;
    return count;
});

const totalColumns3 = computed(() => {
    let count = 5;
    if (showProvinsiColumn.value) count++;
    if (showKabupatenColumn.value) count++;
    if (showKecamatanColumn.value) count++;
    return count;
});

const wilayahLabels = computed(() => {
    if (!dataPerWilayah.value) return [];
    return dataPerWilayah.value.map((w) => w.nama);
});

// --- TABLE DATA ---
const tableDataKepulangan = computed(() => {
    if (!dataPerWilayah.value) return [];
    return dataPerWilayah.value.map((w) => {
        const terdampak = w.penduduk || 0;
        const pernahMengungsi = w.penduduk_pernah_mengungsi || 0;
        const sudahKembali = w.penduduk_pernah_mengungsi_kembali || 0;
        let belumKembali = pernahMengungsi - sudahKembali;
        if (belumKembali < 0) belumKembali = 0;
        const persentase =
            pernahMengungsi > 0
                ? ((sudahKembali / pernahMengungsi) * 100).toFixed(1)
                : 0;
        return {
            nama: w.nama,
            provinsi: w.provinsi,
            kabupaten: w.kabupaten,
            kecamatan: w.kecamatan,
            pendudukTerdampak: terdampak,
            pernahMengungsi: pernahMengungsi,
            sudahKembali: sudahKembali,
            belumKembali: belumKembali,
            persentaseKembali: persentase,
        };
    });
});

const tableDataMengungsi = computed(() => {
    if (!dataPerWilayah.value) return [];
    return dataPerWilayah.value.map((w) => {
        const totalKeluarga = w.keluarga || 0;
        const rumahSendiri = w.keluarga_tinggal_rumah_sendiri || 0;
        const masihMengungsi = w.keluarga_masih_mengungsi || 0;
        const persentase =
            totalKeluarga > 0
                ? ((masihMengungsi / totalKeluarga) * 100).toFixed(1)
                : 0;
        return {
            nama: w.nama,
            provinsi: w.provinsi,
            kabupaten: w.kabupaten,
            kecamatan: w.kecamatan,
            totalKeluarga: totalKeluarga,
            rumahSendiri: rumahSendiri,
            masihMengungsi: masihMengungsi,
            persentaseMengungsi: persentase,
        };
    });
});

const tableDataKelompokRentan = computed(() => {
    if (!dataPerWilayah.value) return [];
    return dataPerWilayah.value.map((w) => {
        return {
            nama: w.nama,
            provinsi: w.provinsi,
            kabupaten: w.kabupaten,
            kecamatan: w.kecamatan,
            totalKeluarga: w.keluarga || 0,
            balita: w.keluarga_balita || 0,
            lansia: w.keluarga_lansia || 0,
            disabilitas: w.keluarga_disabilitas || 0,
        };
    });
});

// --- PAGINATED DATA ---
const paginatedDataTabel1 = computed(() => {
    const data = tableDataKepulangan.value;
    if (!data.length) return [];
    const start = (pageTabel1.value - 1) * itemsPerPage.value;
    return data.slice(start, start + itemsPerPage.value);
});

const paginatedDataTabel2 = computed(() => {
    const data = tableDataMengungsi.value;
    if (!data.length) return [];
    const start = (pageTabel2.value - 1) * itemsPerPage.value;
    return data.slice(start, start + itemsPerPage.value);
});

const paginatedDataTabel3 = computed(() => {
    const data = tableDataKelompokRentan.value;
    if (!data.length) return [];
    const start = (pageTabel3.value - 1) * itemsPerPage.value;
    return data.slice(start, start + itemsPerPage.value);
});

// --- CHART DATA: KONDISI HUNIAN ---
const kondisiAtapData = computed(() => {
    const data = [
        { id: "atap_baik", label: "Baik", color: C_NAVY },
        {
            id: "atap_lepas_sebagian_kecil",
            label: "Sebagian kecil atap lepas",
            color: C_BLUE_LIGHT,
        },
        {
            id: "atap_lepas_sebagian_besar",
            label: "Sebagian rangka atap patah",
            color: C_YELLOW,
        },
        { id: "atap_jatuh", label: "Atap jatuh/tidak ada atap", color: C_RED },
    ];
    return data
        .map((item) => ({
            value: getValueFromAgregat(item.id),
            name: item.label,
            color: item.color,
        }))
        .filter((item) => item.value > 0);
});

const kondisiLantaiData = computed(() => {
    const data = [
        { id: "lantai_baik", label: "Baik", color: C_NAVY },
        {
            id: "lantai_lepas_sebagian_kecil",
            label: "Sebagian kecil lantai lepas",
            color: C_BLUE_LIGHT,
        },
        {
            id: "lantai_lepas_sebagian_besar",
            label: "Sebagian besar lantai lepas",
            color: C_YELLOW,
        },
        {
            id: "lantai_lepas_seluruh",
            label: "Seluruh lantai lepas",
            color: C_RED,
        },
    ];
    return data
        .map((item) => ({
            value: getValueFromAgregat(item.id),
            name: item.label,
            color: item.color,
        }))
        .filter((item) => item.value > 0);
});

const kondisiDindingData = computed(() => {
    const data = [
        { id: "dinding_baik", label: "Baik", color: C_NAVY },
        {
            id: "dinding_sebagian_rusak",
            label: "Sebagian plesteran/dinding rusak",
            color: C_BLUE_LIGHT,
        },
        {
            id: "dinding_roboh_sebagian_kecil",
            label: "Sebagian kecil runtuh",
            color: C_YELLOW,
        },
        {
            id: "dinding_roboh_sebagian_besar",
            label: "Sebagian besar runtuh",
            color: C_RED,
        },
    ];
    return data
        .map((item) => ({
            value: getValueFromAgregat(item.id),
            name: item.label,
            color: item.color,
        }))
        .filter((item) => item.value > 0);
});

// --- CHART DATA: EKONOMI ---
const pendudukMasihBisaBekerja = computed(() => {
    const masihBekerja = getValueFromAgregat("penduduk_masih_bekerja");
    const terkendala = getValueFromAgregat("penduduk_terkendala_bekerja");
    if (masihBekerja === 0 && terkendala === 0) return [];
    return [
        { value: masihBekerja, name: "Masih Bisa Bekerja", color: C_NAVY },
        { value: terkendala, name: "Mengalami Kendala", color: C_YELLOW },
    ];
});

// --- CHART DATA: JENIS HUNIAN ---
const jenisHunianSeries = computed(() => {
    if (!dataPerWilayah.value) return [];
    return [
        {
            name: "Rumah Sendiri",
            data: dataPerWilayah.value.map(
                (w) => w.keluarga_tinggal_rumah_sendiri || 0,
            ),
            color: "#10B981",
        },
        {
            name: "Rumah Keluarga",
            data: dataPerWilayah.value.map(
                (w) => w.keluarga_tinggal_rumah_keluarga || 0,
            ),
            color: "#3B82F6",
        },
        {
            name: "Pengungsian",
            data: dataPerWilayah.value.map(
                (w) => w.keluarga_tinggal_pengungsian || 0,
            ),
            color: "#EF4444",
        },
        {
            name: "Tumpangan",
            data: dataPerWilayah.value.map(
                (w) => w.keluarga_tinggal_rumah_tumpangan || 0,
            ),
            color: "#F59E0B",
        },
        {
            name: "Fasilitas Umum",
            data: dataPerWilayah.value.map(
                (w) => w.keluarga_tinggal_fasilitas_umum || 0,
            ),
            color: "#8B5CF6",
        },
        {
            name: "Huntara",
            data: dataPerWilayah.value.map(
                (w) => w.keluarga_tinggal_huntara || 0,
            ),
            color: "#EC4899",
        },
        {
            name: "Lainnya",
            data: dataPerWilayah.value.map(
                (w) => w.keluarga_tinggal_lainnya || 0,
            ),
            color: "#6B7280",
        },
    ];
});

// handle download excel

const totalRows = computed(() => {
    if (activeTable.value === "kepulangan")
        return tableDataKepulangan.value.length;
    if (activeTable.value === "pengungsian")
        return tableDataMengungsi.value.length;
    if (activeTable.value === "rentan")
        return tableDataKelompokRentan.value.length;
    return 0;
});

// 3. Update fungsi handleMainDownload agar lebih rapi dengan Header Custom (Opsional tapi Recommended)
const columnsKepulangan = [
    { header: "Wilayah", key: "nama" },
    { header: "Penduduk Terdampak", key: "pendudukTerdampak" },
    { header: "Pernah Mengungsi", key: "pernahMengungsi" },
    { header: "Sudah Kembali", key: "sudahKembali" },
    { header: "Belum Kembali", key: "belumKembali" },
    { header: "% Kembali", key: "persentaseKembali" },
];

const columnsPengungsian = [
    { header: "Wilayah", key: "nama" },
    { header: "Total Keluarga", key: "totalKeluarga" },
    { header: "Rumah Sendiri", key: "rumahSendiri" },
    { header: "Masih Mengungsi", key: "masihMengungsi" },
    { header: "% Mengungsi", key: "persentaseMengungsi" },
];

const columnsRentan = [
    { header: "Wilayah", key: "nama" },
    { header: "Total Keluarga", key: "totalKeluarga" },
    { header: "Keluarga Balita", key: "balita" },
    { header: "Keluarga Lansia", key: "lansia" },
    { header: "Keluarga Disabilitas", key: "disabilitas" },
];
</script>
