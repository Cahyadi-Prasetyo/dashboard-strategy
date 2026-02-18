<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Test BPS API Integration</h1>
    
    <div class="flex gap-4 mb-6">
      <UButton @click="fetchData" :loading="loading">Fetch Indicators</UButton>
    </div>

    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p class="font-bold">Error:</p>
      <p>{{ error }}</p>
    </div>

    <div v-if="result" class="space-y-4">
      <div class="bg-gray-100 p-4 rounded">
        <h2 class="font-bold mb-2">Metadata</h2>
        <pre class="text-xs">{{ result.meta }}</pre>
      </div>

      <div class="bg-gray-100 p-4 rounded">
        <h2 class="font-bold mb-2">Data ({{ result.data?.length || 0 }} items)</h2>
        <div v-if="result.data && result.data.length > 0" class="overflow-x-auto">
          <table class="min-w-full bg-white text-sm">
            <thead>
              <tr>
                <th class="py-2 px-4 border-b">ID</th>
                <th class="py-2 px-4 border-b">Title</th>
                <th class="py-2 px-4 border-b">Name</th>
                <th class="py-2 px-4 border-b">Value</th>
                <th class="py-2 px-4 border-b">Unit</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in result.data" :key="item.indicator_id">
                <td class="py-2 px-4 border-b">{{ item.indicator_id }}</td>
                <td class="py-2 px-4 border-b">{{ item.title }}</td>
                <td class="py-2 px-4 border-b">{{ item.name }}</td>
                <td class="py-2 px-4 border-b">{{ item.value }}</td>
                <td class="py-2 px-4 border-b">{{ item.unit }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <pre v-else class="text-xs">No data found</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StandardizedBpsResponse } from '~/types/bps';

const loading = ref(false);
const result = ref<StandardizedBpsResponse | null>(null);
const error = ref<string | null>(null);

async function fetchData() {
  loading.value = true;
  error.value = null;
  result.value = null;

  try {
    const response = await $fetch<StandardizedBpsResponse>('/api/bps/indicators');
    console.log('API Response:', response);
    
    if (response.status === 'error') {
        error.value = (response as any).message || 'Unknown error from API';
    } else {
        result.value = response;
    }
  } catch (err: any) {
    console.error('Fetch error:', err);
    error.value = err.message || 'Failed to fetch data';
  } finally {
    loading.value = false;
  }
}
</script>
