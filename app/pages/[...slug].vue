<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-teacher-500" />
  </div>
</template>

<script setup lang="ts">
import { useGlobalSettingsStore } from '~/stores/globalSettingsStore';
import { useSystemsStore } from '~/stores/systemsStore';
import { usePrepareSystem } from '~/composables/usePrepareSystem';
import { useAvailableSystemPages } from '~/composables/useAvailableSystemPages';
import { AppLoader } from '~/core/AppLoader';
import { onMounted } from 'vue';

const globalSettingsStore = useGlobalSettingsStore();
const systemsStore = useSystemsStore();
const { prepareSystem } = usePrepareSystem();
const { pushFirstAvailablePage } = useAvailableSystemPages();

onMounted(async () => {
  if (globalSettingsStore.teacherMode) {
    await navigateTo('/systems', { replace: true });
    return;
  }

  await new AppLoader().loadApp();

  if (systemsStore.systems.length > 0) {
    const firstSystemId = systemsStore.systems[0].id;
    if (await prepareSystem(firstSystemId)) {
      await pushFirstAvailablePage(null, { replace: true });
      return;
    }
  }

  // Fallback if no systems available or preparation failed
  await navigateTo('/systems', { replace: true });
});
</script>
