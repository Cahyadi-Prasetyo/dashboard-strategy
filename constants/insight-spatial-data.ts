export const tersediaSektorPasca = [
  "Profil Dampak Bencana",
  "Kondisi Infrastruktur (BPS)",
];
export const tersediaSektorPra = [
  // "Perumahan dan Pemukiman",
  "Infrastruktur",
  "Ekonomi",
  "Sosial",
  "Lintas Sektor",
];

export const tersediaSektor = [
  // "Perumahan dan Pemukiman",
  "Infrastruktur",
  "Ekonomi",
  "Sosial",
  "Lintas Sektor",
];

export const praDatasets = [
  // Infrastruktur
  // * Keberadaan Base Transceiver Station (BTS)
  { id_dataset: 19, id_indikator: 17, sektor: "Infrastruktur" },

  // * Jenis Permukaan Jalan Darat Terluas
  { id_dataset: 18, id_indikator: 17, sektor: "Infrastruktur" },
  // * Ketersediaan Angkutan Umum
  { id_dataset: 17, id_indikator: 17, sektor: "Infrastruktur" },
  // * Kekuatan Sinyal Telepon Seluler
  { id_dataset: 20, id_indikator: 17, sektor: "Infrastruktur" },
  // * Kekuatan Sinyal Internet
  { id_dataset: 21, id_indikator: 17, sektor: "Infrastruktur" },
  // * Keberadaan Layanan Pos dan Ekspedisi
  { id_dataset: 22, id_indikator: 17, sektor: "Infrastruktur" },

  // jmlh penumpang
  // { id_dataset: 28, id_indikator: 66, sektor: "Perumahan dan Pemukiman" },
  // { id_dataset: 28, id_indikator: 67, sektor: "Perumahan dan Pemukiman" },
  // { id_dataset: 28, id_indikator: 65, sektor: "Perumahan dan Pemukiman" },
  // { id_dataset: 28, id_indikator: 64, sektor: "Perumahan dan Pemukiman" },
  // { id_dataset: 29, id_indikator: 68, sektor: "Perumahan dan Pemukiman" },
  // { id_dataset: 29, id_indikator: 69, sektor: "Perumahan dan Pemukiman" },
  // { id_dataset: 29, id_indikator: 70, sektor: "Perumahan dan Pemukiman" },
  // { id_dataset: 29, id_indikator: 71, sektor: "Perumahan dan Pemukiman" },

  // Ekonomi
  // * Pertumbuhan Ekonomi (muncul di tooltip dan modal - angka pertumbuhan dan PDRB)
  { id_dataset: 9, id_indikator: 10, sektor: "Ekonomi" },
  // { id_dataset: 9, id_indikator: 3, sektor: "Ekonomi" },
  // { id_dataset: 32, id_indikator: 10, sektor: "Ekonomi" },
  // { id_dataset: 32, id_indikator: 3, sektor: "Ekonomi" },

  // * Kemiskinan
  { id_dataset: 124, id_indikator: 280, sektor: "Ekonomi" },
  { id_dataset: 124, id_indikator: 281, sektor: "Ekonomi" },
  { id_dataset: 124, id_indikator: 284, sektor: "Ekonomi" },

  // * Inflasi (muncul angka inflasi)
  { id_dataset: 27, id_indikator: 209, sektor: "Ekonomi" },
  { id_dataset: 27, id_indikator: 63, sektor: "Ekonomi" },

  // * Pengangguran (muncul angka TPT, Jumlah Pengangguran, Bekerja, Jumlah Angkatan Kerja, Jumlah Bukan Angkatan Kerja, Jumlah Penduduk Usia Kerja)
  { id_dataset: 114, id_indikator: 212, sektor: "Ekonomi" },
  { id_dataset: 114, id_indikator: 213, sektor: "Ekonomi" },
  { id_dataset: 114, id_indikator: 214, sektor: "Ekonomi" },
  { id_dataset: 114, id_indikator: 215, sektor: "Ekonomi" },
  { id_dataset: 114, id_indikator: 216, sektor: "Ekonomi" },
  { id_dataset: 114, id_indikator: 217, sektor: "Ekonomi" },
  { id_dataset: 114, id_indikator: 218, sektor: "Ekonomi" },

  // * Industri (muncul jumlah industri besar menengah IBS)

  // Sosial
  // * Infrastruktur Pendidikan (muncul angka Pendidikan negeri & swasta)
  { id_dataset: 13, id_indikator: 18, sektor: "Sosial" },
  { id_dataset: 13, id_indikator: 19, sektor: "Sosial" },
  { id_dataset: 13, id_indikator: 20, sektor: "Sosial" },
  { id_dataset: 13, id_indikator: 21, sektor: "Sosial" },
  { id_dataset: 13, id_indikator: 22, sektor: "Sosial" },
  { id_dataset: 13, id_indikator: 23, sektor: "Sosial" },
  { id_dataset: 13, id_indikator: 24, sektor: "Sosial" },
  { id_dataset: 13, id_indikator: 25, sektor: "Sosial" },
  { id_dataset: 13, id_indikator: 26, sektor: "Sosial" },
  { id_dataset: 13, id_indikator: 27, sektor: "Sosial" },
  { id_dataset: 13, id_indikator: 28, sektor: "Sosial" },
  { id_dataset: 13, id_indikator: 29, sektor: "Sosial" },
  { id_dataset: 13, id_indikator: 30, sektor: "Sosial" },
  { id_dataset: 13, id_indikator: 31, sektor: "Sosial" },
  { id_dataset: 13, id_indikator: 32, sektor: "Sosial" },
  { id_dataset: 13, id_indikator: 33, sektor: "Sosial" },
  { id_dataset: 13, id_indikator: 34, sektor: "Sosial" },
  { id_dataset: 13, id_indikator: 35, sektor: "Sosial" },
  { id_dataset: 13, id_indikator: 36, sektor: "Sosial" },
  { id_dataset: 13, id_indikator: 37, sektor: "Sosial" },

  // * Infrastruktur Kesehatan
  { id_dataset: 14, id_indikator: 38, sektor: "Sosial" },
  { id_dataset: 14, id_indikator: 39, sektor: "Sosial" },
  { id_dataset: 14, id_indikator: 40, sektor: "Sosial" },
  { id_dataset: 14, id_indikator: 41, sektor: "Sosial" },
  { id_dataset: 14, id_indikator: 42, sektor: "Sosial" },
  { id_dataset: 14, id_indikator: 43, sektor: "Sosial" },
  { id_dataset: 14, id_indikator: 44, sektor: "Sosial" },
  { id_dataset: 14, id_indikator: 45, sektor: "Sosial" },
  { id_dataset: 14, id_indikator: 46, sektor: "Sosial" },
  { id_dataset: 14, id_indikator: 47, sektor: "Sosial" },
  { id_dataset: 14, id_indikator: 48, sektor: "Sosial" },
  { id_dataset: 14, id_indikator: 49, sektor: "Sosial" },

  // Lintas Sektor
  // * Populasi Penduduk (didisable dulu, datanya belum ada - soon - sedang dicarikan proyeksi dtsen)

  // * Infrastruktur Ekonomi
  { id_dataset: 15, id_indikator: 50, sektor: "Lintas Sektor" },
  { id_dataset: 15, id_indikator: 51, sektor: "Lintas Sektor" },
  { id_dataset: 15, id_indikator: 52, sektor: "Lintas Sektor" },
  { id_dataset: 15, id_indikator: 53, sektor: "Lintas Sektor" },
  { id_dataset: 15, id_indikator: 54, sektor: "Lintas Sektor" },
  { id_dataset: 15, id_indikator: 55, sektor: "Lintas Sektor" },
  { id_dataset: 15, id_indikator: 56, sektor: "Lintas Sektor" },
  { id_dataset: 15, id_indikator: 57, sektor: "Lintas Sektor" },

  // * Keberadaan Kegiatan Pengelolaan dan Pelestarian Lingkungan
  // { id_dataset: 16, id_indikator: 17, sektor: "Lintas Sektor" },
];

