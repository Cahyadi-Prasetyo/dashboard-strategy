import { ref, computed, unref, watch, type Ref } from "vue";

export const useAgregatInsightEnhanced = (
    datasetId: number | Ref<number>, // Support Ref agar reaktif jika ID berubah
    selectedWilayah: Ref<any>,
) => {
    const queryParams = computed(() => {
        const w = unref(selectedWilayah) || {};
        const dsId = unref(datasetId); // Unref in case Ref passed

        // 🔥 Helper untuk validasi selection
        const isValidSelection = (arr: any[], names: any[]) => {
            // Cek array kosong
            if (!arr || arr.length === 0) return false;

            // Cek array names untuk "Seluruh Wilayah"
            if (names && names.length > 0) {
                const hasAllTag = names.some(
                    (name) =>
                        name === "Seluruh Wilayah" ||
                        name === "Semua Wilayah" ||
                        name === "All",
                );
                if (hasAllTag) return false;
            }

            const firstItem = arr[0];

            // Reject string "Seluruh Wilayah"
            if (
                typeof firstItem === "string" &&
                (firstItem === "Seluruh Wilayah" ||
                    firstItem === "Semua Wilayah")
            )
                return false;

            // Reject ID 0 atau null
            if (typeof firstItem === "number" && firstItem === 0) return false;
            if (firstItem === null || firstItem === undefined) return false;

            return true;
        };

        const getRegionParams = () => {
            // 🛑 LOGIC BARU: Cek digit > 2 (Desa, Kec, Kab) -> BLOCK FETCH
            // Kita return [] (kosong) agar watcher tidak jalan.

            if (isValidSelection(w.desa, w.desaNames)) {
                // Desa digit pasti > 2
                return [];
            }

            if (isValidSelection(w.kecamatan, w.kecamatanNames)) {
                // Kecamatan digit pasti > 2
                return [];
            }

            if (isValidSelection(w.kabupaten, w.kabupatenNames)) {
                // Kabupaten digit pasti > 2 (biasanya 4 digit)
                return [];
            }

            // ✅ Hanya proses jika PROVINSI (2 Digit)
            if (isValidSelection(w.provinsi, w.provinsiNames)) {
                return w.provinsi.map((id: number) => ({
                    id_dataset: dsId,
                    id_prov: id,
                }));
            }

            // Default: fetch all (no region filter) -> ID Dataset only
            // Asumsi: Kalau tidak ada wilayah terpilih sama sekali, ambil data nasional
            return [{ id_dataset: dsId }];
        };

        return getRegionParams();
    });

    const status = ref("idle");
    const error = ref<unknown>(null);
    const aggregatedData = ref<{
        data: {
            records: any[];
            meta: any;
        };
    } | null>(null);

    watch(
        queryParams,
        async (newParams) => {
            // 🛑 HANDLING JIKA PARAMS KOSONG (BLOCK)
            // Jika array kosong (karena return [] di atas), kita reset data

            if (import.meta.server) return;

            if (!newParams || newParams.length === 0) {
                status.value = "idle";
                aggregatedData.value = { data: { records: [], meta: {} } }; // Kosongkan data
                return;
            }

            status.value = "pending";
            error.value = null;

            try {
                // Parallel fetch untuk semua wilayah
                const responses = await Promise.all(
                    newParams.map((params: any) =>
                        $fetch("/api/agregat-insight", {
                            method: "GET",
                            query: params,
                        }),
                    ),
                );

                // 🔥 AGGREGATE: Gabungkan semua records dari multiple responses
                const allRecords: any[] = [];
                let meta: any = null;

                responses.forEach((response: any) => {
                    if (response?.data?.records) {
                        allRecords.push(...response.data.records);
                    }
                    // Ambil meta dari response pertama
                    if (!meta && response?.data?.meta) {
                        meta = response.data.meta;
                    }
                });

                aggregatedData.value = {
                    data: {
                        records: allRecords,
                        meta: meta,
                    },
                };

                status.value = "success";
            } catch (err) {
                console.error("❌ Fetch error:", err);
                error.value = err;
                status.value = "error";
            }
        },
        { immediate: true },
    );

    const datasetMeta = computed(
        () =>
            (aggregatedData.value && "data" in aggregatedData.value
                ? aggregatedData.value?.data?.meta
                : undefined) || {},
    );
    const datasetInfo = computed(
        () => (datasetMeta.value as any)?.dataset || {},
    );
    const rawRecords = computed(
        () =>
            (aggregatedData.value && "data" in aggregatedData.value
                ? aggregatedData.value?.data?.records
                : undefined) || [],
    );

    const refresh = () => {
        // Trigger reactivity by reassigning selectedWilayah
        selectedWilayah.value = { ...unref(selectedWilayah) };
    };

    return {
        apiResponse: aggregatedData,
        status,
        error,
        datasetMeta,
        datasetInfo,
        rawRecords,
        refresh,
    };
};
