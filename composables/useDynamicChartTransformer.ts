export const useDynamicChartTransformer = () => {
    /**
     * Transform data untuk chart dengan mapping dinamis
     * @param records - Array of records
     * @param filters - Object berisi filter values
     * @param mapping - Object berisi mapping field ke itemCategory
     */
    const transformToChart = (
        records: any[],
        filters: Record<string, any>,
        mapping: {
            regionField: string;
            [key: string]: string;
        }
    ) => {
        // 1. Filter Dinamis
        const filteredRecords = records.filter((record) => {
            // Cek semua filter yang dikirim
            const matchFilters = Object.entries(filters).every(([key, value]) => {
                if (!value) return true; // Skip jika filter kosong

                // Cari field di record berdasarkan mapping, atau langsung pakai key-nya
                const fieldKey = mapping[key + 'Field'] || key;
                const recordValue = record[fieldKey]?.nama || record[fieldKey];

                // Case-insensitive & trimmed comparison
                return String(recordValue).trim().toLowerCase() === String(value).trim().toLowerCase();
            });

            const hasRegion = !!record[mapping.regionField]?.nama;
            const hasValue = record.value !== null && record.value !== undefined;

            return matchFilters && hasRegion && hasValue;
        });

        // 2. Sorting (Berdasarkan Nilai Terbesar)
        const sortedData = [...filteredRecords].sort((a, b) => b.value - a.value);

        // 3. Return format standar
        return {
            categories: sortedData.map((r) => r[mapping.regionField]?.nama),
            data: sortedData.map((r) => parseFloat(Number(r.value).toFixed(2))),
            raw: sortedData
        };
    };

    /**
     * Extract unique values dari field tertentu
     */
    const extractUniqueValues = (records: any[], field: string): string[] => {
        if (!records || records.length === 0) return [];

        // 🔥 PERBAIKAN: Gunakan array biasa untuk preserve order
        const seen = new Set<string>();
        const result: string[] = [];

        records.forEach((record) => {
            const value = record[field]?.nama || record[field];
            if (value && !seen.has(value)) {
                seen.add(value);
                result.push(value); // Push sesuai urutan kemunculan pertama
            }
        });

        return result;
    };

    /**
     * Format value based on magnitude
     */
    const formatValue = (value: number) => {
        if (value >= 1000000000) {
            return `${(value / 1000000000).toFixed(1)}M`;
        } else if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}Jt`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}Rb`;
        }
        return value.toFixed(2);
    };

    return {
        transformToChart,
        extractUniqueValues,
        formatValue,
    };
};
