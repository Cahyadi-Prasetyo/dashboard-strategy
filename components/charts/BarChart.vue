<template>
  <div class="mb-0">
    <div v-if="chartTitle || source" class="mb-4">
      <h2 v-if="chartTitle" class="text-xl font-bold text-gray-800">
        {{ chartTitle }}
      </h2>
    </div>

    <div :class="containerClass">
      <VChart :option="chartOption" autoresize @click="(params) => emit('chartClick', params)" />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { use } from "echarts/core";
import { BarChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import VChart from "vue-echarts";

use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  CanvasRenderer,
]);

const props = defineProps({
  categories: {
    type: Array,
    required: true,
    // Expected format: ['Aceh', 'Sumut', 'Sumbar']
  },
  series: {
    type: Array,
    required: true,
    // Expected format: [{ name: 'Open', data: [2.4, 4.4, 1.8], color: '#FBBF24' }]
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
    validator: (value) => ["top", "bottom"].includes(value),
  },
  stacked: {
    type: Boolean,
    default: false,
  },
  isPyramid: {
    type: Boolean,
    default: false,
  },
  horizontal: {
    type: Boolean,
    default: false,
  },
  grid: {
    type: Object,
    default: () => ({
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "15%",
      containLabel: true,
    }),
  },
  barWidth: {
    type: String,
    default: null,
  },
  tooltipTrigger: {
    type: String,
    default: "axis",
    validator: (value) => ["axis", "item"].includes(value),
  },
  chartTitle: {
    type: String,
    default: "",
  },
  source: {
    type: String,
    default: "",
  },
  tooltipFormatter: { // TAMBAHKAN INI
    type: Function,
    default: null
    },
  onClick: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["chartClick"]);

const containerClass = computed(() => props.height);

const chartOption = computed(() => {
  const isHorizontal = props.horizontal;

  return {
    tooltip: {
      trigger: props.tooltipTrigger,
      axisPointer: { type: "shadow" },
      ...(props.tooltipFormatter && {
        valueFormatter: props.tooltipFormatter
      }),
      formatter: props.isPyramid
        ? (params) => {
            let res = `<strong>${params[0].name}</strong><br/>`;
            params.forEach((item) => {
              res += `${item.marker} ${item.seriesName}: ${Math.abs(item.value).toLocaleString()}<br/>`;
            });
            return res;
          }
        : undefined,
    },
    legend: props.showLegend
      ? {
          data: props.series.map((s) => s.name),
          [props.legendPosition]: props.legendPosition === "bottom" ? 0 : 10,
          textStyle: { color: "#666" },
        }
      : undefined,
    grid: props.grid,
    xAxis: {
      type: isHorizontal ? "value" : "category",
      data: isHorizontal ? undefined : props.categories,
      axisLabel: {
        color: "#666",
        formatter: props.isPyramid ? (value) => Math.abs(value) : undefined,
      },
    },
    yAxis: {
      type: isHorizontal ? "category" : "value",
      data: isHorizontal ? props.categories : undefined,
      axisLabel: { color: "#666" },
    },
    // LOGIC: Check index to apply radius only to the last item if stacked
    series: props.series.map((s, index) => {
      const isLastItem = index === props.series.length - 1;
      const shouldApplyRadius = !props.stacked || isLastItem;

      const radius = shouldApplyRadius
        ? isHorizontal
          ? [0, 10, 10, 0]
          : [10, 10, 0, 0]
        : [0, 0, 0, 0];

      return {
        name: s.name,
        type: "bar",
        data: s.data,
        itemStyle: {
          borderRadius: radius,
          color: s.color,
        },
        cursor: props.onClick ? 'pointer' : 'default',
        stack: props.stacked ? "total" : undefined,
        barWidth: props.barWidth,
        label: s.showLabel
          ? {
              show: true,
              position: isHorizontal ? "right" : "top",
              formatter: s.labelFormatter || "{c}",
            }
          : undefined,
      };
    }),
  };
});
</script>
