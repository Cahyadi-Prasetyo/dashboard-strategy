// utils/export-excel.js
import ExcelJS from "exceljs";

/**
 * Export hierarchical data ke Excel dengan kolom dinamis
 * @param {Array} flatData - Data yang sudah di-map dari rawRecords
 * @param {String} fileName - Nama file output
 * @param {Object} metadata - { datasetName, unit, filters }
 */
export const exportHierarchicalExcel = async (
  flatData,
  fileName,
  metadata = {},
) => {
  try {
    if (!flatData || flatData.length === 0) {
      console.error("No data to export");
      return false;
    }

    const firstRowRaw = flatData[0];
    const keyMap = {};
    let katCounter = 1;
    const monthNames = [
      "jan",
      "feb",
      "mar",
      "apr",
      "mei",
      "may",
      "jun",
      "jul",
      "agu",
      "aug",
      "sep",
      "okt",
      "oct",
      "nov",
      "des",
      "dec",
    ];

    Object.keys(firstRowRaw).forEach((key) => {
      if (key.startsWith("Kategori")) {
        const val = String(firstRowRaw[key]).trim().toLowerCase();

        if (/^\d{4}$/.test(val)) {
          keyMap[key] = "Tahun";
        } else if (monthNames.some((m) => val.includes(m))) {
          keyMap[key] = "Bulan";
        } else {
          keyMap[key] = `Kategori ${katCounter++}`;
        }
      } else {
        keyMap[key] = key;
      }
    });

    // Apply new keys to all data rows
    const processedData = flatData.map((row) => {
      const newRow = {};
      Object.keys(row).forEach((k) => {
        newRow[keyMap[k] || k] = row[k];
      });
      return newRow;
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data Wilayah");

    const firstRow = processedData[0];
    const columnKeys = Object.keys(firstRow);

    const wilayahCols = [
      "Provinsi",
      "Kode Provinsi",
      "Kabupaten",
      "Kode Kabupaten",
      "Kecamatan",
      "Kode Kecamatan",
      "Desa",
      "Kode Desa",
    ];

    const kategoriCols = columnKeys.filter(
      (k) =>
        k.startsWith("Kategori") ||
        ["Tahun", "Bulan", "Periode", "Triwulan"].includes(k),
    );
    const nilaiCols = ["Nilai", "Satuan"];

    const orderedColumns = [
      ...wilayahCols.filter((c) => columnKeys.includes(c)),
      ...kategoriCols,
      ...nilaiCols.filter((c) => columnKeys.includes(c)),
    ];

    // === HEADER METADATA ===
    const totalCols = orderedColumns.length;
    const lastCol = String.fromCharCode(64 + totalCols);

    worksheet.mergeCells(`A1:${lastCol}1`);
    worksheet.getCell("A1").value =
      metadata.datasetName || "Data Statistik Wilayah";
    worksheet.getCell("A1").font = { bold: true, size: 14 };
    worksheet.getCell("A1").alignment = { horizontal: "center" };

    if (metadata.unit) {
      worksheet.mergeCells(`A2:${lastCol}2`);
      worksheet.getCell("A2").value = `Satuan: ${metadata.unit}`;
      worksheet.getCell("A2").font = { italic: true };
      worksheet.getCell("A2").alignment = { horizontal: "center" };
    }

    let headerRow = 4;
    if (metadata.filters && Object.keys(metadata.filters).length > 0) {
      const filterText =
        "Filter: " + Object.values(metadata.filters).join(", ");
      worksheet.mergeCells(`A3:${lastCol}3`);
      worksheet.getCell("A3").value = filterText;
      worksheet.getCell("A3").font = { size: 10, color: { argb: "666666" } };
      headerRow = 5;
    }

    // === TABLE HEADER ===
    worksheet.getRow(headerRow).values = orderedColumns;
    const header = worksheet.getRow(headerRow);
    header.font = { bold: true, color: { argb: "FFFFFF" } };
    header.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4472C4" },
    };
    header.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    header.height = 30;

    // === DATA ROWS ===
    processedData.forEach((rowData, idx) => {
      const rowValues = orderedColumns.map((col) => rowData[col] || "");
      const dataRow = worksheet.addRow(rowValues);

      if (idx % 2 === 1) {
        dataRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "F2F2F2" },
        };
      }

      const nilaiIndex = orderedColumns.indexOf("Nilai");
      if (nilaiIndex >= 0) {
        const nilaiCell = dataRow.getCell(nilaiIndex + 1);
        nilaiCell.numFmt = "#,##0.00";
        nilaiCell.alignment = { horizontal: "right" };
      }
    });

    // === COLUMN WIDTH ===
    orderedColumns.forEach((col, idx) => {
      let width = 15;

      if (col.includes("Provinsi")) width = 20;
      else if (
        col.includes("Kabupaten") ||
        col.includes("Kecamatan") ||
        col.includes("Desa")
      )
        width = 25;
      else if (col.includes("Kode")) width = 12;
      else if (col === "Nilai") width = 15;
      else if (col === "Satuan") width = 12;
      else if (col === "Tahun") width = 10;
      else if (col === "Bulan") width = 15;
      else if (col.startsWith("Kategori")) width = 18;

      worksheet.getColumn(idx + 1).width = width;
    });

    // === BORDERS & FILTER ===
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber >= headerRow) {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      }
    });

    worksheet.autoFilter = {
      from: { row: headerRow, column: 1 },
      to: { row: headerRow, column: orderedColumns.length },
    };

    worksheet.views = [{ state: "frozen", xSplit: 0, ySplit: headerRow }];

    // === DOWNLOAD ===
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Error exporting Excel:", error);
    return false;
  }
};
