<template>
  <div class="relative" ref="containerRef">
    <!-- Trigger Button -->
    <button
      type="button"
      @click="toggleDropdown"
      :disabled="disabled || loading"
      :class="[ui.trigger, disabled ? 'opacity-50 cursor-not-allowed' : '']"
      class="group flex items-center justify-between w-full"
    >
      <span class="truncate flex-1 text-left text-sm">
        <slot name="label">
          {{ displayLabel }}
        </slot>
      </span>
      <UIcon
        :name="isOpen ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
        class="w-4 h-4 ml-2 flex-shrink-0 group-hover:text-white transition-colors"
      />
    </button>

    <!-- Dropdown Menu -->
    <Teleport to="body">
      <div
        v-show="isOpen"
        ref="dropdownRef"
        :style="dropdownStyle"
        :class="[ui.base]"
        class="fixed z-[9999] w-full min-w-[200px] max-w-md overflow-hidden"
        @click.stop
      >
        <!-- Search Input -->
        <div
          class="sticky top-0 bg-slate-800 border-b border-white/10 p-2 z-10"
        >
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            placeholder="Cari..."
            class="w-full px-3 py-1.5 text-sm bg-slate-700 text-white rounded border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-500"
            @keydown.esc="closeDropdown"
            @keydown.enter.prevent="handleEnterKey"
          />
          <div
            v-if="filteredItems.length > 0"
            class="text-[10px] text-slate-400 mt-1 px-1"
          >
            {{ filteredItems.length - 1 }} hasil{{
              searchQuery ? ` dari ${items.length - 1} total` : ""
            }}
          </div>
        </div>

        <!-- Virtual Scroll Container -->
        <div
          ref="scrollContainerRef"
          class="overflow-y-auto"
          :style="{ maxHeight: '280px' }"
          @scroll="handleScroll"
        >
          <!-- Spacer for items before visible range -->
          <div :style="{ height: `${offsetY}px` }"></div>

          <!-- Visible Items -->
          <div
            v-for="(item, index) in visibleItems"
            :key="`${item}-${startIndex + index}`"
            @click="toggleItem(item)"
            :class="[
              ui.option.base,
              isSelected(item) ? 'bg-slate-600 ring-1 ring-slate-400' : '',
            ]"
            class="flex items-center gap-2 cursor-pointer"
          >
            <!-- Checkbox -->
            <div
              class="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0"
              :class="
                isSelected(item)
                  ? 'bg-slate-500 border-slate-300'
                  : 'border-slate-500 bg-slate-700'
              "
            >
              <UIcon
                v-if="isSelected(item)"
                name="i-heroicons-check"
                class="w-3 h-3 text-white"
              />
            </div>

            <!-- Item Text -->
            <span class="flex-1 truncate text-sm">{{ item }}</span>

            <!-- Badge for "Seluruh Wilayah" -->
            <span
              v-if="item === 'Seluruh Wilayah'"
              class="text-[10px] bg-primary-600/30 text-primary-300 px-1.5 py-0.5 rounded"
            >
              Semua
            </span>
          </div>

          <!-- Spacer for items after visible range -->
          <div :style="{ height: `${bottomSpacerHeight}px` }"></div>

          <!-- Loading More Indicator -->
          <div
            v-if="isLoadingMore"
            class="flex items-center justify-center py-2 text-slate-400"
          >
            <UIcon
              name="i-heroicons-arrow-path"
              class="w-4 h-4 animate-spin mr-2"
            />
            <span class="text-xs">Memuat...</span>
          </div>

          <!-- No Results -->
          <div
            v-if="filteredItems.length === 0"
            class="py-6 text-center text-slate-400"
          >
            <UIcon
              name="i-heroicons-magnifying-glass"
              class="w-6 h-6 mx-auto mb-2 opacity-50"
            />
            <p class="text-xs">Tidak ada hasil</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div
          class="sticky bottom-0 bg-slate-800 border-t border-white/10 p-2 flex gap-2"
        >
          <button
            @click="selectAll"
            class="flex-1 px-3 py-1.5 text-xs text-white/80 bg-primary-600/20 hover:bg-primary-600/30 text-primary-300 rounded transition-colors font-medium border border-gray"
          >
            Pilih Semua
          </button>
          <button
            @click="clearSelection"
            class="flex-1 px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors font-medium"
          >
            Hapus
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from "vue";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  items: {
    type: Array,
    required: true,
  },
  allItems: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: "Pilih...",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  ui: {
    type: Object,
    default: () => ({
      trigger:
        "w-full bg-white/25 hover:bg-white/3 font-medium px-3 py-2 rounded-lg transition-all border border-white/30 hover:border-white/40",
      base: "bg-slate-800 border border-white/20 rounded-lg shadow-2xl",
      option: {
        base: "px-3 py-2 hover:bg-white/30 cursor-pointer text-white transition-colors",
      },
    }),
  },
});

const emit = defineEmits(["update:modelValue"]);

// Refs
const containerRef = ref(null);
const dropdownRef = ref(null);
const scrollContainerRef = ref(null);
const searchInputRef = ref(null);

// State
const isOpen = ref(false);
const searchQuery = ref("");
const selectedItems = ref([...props.modelValue]);

// Virtual Scrolling State
const ITEM_HEIGHT = 38; // Reduced from 42px
const VISIBLE_ITEMS = 20;
const BUFFER_ITEMS = 5;

const startIndex = ref(0);
const endIndex = ref(VISIBLE_ITEMS);
const isLoadingMore = ref(false);

// Dropdown positioning
const dropdownStyle = ref({});

