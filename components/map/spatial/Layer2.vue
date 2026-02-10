<template>
  <div class="flex flex-col gap-2">
    <div
      class="flex justify-between items-center pb-2 border-b border-gray-100"
    >
      <span
        class="text-[10px] text-gray-500 font-medium uppercase tracking-wide"
      >
        Pilih Max 3 Item
      </span>
      <span
        class="text-[10px] font-bold"
        :class="checkedCount >= 3 ? 'text-red-500' : 'text-amber-600'"
      >
        {{ checkedCount }}/3
      </span>
    </div>

    <div class="space-y-2">
      <div
        v-for="ind in indikators"
        :key="ind.id"
        class="group border rounded-md transition-all duration-200 overflow-hidden"
        :class="
          ind.checked
            ? 'border-amber-300 bg-amber-50/60'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        "
      >
        <div class="flex items-start gap-3 p-2.5">
          <div class="pt-0.5">
            <input
              type="checkbox"
              v-model="ind.checked"
              :disabled="!ind.checked && checkedCount >= 3"
              @change="onChange(ind)"
              class="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-600 disabled:opacity-50 cursor-pointer transition-all shadow-sm"
            />
          </div>

          <div
            class="flex-1 cursor-pointer flex justify-between items-start gap-2 select-none"
            @click="toggleAccordion(ind)"
          >
            <span
              class="text-xs font-medium leading-snug"
              :class="ind.checked ? 'text-gray-900' : 'text-gray-600'"
            >
              {{ ind.label }}
            </span>

            <UIcon
              v-if="ind.jenis_infra?.length > 0"
              :name="
                ind.isOpen
                  ? 'i-heroicons-chevron-up'
                  : 'i-heroicons-chevron-down'
              "
              class="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 transition-transform duration-200"
              :class="{ 'rotate-180': ind.isOpen }"
            />
          </div>
        </div>

        <div
          v-if="ind.jenis_infra?.length > 0 && ind.isOpen"
          class="px-3 pb-3 pt-1 ml-6 border-t border-amber-200/50 space-y-2 animate-fade-in"
        >
          <label
            v-for="jenis in ind.jenis_infra"
            :key="jenis"
            class="flex items-center gap-2 cursor-pointer group/sub"
          >
            <input
              type="checkbox"
              v-model="ind.selectedJenisInfra"
              :value="jenis"
              :disabled="!ind.checked"
              @change="onChange(ind)"
              class="w-3.5 h-3.5 text-amber-600 rounded border-gray-300 focus:ring-amber-500 disabled:opacity-50 transition-colors shadow-sm"
            />
            <span
              class="text-[11px] text-gray-600 group-hover/sub:text-gray-900 transition-colors"
              :class="{ 'opacity-50': !ind.checked }"
            >
              {{ jenis }}
            </span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: { type: Array, required: true },
});

const emit = defineEmits(["update:modelValue", "change"]);

const indikators = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const checkedCount = computed(
  () => indikators.value.filter((i) => i.checked).length,
);

const toggleAccordion = (ind) => {
  ind.isOpen = !ind.isOpen;
};

const onChange = (ind) => {
  if (ind.checked) {
    ind.isOpen = true;
    if (
      ind.jenis_infra?.length > 0 &&
      (!ind.selectedJenisInfra || ind.selectedJenisInfra.length === 0)
    ) {
      ind.selectedJenisInfra = [...ind.jenis_infra];
    }
  } else {
    ind.isOpen = false;
    ind.selectedJenisInfra = [];
  }
  emit("change");
};
</script>

<style scoped>
/* PERBAIKAN: Menghapus @apply shadow-sm yang menyebabkan error */
/* Kita tetap butuh CSS ini untuk memastikan icon centang muncul saat checked */
input[type="checkbox"]:checked {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
  background-color: currentColor;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
