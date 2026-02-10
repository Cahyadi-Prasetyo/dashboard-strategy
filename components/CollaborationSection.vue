<template>
    <section class="bg-gray-50 py-20 px-6 lg:px-15">
        <div class="max-w-full mx-auto">
            <div class="text-center mb-16">
                <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    Kolaborasi Kementerian/Lembaga
                </h2>
                <div class="h-1 w-20 bg-amber-400 mx-auto rounded-full"></div>
                <p class="text-gray-600 mt-4 max-w-5xl mx-auto">
                    Dashboard Pendataan Pasca Bencana Sumatera dikembangkan
                    melalui sinergi antara Satuan Tugas Percepatan Rehabilitasi
                    dan Rekonstruksi dengan berbagai kementerian dan lembaga
                    terkait sesuai Keputusan Presiden Nomor 1 Tahun 2026.
                </p>
            </div>

            <div
                class="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 lg:gap-4"
            >
                <div
                    v-for="(partner, index) in partners"
                    :key="index"
                    class="flex flex-col items-center justify-center p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-amber-200 transition-all duration-300 group"
                >
                    <div
                        class="w-24 h-24 mb-4 flex items-center justify-center"
                    >
                        <img
                            :src="partner.logo"
                            :alt="partner.name"
                            class="max-w-full max-h-full object-contain group-hover:grayscale-0 transition-all duration-300"
                        />
                    </div>
                    <p
                        class="text-center text-sm font-medium text-gray-700 group-hover:text-gray-900 leading-tight"
                    >
                        {{ partner.name }}
                    </p>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
const partners = [
    {
        name: "Kemenko Pembangunan Manusia dan Kebudayaan",
        logo: "/images/logo/kemenkopmk.png",
    },
    {
        name: "Kemenko Politik dan Keamanan",
        logo: "/images/logo/kemenkopolkam.png",
    },
    {
        name: "Kemenko Infrastruktur dan Pembangunan Kewilayahan",
        logo: "/images/logo/kemenkobipk.png",
    },
    {
        name: "Kemenko Perekonomian",
        logo: "/images/logo/kemenkoeko.png",
    },
    { name: "Kemenko Pangan", logo: "/images/logo/kemenkopangan.png" },
    {
        name: "Kemenko Pemberdayaan Masyarakat",
        logo: "/images/logo/kemenkoberdaya.png",
    },
    { name: "Kementerian Keuangan", logo: "/images/logo/kemenkeu.png" },
    { name: "TNI", logo: "/images/logo/tni.png" },
    { name: "Polri", logo: "/images/logo/polri.png" },

    // --- TIM PELAKSANA (PIMPINAN) ---
    { name: "Kementerian Dalam Negeri", logo: "/images/logo/kemendagri.png" }, // Ketua [cite: 94]
    {
        name: "Badan Nasional Penanggulangan Bencana",
        logo: "/images/logo/bnpb.png",
    }, // Wakil Ketua II
    {
        name: "Badan Pengelola Investasi Daya Anagata Nusantara",
        logo: "/images/logo/danantara.png",
    }, // Wakil Ketua IV

    // --- BIDANG TEKNIS (KOORDINATOR & ANGGOTA) ---
    { name: "Kementerian PPN/Bappenas", logo: "/images/logo/bappenas.png" },
    { name: "Kementerian ATR/BPN", logo: "/images/logo/agraria.png" },
    {
        name: "Kementerian Pendidikan Tinggi, Sains, dan Teknologi",
        logo: "/images/logo/kemendikti.png",
    },
    { name: "Kementerian Lingkungan Hidup", logo: "/images/logo/klh.png" },
    { name: "Kementerian Kehutanan", logo: "/images/logo/kemenkehu.png" },
    { name: "Badan Pusat Statistik", logo: "/images/logo/bps.png" },
    { name: "Badan Informasi Geospasial", logo: "/images/logo/big.png" },
    { name: "BMKG", logo: "/images/logo/bmkg.png" },
    { name: "BRIN", logo: "/images/logo/brin.png" },
    {
        name: "Kementerian Komunikasi dan Digital",
        logo: "/images/logo/komdigi.png",
    },
    { name: "Badan Komunikasi Pemerintah", logo: "/images/logo/bakomrev.png" },
    { name: "Kementerian Pekerjaan Umum", logo: "/images/logo/pu.png" },
    { name: "Kementerian Perhubungan", logo: "/images/logo/kemenhub.png" },
    {
        name: "Kementerian Perumahan dan Kawasan Permukiman",
        logo: "/images/logo/pkp.png",
    },
    { name: "Kementerian Desa dan PDT", logo: "/images/logo/kemendes.png" },
    { name: "Kementerian Sosial", logo: "/images/logo/kemensos.png" },
    {
        name: "Kementerian Pendidikan Dasar dan Menengah",
        logo: "/images/logo/dikdasmen.png",
    },
    { name: "Kementerian Kesehatan", logo: "/images/logo/kemenkes.png" },
    { name: "Kementerian Agama", logo: "/images/logo/kemenag.png" },
    { name: "Kementerian Kebudayaan", logo: "/images/logo/kemenbud.png" },
    { name: "Kementerian PPPA", logo: "/images/logo/kemenpppa.png" },
    { name: "Kementerian ESDM", logo: "/images/logo/esdm.png" },
    { name: "Badan Pengaturan BUMN", logo: "/images/logo/bp-bumn.png" },
    { name: "Kementerian Pertanian", logo: "/images/logo/kementan.png" },
    { name: "Kementerian Perindustrian", logo: "/images/logo/kemenperin.png" },
    { name: "Kementerian KKP", logo: "/images/logo/kkp.png" },
    { name: "Kementerian Perdagangan", logo: "/images/logo/kemendag.png" },
    { name: "Kementerian UMKM", logo: "/images/logo/umkm.png" },
    { name: "Kementerian Ekonomi Kreatif", logo: "/images/logo/ekraf.png" },
    { name: "Kementerian PANRB", logo: "/images/logo/menpanrb.png" },
];
</script>
