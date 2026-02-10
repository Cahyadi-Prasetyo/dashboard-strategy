// ~/constants/map-config.ts

export const MIN_ZOOM_LABEL = 7.5;

// === KONFIGURASI VIEW PETA UTAMA ===
export const MAP_VIEW_CONFIG = {
  bounds: [
    [6.5, 60],
    [-6.5, 120],
  ],
  initialCenter: [5.0, 97.4804],
  initialZoom: 7,
  minZoom: 5,
  maxBoundsViscosity: 1.0,
};

export const DAMAGE_CONFIG = {
  1: { label: "Rusak Ringan", color: "#10b981" },
  2: { label: "Rusak Sedang", color: "#f59e0b" },
  3: { label: "Rusak Berat", color: "#ef4444" },
  4: { label: "Hanyut", color: "#a855f7" },
  5: { label: "Tidak Diketahui", color: "#64748b" },
};

export const SIDEBAR_POSITIONS = ["bottom-[14rem]", "bottom-[7rem]"];

// === KONFIGURASI LAYER TYPES ===
export const LAYER_TYPES_PRA = {
  SENTINEL: "sentinel",
  DEM: "dem",
  VIIRS: "viirs",
};

export const LAYER_TYPES_PASCA = {
  SENTINEL: "sentinel",
  DEM: "dem",
  VIIRS: "viirs",
};

// === KONFIGURASI LAYER PRA BENCANA ===
// Tambahkan property legend di setiap layer config

// Update di map-config.ts

export const LAYER_CONFIG_PRA = {
  // [LAYER_TYPES_PRA.SENTINEL]: {
  //   id: "sentinel2-pra",
  //   label: "Citra Siang (Sentinel-2)",
  //   icon: "i-heroicons-globe-alt",
  //   description:
  //     "Foto satelit siang hari sebelum bencana, menampilkan kondisi permukaan bumi dengan jelas.",
  //   metadata: {
  //     source: "Google Earth Engine",
  //     resolution: "10m/pixel",
  //     status: "Pra Bencana",
  //     type: "Foto Satelit",
  //   },
  //   url: "https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=O7PAbzskDTxUmuyVGvJ0",
  //   attribution: "Google Earth Engine - Sentinel-2",
  //   minZoom: 5,
  //   maxZoom: 18,
  //   defaultOpacity: 0.8,
  //   legend: {
  //     title: "Legenda",
  //     type: "categorical",
  //     items: [
  //       {
  //         colors: ["#1a3d0f", "#2d5016", "#3d6b1f"],
  //         label: "Vegetasi Lebat",
  //       },
  //       {
  //         colors: ["#5a8f32", "#7cb342", "#a3d070"],
  //         label: "Vegetasi Sedang",
  //       },
  //       {
  //         colors: ["#c4a574", "#d4b896", "#e8d4b8"],
  //         label: "Tanah / Lumpur / Sawah",
  //       },
  //       {
  //         colors: ["#4a90c4", "#6ba3d0", "#87ceeb"],
  //         label: "Air",
  //       },
  //       {
  //         colors: ["#757575", "#9e9e9e", "#bdbdbd"],
  //         label: "Bangunan / Jalan",
  //       },
  //       {
  //         colors: ["#ffffff", "#ffffff", "#ffffff"],
  //         label: "Awan",
  //       },
  //     ],
  //   },
  // },
  [LAYER_TYPES_PRA.DEM]: {
    id: "dem-basemap-pra",
    label: "Ketinggian Wilayah (DEM)",
    icon: "i-heroicons-chart-bar",
    description:
      "Peta ketinggian wilayah untuk melihat topografi dan kontur tanah.",
    metadata: {
      source: "BIG - DEMNAS",
      resolution: "8.33m/pixel",
      status: "Data Dasar",
      type: "Peta Ketinggian",
    },
    url: "/demnas_tiles/{z}/{x}/{y}.png",
    attribution: "Badan Informasi Geospasial",
    minZoom: 5,
    maxZoom: 12,
    defaultOpacity: 1.0,
    legend: {
      title: "Skala Ketinggian",
      max: "2000 mdpl",
      description: "Warna makin terang = ketinggian makin tinggi",
    },
  },
  // [LAYER_TYPES_PRA.VIIRS]: {
  //   id: "viirs-nighttime-pra",
  //   label: "Citra Malam (VIIRS)",
  //   icon: "i-heroicons-moon",
  //   description:
  //     "Foto satelit malam hari sebelum bencana, menampilkan cahaya lampu dan aktivitas malam.",
  //   metadata: {
  //     source: "NASA/NOAA - VIIRS",
  //     resolution: "750m/pixel",
  //     status: "Pra Bencana",
  //     type: "Foto Cahaya Malam",
  //   },
  //   url: "https://earthengine.googleapis.com/v1/projects/gen-lang-client-0128627575/maps/40483bdd2874376c54e3c7ddf2a8ad04-70b9c6a75104f1cc4613773942c0595d/tiles/{z}/{x}/{y}",
  //   attribution: "NASA EOSDIS GIBS",
  //   minZoom: 5,
  //   maxZoom: 8,
  //   defaultOpacity: 0.9,
  //   legend: {
  //     title: "Intensitas Cahaya",
  //     max: "5 nW/sr/cm²",
  //     description: "Warna makin terang = cahaya makin kuat",
  //   },
  // },
};

