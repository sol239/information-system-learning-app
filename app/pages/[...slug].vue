<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <UIcon
      name="i-heroicons-arrow-path"
      class="w-8 h-8 animate-spin text-teacher-500"
    />
  </div>
</template>

<script setup lang="ts">
/* 1. Imports */
import { onMounted } from "vue";
import { TaskHelper } from "~/core/systems/TaskHelper";

defineOptions({
  name: "CatchAllRedirectPage",
});

/* 2. Stores */

/* 3. Context hooks */

/* 4. Constants (non-reactive) */

/* 5. Props */

/* 6. Emits */

/* 7. Template refs */

/* 8. State (ref, reactive) */

/* 9. Computed */

/* 10. Watchers */

/* 11. Methods */

/* 12. Lifecycle */
onMounted(async () => {
  const globalSettings = useGlobalSettingsStore();
  if (!globalSettings.teacherMode && useRoute().path === "/") {
    const system = useSystemsStore().getPrimarySystem();
    if (system) {
      globalSettings.studentWelcomeModalOpen =
        !system.startedTasks && !system.exploringSystem;
      const firstPage =
        TaskHelper.getVisiblePages(system.availableTasks() ?? [])[0]?.route ??
        "";
      await navigateTo(`/systems/${system.id}${firstPage}`, { replace: true });
    }
    return;
  }
  await navigateTo("/systems", { replace: true });
});

/* 13. defineExpose */
</script>

<style scoped></style>
