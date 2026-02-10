export const useDatasetConfig = () => {
    const configs = {
        9: {
            chart: {
                yearField: "itemCategory1",
                indikatorField: "indikator",
                periodField: "itemCategory2",
                regionField: "kd_kab",
            },
        },
        10: {
            chart: {
                yearField: "itemCategory2", // Tahun
                indikatorField: "indikator", // Indikator (misal: Jumlah Kelahiran, dll)
                regionField: "kd_kab", // Wilayah Kabupaten
            },
        },
        11: {
            chart: {
                yearField: "itemCategory2", // Dataset 11: tahun di category2
                monthField: "itemCategory3", // bulan di category3
                subsektorField: "itemCategory1", // subsektor di category1
            },
        },
        26: {
            chart: {
                yearField: "itemCategory1", // Tahun
                monthField: "itemCategory2", // Bulan/Periode
                indikatorField: "indikator", // Indikator transportasi
                sektorField: "itemCategory3", // Sektor transportasi
            },
        },
        27: {
            chart: {
                yearField: "itemCategory1", // Tahun
                monthField: "itemCategory2", // Bulan/Periode
                indikatorField: "indikator", // Indikator transportasi'
                sektorField: "itemCategory3", // Sektor transportasi
            },
        },

        46: {
            chart: {
                yearField: "itemCategory1", // tahun di category1
                genderField: "itemCategory2", // gender di category2
                ageField: "itemCategory3", // umur di category3
            },
        },
        // ✅ Dataset 28: Angkutan Udara Domestik
        28: {
            chart: {
                bandaraField: "itemCategory1", // Nama Bandara
                yearField: "itemCategory2", // Tahun (2024, 2025)
                monthField: "itemCategory3", // Bulan (Januari - Desember)
                indikatorField: "indikator", // Indikator (Penumpang/Barang)
            },
        },
        // ✅ Dataset 29: Angkutan Udara Internasional
        29: {
            chart: {
                bandaraField: "itemCategory1", // Nama Bandara
                yearField: "itemCategory2", // Tahun (2024, 2025)
                monthField: "itemCategory3", // Bulan (Januari - Desember)
                indikatorField: "indikator", // Indikator (Penumpang/Barang)
            },
        },
                // ✅ Dataset 91: Dampak Bencana
       // ✅ Dataset 91: Dampak Bencana
        91: {
            chart: {
                indikatorField: "indikator", // Indikator (Meninggal, Hilang, Pengungsi, dll)
                tanggalField: "tanggal", // Tanggal kejadian
                regionField: "kd_prov", // Default ke provinsi (bisa kab/kec/desa)
                valueField: "value", // Nilai dampak
            },
        },
    };

    const getConfig = (datasetId: number) => {
        return configs[datasetId as keyof typeof configs] || null;
    };

    return { getConfig };
};
