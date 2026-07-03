<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-teacher-500" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(async () => {
 await navigateTo('/systems', { replace: true });
});
</script>
