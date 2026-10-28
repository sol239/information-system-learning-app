<template>
  <UModal
    v-model:open="modalOpen"
    fullscreen
    :dismissible="false"
    :title="t('task_modal_title')"
  >
    <UButton
      icon="i-lucide-list-todo"
      color="neutral"
      variant="soft"
      :label="selectedTaskTitle"
      size="sm"
    />

    <template #body>
      <TasksDesignerPanel />
    </template>
  </UModal>
</template>

<script setup lang="ts">
/* 1. Imports */
import { computed, ref } from "vue";

import TasksDesignerPanel from "~/components/TasksDesignerPanel.vue";

/* 2. Stores */
const systemsStore = useSystemsStore();

const globalSettings = useGlobalSettingsStore();

/* 3. Context hooks */
const { t } = useI18n();

/* 4. Constants (non-reactive) */

/* 5. Props */

/* 6. Emits */

/* 7. Template refs */

/* 8. State (ref, reactive) */
const modalOpen = ref(false);

/* 9. Computed */
const selectedTaskTitle = computed(() => {
  const selectedTask = systemsStore.selectedSystem?.tasks?.find(
    (task) => task.id === globalSettings.selectedTaskId,
  );

  return selectedTask?.title || t("task_modal_title");
});

/* 10. Watchers */

/* 11. Methods */

/* 12. Lifecycle */

/* 13. defineExpose */
defineExpose({
  openModal: () => {
    modalOpen.value = true;
  },
});
</script>

<style scoped></style>
