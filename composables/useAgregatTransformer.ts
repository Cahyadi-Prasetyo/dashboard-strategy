export const useAgregatTransformer = () => {
    // Helper: Bersihkan ID dari spasi/karakter aneh
    const safeId = (val: any) => String(val).replace(/[^a-zA-Z0-9]/g, "_");

    const transformAgregatData = (
        records: any[],
        forceLevel?: "provinsi" | "kabupaten" | "kecamatan" | "desa",
    ) => {
        if (!records || records.length === 0) return null;

        // --- 1. DETEKSI BARIS (Row Headers) dengan FORCE LEVEL ---
        const rowMap = new Map();

        records.forEach((rec) => {
            let rowObj = null;

            // 🔥 FORCE LEVEL: Paksa ambil level tertentu jika diberikan
            if (forceLevel === "provinsi" && rec.kd_prov?.kode) {
                rowObj = rec.kd_prov;
            } else if (forceLevel === "kabupaten" && rec.kd_kab?.kode) {
                rowObj = rec.kd_kab;
            } else if (forceLevel === "kecamatan" && rec.kd_kec?.kode) {
                rowObj = rec.kd_kec;
            } else if (forceLevel === "desa" && rec.kd_desa?.kode) {
                rowObj = rec.kd_desa;
            }
            // Auto-detect (Hierarki: Desa > Kec > Kab > Prov)
            else {
                if (rec.kd_desa && rec.kd_desa.kode) rowObj = rec.kd_desa;
                else if (rec.kd_kec && rec.kd_kec.kode) rowObj = rec.kd_kec;
                else if (rec.kd_kab && rec.kd_kab.kode) rowObj = rec.kd_kab;
                else if (rec.kd_prov && rec.kd_prov.kode) rowObj = rec.kd_prov;
            }

            if (rowObj) {
                const rCode = safeId(rowObj.kode);
                if (!rowMap.has(rCode)) {
                    rowMap.set(rCode, {
                        id: rCode,
                        name: rowObj.nama,
                        role: "Region",
                        // Metadata untuk tracking
                        _level:
                            rowObj.kode.length === 2
                                ? "provinsi"
                                : rowObj.kode.length === 4
                                  ? "kabupaten"
                                  : rowObj.kode.length === 7
                                    ? "kecamatan"
                                    : "desa",
                        _kode: rowObj.kode,
                    });
                }
            }
        });

        const sortedRows = Array.from(rowMap.values()).sort((a: any, b: any) =>
            a.id.localeCompare(b.id),
        );

        // --- 2. DETEKSI KOLOM (Ikuti Urutan API) ---
        const categoryLevels: Map<string, any>[] = Array.from(
            { length: 5 },
            () => new Map(),
        );
        let maxLevel = 0;

        records.forEach((rec) => {
            for (let i = 1; i <= 5; i++) {
                const catKey = `itemCategory${i}`;
                const catData = rec[catKey];

                if (catData && catData.kode) {
                    const levelIndex = i - 1;
                    const cCode = safeId(catData.kode);
                    const levelMap = categoryLevels[levelIndex];

                    if (
                        categoryLevels[levelIndex] &&
                        !categoryLevels[levelIndex].has(cCode)
                    ) {
                        categoryLevels[levelIndex].set(cCode, {
                            id: cCode,
                            name: catData.nama,
                        });
                    }
                    if (i > maxLevel) maxLevel = i;
                }
            }
        });

        const columnHeaders = [];
        for (let i = 0; i < maxLevel; i++) {
            const levels = categoryLevels[i];
            columnHeaders.push({
                id: `lvl_${i + 1}`,
                name: `Kategori ${i + 1}`,
                items: levels ? Array.from(levels.values()) : [],
            });
        }

        // --- 3. MAPPING DATA VALUES dengan AGGREGATION ---
        const dataMap = new Map();

        records.forEach((rec) => {
            let rowId = null;

            if (forceLevel === "provinsi" && rec.kd_prov?.kode) {
                rowId = safeId(rec.kd_prov.kode);
            } else if (forceLevel === "kabupaten" && rec.kd_kab?.kode) {
                rowId = safeId(rec.kd_kab.kode);
            } else if (forceLevel === "kecamatan" && rec.kd_kec?.kode) {
                rowId = safeId(rec.kd_kec.kode);
            } else if (forceLevel === "desa" && rec.kd_desa?.kode) {
                rowId = safeId(rec.kd_desa.kode);
            } else {
                if (rec.kd_desa && rec.kd_desa.kode)
                    rowId = safeId(rec.kd_desa.kode);
                else if (rec.kd_kec && rec.kd_kec.kode)
                    rowId = safeId(rec.kd_kec.kode);
                else if (rec.kd_kab && rec.kd_kab.kode)
                    rowId = safeId(rec.kd_kab.kode);
                else if (rec.kd_prov && rec.kd_prov.kode)
                    rowId = safeId(rec.kd_prov.kode);
            }

            if (!rowId) return;

            const dims = [rowId];

            for (let i = 1; i <= maxLevel; i++) {
                const catData = rec[`itemCategory${i}`];
                if (catData && catData.kode) {
                    dims.push(safeId(catData.kode));
                }
            }

            // Hanya proses jika jumlah dimensi cocok (menghindari incomplete data)
            if (dims.length === 1 + maxLevel) {
                const key = dims.join("-");

                // 🔥 AGGREGATE: Sum values dengan key yang sama (Gunakan parseFloat untuk presisi)
                const val = parseFloat(rec.value || 0);
                if (dataMap.has(key)) {
                    dataMap.get(key).value += val;
                } else {
                    dataMap.set(key, {
                        dimensions: dims,
                        value: val,
                    });
                }
            }
        });

        const formattedData = Array.from(dataMap.values());

        return {
            row_headers: sortedRows,
            column_headers: columnHeaders,
            data: formattedData,
        };
    };

    return {
        transformAgregatData,
    };
};
