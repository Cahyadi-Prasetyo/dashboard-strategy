// utils/hierarchical-data.js

/**
 * Fetch data hierarki berdasarkan level dan parent
 * @param {Object} params - { id_dataset, id_indikator, level, parent_id, filter_state }
 * @returns {Promise<Array>} - Array of records
 */
export const fetchHierarchicalData = async ({
  id_dataset,
  id_indikator,
  level, // 'prov' | 'kab' | 'kec' | 'desa'
  parent_id = null,
  filter_state = {},
}) => {
  try {
    const params = {
      id_dataset,
      id_indikator_insight: id_indikator,
      ...filter_state,
    };

    // Tambahkan parent filter sesuai level
    if (level === "kab" && parent_id) {
      params.id_prov = parent_id;
    } else if (level === "kec" && parent_id) {
      params.id_kab = parent_id;
    } else if (level === "desa" && parent_id) {
      params.id_kec = parent_id;
    }

    const response = await $fetch("/api/agregat-insight", { params });

    if (response.success && response.data?.records) {
      return response.data.records;
    }

    return [];
  } catch (error) {
    console.error("Error fetching hierarchical data:", error);
    return [];
  }
};

/**
 * Group records berdasarkan wilayah dengan agregasi SUM
 * @param {Array} records - Raw records dari API
 * @param {String} level - Level saat ini
 * @returns {Object} - Grouped data { regionId: { id, name, value, children: [] } }
 */
export const groupRecordsByRegion = (records, level) => {
  const grouped = {};

  records.forEach((rec) => {
    let regionId, regionName, regionDetails;

    // Tentukan region berdasarkan level
    if (level === "prov") {
      regionId = String(rec.kd_prov?.kode || "");
      // Skip kode nasional "00"
      if (regionId === "00") return;
      regionName = rec.kd_prov?.nama || "";
      regionDetails = { provinsi: regionName };
    } else if (level === "kab") {
      regionId = String(rec.kd_kab?.kode || "");
      regionName = rec.kd_kab?.nama || "";
      regionDetails = {
        provinsi: rec.kd_prov?.nama || "",
        kabupaten: regionName,
      };
    } else if (level === "kec") {
      regionId = String(rec.kd_kec?.kode || "");
      regionName = rec.kd_kec?.nama || "";
      regionDetails = {
        provinsi: rec.kd_prov?.nama || "",
        kabupaten: rec.kd_kab?.nama || "",
        kecamatan: regionName,
      };
      // console.log(`Grouping kec: ${regionId} - ${regionName}`);
    } else if (level === "desa") {
      regionId = String(rec.kd_desa?.kode || "");
      regionName = rec.kd_desa?.nama || "";
      regionDetails = {
        provinsi: rec.kd_prov?.nama || "",
        kabupaten: rec.kd_kab?.nama || "",
        kecamatan: rec.kd_kec?.nama || "",
        desa: regionName,
      };
    }

    if (!regionId) {
      console.warn(`No regionId for level ${level}:`, rec);
      return;
    }
    if (!regionId || regionId === "00") return;

    const value =
      rec.value !== null && rec.value !== undefined
        ? typeof rec.value === "string"
          ? parseFloat(rec.value)
          : rec.value
        : 0;

    // ✅ AGREGASI: Sum values untuk regionId yang sama
    if (grouped[regionId]) {
      grouped[regionId].value += value; // Tambahkan ke nilai existing
      // Keep the most complete fullRecord (prefer one with more data)
      if (!grouped[regionId].fullRecord.indikator && rec.indikator) {
        grouped[regionId].fullRecord = rec;
      }
    } else {
      grouped[regionId] = {
        id: regionId,
        name: regionName,
        details: regionDetails,
        value: value,
        fullRecord: rec,
      };
    }
    // if (level === 'kec') {
    //   console.log('=== GROUPED KECAMATAN ===');
    //   console.log('Total regions:', Object.keys(grouped).length);
    //   console.log('Region IDs:', Object.keys(grouped));
    //   console.log('Sample data:', Object.values(grouped)[0]);
    // }
  });

  return grouped;
};

/**
 * Fetch child data untuk hover tooltip
 * @param {String} parentId - ID wilayah parent
 * @param {String} parentLevel - Level parent
 * @param {Object} datasetInfo - { id_dataset, id_indikator, filter_state }
 * @returns {Promise<Array>} - Array of child records with values
 */
export const fetchChildrenForHover = async (
  parentId,
  parentLevel,
  datasetInfo,
) => {
  // Tentukan child level
  let childLevel;
  if (parentLevel === "prov") childLevel = "kab";
  else if (parentLevel === "kab") childLevel = "kec";
  else if (parentLevel === "kec") childLevel = "desa";
  else return []; // Desa tidak punya child

  try {
    const childRecords = await fetchHierarchicalData({
      ...datasetInfo,
      level: childLevel,
      parent_id: parentId,
    });

    // Group children dengan agregasi (untuk handle duplikat)
    const groupedChildren = groupRecordsByRegion(childRecords, childLevel);

    // Transform ke format tabel
    return Object.values(groupedChildren)
      .map((child) => ({
        name: child.name,
        value: child.value,
      }))
      .filter((item) => item.name); // Filter empty names
  } catch (error) {
    console.error("Error fetching children for hover:", error);
    return [];
  }
};

/**
 * Prepare flat data untuk export Excel
 * @param {String} regionId - ID wilayah yang dipilih
 * @param {String} regionLevel - Level wilayah
 * @param {Object} datasetInfo - Dataset & indikator info
 * @returns {Promise<Array>} - Flat array untuk Excel
 */
export const prepareFlatExportData = async (
  regionId,
  regionLevel,
  datasetInfo,
) => {
  const flatData = [];

  // Fetch semua level di bawah region ini
  const levels = [];
  if (regionLevel === "prov") levels.push("kab", "kec", "desa");
  else if (regionLevel === "kab") levels.push("kec", "desa");
  else if (regionLevel === "kec") levels.push("desa");

  // Fetch data bertingkat
  for (const level of levels) {
    const records = await fetchHierarchicalData({
      ...datasetInfo,
      level,
      parent_id: regionId,
    });

    records.forEach((rec) => {
      flatData.push({
        Provinsi: rec.kd_prov?.nama || "",
        Kabupaten: rec.kd_kab?.nama || "",
        Kecamatan: rec.kd_kec?.nama || "",
        Desa: rec.kd_desa?.nama || "",
        Indikator: rec.indikator?.nama || "",
        Nilai: rec.value || 0,
        Satuan: rec.indikator?.satuan || "",
      });
    });
  }

  return flatData;
};