// Lakukan hal yang sama untuk LAYER_CONFIG_PASCA
export const LAYER_CONFIG_PASCA = {
  [LAYER_TYPES_PASCA.SENTINEL]: {
    id: "sentinel2-pasca",
    label: "Citra Siang (Sentinel-2)",
    icon: "i-heroicons-globe-alt",
    description:
      "Foto satelit siang hari setelah bencana. Karena keterbatasan data (2 bulan), citra ini masih terhalang awan di beberapa area.",
    metadata: {
      source: "Google Earth Engine",
      resolution: "10m/pixel",
      status: "Pasca Bencana",
      type: "Foto Satelit",
    },
    url: "https://earthengine.googleapis.com/v1/projects/gen-lang-client-0128627575/maps/8bf0900dfa1665e658ab1ce8d010a636-d636272d73e8f997d0c6724461b70943/tiles/{z}/{x}/{y}",
    attribution: "Google Earth Engine - Sentinel-2",
    minZoom: 5,
    maxZoom: 18,
    defaultOpacity: 0.8,
    legend: {
      title: "Legenda",
      type: "categorical",
      items: [
        {
          colors: ["#1a3d0f", "#2d5016", "#3d6b1f"],
          label: "Vegetasi Lebat",
        },
        {
          colors: ["#5a8f32", "#7cb342", "#a3d070"],
          label: "Vegetasi Sedang",
        },
        {
          colors: ["#c4a574", "#d4b896", "#e8d4b8"],
          label: "Tanah / Lumpur / Sawah",
        },
        {
          colors: ["#4a90c4", "#6ba3d0", "#87ceeb"],
          label: "Air",
        },
        {
          colors: ["#757575", "#9e9e9e", "#bdbdbd"],
          label: "Bangunan / Jalan",
        },
        {
          colors: ["#ffffff", "#ffffff", "#ffffff"],
          label: "Awan",
        },
      ],
    },
  },
  [LAYER_TYPES_PASCA.DEM]: {
    id: "dem-basemap-pasca",
    label: "Ketinggian Wilayah (DEM)",
    icon: "i-heroicons-chart-bar",
    description:
      "Peta ketinggian wilayah untuk melihat topografi dan kontur tanah.",
    metadata: {
      source: "BIG - DEMNAS",
      resolution: "8.33m/pixel",
      status: "Data Dasar",
      type: "Peta Ketinggian",
    },
    url: "/demnas_tiles/{z}/{x}/{y}.png",
    attribution: "Badan Informasi Geospasial",
    minZoom: 5,
    maxZoom: 12,
    defaultOpacity: 1.0,
    legend: {
      title: "Skala Ketinggian",
      max: "2000 mdpl",
      description: "Warna makin terang = ketinggian makin tinggi",
    },
  },
  // [LAYER_TYPES_PASCA.VIIRS]: {
  //   id: "viirs-nighttime-pra",
  //   label: "Citra Malam (VIIRS)",
  //   icon: "i-heroicons-moon",
  //   description:
  //     "Foto satelit malam hari sebelum bencana, menampilkan cahaya lampu dan aktivitas malam.",
  //   metadata: {
  //     source: "NASA/NOAA - VIIRS",
  //     resolution: "750m/pixel",
  //     status: "Pra Bencana",
  //     type: "Foto Cahaya Malam",
  //   },
  //   url: "",
  //   attribution: "NASA EOSDIS GIBS",
  //   minZoom: 5,
  //   maxZoom: 8,
  //   defaultOpacity: 0.9,
  //   legend: {
  //     title: "Intensitas Cahaya",
  //     max: "5 nW/sr/cm²",
  //     description: "Warna makin terang = cahaya makin kuat",
  //   },
  // },
};

