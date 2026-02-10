// composables/useTableUtils.ts
import type { Dimension, DimensionItem } from "~/shared/types/dataset";

export function formatNumber(value: number | string | null) {
    if (value === null || value === undefined) {
        return "-";
    }
    const valueAsString = String(value).replace(",", ".");
    const numericValue = parseFloat(valueAsString);
    if (isNaN(numericValue)) {
        return "-";
    }
    // Format angka Indonesia
    return Math.round(numericValue).toLocaleString("id-ID");
}

export function generateHierarchicalHeader(categories: DimensionItem[][]) {
    const result: any[][] = Array.from({ length: categories.length }, () => []);

    function generate(level: number, path: DimensionItem[], prefixIds: string) {
        if (level === categories.length || !categories[level]) {
            return;
        }
        for (const item of categories[level]!) {
            const newPath = [...path, item];
            const newId = prefixIds ? `${prefixIds}-${item.id}` : `${item.id}`;

            // Hitung colspan berdasarkan anak-anaknya di level bawah
            const leafCount = categories
                .slice(level + 1)
                .reduce((acc, curr) => (curr ? acc * curr.length : acc), 1);

            result[level]!.push({
                text: item.name,
                colspan: leafCount,
                id: newId,
            });
            generate(level + 1, newPath, newId);
        }
    }

    if (
        categories.length > 0 &&
        categories.every((cat) => Array.isArray(cat))
    ) {
        generate(0, [], "");
    }
    return result;
}

export function getCellPath(
    rowItem: DimensionItem | undefined,
    colItem: any | undefined,
    rowDimension: Dimension | undefined,
    colDimensions: Dimension[],
    allRegions: Dimension[],
) {
    if (!rowItem || !colItem) return "";

    // Sesuaikan logic path ID ini dengan cara Anda menyusun data 'dimensions' nanti
    // Untuk kasus sederhana (Row ID - Col ID)
    return `${rowItem.id}-${colItem.id}`;
}
