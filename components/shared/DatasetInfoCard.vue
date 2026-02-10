<template>
    <div class="mt-3 pt-3 border-t border-gray-200">
        <div class="flex items-center gap-2 text-[10px]">
            <div class="flex items-center gap-1.5 flex-[1.5] min-w-0">
                <div
                    class="flex items-center justify-center w-5 h-5 rounded-md bg-blue-50 shrink-0"
                >
                    <UIcon
                        name="i-heroicons-building-library"
                        class="w-3 h-3 text-blue-600"
                    />
                </div>
                <div class="flex flex-col gap-0.5 min-w-0">
                    <span
                        class="text-[11px] text-gray-400 font-bold uppercase tracking-wide"
                    >
                        Sumber
                    </span>
                    <span
                        class="text-[11px] font-semibold text-gray-700 break-words leading-tightblock"
                        :title="source"
                    >
                        {{ source || "-" }}
                    </span>
                </div>
            </div>

            <div class="w-px h-8 bg-gray-200 shrink-0"></div>

            <div class="flex items-center gap-1.5 flex-1 min-w-0">
                <div
                    class="flex items-center justify-center w-5 h-5 rounded-md bg-emerald-50 shrink-0"
                >
                    <UIcon
                        name="i-heroicons-clock"
                        class="w-3 h-3 text-emerald-600"
                    />
                </div>
                <div class="flex flex-col gap-0.5 min-w-0">
                    <span
                        class="text-[11px] text-gray-400 font-bold uppercase tracking-wide"
                    >
                        Terakhir Diperbarui
                    </span>
                    <span
                        class="text-[11px] font-semibold text-gray-700 break-words leading-tight block"
                        :title="formatDate(lastUpdate)"
                    >
                        {{ formatDate(lastUpdate) }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    source: {
        type: String,
        default: "-",
    },
    lastUpdate: {
        type: String,
        default: null,
    },
});

const formatDate = (isoString) => {
    if (!isoString) return "-";
    try {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(date);
    } catch (e) {
        return "-";
    }
};
</script>
