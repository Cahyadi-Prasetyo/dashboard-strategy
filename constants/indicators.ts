import type { BPSIndicator } from '~/types/indicator';

export const INDICATORS: BPSIndicator[] = [
    {
        id: 'growth',
        label: 'Pertumbuhan Ekonomi',
        description: 'Laju pertumbuhan Produk Domestik Regional Bruto (PDRB) atas dasar harga konstan.',
        unit: '%',
        source: 'BPS Kepulauan Riau'
    },
    {
        id: 'unemployment',
        label: 'Tingkat Pengangguran Terbuka (TPT)',
        description: 'Persentase jumlah pengangguran terhadap jumlah angkatan kerja.',
        unit: '%',
        source: 'BPS Kepulauan Riau'
    },
    {
        id: 'income_per_capita',
        label: 'PDRB Per Kapita',
        description: 'Rata-rata pendapatan penduduk per tahun.',
        unit: 'Juta Rupiah',
        source: 'BPS Kepulauan Riau'
    },
    {
        id: 'hdi',
        label: 'Indeks Pembangunan Manusia (IPM)',
        description: 'Mengukur capaian pembangunan manusia berbasis sejumlah komponen dasar kualitas hidup.',
        unit: 'Indeks',
        source: 'BPS Kepulauan Riau'
    },
    {
        id: 'aps',
        label: 'Angka Partisipasi Sekolah (APS)',
        description: 'Proporsi anak sekolah pada satu kelompok umur tertentu yang bersekolah pada jenjang pendidikan yang sesuai.',
        unit: '%',
        source: 'BPS Kepulauan Riau'
    },
    {
        id: 'gdi',
        label: 'Indeks Pembangunan Gender (IPG)',
        description: 'Mengukur pencapaian pembangunan manusia dengan memperhatikan ketimpangan gender.',
        unit: 'Indeks',
        source: 'BPS Kepulauan Riau'
    },
    {
        id: 'poverty',
        label: 'Persentase Penduduk Miskin',
        description: 'Persentase penduduk yang berada di bawah Garis Kemiskinan.',
        unit: '%',
        source: 'BPS Kepulauan Riau'
    },
    {
        id: 'gini',
        label: 'Gini Ratio',
        description: 'Mengukur tingkat ketimpangan pengeluaran secara menyeluruh.',
        unit: 'Koefisien',
        source: 'BPS Kepulauan Riau'
    }
];

export const MOCK_REGION_DATA = {
    // Provinsi Kepulauan Riau
    '2100': {
        name: 'Provinsi Kepulauan Riau',
        values: {
            growth: 5.2,
            unemployment: 6.8,
            income_per_capita: 145.2,
            hdi: 78.4,
            aps: 98.5,
            gdi: 94.2,
            poverty: 5.6,
            gini: 0.34
        }
    },
    // Kota Batam
    '2171': {
        name: 'Kota Batam',
        values: {
            growth: 6.84,
            unemployment: 8.14,
            income_per_capita: 180.5,
            hdi: 81.12,
            aps: 99.2,
            gdi: 95.1,
            poverty: 4.88,
            gini: 0.38
        }
    },
    // Kota Tanjungpinang
    '2172': {
        name: 'Kota Tanjungpinang',
        values: {
            growth: 4.92,
            unemployment: 5.72,
            income_per_capita: 110.4,
            hdi: 79.64,
            aps: 99.0,
            gdi: 93.8,
            poverty: 9.38,
            gini: 0.32
        }
    },
    // Kabupaten Karimun
    '2101': {
        name: 'Kab. Karimun',
        values: {
            growth: 5.11,
            unemployment: 6.25,
            income_per_capita: 120.3,
            hdi: 72.54,
            aps: 98.1,
            gdi: 92.5,
            poverty: 6.45,
            gini: 0.33
        }
    },
    // Kabupaten Bintan
    '2102': {
        name: 'Kab. Bintan',
        values: {
            growth: 5.45,
            unemployment: 5.89,
            income_per_capita: 135.2,
            hdi: 75.21,
            aps: 98.7,
            gdi: 93.1,
            poverty: 6.12,
            gini: 0.35
        }
    },
    // Kabupaten Natuna
    '2103': {
        name: 'Kab. Natuna',
        values: {
            growth: 3.21,
            unemployment: 4.12,
            income_per_capita: 98.5,
            hdi: 73.85,
            aps: 97.5,
            gdi: 91.2,
            poverty: 5.85,
            gini: 0.29
        }
    },
    // Kabupaten Lingga
    '2104': {
        name: 'Kab. Lingga',
        values: {
            growth: 2.85,
            unemployment: 3.56,
            income_per_capita: 45.2,
            hdi: 66.52,
            aps: 96.8,
            gdi: 89.5,
            poverty: 12.45,
            gini: 0.31
        }
    },
    // Kabupaten Kepulauan Anambas
    '2105': {
        name: 'Kab. Kepulauan Anambas',
        values: {
            growth: 3.15,
            unemployment: 4.25,
            income_per_capita: 85.6,
            hdi: 69.85,
            aps: 97.2,
            gdi: 90.8,
            poverty: 7.25,
            gini: 0.30
        }
    }
};
