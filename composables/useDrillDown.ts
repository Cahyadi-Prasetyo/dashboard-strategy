// composables/useDrillDown.js
import { ref, computed } from 'vue';

export const useDrillDown = () => {
  const drillDownStack = ref([]);
  const currentDrillLevel = ref(null);
  const isAggregated = ref(false);
  const baseLevel = ref('prov'); // ← TAMBAH INI (default level data)

  // Computed: Level saat ini
  const currentLevel = computed(() => {
    if (drillDownStack.value.length === 0) return baseLevel.value; // ← GANTI dari 'prov' jadi baseLevel.value
    const last = drillDownStack.value[drillDownStack.value.length - 1];
    
    if (last.level === 'prov') return 'kab';
    if (last.level === 'kab') return 'kec';
    if (last.level === 'kec') return 'desa';
    return 'desa';
  });

  const currentParentId = computed(() => {
    if (drillDownStack.value.length === 0) return null;
    return drillDownStack.value[drillDownStack.value.length - 1].id;
  });

  const breadcrumbPath = computed(() => {
    return drillDownStack.value.map(item => ({
      label: item.name,
      level: item.level,
      id: item.id
    }));
  });

  const drillDown = (levelType, regionId, regionName) => {
    if (!isAggregated.value && drillDownStack.value.length === 0) {
      return false;
    }
    drillDownStack.value.push({
      level: levelType,
      id: regionId,
      name: regionName
    });
    return true;
  };

  const drillUp = () => {
    if (drillDownStack.value.length > 0) {
      drillDownStack.value.pop();
      return true;
    }
    return false;
  };

  const resetDrill = () => {
    drillDownStack.value = [];
  };

  const setAggregationFlag = (flag) => {
    isAggregated.value = flag === 1;
  };

  // ← TAMBAH METHOD BARU
  const setBaseLevel = (level) => {
    baseLevel.value = level;
  };

  const canDrillDown = computed(() => {
    if (!isAggregated.value) return false;
    const currentLvl = currentLevel.value;
    return currentLvl !== 'desa';
  });

  return {
    drillDownStack,
    currentDrillLevel,
    isAggregated,
    currentLevel,
    currentParentId,
    breadcrumbPath,
    canDrillDown,
    drillDown,
    drillUp,
    resetDrill,
    setAggregationFlag,
    setBaseLevel // ← EXPOSE METHOD BARU
  };
};