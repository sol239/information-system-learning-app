<template>
  <UModal v-model:open="modalOpen" fullscreen :dismissible="false" :title="t('task_modal_title')">
    <UButton
      icon="i-lucide-list-todo"
      color="neutral"
      variant="soft"
      :label="selectedTaskTitle"
    size="sm" />

    <template #body>
      <TasksDesignerPanel />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import TasksDesignerPanel from '~/components/TasksDesignerPanel.vue'

const modalOpen = ref(false)

defineExpose({
  openModal: () => {
    modalOpen.value = true
  },
})

const { t } = useI18n()
const systemsStore = useSystemsStore()
const globalSettings = useGlobalSettingsStore()

const selectedTaskTitle = computed(() => {
  const selectedTask = systemsStore.selectedSystem?.tasks?.find(
    task => task.id === globalSettings.selectedTaskId,
  )

  return selectedTask?.title || t('task_modal_title')
})
</script>