export const pascaDatasets = [
  { id_dataset: 137, id_indikator: 309, sektor: "Profil Dampak Bencana" },
  { id_dataset: 138, id_indikator: 310, sektor: "Profil Dampak Bencana" },
  {
    id_dataset: 132,
    id_indikator: 308,
    sektor: "Kerusakan Aset",
    variant_id: "132_308_varian_A",
  },

  {
    id_dataset: 130,
    id_indikator: 308,
    sektor: "Kerusakan Aset",
    variant_id: "130_308_varian_A",
  },

  {
    id_dataset: 135,
    id_indikator: 308,
    sektor: "Kerusakan Aset",
    variant_id: "135_308_varian_A",
  },

  {
    id_dataset: 134,
    id_indikator: 308,
    sektor: "Kerusakan Aset",
    variant_id: "134_308_varian_A",
  },
  {
    id_dataset: 133,
    id_indikator: 308,
    sektor: "Kerusakan Aset",
    variant_id: "133_308_varian_A",
  },
  // Perumahan dan Pemukiman
  // * Tingkat Kerusakan Hunian
  // { id_dataset: 121, id_indikator: 271, sektor: "Perumahan dan Pemukiman" },
  // { id_dataset: 121, id_indikator: 272, sektor: "Perumahan dan Pemukiman" },
  // { id_dataset: 121, id_indikator: 273, sektor: "Perumahan dan Pemukiman" },
  // { id_dataset: 121, id_indikator: 274, sektor: "Perumahan dan Pemukiman" },
  // { id_dataset: 121, id_indikator: 275, sektor: "Perumahan dan Pemukiman" },
  // { id_dataset: 129, id_indikator: 307, sektor: "Perumahan dan Pemukiman" },
  // { id_dataset: 111, id_indikator: 210, sektor: "Perumahan dan Pemukiman" },
  // { id_dataset: 107, sektor: "Perumahan dan Pemukiman" },
  // Infrastruktur
  // { id_dataset: 16, id_indikator: 17, sektor: "Lintas Sektor" },
  // * Jembatan Terdampak (Harian BNPB)
  // { id_dataset: 105, id_indikator: 157, sektor: "Perumahan dan Pemukiman" },
  // { id_dataset: 105, id_indikator: 158, sektor: "Perumahan dan Pemukiman" },

  // Ekonomi
  // * Inflasi
  // { id_dataset: 27, id_indikator: 209, sektor: "Ekonomi" },
  // { id_dataset: 27, id_indikator: 63, sektor: "Ekonomi" },

  // * Industri Terdampak (data IBS)

  // Sosial
  { id_dataset: 116, id_indikator: 219, sektor: "Sosial" },
  // * Infrastruktur Pendidikan Terdampak (data harian BNPB)
  // { id_dataset: 91, id_indikator: 143, sektor: "Sosial" },
  // * Infrastruktur Kesehatan Terdampak (data harian BNPB)
  // { id_dataset: 91, id_indikator: 144, sektor: "Sosial" },
  // * Rumah Ibadah Terdampak (Harian BNPB)
  // { id_dataset: 91, id_indikator: 145, sektor: "Sosial" },
  // * Cagar Budaya Terdampak ()
  // { id_dataset: 120, id_indikator: 276, sektor: "Sosial" },
  // { id_dataset: 120, id_indikator: 277, sektor: "Sosial" },
  // Objek kebudayaan
  // { id_dataset: 122, id_indikator: 278, sektor: "Sosial" },

  // Lintas Sektor
  // Data keparahan dampak bencana
  // { id_dataset: 128, id_indikator: 306, sektor: "Lintas Sektor" },
  // * Jumlah Korban (muncul jumlah meninggal, hilang, pengungsi)
  // { id_dataset: 91, id_indikator: 129, sektor: "Lintas Sektor" },
  // { id_dataset: 91, id_indikator: 130, sektor: "Lintas Sektor" },
  // { id_dataset: 91, id_indikator: 131, sektor: "Lintas Sektor" },

  //Data Kerusakan Fasilitas Kelautan dan Perikanan"

  // { id_dataset: 119, id_indikator: 244, sektor: "Lintas Sektor" },
  // { id_dataset: 119, id_indikator: 221, sektor: "Lintas Sektor" },
  // { id_dataset: 119, id_indikator: 244, sektor: "Lintas Sektor" },

  // { id_dataset: 125, id_indikator: 287, sektor: "Lintas Sektor" },
  // { id_dataset: 125, id_indikator: 289, sektor: "Lintas Sektor" },
  // { id_dataset: 125, id_indikator: 297, sektor: "Lintas Sektor" },
  // { id_dataset: 125, id_indikator: 298, sektor: "Lintas Sektor" },
  // { id_dataset: 125, id_indikator: 285, sektor: "Lintas Sektor" },
  // { id_dataset: 125, id_indikator: 286, sektor: "Lintas Sektor" },
  // { id_dataset: 125, id_indikator: 288, sektor: "Lintas Sektor" },
  // { id_dataset: 125, id_indikator: 296, sektor: "Lintas Sektor" },

  // { id_dataset: 126, id_indikator: 292, sektor: "Lintas Sektor" },
  // { id_dataset: 126, id_indikator: 294, sektor: "Lintas Sektor" },
  // { id_dataset: 126, id_indikator: 293, sektor: "Lintas Sektor" },
  // { id_dataset: 126, id_indikator: 291, sektor: "Lintas Sektor" },
  // { id_dataset: 126, id_indikator: 290, sektor: "Lintas Sektor" },
  // { id_dataset: 126, id_indikator: 289, sektor: "Lintas Sektor" },

  // 119, 125, 126, 91
  // rumah tenaga kesehatan terdampak bencana
  { id_dataset: 111, id_indikator: 210, sektor: "Perumahan dan Pemukiman" },
];

