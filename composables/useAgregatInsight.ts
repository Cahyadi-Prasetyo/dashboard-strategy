import { ref, unref, computed, watch } from "vue";
import type { Ref } from "vue";

// Helper type for reactive arguments
type MaybeRef<T> = T | Ref<T>;

export const useAgregatInsight = (
    datasetId: MaybeRef<number>, // <--- CHANGED: Now accepts Ref
    selectedWilayah: Ref<any>,
    extraParams: Record<string, any> = {},
) => {
    // 1. Capture Headers (Server Side Auth Fix)
    const headers = import.meta.server ? useRequestHeaders(["cookie"]) : {};

    const aggregatedData = ref<any>(null);
    const status = ref<"idle" | "pending" | "success" | "error">("idle");
    const error = ref<any>(null);

    // Watch for changes in selectedWilayah OR datasetId
    watch(
        [() => unref(selectedWilayah), () => unref(datasetId)],
        async () => {
            const w = unref(selectedWilayah) || {};
            const dsId = unref(datasetId); // <--- Unwrap the ID

            // 2. STOP if no valid dataset ID is provided (e.g. for aggregation cases)
            if (!dsId) {
                status.value = "idle";
                aggregatedData.value = null;
                return;
            }

            status.value = "pending";
            error.value = null;

            // Base params
            const baseParams = { id_dataset: dsId, ...extraParams };

            // Helper to validate selection
            const isValidSelection = (arr: any[], names: any[]) => {
                if (!arr || arr.length === 0) return false;

                // Check for "Seluruh Wilayah" tag
                if (names && names.length > 0) {
                    const hasAllTag = names.some((name) =>
                        ["Seluruh Wilayah", "Semua Wilayah", "All"].includes(
                            name,
                        ),
                    );
                    if (hasAllTag) return false;
                }

                const firstItem = arr[0];
                if (
                    typeof firstItem === "string" &&
                    ["Seluruh Wilayah", "Semua Wilayah"].includes(firstItem)
                )
                    return false;
                if (typeof firstItem === "number" && firstItem === 0)
                    return false;
                if (firstItem === null || firstItem === undefined) return false;

                return true;
            };

            try {
                const promises: Promise<any>[] = [];
                const fetchOptions = { headers };

                // 1. Priority: Desa
                if (isValidSelection(w.desa, w.desaNames)) {
                    w.desa.forEach((id: any) => {
                        const idVal = typeof id === "object" ? id.id : id;
                        promises.push(
                            $fetch("/api/agregat-insight", {
                                ...fetchOptions,
                                params: { ...baseParams, id_desa: idVal },
                            }),
                        );
                    });
                }
                // 2. Priority: Kecamatan
                else if (isValidSelection(w.kecamatan, w.kecamatanNames)) {
                    w.kecamatan.forEach((id: any) => {
                        const idVal = typeof id === "object" ? id.id : id;
                        promises.push(
                            $fetch("/api/agregat-insight", {
                                ...fetchOptions,
                                params: { ...baseParams, id_kec: idVal },
                            }),
                        );
                    });
                }
                // 3. Priority: Kabupaten
                else if (isValidSelection(w.kabupaten, w.kabupatenNames)) {
                    w.kabupaten.forEach((id: any) => {
                        const idVal = typeof id === "object" ? id.id : id;
                        promises.push(
                            $fetch("/api/agregat-insight", {
                                ...fetchOptions,
                                params: { ...baseParams, id_kab: idVal },
                            }),
                        );
                    });
                }
                // 4. Priority: Provinsi
                else if (isValidSelection(w.provinsi, w.provinsiNames)) {
                    w.provinsi.forEach((id: any) => {
                        const idVal = typeof id === "object" ? id.id : id;
                        promises.push(
                            $fetch("/api/agregat-insight", {
                                ...fetchOptions,
                                params: { ...baseParams, id_prov: idVal },
                            }),
                        );
                    });
                }
                // 5. Default: Nasional
                else {
                    promises.push(
                        $fetch("/api/agregat-insight", {
                            ...fetchOptions,
                            params: baseParams,
                        }),
                    );
                }

                const responses = await Promise.all(promises);

                let allRecords: any[] = [];
                let meta: any = {};

                responses.forEach((response: any) => {
                    if (response?.data?.records) {
                        allRecords = [...allRecords, ...response.data.records];
                    }
                    if (!meta.dataset && response?.data?.meta) {
                        meta = response.data.meta;
                    }
                });

                aggregatedData.value = {
                    data: { records: allRecords, meta: meta },
                };

                status.value = "success";
            } catch (err) {
                console.error("❌ Fetch error:", err);
                error.value = err;
                status.value = "error";
            }
        },
        { immediate: true, deep: true },
    );

    const datasetMeta = computed(() => aggregatedData.value?.data?.meta || {});
    const datasetInfo = computed(
        () => (datasetMeta.value as any)?.dataset || {},
    );
    const rawRecords = computed(
        () => aggregatedData.value?.data?.records || [],
    );

    const refresh = () => {
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
