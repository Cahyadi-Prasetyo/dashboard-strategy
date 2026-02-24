// ============================================================
// DATA — Dashboard Strategis Kepulauan Riau
// ============================================================

const REGIONS = [
    { id: "2101", name: "Kab. Karimun", type: "kabupaten", coords: [0.9996, 103.4285] },
    { id: "2102", name: "Kab. Bintan", type: "kabupaten", coords: [1.1378, 104.5369] },
    { id: "2103", name: "Kab. Natuna", type: "kabupaten", coords: [3.9392, 108.2039] },
    { id: "2104", name: "Kab. Lingga", type: "kabupaten", coords: [-0.2173, 104.6293] },
    { id: "2105", name: "Kab. Kepulauan Anambas", type: "kabupaten", coords: [3.2384, 106.1152] },
    { id: "2171", name: "Kota Batam", type: "kota", coords: [1.0456, 104.0305] },
    { id: "2172", name: "Kota Tanjung Pinang", type: "kota", coords: [0.9165, 104.4497] }
];

// Warna distinct per daerah (vibrant)
const REGION_COLORS = {
    "2101": "#3B82F6", // Karimun — Blue
    "2102": "#10B981", // Bintan — Emerald
    "2103": "#F59E0B", // Natuna — Amber
    "2104": "#8B5CF6", // Lingga — Violet
    "2105": "#EF4444", // Anambas — Red
    "2171": "#06B6D4", // Batam — Cyan
    "2172": "#EC4899"  // Tanjungpinang — Pink
};