// ==================== COMPUTED ====================
const filteredItems = computed(() => {
  if (!searchQuery.value) return props.items;

  const query = searchQuery.value.toLowerCase();
  return props.items.filter((item) => item.toLowerCase().includes(query));
});

const visibleItems = computed(() => {
  return filteredItems.value.slice(startIndex.value, endIndex.value);
});

const offsetY = computed(() => {
  return startIndex.value * ITEM_HEIGHT;
});

const bottomSpacerHeight = computed(() => {
  const remaining = filteredItems.value.length - endIndex.value;
  return remaining > 0 ? remaining * ITEM_HEIGHT : 0;
});

const displayLabel = computed(() => {
  if (selectedItems.value.length === 0) return props.placeholder;

  if (selectedItems.value.includes("Seluruh Wilayah")) {
    return "Seluruh Wilayah";
  }

  const realCount = selectedItems.value.filter(
    (x) => x !== "Seluruh Wilayah",
  ).length;
  return `${realCount} item terpilih`;
});

// ==================== METHODS ====================
const toggleDropdown = () => {
  if (props.disabled || props.loading) return;

  isOpen.value = !isOpen.value;

  if (isOpen.value) {
    nextTick(() => {
      updateDropdownPosition();
      searchInputRef.value?.focus();
    });
  }
};

const closeDropdown = () => {
  isOpen.value = false;
  searchQuery.value = "";
  startIndex.value = 0;
  endIndex.value = VISIBLE_ITEMS;
};

const updateDropdownPosition = () => {
  if (!containerRef.value || !dropdownRef.value) return;

  const rect = containerRef.value.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const dropdownHeight = 380; // Reduced from 400

  let top = rect.bottom + 4;

  // If dropdown would go below viewport, show above
  if (top + dropdownHeight > viewportHeight) {
    top = rect.top - dropdownHeight - 4;
  }

  dropdownStyle.value = {
    position: "fixed",
    top: `${Math.max(10, top)}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
  };
};

const handleScroll = (event) => {
  const { scrollTop, scrollHeight, clientHeight } = event.target;

  // Calculate which items should be visible
  const scrolledItems = Math.floor(scrollTop / ITEM_HEIGHT);
  const newStart = Math.max(0, scrolledItems - BUFFER_ITEMS);
  const newEnd = Math.min(
    filteredItems.value.length,
    scrolledItems + VISIBLE_ITEMS + BUFFER_ITEMS,
  );

  startIndex.value = newStart;
  endIndex.value = newEnd;

  // Load more indicator
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    isLoadingMore.value = true;
    setTimeout(() => {
      isLoadingMore.value = false;
    }, 300);
  }
};

const isSelected = (item) => {
  return selectedItems.value.includes(item);
};

const toggleItem = (item) => {
  const index = selectedItems.value.indexOf(item);
  const realItems = props.items.filter((x) => x !== "Seluruh Wilayah");

  if (item === "Seluruh Wilayah") {
    // Jika klik "Seluruh Wilayah"
    if (index === -1) {
      // Centang semua (termasuk "Seluruh Wilayah")
      selectedItems.value = ["Seluruh Wilayah", ...realItems];
    } else {
      // Hapus semua
      selectedItems.value = [];
    }
  } else {
    // Klik item biasa
    if (index > -1) {
      // Hapus item ini
      selectedItems.value.splice(index, 1);

      // Hapus "Seluruh Wilayah" juga karena tidak semua tercentang
      const allIndex = selectedItems.value.indexOf("Seluruh Wilayah");
      if (allIndex > -1) {
        selectedItems.value.splice(allIndex, 1);
      }
    } else {
      // Tambah item ini
      selectedItems.value.push(item);

      // Cek apakah sekarang semua item tercentang
      const selectedReal = selectedItems.value.filter(
        (x) => x !== "Seluruh Wilayah",
      );
      if (selectedReal.length === realItems.length && realItems.length > 0) {
        // Semua item tercentang, tambahkan "Seluruh Wilayah"
        if (!selectedItems.value.includes("Seluruh Wilayah")) {
          selectedItems.value.unshift("Seluruh Wilayah");
        }
      }
    }
  }

  emit("update:modelValue", [...selectedItems.value]);
};

const selectAll = () => {
  const realItems = props.items.filter((x) => x !== "Seluruh Wilayah");
  selectedItems.value = ["Seluruh Wilayah", ...realItems];
  emit("update:modelValue", [...selectedItems.value]);
};

const clearSelection = () => {
  selectedItems.value = [];
  emit("update:modelValue", []);
};

const handleEnterKey = () => {
  if (filteredItems.value.length > 0) {
    toggleItem(filteredItems.value[0]);
  }
};

// ==================== WATCHERS ====================
watch(
  () => props.modelValue,
  (newVal) => {
    selectedItems.value = [...newVal];
  },
  { deep: true },
);

watch(searchQuery, () => {
  // Reset scroll position when searching
  startIndex.value = 0;
  endIndex.value = VISIBLE_ITEMS;
  if (scrollContainerRef.value) {
    scrollContainerRef.value.scrollTop = 0;
  }
});

watch(isOpen, (newVal) => {
  if (newVal) {
    window.addEventListener("resize", updateDropdownPosition);
    document.addEventListener("click", handleClickOutside);
  } else {
    window.removeEventListener("resize", updateDropdownPosition);
    document.removeEventListener("click", handleClickOutside);
  }
});

// ==================== LIFECYCLE ====================
const handleClickOutside = (event) => {
  if (
    containerRef.value &&
    !containerRef.value.contains(event.target) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target)
  ) {
    closeDropdown();
  }
};

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateDropdownPosition);
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
/* Smooth scrolling */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) rgba(0, 0, 0, 0.1);
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