export const datasets = [...pascaDatasets, ...praDatasets];
export const additionalLayersConfig = [
  {
    id: "akses_jalan_area_banjir",
    label: "Akses Jalan Area Banjir",
    color: "#7c2d12",
    loader: () => import("~/assets/data/map/akses_jalan_area_banjir.json"),
  },
  {
    id: "bangunan_terdampak",
    label: "Bangunan Terdampak",
    color: "#7c3aed",
    type: "api",
    // loader: () => import("~/assets/data/map/bangunan_terdampak.json"),
  },
  {
    id: "banjir",
    label: "Area Banjir - Citra Satelit",
    color: "#0284c7",
    loader: () => import("~/assets/data/map/banjir.json"),
  },
  // {
  //     id: "data_jalan_pu",
  //     label: "Data Jalan PU",
  //     color: "#40DFCE",
  //     loader: () => import("~/assets/data/map/data_jalan_PU.json"),
  // },
  {
    id: "longsor",
    label: "Area Longsor",
    color: "#92400e",
    loader: () => import("~/assets/data/map/longsor.json"),
  },
  {
    id: "titik_jalan_terputus",
    label: "Titik Jalan Terputus",
    color: "#dc2626",
    loader: () => import("~/assets/data/map/titik_jalan_terputus.json"),
  },
];

