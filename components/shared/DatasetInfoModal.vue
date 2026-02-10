<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
    >
        <!-- Backdrop with blur -->
        <div
            class="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
            @click="$emit('close')"
        ></div>

        <!-- Modal Container -->
        <div
            class="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10"
        >
            <!-- ✅ Original Header Style -->
            <div
                class="px-6 pt-6 pb-4 flex items-center justify-between gap-4 border-b border-gray-100"
            >
                <h3 class="text-lg font-bold text-gray-800">
                    Informasi Dataset
                </h3>

                <!-- ✅ Original Close Button -->
                <UButton
                    color="error"
                    variant="soft"
                    icon="i-heroicons-x-mark"
                    @click="$emit('close')"
                    class="bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/40 hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 border-none ring-0 h-[31px]"
                />
            </div>

            <!-- tabs per dataset jika lebih dari 1 -->
            <div
                v-if="infoItems.length > 1"
                class="px-6 py-4 border-b border-gray-100 bg-white"
            >
                <div
                    class="flex flex-wrap gap-2 p-1.5 bg-slate-100/50 rounded-xl w-fit"
                >
                    <button
                        v-for="tab in infoItems"
                        :key="tab.key"
                        @click="activeTab = tab.key"
                        class="px-5 py-2 text-[13px] font-bold rounded-lg transition-all duration-300"
                        :class="
                            activeTab === tab.key
                                ? 'bg-white text-emerald-600 shadow-md ring-1 ring-slate-200 scale-[1.02]'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        "
                    >
                        {{ tab.key }}
                    </button>
                </div>
            </div>

            <!-- Content Area -->
            <div
                class="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50/50 to-white"
            >
                <!-- Judul Dataset Card -->
                <div
                    class="mb-5 p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div class="flex items-start gap-3">
                        <div
                            class="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-violet-100 to-violet-200 flex-shrink-0"
                        >
                            <UIcon
                                name="i-heroicons-document-text"
                                class="w-5 h-5 text-violet-700"
                            />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p
                                class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1.5"
                            >
                                Judul Dataset
                            </p>
                            <p
                                class="text-base font-bold text-gray-900 leading-snug"
                            >
                                {{ currentInfo?.judul || "-" }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Sumber Card -->
                <div
                    class="mb-5 p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div class="flex items-start gap-3">
                        <div
                            class="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-sky-100 to-sky-200 flex-shrink-0"
                        >
                            <UIcon
                                name="i-heroicons-building-library"
                                class="w-5 h-5 text-sky-700"
                            />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p
                                class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1.5"
                            >
                                Sumber Data
                            </p>
                            <p
                                class="text-sm font-semibold text-gray-800 leading-relaxed"
                            >
                                {{ currentInfo?.sumber !== '-' ? currentInfo?.sumber : currentInfo?.instansi }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Grid Info Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <!-- Frekuensi Card -->
                    <div
                        class="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div class="flex items-start gap-3">
                            <div
                                class="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-teal-100 to-teal-200 flex-shrink-0"
                            >
                                <UIcon
                                    name="i-heroicons-arrow-path"
                                    class="w-5 h-5 text-teal-700"
                                />
                            </div>
                            <div class="flex-1 min-w-0">
                                <p
                                    class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1.5"
                                >
                                    Frekuensi Diperbarui
                                </p>
                                <p class="text-sm font-semibold text-gray-900">
                                    {{ currentInfo?.frekuensi || "-" }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Last Update Card -->
                    <div
                        class="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div class="flex items-start gap-3">
                            <div
                                class="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex-shrink-0"
                            >
                                <UIcon
                                    name="i-heroicons-clock"
                                    class="w-5 h-5 text-orange-700"
                                />
                            </div>
                            <div class="flex-1 min-w-0">
                                <p
                                    class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1.5"
                                >
                                    Terakhir Diperbarui
                                </p>
                                <p class="text-sm font-semibold text-gray-900">
                                    {{
                                        formatDate(
                                            currentInfo?.terakhir_diupdate,
                                        )
                                    }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
    isOpen: { type: Boolean, required: true },
    datasetInfo: { type: Object, default: () => ({}) },
});

defineEmits(["close"]);

const activeTab = ref(null);

const infoItems = computed(() => {
    if (!props.datasetInfo) return [];

    if (props.datasetInfo.judul || props.datasetInfo.sumber || props.datasetInfo.instansi) {
        return [{ key: "Data Utama", info: props.datasetInfo }];
    }

    return Object.entries(props.datasetInfo)
        .filter(([key, info]) => info && typeof info === "object")
        .map(([key, info]) => ({
            key,
            info,
        }));
});

watch(
    infoItems,
    (items) => {
        if (
            items.length > 0 &&
            (!activeTab.value || !items.find((i) => i.key === activeTab.value))
        ) {
            activeTab.value = items[0].key;
        }
    },
    { immediate: true },
);

const currentInfo = computed(() => {
    const item = infoItems.value.find((i) => i.key === activeTab.value);
    return item ? item.info : infoItems.value[0]?.info || {};
});

const formatDate = (isoString) => {
    if (!isoString) return "-";
    try {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(date);
    } catch (e) {
        return "-";
    }
};
</script>

<style scoped>
@keyframes fade-in {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes zoom-in-95 {
    from {
        transform: scale(0.95);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}

.animate-in {
    animation-fill-mode: both;
}

.fade-in {
    animation-name: fade-in;
}

.zoom-in-95 {
    animation-name: zoom-in-95;
}

.duration-200 {
    animation-duration: 200ms;
}
</style>
