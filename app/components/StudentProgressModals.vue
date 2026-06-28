<template>
  <div>
    <UModal
      v-model:open="welcomeModalOpen"
      :title="t('student_welcome_modal_title')"
      :dismissible="false"
      :close="false"
      :ui="{ content: 'sm:max-w-md' }"
    >
      <template #body>
        <div class="space-y-4">
          <p class="text-sm leading-6 text-gray-600">
            {{ t('student_welcome_sidebar_description', { count: taskCount, points: totalTaskPoints }) }}
          </p>

        </div>
      </template>

      <template #footer>
        <div class="flex w-full flex-col gap-2">
          <UButton block color="primary" variant="soft" @click="closeWelcomeModal">
            {{ t('student_welcome_modal_explore_button') }}
          </UButton>
          <UButton
            id="enter-system-button"
            block
            color="primary"
            variant="solid"
            icon="i-lucide-rotate-cw"
            :loading="isStartingTasks"
            @click="startTasksFromModal"
          >
            {{ t('student_welcome_sidebar_start_button') }}
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal
      v-model:open="completedModalOpen"
      :title="t('student_completed_modal_title')"
      :ui="{ content: 'sm:max-w-md' }"
    >
      <template #body>
        <div class="space-y-4">
          <p class="text-sm leading-6 text-gray-600">
            {{ t('student_completed_modal_description') }}
          </p>

          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <div class="text-xs font-medium uppercase text-gray-500">
                {{ t('student_completed_modal_points_count') }}
              </div>
              <div class="mt-1 text-xl font-semibold text-gray-900">
                {{ score }}
              </div>
            </div>

            <div class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <div class="text-xs font-medium uppercase text-gray-500">
                {{ t('student_completed_modal_mistakes') }}
              </div>
              <div class="mt-1 flex flex-wrap items-baseline gap-1.5">
                <span class="text-xl font-semibold text-gray-900">{{ mistakesCount }}</span>
                <span class="text-xs font-medium text-gray-500">
                  {{ t('student_completed_modal_mistakes_penalty', { points: mistakesPenalty }) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full justify-end">
          <UButton color="primary" @click="completedModalOpen = false">
            {{ t('student_completed_modal_button') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { TaskStatus } from '~/model/Task/TaskStatus'

const { t } = useI18n()
const globalSettings = useGlobalSettingsStore()
const systemsStore = useSystemsStore()
const { isStartingTasks, startTaskSolving } = useStartTaskSolving()

const welcomeModalOpen = ref(false)
const completedModalOpen = ref(false)
const isMounted = ref(false)

const systemId = computed(() => systemsStore.selectedSystemId ?? 'unknown')
const tasks = computed(() => systemsStore.selectedSystem?.tasks ?? [])
const taskCount = computed(() => tasks.value.length)
const totalTaskPoints = computed(() =>
  tasks.value.reduce((sum, task) => sum + Number(task.pointsReward ?? 0), 0)
)
const completedTasksCount = computed(() =>
  tasks.value.filter(task => task.completed || task.status === TaskStatus.COMPLETED).length,
)
const allTasksCompleted = computed(() => taskCount.value > 0 && completedTasksCount.value === taskCount.value)
const score = computed(() => systemsStore.selectedSystem?.score.score ?? 0)
const mistakesCount = computed(() =>
  systemsStore.selectedSystem?.mistakesCount
  ?? systemsStore.selectedSystem?.score.mistakesCount
  ?? 0
)
const mistakesPenalty = computed(() =>
  systemsStore.selectedSystem?.mistakesPenalty
  ?? systemsStore.selectedSystem?.score.mistakesPenalty
  ?? 0
)
const studentModeActive = computed(() => isMounted.value && !!systemsStore.selectedSystem && !globalSettings.teacherMode)

const welcomeStorageKey = computed(() => `student-welcome-modal-seen:${systemId.value}`)
const completedStorageKey = computed(() => `student-completed-modal-seen:${systemId.value}`)

function hasSessionFlag(key: string) {
  return window.sessionStorage.getItem(key) === 'true'
}

function clearSessionFlag(key: string) {
  window.sessionStorage.removeItem(key)
}

function setSessionFlag(key: string) {
  window.sessionStorage.setItem(key, 'true')
}

function maybeOpenWelcomeModal() {
  if (
    !studentModeActive.value
    || globalSettings.hasStartedTasks(systemId.value)
    || hasSessionFlag(welcomeStorageKey.value)
  ) {
    return
  }

  welcomeModalOpen.value = true
  setSessionFlag(welcomeStorageKey.value)
}

function maybeOpenCompletedModal() {
  if (!studentModeActive.value || welcomeModalOpen.value || !globalSettings.hasStartedTasks(systemId.value) || !allTasksCompleted.value || hasSessionFlag(completedStorageKey.value)) {
    return
  }

  completedModalOpen.value = true
  setSessionFlag(completedStorageKey.value)
}

function closeWelcomeModal() {
  welcomeModalOpen.value = false
  maybeOpenCompletedModal()
}

async function startTasksFromModal() {
  const started = await startTaskSolving()
  if (started) {
    welcomeModalOpen.value = false
    maybeOpenCompletedModal()
  }
}

onMounted(() => {
  isMounted.value = true
  maybeOpenWelcomeModal()
  maybeOpenCompletedModal()
})

watch([studentModeActive, systemId], () => {
  maybeOpenWelcomeModal()
  maybeOpenCompletedModal()
})

watch(allTasksCompleted, (isCompleted) => {
  if (!isMounted.value) {
    return
  }

  if (!isCompleted) {
    clearSessionFlag(completedStorageKey.value)
    completedModalOpen.value = false
    return
  }

  maybeOpenCompletedModal()
})

watch(welcomeModalOpen, (isOpen) => {
  if (!isOpen) {
    maybeOpenCompletedModal()
  }
})
</script>
