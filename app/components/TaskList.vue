<template>
  <div class="flex flex-col">
    <!-- Task detail view -->
    <div v-if="selectedTask" class="flex flex-col p-4 gap-4">
      <UButton
        icon="i-lucide-arrow-left"
        variant="ghost"
        color="neutral"
        size="sm"
        class="self-start"
        @click="closeTask"
      >
        {{ t('back_to_tasks') }}
      </UButton>
      <TaskStudentDetail :task="selectedTask" :title="selectedTaskTitle" />
      <UButton
        icon="i-lucide-arrow-left"
        variant="ghost"
        color="neutral"
        size="sm"
        class="self-start"
        @click="closeTask"
      >
        {{ t('back_to_tasks') }}
      </UButton>
    </div>

    <!-- Task list view -->
    <div v-else-if="showStudentIntro" class="flex flex-col p-4 gap-4">
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div class="flex flex-col gap-4">
          <div class="flex items-start">
            <div class="min-w-0">
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                {{ t('student_welcome_modal_title') }}
              </h3>
              <p class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
                {{ t('student_welcome_sidebar_description', { count: taskCount, points: totalTaskPoints }) }}
              </p>
            </div>
          </div>

          <UButton
            color="primary"
            icon="i-lucide-rotate-cw"
            block
            :loading="isStartingTasks"
            @click="startTaskSolving"
          >
            {{ t('student_welcome_sidebar_start_button') }}
          </UButton>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col p-4 gap-2">
      <button
        v-if="globalSettings.teacherMode"
        type="button"
        class="flex w-full items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-3 text-left text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800"
        @click="createTaskAndOpenDesigner"
      >
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-gray-500 shadow-sm dark:bg-gray-900 dark:text-gray-400">
          <UIcon name="i-lucide-plus" class="h-4 w-4" />
        </span>
        <span class="min-w-0 font-medium text-sm">{{ t('task_create_task') }}</span>
      </button>

      <div v-if="!tasks.length" class="flex flex-col items-center py-8 text-center gap-2">
        <UIcon name="i-lucide-clipboard-list" class="w-10 h-10 text-gray-300 dark:text-gray-600" />
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('task_list_empty') }}</p>
      </div>

      <template v-for="(task, index) in tasks" :key="task.id">
        <!-- Level Divider -->
        <div v-if="index === 0 || task.round !== tasks[index - 1].round" class="flex items-center py-3 first:pt-1">
          <span class="pr-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
            {{ t('task_level') }} {{ task.round }}
          </span>
          <div class="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
        </div>
        <UAlert
          v-if="isFirstTaskOfLevel(index, task) && levelHasVisiblePagesConflict(task.round)"
          color="red"
          variant="subtle"
          icon="i-lucide-alert-triangle"
          :title="t('task_level_visible_pages_mismatch_title')"
          :description="t('task_level_visible_pages_mismatch_description')"
          class="mb-1"
        />

        <ModernHoverPopover
          v-if="isTaskLocked(task)"
          class="w-full"
          :title="t('task_level_locked_title')"
          :description="t('task_level_locked_description')"
          icon="i-lucide-lock"
        >
          <button
            type="button"
            aria-disabled="true"
            class="flex w-full cursor-not-allowed flex-col gap-1.5 rounded-lg border border-gray-200 bg-gray-50 p-3 text-left opacity-60 dark:border-gray-700 dark:bg-gray-800/50"
            @click.prevent
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex min-w-0 flex-col gap-1">
                <span class="font-medium text-sm text-gray-900 dark:text-white leading-snug">{{ taskDisplayTitle(task, index) }}</span>
              </div>
              <span
                v-if="showTaskCompletion"
                role="checkbox"
                :aria-checked="isTaskDone(task)"
                :aria-label="t('task_completed')"
                class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors"
                :class="isTaskDone(task)
                  ? 'border-green-500 bg-green-500 dark:border-green-400 dark:bg-green-400'
                  : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900'"
              >
                <UIcon v-if="isTaskDone(task)" name="i-lucide-check" class="h-3 w-3 text-white" />
              </span>
            </div>
          </button>
        </ModernHoverPopover>

        <div
          v-else
          role="button"
          tabindex="0"
          class="flex flex-col gap-1.5 rounded-lg border p-3 text-left transition-colors cursor-pointer w-full"
          :class="globalSettings.teacherMode && globalSettings.selectedTaskId === task.id ? 'border-sky-300 bg-sky-50/80 ring-2 ring-sky-200 shadow-sm shadow-sky-100 dark:border-cyan-700 dark:bg-cyan-950/35 dark:ring-cyan-800/70 dark:shadow-none' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'"
          @click="openTask(task)"
          @keydown.enter="openTask(task)"
          @keydown.space.prevent="openTask(task)"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex min-w-0 flex-col gap-1">
              <span class="font-medium text-sm text-gray-900 dark:text-white leading-snug">{{ taskDisplayTitle(task, index) }}</span>
            </div>
            <span
              v-if="showTaskCompletion"
              role="checkbox"
              :aria-checked="isTaskDone(task)"
              :aria-label="t('task_completed')"
              class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors"
              :class="isTaskDone(task)
                ? 'border-green-500 bg-green-500 dark:border-green-400 dark:bg-green-400'
                : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900'"
            >
              <UIcon v-if="isTaskDone(task)" name="i-lucide-check" class="h-3 w-3 text-white" />
            </span>
            <ModernHoverPopover
              v-if="globalSettings.teacherMode"
              :title="t('task_remove_task_action')"
              :description="t('task_remove_task_description')"
              icon="i-lucide-trash-2"
              class="mt-0.5 shrink-0"
            >
              <UButton
                icon="i-lucide-trash-2"
                color="red"
                variant="ghost"
                size="xs"
                :aria-label="t('task_remove_task_action')"
                @click.stop="deleteTask(task.id)"
              />
            </ModernHoverPopover>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSystemsStore } from '~/stores/systemsStore'
