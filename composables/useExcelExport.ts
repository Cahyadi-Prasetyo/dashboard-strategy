import * as XLSX from "xlsx";

export const useExcelExport = () => {
    // Fungsi Helper untuk meratakan header bertingkat (Flattening)
    // Mengubah: Tahun [2022, 2023] -> ["2022", "2023"]
    const flattenHeaders = (
        levels: any[],
        currentPath: string[] = [],
        currentNameParts: string[] = [],
    ): any[] => {
        if (levels.length === 0) {
            return [{ ids: currentPath, name: currentNameParts.join(" - ") }];
        }

        const currentLevel = levels[0];
        const remainingLevels = levels.slice(1);
        let paths: any[] = [];

        if (currentLevel.items && currentLevel.items.length > 0) {
            currentLevel.items.forEach((item: any) => {
                paths = paths.concat(
                    flattenHeaders(
                        remainingLevels,
                        [...currentPath, item.id],
                        [...currentNameParts, item.name],
                    ),
                );
            });
        } else {
            paths = flattenHeaders(
                remainingLevels,
                currentPath,
                currentNameParts,
            );
        }
        return paths;
    };

    /**
     * Fungsi Utama Export
     * @param transformedResult Data hasil transformasi (useAgregatTransformer)
     * @param filename Nama file output (tanpa .xlsx)
     * @param sheetName Nama Sheet di dalam Excel
     */
    const downloadExcel = (
        transformedResult: any,
        filename: string = "Data-Export",
        sheetName: string = "Data",
    ) => {
        if (
            !transformedResult ||
            !transformedResult.row_headers ||
            !transformedResult.data
        ) {
            console.warn("Data tidak valid untuk export");
            return;
        }

        // 1. Siapkan Header
        // Kita gunakan model "Flat Header" agar mudah di-filter di Excel (Best Practice Data Analyst)
        const colPaths = flattenHeaders(transformedResult.column_headers || []);
        const headers = ["Wilayah", ...colPaths.map((c) => c.name)];

        // 2. Siapkan Baris Data
        const excelData = transformedResult.row_headers.map((row: any) => {
            // Kolom 1: Nama Wilayah
            const rowData: any[] = [row.name];

            // Kolom 2 dst: Data Value
            colPaths.forEach((col: any) => {
                // Cari data yang cocok dengan ID Baris & ID Kolom
                const matchedItem = transformedResult.data.find((d: any) => {
                    // Dimensi 0 = Baris, Dimensi 1..n = Kolom
                    if (d.dimensions[0] !== row.id) return false;
                    for (let i = 0; i < col.ids.length; i++) {
                        if (d.dimensions[i + 1] !== col.ids[i]) return false;
                    }
                    return true;
                });

                // Masukkan nilai asli (Number), agar di Excel bisa di-sum/average
                rowData.push(matchedItem ? matchedItem.value : null);
            });

            return rowData;
        });

        // 3. Gabungkan Header + Data
        const finalData = [headers, ...excelData];

        // 4. Buat Worksheet & Workbook
        const worksheet = XLSX.utils.aoa_to_sheet(finalData);

        // (Opsional) Auto-width kolom agar rapi
        const wscols = headers.map((h) => ({ wch: h.length + 5 }));
        worksheet["!cols"] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // 5. Download File
        XLSX.writeFile(workbook, `${filename}.xlsx`);
    };

    return {
        downloadExcel,
    };
};