export const pmssLayersConfig = [
  {
    group: "Desa Tematik (BPS)",
    color: "bg-purple-500",
    layers: [
      {
        id: "desa_pendataan",
        name: "Desa Pendataan BPS-STIS",
        layerName: "floodmap_sumatera_2025:desa_pendataan_bps-stis",
        url: "https://geoserver.bps.go.id/gwc/service/wmts?layer=floodmap_sumatera_2025:desa_pendataan_bps-stis&style=&tilematrixset=WebMercatorQuad&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}",
      },
      {
        id: "desa_bencana",
        name: "Desa Wilayah Bencana",
        layerName: "floodmap_sumatera_2025:desa_wilayah_bencana",
        url: "https://geoserver.bps.go.id/gwc/service/wmts?layer=floodmap_sumatera_2025:desa_wilayah_bencana&style=&tilematrixset=WebMercatorQuad&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}",
      },
    ],
  },
  {
    group: "Geotagging (BPS)",
    color: "bg-orange-500",
    layers: [
      {
        id: "infrastruktur_terdampak",
        name: "Perkiraan Bangunan Infrastruktur",
        layerName:
          "floodmap_sumatera_2025:perkiraan_bangunan_infrastruktur_terdampak",
        url: "https://geoserver.bps.go.id/gwc/service/wmts?layer=floodmap_sumatera_2025:perkiraan_bangunan_infrastruktur_terdampak&style=&tilematrixset=WebMercatorQuad&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}",
      },
      {
        id: "tempat_tinggal_terdampak",
        name: "Perkiraan Tempat Tinggal",
        layerName:
          "floodmap_sumatera_2025:perkiraan_bangunan_tempat_tinggal_terdampak",
        url: "https://geoserver.bps.go.id/gwc/service/wmts?layer=floodmap_sumatera_2025:perkiraan_bangunan_tempat_tinggal_terdampak&style=&tilematrixset=WebMercatorQuad&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}",
      },
    ],
  },
  {
    group: "Poligon Tambahan",
    color: "bg-emerald-500",
    layers: [
      {
        id: "prediksi_banjir",
        name: "Prediksi Wilayah Banjir (BPS)",
        layerName: "floodmap_sumatera_2025:prediksi_wilayah_banjir",
        url: "https://geoserver.bps.go.id/gwc/service/wmts?layer=floodmap_sumatera_2025:prediksi_wilayah_banjir&style=&tilematrixset=WebMercatorQuad&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}",
      },
      {
        id: "lahan_baku_sawah",
        name: "Lahan Baku Sawah (Kemen ATR/BPN)",
        layerName: "floodmap_sumatera_2025:lahan_baku_sawah__lbs_",
        url: "https://geoserver.bps.go.id/gwc/service/wmts?layer=floodmap_sumatera_2025:lahan_baku_sawah__lbs_&style=&tilematrixset=WebMercatorQuad&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}",
      },
      //   {
      //     id: "banjir",
      //     name: "Area Banjir", // <--- PASTIIN INI 'name', BUKAN 'label'
      //     // label: "Area Banjir", // <--- JANGAN PAKE INI
      //     color: "#0284c7",
      //     loader: () => import("~/assets/data/map/banjir.json"),
      //   },
    ],
  },
  {
    // Curah Hujan BMKG section
    group: "Curah Hujan (BMKG)",
    color: "bg-blue-500",
    layers: [
      {
        id: "prediksi_curah_hujan_februari_2026",
        name: "Prediksi Curah Hujan Februari 2026",
        layerName: "curah_hujan_bmkg:prediksi_curah_hujan_februari_2026__mm_",
        url: "https://geoserver.bps.go.id/gwc/service/wmts?layer=curah_hujan_bmkg:prediksi_curah_hujan_februari_2026__mm_&style=&tilematrixset=WebMercatorQuad&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}",
      },
    ],
  },
  {
    // Curah Hujan BMKG section
    group: "Sungai (Kementerian PU)",
    color: "bg-dark-blue-500",
    layers: [
      {
        id: "sungai",
        name: "Sungai",
        layerName: "floodmap_sumatera_2025:inters_sungai_hutan_administrasi",
        url: "https://geoserver.bps.go.id/gwc/service/wmts?layer=floodmap_sumatera_2025:inters_sungai_hutan_administrasi&style=&tilematrixset=WebMercatorQuad&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}",
      },
    ],
  },
  {
    // Curah Hujan BMKG section
    group: "Kawasan Hutan (Kementerian Kehutanan)",
    color: "bg-dark-green-500",
    layers: [
      {
        id: "kawasan_hutan",
        name: "Kawasan Hutan",
        layerName: "floodmap_sumatera_2025:status_dan_fungsi_kawasan_hutan_sumut_sumbar_aceh",
        url: "https://geoserver.bps.go.id/gwc/service/wmts?layer=floodmap_sumatera_2025:status_dan_fungsi_kawasan_hutan_sumut_sumbar_aceh&style=&tilematrixset=WebMercatorQuad&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={z}&TileCol={x}&TileRow={y}",
      },
    ],
  },
];
