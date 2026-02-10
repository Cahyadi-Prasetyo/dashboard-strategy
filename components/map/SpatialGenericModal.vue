<template>
    <Transition name="map-modal">
        <div
            v-if="isOpen"
            class="fixed inset-0 z-[100] flex flex-col bg-white"
        >
            <!-- Header -->
            <div class="shrink-0 flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-white shadow-sm">
                <div class="flex items-center gap-2.5">
                    <div class="flex items-center justify-center w-7 h-7 bg-emerald-50 rounded-lg border border-emerald-100">
                        <UIcon name="i-heroicons-map" class="w-4 h-4 text-emerald-600" />
                    </div>
                    <h3 class="text-sm font-bold text-gray-800">
                        Visualisasi Spasial
                    </h3>
                </div>

                    <UButton
                    color="error"
                    variant="soft"
                    icon="i-heroicons-x-mark"
                    @click="$emit('close')"
                    class="bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md hover:scale-[1.02] transition-all duration-300 border-none ring-0 h-[31px]"
                />
            </div>

            <!-- Map Body -->
            <div class="flex-1 min-h-0 overflow-hidden">
                <MapSpatialGeneric
                    map-id="map-pasca-modal"
                    map-type="pasca"
                    :wilayah="selectedWilayah"
                    :view-mode="'focus'"
                    :datasets="pascaDatasets"
                    :available-sektors="tersediaSektorPasca"
                    :layer-config="LAYER_CONFIG_PASCA"
                    :layer-types="LAYER_TYPES_PASCA"
                    :condition-layer-component="MapSpatialConditionLayerPasca"
                    :initial-dataset-id="initialDatasetId"
                    :initial-indikator-id="initialIndikatorId"
                    default-sektor-tab="Profil Dampak Bencana"
                    @panel-opened="$emit('panel-opened')"
                    :is-fullscreen-available="false"
                />
            </div>
        </div>
    </Transition>
</template>

<script setup>
import MapSpatialGeneric from "~/components/map/SpatialGeneric.vue";
import MapSpatialConditionLayerPasca from "~/components/map/spatial/ConditionLayerPasca.vue";
import { pascaDatasets, tersediaSektorPasca } from "~/constants/insight-spatial-data.ts";
import { LAYER_CONFIG_PASCA, LAYER_TYPES_PASCA } from "~/constants/map-config";

const props = defineProps({
    isOpen:             { type: Boolean, required: true },
    selectedWilayah:    { type: Object,  required: true },
    title:    { type: String,  required: false },
    initialDatasetId:   { type: Number,  required: true },
    initialIndikatorId: { type: Number,  required: true }
});

defineEmits(["close", "panel-opened"]);
</script>

<style scoped>
.map-modal-enter-active,
.map-modal-leave-active {
    transition: opacity 0.2s ease;
}
.map-modal-enter-from,
.map-modal-leave-to {
    opacity: 0;
}
</style>