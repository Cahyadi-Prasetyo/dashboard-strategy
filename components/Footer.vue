<template>
  <footer
    class="bg-slate-900 text-slate-300 font-sans border-t border-slate-800"
  >
    <div class="max-w-7xl mx-auto px-4 lg:px-16 py-6 lg:py-8">
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8"
      >
        <div class="lg:col-span-1 space-y-6">
          <div>
            <h3 class="text-2xl font-bold text-white leading-tight">
              Dashboard Strategis <br />
              <span class="text-amber-500">Kepulauan Riau</span>
            </h3>
            <p
              class="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider"
            >
              Provinsi Kepulauan Riau
            </p>
          </div>
          <p class="text-sm leading-relaxed text-slate-400">
            Sistem integrasi data dan monitoring strategis untuk
            mendukung pembangunan wilayah Kepulauan Riau.
          </p>
        </div>

        <div>
          <h4
            class="text-white font-bold mb-6 border-b border-slate-700 pb-2 inline-block"
          >
            Kontak Kami
          </h4>
          <ul class="space-y-4 text-sm">
            <li class="flex items-start gap-3">
              <UIcon
                name="i-heroicons-map-pin"
                class="w-5 h-5 text-amber-500 shrink-0 mt-0.5"
              />
              <span>
                Jl. Dr. Sutomo 6-8<br />
                Jakarta 10710 Indonesia
              </span>
            </li>
            <li class="flex items-center gap-3">
              <UIcon
                name="i-heroicons-envelope"
                class="w-5 h-5 text-amber-500 shrink-0"
              />
              <a
                href="mailto:bpshq@bps.go.id"
                class="hover:text-amber-400 transition-colors"
              >
                bpshq@bps.go.id
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4
            class="text-white font-bold mb-6 border-b border-slate-700 pb-2 inline-block"
          >
            Kolaborasi
          </h4>

          <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <p class="text-sm text-slate-300 leading-relaxed mb-4">
              Inisiatif ini merupakan hasil kerjasama strategis dan sinergi data
              antara beberapa Kementerian dan Lembaga terkait untuk memastikan
              validitas data bencana.
            </p>

            <NuxtLink
              to="/tentang"
              class="inline-flex items-center gap-2 text-sm font-semibold text-amber-500 hover:text-amber-400 transition-colors group"
            >
              Lihat Detail
              <UIcon
                name="i-heroicons-arrow-right"
                class="w-4 h-4 transition-transform group-hover:translate-x-1"
              />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-slate-950 py-6 border-t border-slate-800">
      <div
        class="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500"
      >
        <p>
          Hak Cipta &copy; {{ new Date().getFullYear() }} Badan Pusat Statistik
        </p>
        <div class="flex gap-6">
          <NuxtLink to="#" class="hover:text-white transition-colors">
            Kebijakan Privasi
          </NuxtLink>
          <NuxtLink to="#" class="hover:text-white transition-colors">
            Syarat & Ketentuan
          </NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// Komponen Footer
</script>
