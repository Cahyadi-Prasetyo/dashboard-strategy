<template>
    <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mt-4">
        <ChartHeader
            :dataset-info="datasetInfo"
            icon="i-heroicons-building-library"
            icon-class="text-orange-600"
            class="mb-4"
        />
            <div class="flex-1 min-h-0 w-full relative">
                <div class="flex-1 min-h-0 w-full relative overflow-auto">
                    <table class="w-full text-xs border border-gray-200 rounded-lg">
                        <thead class="bg-gray-50 sticky top-0 z-10">
                            <tr class="text-gray-600 uppercase text-[10px]">
                                <th class="px-3 py-2 text-left border-b">Provinsi</th>
                                <th class="px-3 py-2 text-left border-b">Kab/Kota</th>
                                <th class="px-3 py-2 text-left border-b">Kepemilikan</th>
                                <th class="px-3 py-2 text-left border-b">Kerusakan</th>
                                <th class="px-3 py-2 text-right border-b">Jumlah</th>
                            </tr>
                        </thead>

                        <tbody>
                            <template v-for="(row, i) in rawData" :key="i">
                                <template
                                    v-for="(kerusakan, kepemilikan) in row.data"
                                    :key="kepemilikan"
                                >
                                    <tr
                                        v-for="(jumlah, status) in kerusakan"
                                        :key="status"
                                        class="hover:bg-gray-50"
                                    >
                                        <td class="px-3 py-2 border-b">{{ row.provinsi }}</td>
                                        <td class="px-3 py-2 border-b">{{ row.kabupaten }}</td>
                                        <td class="px-3 py-2 border-b">{{ kepemilikan }}</td>
                                        <td class="px-3 py-2 border-b">{{ status }}</td>
                                        <td class="px-3 py-2 border-b text-right font-medium">
                                            {{ jumlah }}
                                        </td>
                                    </tr>
                                </template>
                            </template>
                        </tbody>
                    </table>

                    <!-- Empty state -->
                    <div
                        v-if="!loading && rawData.length === 0"
                        class="absolute inset-0 flex items-center justify-center text-gray-400 text-sm"
                    >
                        Tidak ada data
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue"

/* =========================
   STATE LOADING & EXPORT
========================= */
const loading = ref(false)
const isExporting = ref(false)

/* =========================
   MASTER HEADER TABLE
========================= */
const kategoriKerusakan = [
  "Milik Pemerintah",
  "Milik Swasta",
]

const statusAkhir = [
  "Rusak Ringan",
  "Rusak Sedang",
  "Rusak Berat",
  "Rusak Hanyut",
]

/* =========================
   DUMMY DATA UTAMA
========================= */
const rawData = ref([
  {
    provinsi: "DKI JAKARTA",
    kabupaten: "JAKARTA PUSAT",
    data: {
      "Milik Pemerintah": {
        "Rusak Ringan": 5,
        "Rusak Sedang": 1,
        "Rusak Berat": 2,
        "Rusak Hanyut": 0,
      },
      "Milik Swasta": {
        "Rusak Ringan": 2,
        "Rusak Sedang": 0,
        "Rusak Berat": 1,
        "Rusak Hanyut": 0,
      },
    },
    total: 11,
  },
  {
    provinsi: "JAWA BARAT",
    kabupaten: "KOTA BANDUNG",
    data: {
      "Milik Pemerintah": {
        "Rusak Ringan": 10,
        "Rusak Sedang": 4,
        "Rusak Berat": 1,
        "Rusak Hanyut": 0,
      },
      "Milik Swasta": {
        "Rusak Ringan": 3,
        "Rusak Sedang": 2,
        "Rusak Berat": 0,
        "Rusak Hanyut": 1,
      },
    },
    total: 21,
  },
  {
    provinsi: "JAWA TENGAH",
    kabupaten: "KOTA SEMARANG",
    data: {
      "Milik Pemerintah": {
        "Rusak Ringan": 12,
        "Rusak Sedang": 5,
        "Rusak Berat": 2,
        "Rusak Hanyut": 1,
      },
      "Milik Swasta": {
        "Rusak Ringan": 4,
        "Rusak Sedang": 1,
        "Rusak Berat": 0,
        "Rusak Hanyut": 0,
      },
    },
    total: 27,
  },
  {
    provinsi: "JAWA TIMUR",
    kabupaten: "KOTA SURABAYA",
    data: {
      "Milik Pemerintah": {
        "Rusak Ringan": 20,
        "Rusak Sedang": 6,
        "Rusak Berat": 1,
        "Rusak Hanyut": 0,
      },
      "Milik Swasta": {
        "Rusak Ringan": 5,
        "Rusak Sedang": 2,
        "Rusak Berat": 1,
        "Rusak Hanyut": 0,
      },
    },
    total: 35,
  },
])