// Konfigurasi Dataset Khusus

export const SPECIAL_DATASET_CONFIG = {
  "27_209": {
    itemCategory2: "Desember",
    itemCategory3: "UMUM",
  },
  "27_63": {
    itemCategory2: "Desember",
    itemCategory3: "UMUM",
  },
  "137_309": {
    label: "Jumlah Hunian Rusak",
  },
  "138_310": {
    label: "Jumlah Penduduk Terdampak Bencana",
  },
  "114_212": {
    itemCategory2: "Agustus",
  },
  "114_213": {
    itemCategory2: "Agustus",
  },
  "114_214": {
    itemCategory2: "Agustus",
  },
  "114_215": {
    itemCategory2: "Agustus",
  },
  "114_216": {
    itemCategory2: "Agustus",
  },
  "114_217": {
    itemCategory2: "Agustus",
  },
  "114_218": {
    itemCategory2: "Agustus",
  },
  // Case 2: Custom Label, Unit, & Multi-Select
  "132_308_varian_A": {
    label: "Jalan dan Jembatan Terdampak",
    unit: "KM",
    filters: {
      itemCategory1: "TRANSPORTASI",
      itemCategory2: [
        "Jalan Nasional",
        "Jalan Provinsi",
        "Jalan Kabupaten",
        "Jembatan Nasional",
        "Jembatan Provinsi",
        "Jembatan Kabupaten",
      ],
    },
  },
  "130_308_varian_A": {
    label: "Perdagangan Terdampak",
    unit: "Unit",
    filters: {
      itemCategory1: ["Perdagangan", "Koperasi dan UMKM"],
      itemCategory2: [
        "Pasar",
        "Pedagang Kaki Lima (PKL)",
        "Pertokoan",
        "Koperasi",
        "UMKM",
      ],
    },
  },
  "135_308_varian_A": {
    label: "Rumah Ibadah Terdampak",
    unit: "Unit",
    filters: {
      itemCategory1: "Agama",
      itemCategory2: "Rumah Ibadah",
    },
  },
  "134_308_varian_A": {
    label: "Prasarana Lingkungan Terdampak",
    unit: "Unit",
    filters: {
      itemCategory1: "Prasarana Lingkungan",
      itemCategory2: [
        "Drainase Lingkungan",
        "Jalan Lingkungan",
        "Jembatan Ruas Jalan Lingkungan",
      ],
    },
  },
  "133_308_varian_A": {
    label: "Kantor Pemerintahan Terdampak",
    unit: "Unit",
    ignoreLevels: [2],
    filters: {
      itemCategory1: "Pemerintahan",
      itemCategory2: ["Pemerintahan", "Kantor Pemerintahan"],
    },
  },
};

// === HELPER FUNCTIONS ===

/**
 * Get layer configuration based on mode and layer type
 */
export const getLayerConfig = (mode, layerType) => {
  const config = mode === "pasca" ? LAYER_CONFIG_PASCA : LAYER_CONFIG_PRA;
  return config[layerType] || null;
};

/**
 * Get all layer types for a specific mode
 */
export const getLayerTypes = (mode) => {
  return mode === "pasca" ? LAYER_TYPES_PASCA : LAYER_TYPES_PRA;
};

/**
 * Get full layer configuration for a mode
 */
export const getFullLayerConfig = (mode) => {
  return mode === "pasca" ? LAYER_CONFIG_PASCA : LAYER_CONFIG_PRA;
};
