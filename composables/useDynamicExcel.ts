import * as XLSX from "xlsx";

export const useDynamicExcel = () => {
    const isExporting = ref(false);

    // Parameter columns kita buat optional (tanda tanya ?)
    const downloadDynamicExcel = (
        data: any[],
        fileName: string = "Export_Data",
        columns?: { header: string; key: string | ((row: any) => any) }[],
    ) => {
        if (!data || data.length === 0) {
            console.warn("Data kosong, tidak ada yang di-export");
            return;
        }

        isExporting.value = true;

        try {
            let exportData = [];

            // SKENARIO 1: Jika user mendefinisikan kolom (Cara Rapi)
            if (columns && columns.length > 0) {
                exportData = data.map((row) => {
                    const rowData: Record<string, any> = {};
                    columns.forEach((col) => {
                        const value =
                            typeof col.key === "function"
                                ? col.key(row)
                                : row[col.key];
                        rowData[col.header] = value;
                    });
                    return rowData;
                });
            }
            // SKENARIO 2: Otomatis (Cara Cepat)
            // Menggunakan data mentah apa adanya dari API/Table
            else {
                exportData = data;
            }

            // --- Proses Pembuatan Excel ---
            const worksheet = XLSX.utils.json_to_sheet(exportData);

            // Auto-width kolom (biar tidak sempit)
            // Kita ambil keys dari baris pertama data
            const keys = Object.keys(exportData[0] || {});
            const wscols = keys.map((key) => ({ wch: key.length + 15 }));
            worksheet["!cols"] = wscols;

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

            const timestamp = new Date().toISOString().slice(0, 10);
            XLSX.writeFile(workbook, `${fileName}_${timestamp}.xlsx`);
        } catch (error) {
            console.error("Gagal export excel:", error);
        } finally {
            isExporting.value = false;
        }
    };

    return { downloadDynamicExcel, isExporting };
};
