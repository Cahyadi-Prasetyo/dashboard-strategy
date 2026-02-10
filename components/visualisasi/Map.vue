<template>
  <div class="w-full h-full bg-gray-50 relative group/container flex flex-col">
    <div
      id="tour-tabs"
      v-if="enabledTabs.length > 1"
      class="flex border-b border-gray-200 bg-white px-4 shrink-0"
    >
      <button
        v-for="tab in enabledTabs"
        :key="tab.id"
        @click="switchTab(tab.id)"
        class="px-4 py-3 text-sm font-bold border-b-2 transition-colors duration-200"
        :class="
          activeTab === tab.id
            ? 'border-amber-500 text-amber-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        "
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="flex-1 relative overflow-hidden">
      <KeepAlive>
        <component
          :is="activeComponent"
          v-bind="activeProps"
          :view-mode="viewMode"
          :focused-map="focusedMap"
          @update:view-mode="viewMode = $event"
          @update:focused-map="focusedMap = $event"
        />
      </KeepAlive>
    </div>
  </div>
</template>

<script setup>
import { computed, markRaw, ref, watch } from "vue";
import MapPendataan from "~/components/map/Pendataan.vue";
import MapInsight from "~/components/map/Insight.vue";
import MapSpatial from "~/components/map/Spatial.vue";

const props = defineProps({
  activeTab: { type: String },
  wilayahPendataan: { type: Object, default: () => ({}) },
  wilayahInsight: { type: Object, default: () => ({}) },
  wilayahSpatial: { type: Object, default: () => ({}) },
  enabledTabIds: { type: Array, default: () => [] },
});

const emit = defineEmits(["update:activeTab"]);

// State View Mode tetap disini agar global antar tab jika perlu
const viewMode = ref("focus");
const focusedMap = ref("pasca");

const switchTab = (id) => emit("update:activeTab", id);

// Config Tab Master tetap sama...
const tabMaster = [
  {
    id: "pendataan",
    label: "Pendataan Lapangan",
    component: markRaw(MapPendataan),
    getProps: () => ({ wilayah: props.wilayahPendataan }),
  },
  {
    id: "insight",
    label: "Insight Data",
    component: markRaw(MapInsight),
    getProps: () => ({ wilayah: props.wilayahInsight }),
  },
  {
    id: "spatial",
    label: "Spatial Data",
    component: markRaw(MapSpatial),
    getProps: () => ({ wilayah: props.wilayahSpatial }),
  },
];

// Logic Computed sama persis dengan yang lama...
const enabledTabs = computed(() =>
  tabMaster.filter((tab) => props.enabledTabIds.includes(tab.id)),
);
const activeComponent = computed(() => {
  let current = tabMaster.find((t) => t.id === props.activeTab);
  if (!current || !props.enabledTabIds.includes(current.id))
    current = enabledTabs.value[0];
  return current ? current.component : null;
});
const activeProps = computed(() => {
  let current = tabMaster.find((t) => t.id === props.activeTab);
  if (!current || !props.enabledTabIds.includes(current.id))
    current = enabledTabs.value[0];
  return current ? current.getProps() : {};
});

// Watchers tetap sama...
watch(
  () => props.enabledTabIds,
  (newEnabled) => {
    if (!newEnabled.includes(props.activeTab) && newEnabled.length > 0)
      emit("update:activeTab", newEnabled[0]);
  },
  { immediate: true },
);
</script>
