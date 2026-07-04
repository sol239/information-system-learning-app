<template>
  <div>
    <UModal
      v-model:open="welcomeModalOpen"
      :dismissible="false"
      :close="false"
      :ui="modalUi"
    >
      <template #header>
        <div class="flex w-full items-center justify-between gap-3">
          <h2 class="text-highlighted font-semibold">
            {{ t('student_welcome_modal_title') }}
          </h2>
        </div>
      </template>

      <template #body>
        <div class="space-y-4">
          <p class="text-sm leading-6 text-gray-600">
            {{ t('student_welcome_sidebar_description_before_count') }}
            <strong class="font-semibold text-gray-900">
              {{ taskCount }} {{ t('student_welcome_tasks_word') }}
            </strong>
            {{ t('student_welcome_sidebar_description_between_tasks_points') }}
            <strong class="font-semibold text-gray-900">
              {{ totalTaskPoints }} {{ t('student_welcome_points_word') }}
            </strong>
            {{ t('student_welcome_sidebar_description_after_points_word') }}
          </p>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full flex-col gap-2">
          <UButton block color="primary" variant="soft" size="sm" @click="closeWelcomeModal">
            {{ t('student_welcome_modal_explore_button') }}
          </UButton>
          <UButton
            id="enter-system-button"
            block
            color="primary"
            variant="solid"
            icon="i-lucide-rotate-cw"
            size="sm"
            @click="startTasksFromModal"
          >
            {{ t('student_welcome_sidebar_start_button') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>


<script setup lang="ts">
/* 1. Imports */
import { computed } from 'vue'

/* 2. Stores */
const globalSettings = useGlobalSettingsStore()
const systemsStore = useSystemsStore()

/* 3. Context hooks */
const { t } = useI18n()

/* 4. Constants (non-reactive) */
const modalUi = {
  content: 'sm:max-w-md'
}

/* 5. Props */

/* 6. Emits */

/* 7. Template refs */

/* 8. State (ref, reactive) */

/* 9. Computed */
const tasks = computed(() => systemsStore.selectedSystem?.tasks ?? [])
const taskCount = computed(() => tasks.value.length)
const totalTaskPoints = computed(() =>
  tasks.value.reduce((sum, task) => sum + Number(task.pointsReward ?? 0), 0)
)
const welcomeModalOpen = computed({
  get: () => globalSettings.studentWelcomeModalOpen,
  set: value => {
    globalSettings.studentWelcomeModalOpen = value
  },
})

/* 10. Watchers */

/* 11. Methods */
async function closeWelcomeModal() {
  const system = systemsStore.selectedSystem
  if (!system) {
    return
  }

  system.startedTasks = false
  system.exploringSystem = true
  welcomeModalOpen.value = false
  await systemsStore.updateSystem(system)
}

async function startTasksFromModal() {
  const system = systemsStore.selectedSystem
  if (!system) {
    return
  }

  globalSettings.selectedTaskId = null
  globalSettings.solvedComponentIds = []
  system.startedTasks = true
  system.exploringSystem = false
  welcomeModalOpen.value = false
  await systemsStore.updateSystem(system)
}

/* 12. Lifecycle */

/* 13. defineExpose */
defineExpose({
})
</script>
