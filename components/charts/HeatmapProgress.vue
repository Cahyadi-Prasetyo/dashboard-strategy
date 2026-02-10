<template>
    <div class="h-[600px]">
        <VChart :option="option" autoresize />
    </div>
</template>

<script setup>
import { computed } from "vue";
import { use } from "echarts/core";
import { HeatmapChart } from "echarts/charts";
import {
    TitleComponent,
    TooltipComponent,
    VisualMapComponent,
    GridComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import VChart from "vue-echarts";

use([
    HeatmapChart,
    TitleComponent,
    TooltipComponent,
    VisualMapComponent,
    GridComponent,
    CanvasRenderer,
]);

const props = defineProps({
    xAxisData: {
        type: Array,
        default: () => ["Day1", "Day2", "Day3", "Day4"],
    },
    yAxisData: {
        type: Array,
        default: () => ["Week1", "Week2", "Week3"],
    },
    seriesData: {
        type: Array,
        default: () => [
            [0, 0, 95],
            [1, 0, 85],
        ],
    },
});

const option = computed(() => {
    const values = props.seriesData.map((d) => d[2]);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    return {
        tooltip: {
            trigger: "item",
            formatter: (params) => {
                const xName = props.xAxisData[params.data[0]];
                const yName = props.yAxisData[params.data[1]];
                const value = params.data[2];
                return `<strong>${yName}</strong><br/>${xName}: <strong>${value.toLocaleString()}</strong>`;
            },
        },
        visualMap: {
            min: minValue,
            max: maxValue,
            text: ["Tinggi", "Rendah"],
            realtime: true,
            calculable: true,
            left: "2%",
            top: "middle",
            orient: "vertical",
            inRange: {
                color: ["#FEF3C7", "#FBBF24", "#F59E0B", "#D97706"],
            },
        },
        grid: {
            left: "12%",
            right: "3%",
            bottom: "15%",
            top: "3%",
            containLabel: true,
        },
        xAxis: {
            type: "category",
            data: props.xAxisData,
            splitArea: { show: true },
            axisLabel: {
                interval: 0,
                rotate: 45,
                fontSize: 10,
                margin: 10,
            },
        },
        yAxis: {
            type: "category",
            data: props.yAxisData,
            splitArea: { show: true },
            axisLabel: {
                fontSize: 10,
                width: 180,
                overflow: "truncate",
                margin: 5,
            },
        },
        series: [
            {
                name: "Data",
                type: "heatmap",
                data: props.seriesData,
                label: {
                    show: false, // MATIKAN label agar tidak menumpuk
                },
                itemStyle: {
                    borderWidth: 1,
                    borderColor: "#fff",
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: "rgba(0, 0, 0, 0.5)",
                        borderColor: "#333",
                        borderWidth: 2,
                    },
                    label: {
                        show: true, // Tampilkan label hanya saat hover
                        formatter: (params) => {
                            const value = params.data[2];
                            if (value >= 1000000) {
                                return `${(value / 1000000).toFixed(1)}Jt`;
                            } else if (value >= 1000) {
                                return `${(value / 1000).toFixed(1)}Rb`;
                            }
                            return value.toFixed(0);
                        },
                        color: "#000",
                        fontSize: 11,
                        fontWeight: "bold",
                    },
                },
            },
        ],
    };
});
</script>
