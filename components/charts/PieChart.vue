<template>
    <div :class="containerClass" class="w-full">
        <VChart
            :option="chartOption"
            :style="{ height: '100%', width: '100%' }"
            autoresize
        />
    </div>
</template>

<script setup>
import { computed } from "vue";
import { use } from "echarts/core";
import { PieChart } from "echarts/charts";
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import VChart from "vue-echarts";

use([
    PieChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    CanvasRenderer,
]);

const props = defineProps({
    data: {
        type: Array,
        required: true,
    },
    seriesName: {
        type: String,
        default: "Status",
    },
    height: {
        type: String,
        default: "h-80",
    },
    showLegend: {
        type: Boolean,
        default: true,
    },
    legendPosition: {
        type: String,
        default: "bottom",
        validator: (value) =>
            [
                "top",
                "bottom",
                "left",
                "right",
                "top-right",
                "top-left",
                "right-center",
            ].includes(value),
    },
    innerRadius: {
        type: String,
        default: "40%",
    },
    outerRadius: {
        type: String,
        default: "70%",
    },
    center: {
        type: Array,
        default: null,
    },
    borderRadius: {
        type: Number,
        default: 10,
    },
    tooltipFormatter: {
        type: String,
        default: "{b}: <br/>{c} ({d}%)",
    },
});

const containerClass = computed(() => `${props.height} w-full`);

const getLegendConfig = () => {
    if (!props.showLegend) return undefined;

    const baseConfig = {
        textStyle: { color: "#666", fontSize: 12 },
        data: props.data.map((item) => item.name),
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 10,
    };

    switch (props.legendPosition) {
        case "top":
            return {
                ...baseConfig,
                top: 10,
                left: "center",
                orient: "horizontal",
            };
        case "bottom":
            return {
                ...baseConfig,
                bottom: 10,
                left: "center",
                orient: "horizontal",
            };
        case "left":
            return {
                ...baseConfig,
                left: 10,
                top: "middle",
                orient: "vertical",
            };
        case "right":
        case "right-center":
            return {
                ...baseConfig,
                right: 10,
                top: "middle",
                orient: "vertical",
            };
        case "top-right":
            return { ...baseConfig, top: 10, right: 10, orient: "vertical" };
        case "top-left":
            return { ...baseConfig, top: 10, left: 10, orient: "vertical" };
        default:
            return {
                ...baseConfig,
                bottom: 10,
                left: "center",
                orient: "horizontal",
            };
    }
};

const getChartCenter = () => {
    if (props.center) return props.center;

    if (["right", "right-center"].includes(props.legendPosition)) {
        return ["40%", "50%"];
    }
    if (props.legendPosition === "left") {
        return ["60%", "50%"];
    }
    if (props.legendPosition === "bottom") {
        return ["50%", "42%"];
    }

    return ["50%", "50%"];
};

const chartOption = computed(() => ({
    tooltip: {
        trigger: "item",
        formatter: props.tooltipFormatter,
        textStyle: {
            fontSize: 12,
        },
        padding: 8,
    },
    legend: getLegendConfig(),
    series: [
        {
            name: props.seriesName,
            type: "pie",
            radius: [props.innerRadius, props.outerRadius],
            center: getChartCenter(),
            itemStyle: {
                borderRadius: props.borderRadius,
                borderColor: "#fff",
                borderWidth: 2,
            },
            data: props.data.map((item) => ({
                value: item.value,
                name: item.name,
                itemStyle: { color: item.color },
            })),
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: "rgba(0, 0, 0, 0.5)",
                },
            },
            label: {
                show: false,
            },
        },
    ],
}));
</script>