/* =========================
   FILTER DROPDOWN (DUMMY)
========================= */
const filterRumahKesehatan = ref(null)
const filterAlatKesehatan = ref("")
const filterRuangan = ref("")

const availableRumahKesehatan = ["RSUD", "Puskesmas", "Klinik"]
const availableAlatKesehatan = ["Ventilator", "Tempat Tidur", "USG", "Ambulans"]
const availableRuangan = ["IGD", "ICU", "Rawat Inap", "Laboratorium"]

/* =========================
   SEARCH & SORT
========================= */
const searchQuery = ref("")
const sortColumn = ref("")
const sortDirection = ref("asc")

function toggleSort(column) {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc"
  } else {
    sortColumn.value = column
    sortDirection.value = "asc"
  }
}

function getSortIcon(column) {
  if (sortColumn.value !== column) return "i-heroicons-arrows-up-down"
  return sortDirection.value === "asc"
    ? "i-heroicons-arrow-up"
    : "i-heroicons-arrow-down"
}

/* =========================
   FILTERED + SORTED DATA
========================= */
const filteredAndSortedData = computed(() => {
  let data = [...rawData.value]

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    data = data.filter(
      d =>
        d.provinsi.toLowerCase().includes(q) ||
        d.kabupaten.toLowerCase().includes(q)
    )
  }

  if (sortColumn.value) {
    data.sort((a, b) => {
      const valA = a[sortColumn.value]
      const valB = b[sortColumn.value]
      if (valA < valB) return sortDirection.value === "asc" ? -1 : 1
      if (valA > valB) return sortDirection.value === "asc" ? 1 : -1
      return 0
    })
  }

  return data
})

/* =========================
   PAGINATION
========================= */
const currentPage = ref(1)
const itemsPerPage = ref(5)

const totalPages = computed(() =>
  Math.ceil(filteredAndSortedData.value.length / itemsPerPage)
)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredAndSortedData.value.slice(start, start + itemsPerPage)
})

function changePage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const startItem = computed(
  () => (currentPage.value - 1) * itemsPerPage + 1
)

const endItem = computed(() =>
  Math.min(
    currentPage.value * itemsPerPage,
    filteredAndSortedData.value.length
  )
)

/* =========================
   GRAND TOTAL
========================= */
const grandTotal = computed(() => {
  const result = { data: {}, total: 0 }

  kategoriKerusakan.forEach(k => {
    result.data[k] = {}
    statusAkhir.forEach(s => {
      result.data[k][s] = 0
    })
  })

  filteredAndSortedData.value.forEach(row => {
    kategoriKerusakan.forEach(k => {
      statusAkhir.forEach(s => {
        const val = row.data[k]?.[s] || 0
        result.data[k][s] += val
        result.total += val
      })
    })
  })

  return result
})

/* =========================
   HELPERS
========================= */
const formatNumber = val => val.toLocaleString("id-ID")

function triggerDownload() {
  isExporting.value = true
  setTimeout(() => {
    isExporting.value = false
    alert("Dummy export Excel 😄")
  }, 800)
}
</script>