// Data indikator per kab/kota (BPS Real Data)
const INDICATOR_DATA = [
    {
        id: "2101",
        name: "Kab. Karimun",
        indicators: {
            pertumbuhan_ekonomi: 6.45,
            pertumbuhan_ekonomi_ctoc: { tw1: 5.16, tw2: 6.15, tw3: 6.60, tw4: 6.94 },
            pertumbuhan_ekonomi_qtq: { tw1: -2.78, tw2: 2.51, tw3: 0.85, tw4: 7.35 },
            pertumbuhan_ekonomi_yoy: { tw1: 5.16, tw2: 7.14, tw3: 7.48, tw4: 7.89 },
            pengangguran_tpt: 6.31,
            pendapatan_per_kapita: 69608000,
            ipm: 76.08,
            aps: 70.83,
            ipg: 91.61,
            kemiskinan: 5.16,
            gini_ratio: null,
            inflasi: 3.12
        }
    },
    {
        id: "2102",
        name: "Kab. Bintan",
        indicators: {
            pertumbuhan_ekonomi: 8.89,
            pertumbuhan_ekonomi_ctoc: { tw1: 5.16, tw2: 6.15, tw3: 6.60, tw4: 6.94 },
            pertumbuhan_ekonomi_qtq: { tw1: -2.78, tw2: 2.51, tw3: 0.85, tw4: 7.35 },
            pertumbuhan_ekonomi_yoy: { tw1: 5.16, tw2: 7.14, tw3: 7.48, tw4: 7.89 },
            pengangguran_tpt: 4.88,
            pendapatan_per_kapita: 90773000,
            ipm: 78.65,
            aps: 81.32,
            ipg: 94.05,
            kemiskinan: 4.77,
            gini_ratio: null,
            inflasi: null
        }
    },
    {
        id: "2103",
        name: "Kab. Natuna",
        indicators: {
            pertumbuhan_ekonomi: -3.57,
            pertumbuhan_ekonomi_ctoc: { tw1: 5.16, tw2: 6.15, tw3: 6.60, tw4: 6.94 },
            pertumbuhan_ekonomi_qtq: { tw1: -2.78, tw2: 2.51, tw3: 0.85, tw4: 7.35 },
            pertumbuhan_ekonomi_yoy: { tw1: 5.16, tw2: 7.14, tw3: 7.48, tw4: 7.89 },
            pengangguran_tpt: 5.01,
            pendapatan_per_kapita: 76890000,
            ipm: 78.94,
            aps: 81.24,
            ipg: 91.82,
            kemiskinan: 4.81,
            gini_ratio: null,
            inflasi: null
        }
    },
    {
        id: "2104",
        name: "Kab. Lingga",
        indicators: {
            pertumbuhan_ekonomi: 4.42,
            pertumbuhan_ekonomi_ctoc: { tw1: 5.16, tw2: 6.15, tw3: 6.60, tw4: 6.94 },
            pertumbuhan_ekonomi_qtq: { tw1: -2.78, tw2: 2.51, tw3: 0.85, tw4: 7.35 },
            pertumbuhan_ekonomi_yoy: { tw1: 5.16, tw2: 7.14, tw3: 7.48, tw4: 7.89 },
            pengangguran_tpt: 5.12,
            pendapatan_per_kapita: 54321000,
            ipm: 73.82,
            aps: 81.50,
            ipg: 91.12,
            kemiskinan: 9.12,
            gini_ratio: null,
            inflasi: null
        }
    },
    {
        id: "2105",
        name: "Kab. Kepulauan Anambas",
        indicators: {
            pertumbuhan_ekonomi: -5.67,
            pertumbuhan_ekonomi_ctoc: { tw1: 5.16, tw2: 6.15, tw3: 6.60, tw4: 6.94 },
            pertumbuhan_ekonomi_qtq: { tw1: -2.78, tw2: 2.51, tw3: 0.85, tw4: 7.35 },
            pertumbuhan_ekonomi_yoy: { tw1: 5.16, tw2: 7.14, tw3: 7.48, tw4: 7.89 },
            pengangguran_tpt: 5.56,
            pendapatan_per_kapita: 145876000,
            ipm: 71.73,
            aps: 85.18,
            ipg: 93.45,
            kemiskinan: 6.35,
            gini_ratio: null,
            inflasi: null
        }
    },
    {
        id: "2171",
        name: "Kota Batam",
        indicators: {
            pertumbuhan_ekonomi: 6.69,
            pertumbuhan_ekonomi_ctoc: { tw1: 5.16, tw2: 6.15, tw3: 6.60, tw4: 6.94 },
            pertumbuhan_ekonomi_qtq: { tw1: -2.78, tw2: 2.51, tw3: 0.85, tw4: 7.35 },
            pertumbuhan_ekonomi_yoy: { tw1: 5.16, tw2: 7.14, tw3: 7.48, tw4: 7.89 },
            pengangguran_tpt: 7.02,
            pendapatan_per_kapita: 182507000,
            ipm: 84.42,
            aps: 88.68,
            ipg: 95.67,
            kemiskinan: 3.81,
            gini_ratio: null,
            inflasi: 2.89
        }
    },
    {
        id: "2172",
        name: "Kota Tanjung Pinang",
        indicators: {
            pertumbuhan_ekonomi: 3.78,
            pertumbuhan_ekonomi_ctoc: { tw1: 5.16, tw2: 6.15, tw3: 6.60, tw4: 6.94 },
            pertumbuhan_ekonomi_qtq: { tw1: -2.78, tw2: 2.51, tw3: 0.85, tw4: 7.35 },
            pertumbuhan_ekonomi_yoy: { tw1: 5.16, tw2: 7.14, tw3: 7.48, tw4: 7.89 },
            pengangguran_tpt: 6.15,
            pendapatan_per_kapita: 98432000,
            ipm: 81.28,
            aps: 86.31,
            ipg: 96.12,
            kemiskinan: 5.96,
            gini_ratio: null,
            inflasi: 3.45
        }
    }
];

// Konfigurasi 9 indikator
const INDICATORS_CONFIG = [
    { id: "pertumbuhan_ekonomi", label: "Pertumbuhan Ekonomi", shortLabel: "PE", unit: "%", icon: "📈", isTriwulanan: true },
    { id: "pengangguran_tpt", label: "Tingkat Pengangguran Terbuka", shortLabel: "TPT", unit: "%", icon: "👥", isInverse: true },
    { id: "ipm", label: "Indeks Pembangunan Manusia", shortLabel: "IPM", unit: "Poin", icon: "🎯" },
    { id: "aps", label: "Angka Partisipasi Sekolah", shortLabel: "APS", unit: "%", icon: "🎓" },
    { id: "ipg", label: "Indeks Pembangunan Gender", shortLabel: "IPG", unit: "Poin", icon: "⚖️" },
    { id: "pendapatan_per_kapita", label: "PDRB Per Kapita", shortLabel: "PDRB/Kap", unit: "Rupiah", icon: "💰", formatCurrency: true },
    { id: "kemiskinan", label: "Persentase Penduduk Miskin", shortLabel: "Kemiskinan", unit: "%", icon: "📊", isInverse: true },
    { id: "gini_ratio", label: "Rasio Gini", shortLabel: "Gini", unit: "Koefisien", icon: "📉", isInverse: true },
    { id: "inflasi", label: "Inflasi", shortLabel: "Inflasi", unit: "%", icon: "💹" }
];
