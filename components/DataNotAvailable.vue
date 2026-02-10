<template>
    <div
        class="flex flex-col items-center justify-center h-[300px] text-center rounded-3xl border-2 border-dashed border-gray-100"
    >
        <div
            class="w-24 h-24 rounded-full flex items-center justify-center mb-2"
        >
            <UIcon
                name="i-heroicons-document-magnifying-glass"
                class="w-12 h-12 text-gray-400"
            />
        </div>

        <h3 class="text-xl font-bold text-gray-800 mb-2">
            Data Belum Tersedia
        </h3>
        <p class="text-gray-500 text-center max-w-md mb-2">
            Maaf, data saat ini sedang dalam proses pengumpulan dan akan segera
            tersedia.
        </p>

        <div class="flex flex-wrap items-center justify-center gap-2">
            <UBadge color="primary" variant="subtle" size="md">
                <UIcon name="i-heroicons-clock" class="w-3 h-3 mr-1" />
                Segera Hadir
            </UBadge>
        </div>
    </div>
</template>