import { Task } from '~/model/Task/Task'
import type { GUID } from '~/model/GUID'
import { inconsistentVisiblePageLevels, isTaskDone, isTaskLevelLocked } from '~/utils/taskLevels'
import { systemPageRouteFromPath, systemVisiblePages, taskAllowsPage } from '~/utils/taskPageVisibility'

const { t } = useI18n()

const systemsStore = useSystemsStore()
const globalSettings = useGlobalSettingsStore()
const route = useRoute()
const { isStartingTasks, startTaskSolving } = useStartTaskSolving()

const selectedTask = computed(() => {
  if (globalSettings.teacherMode) return null
  
  const taskId = globalSettings.selectedTaskId
  if (!taskId) return null
  
  return systemsStore.selectedSystem?.tasks?.find(task => task.id === taskId) ?? null
})

const currentRound = computed(() => systemsStore.selectedSystem?.currentRound ?? 1)
const taskCount = computed(() => tasks.value.length)
const totalTaskPoints = computed(() =>
  tasks.value.reduce((sum, task) => sum + Number(task.pointsReward ?? 0), 0)
)
const showStudentIntro = computed(() =>
  !globalSettings.teacherMode
  && !!systemsStore.selectedSystemId
  && !globalSettings.hasStartedTasks(systemsStore.selectedSystemId)
)


const tasks = computed(() =>
  (systemsStore.selectedSystem?.tasks ?? [])
    .map((task, index) => ({ task, index }))
    .sort((a, b) => {
      const levelDiff = normalizeTaskRound(a.task.round) - normalizeTaskRound(b.task.round)
      return levelDiff || a.index - b.index
    })
    .map(({ task }) => task)
)
const selectedTaskTitle = computed(() => {
  const task = selectedTask.value
  if (!task) return undefined

  const index = tasks.value.findIndex(item => item.id === task.id)
  return taskDisplayTitle(task, index)
})
const showTaskCompletion = computed(() => !globalSettings.teacherMode)
const levelsWithVisiblePagesConflict = computed(() => {
  const system = systemsStore.selectedSystem
  if (!system) {
    return new Set<number>()
  }

  return new Set(inconsistentVisiblePageLevels(system.tasks, systemVisiblePages(system)))
})

function normalizeTaskRound(round: unknown): number {
  const parsed = Number(round)
  return Number.isFinite(parsed) ? parsed : 1
}


function isFirstTaskOfLevel(index: number, task: Task): boolean {
  return index === 0 || normalizeTaskRound(task.round) !== normalizeTaskRound(tasks.value[index - 1]?.round)
}

function levelHasVisiblePagesConflict(round: unknown): boolean {
  return globalSettings.teacherMode && levelsWithVisiblePagesConflict.value.has(normalizeTaskRound(round))
}

function taskDisplayTitle(task: Task, index: number): string {
  const taskNumber = index >= 0 ? index + 1 : tasks.value.findIndex(item => item.id === task.id) + 1
  const title = task.title || t('task_untitled')
  return taskNumber > 0 ? `${taskNumber}. ${title}` : title
}

async function openTask(task: Task) {
  if (isTaskLocked(task)) {
    return
  }

  if (globalSettings.teacherMode) {
    if (globalSettings.selectedTaskId === task.id) {
      globalSettings.selectedTaskId = null
      return
    }

    globalSettings.selectedTaskId = task.id
    return
  }

  globalSettings.selectedTaskId = task.id
}

async function createTaskAndOpenDesigner() {
  const system = systemsStore.selectedSystem
  const systemId = systemsStore.selectedSystemId
  if (!system || !systemId) {
    return
  }

  const task = new Task(crypto.randomUUID() as GUID, 'New Task', '')
  system.tasks.push(task)
  globalSettings.selectedTaskId = task.id
  await systemsStore.updateSystem(system)
  await navigateTo({
    path: `/systems/${systemId}/designer`,
    query: {
      backTo: route.fullPath,
      taskId: task.id,
    },
  })
}

async function deleteTask(taskId: GUID) {
  const system = systemsStore.selectedSystem
  if (!system?.tasks) {
    return
  }

  system.tasks = system.tasks.filter(task => task.id !== taskId)

  if (globalSettings.selectedTaskId === taskId) {
    globalSettings.selectedTaskId = null
  }

  system.defaultTasks = system.tasks.map(task => Task.fromJSON(JSON.parse(JSON.stringify(task))))
  await systemsStore.updateSystem(system)
}

function closeTask() {
  globalSettings.selectedTaskId = null
}

function isTaskLocked(task: Task): boolean {
  return !globalSettings.teacherMode && isTaskLevelLocked(task, currentRound.value)
}
</script>
