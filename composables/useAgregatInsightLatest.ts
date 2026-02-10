import { ref, computed, unref, watch, type Ref } from "vue";

export const useAgregatInsightLatest = (
    datasetId: number | Ref<number>,
    selectedWilayah?: Ref<any>,
    additionalParams?: Ref<Record<string, any>>
) => {
    const queryParams = computed(() => {
        const dsId = unref(datasetId);
        const params: Record<string, any> = {
            id_dataset: dsId,
        };

        // Tambahkan parameter wilayah jika ada
        if (selectedWilayah) {
            const w = unref(selectedWilayah) || {};

            // Helper untuk validasi selection
            const isValidSelection = (arr: any[], names: any[]) => {
                if (!arr || arr.length === 0) return false;

                if (names && names.length > 0) {
                    const hasAllTag = names.some(
                        (name) =>
                            name === "Seluruh Wilayah" ||
                            name === "Semua Wilayah" ||
                            name === "All"
                    );
                    if (hasAllTag) return false;
                }

                const firstItem = arr[0];

                if (
                    typeof firstItem === "string" &&
                    (firstItem === "Seluruh Wilayah" ||
                        firstItem === "Semua Wilayah")
                )
                    return false;

                if (typeof firstItem === "number" && firstItem === 0)
                    return false;
                if (firstItem === null || firstItem === undefined) return false;

                return true;
            };

            // Prioritas: Desa > Kecamatan > Kabupaten > Provinsi
            if (isValidSelection(w.desa, w.desaNames)) {
                params.id_desa = String(w.desa[0]);
            } else if (isValidSelection(w.kecamatan, w.kecamatanNames)) {
                params.id_kec = String(w.kecamatan[0]);
            } else if (isValidSelection(w.kabupaten, w.kabupatenNames)) {
                params.id_kab = String(w.kabupaten[0]);
            } else if (isValidSelection(w.provinsi, w.provinsiNames)) {
                params.id_prov = String(w.provinsi[0]);
            }
        }

        // Tambahkan parameter tambahan jika ada
        if (additionalParams) {
            const additional = unref(additionalParams);
            Object.assign(params, additional);
        }

        return params;
    });

    const status = ref("idle");
    const error = ref<unknown>(null);
    const responseData = ref<any>(null);

    const fetchData = async () => {
        if (import.meta.server) return;

        const params = unref(queryParams);

        if (!params.id_dataset) {
            status.value = "idle";
            responseData.value = null;
            return;
        }

        status.value = "pending";
        error.value = null;

        try {
            const response = await $fetch("/api/agregat-insight-latest", {
                method: "GET",
                query: params,
            });

            responseData.value = response;
            status.value = "success";
        } catch (err) {
            console.error("❌ Fetch error:", err);
            error.value = err;
            status.value = "error";
        }
    };

    // Watch untuk auto-fetch saat params berubah
    watch(
        queryParams,
        () => {
            fetchData();
        },
        { immediate: true }
    );

    const datasetMeta = computed(() => responseData.value?.data?.meta || {});
    const datasetInfo = computed(() => datasetMeta.value?.dataset || {});
    const records = computed(() => responseData.value?.data?.records || []);

    const refresh = () => {
        fetchData();
    };

    return {
        apiResponse: responseData,
        status,
        error,
        datasetMeta,
        datasetInfo,
        records,
        refresh,
        fetchData,
    };
};