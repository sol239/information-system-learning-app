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
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div class="flex flex-col gap-4">
          <div class="flex items-start">
            <div class="min-w-0">
              <h3 class="text-base font-semibold text-gray-900">
                {{ t('student_welcome_modal_title') }}
              </h3>
              <p class="mt-1 text-sm leading-6 text-gray-600">
                {{ t('student_welcome_sidebar_description', { count: taskCount, points: totalTaskPoints }) }}
              </p>
            </div>
          </div>

          <UButton
            id="enter-system-sidebar-button"
            color="primary"
            icon="i-lucide-rotate-cw"
            block
            @click="startTaskSolving"
           size="sm">
            {{ t('student_welcome_sidebar_start_button') }}
          </UButton>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col p-4 gap-2">
      <button
        v-if="globalSettings.teacherMode"
        type="button"
        class="flex w-full items-center gap-[0.675rem] rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-[0.675rem] text-left text-gray-600 transition-colors hover:border-gray-400 hover:bg-gray-100"
        @click="createTaskAndOpenDesigner"
      >
        <span class="flex h-[1.8rem] w-[1.8rem] shrink-0 items-center justify-center rounded-md bg-white text-gray-500 shadow-sm">
          <UIcon name="i-lucide-plus" class="h-[0.9rem] w-[0.9rem]" />
        </span>
        <span class="min-w-0 font-medium text-sm">{{ t('task_create_task') }}</span>
      </button>

      <div v-if="!tasks.length" class="flex flex-col items-center py-8 text-center gap-2">
        <UIcon name="i-lucide-clipboard-list" class="w-10 h-10 text-gray-300" />
        <p class="text-sm text-gray-500">{{ t('task_list_empty') }}</p>
      </div>

      <template v-for="(task, index) in tasks" :key="task.id">
        <!-- Level Divider -->
        <div v-if="index === 0 || task.level !== tasks[index - 1].level" class="flex items-center py-3 first:pt-1">
          <span class="pr-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
            {{ t('task_level') }} {{ task.level }}
          </span>
          <div class="flex-1 border-t border-gray-300"></div>
        </div>
        <UAlert
          v-if="isFirstTaskOfLevel(index, task) && levelHasVisiblePagesConflict(task.level)"
          color="red"
          variant="subtle"
          icon="i-lucide-alert-triangle"
          :title="t('task_level_visible_pages_mismatch_title')"
          :description="t('task_level_visible_pages_mismatch_description')"
          class="mb-1"
        />

        <UPopover
          v-if="isTaskLocked(task)"
          mode="hover"
          arrow
        >
          <span class="app-popover-trigger-full">
            <button
              :id="`task-${index + 1}`"
              type="button"
              aria-disabled="true"
              class="flex w-full cursor-not-allowed flex-col gap-[0.3375rem] rounded-lg border border-gray-200 bg-gray-50 p-[0.675rem] text-left opacity-60"
              @click.prevent
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex min-w-0 flex-col gap-1">
                  <span class="font-medium text-sm text-gray-900 leading-snug">{{ taskDisplayTitle(task, index) }}</span>
                </div>
                <span
                  v-if="showTaskCompletion"
                  role="checkbox"
                  :aria-checked="isTaskDone(task)"
                  :aria-label="t('task_completed')"
                  class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors"
                  :class="isTaskDone(task)
                    ? 'border-green-500 bg-green-500'
                    : 'border-gray-300 bg-white'"
                >
                  <UIcon v-if="isTaskDone(task)" name="i-lucide-check" class="h-3 w-3 text-white" />
                </span>
              </div>
            </button>
          </span>
          <template #content>
            <div class="app-popover-content">
              <UIcon name="i-lucide-lock" class="app-popover-icon" />
              <div class="app-popover-text">
                <strong class="app-popover-title">{{ t('task_level_locked_title') }}</strong>
                <span class="app-popover-description">{{ t('task_level_locked_description') }}</span>
              </div>
            </div>
          </template>
        </UPopover>

        <div
          v-else
          :id="`task-${index + 1}`"
          role="button"
          tabindex="0"
          class="flex flex-col gap-[0.3375rem] rounded-lg border p-[0.675rem] text-left transition-colors cursor-pointer w-full"
          :class="globalSettings.teacherMode && globalSettings.selectedTaskId === task.id ? 'border-sky-300 bg-sky-50/80 ring-2 ring-sky-200 shadow-sm shadow-sky-100' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'"
          @click="openTask(task)"
          @keydown.enter="openTask(task)"
          @keydown.space.prevent="openTask(task)"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex min-w-0 flex-col gap-1">
              <span class="font-medium text-sm text-gray-900 leading-snug">{{ taskDisplayTitle(task, index) }}</span>
            </div>
            <span
              v-if="showTaskCompletion"
              role="checkbox"
              :aria-checked="isTaskDone(task)"
              :aria-label="t('task_completed')"
              class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors"
              :class="isTaskDone(task)
                ? 'border-green-500 bg-green-500'
                : 'border-gray-300 bg-white'"
            >
              <UIcon v-if="isTaskDone(task)" name="i-lucide-check" class="h-3 w-3 text-white" />
            </span>
            <UPopover
              v-if="globalSettings.teacherMode"
              mode="hover"
              arrow
            >
              <span class="mt-0.5 inline-flex shrink-0">
                <UButton
                  icon="i-lucide-trash-2"
                  color="red"
                  variant="ghost"
                  size="sm"
                  :aria-label="t('task_remove_task_action')"
                  @click.stop="deleteTask(task.id)"
                />
              </span>
              <template #content>
                <div class="app-popover-content">
                  <UIcon name="i-lucide-trash-2" class="app-popover-icon" />
                  <div class="app-popover-text">
                    <strong class="app-popover-title">{{ t('task_remove_task_action') }}</strong>
                    <span class="app-popover-description">{{ t('task_remove_task_description') }}</span>
                  </div>
                </div>
              </template>
            </UPopover>
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
import { inconsistentVisiblePageLevels, isTaskDone } from '~/utils/taskLevels'
import { systemVisiblePages } from '~/utils/taskPageVisibility'

const { t } = useI18n()

const systemsStore = useSystemsStore()
const globalSettings = useGlobalSettingsStore()
const route = useRoute()

const selectedTask = computed(() => {
  if (globalSettings.teacherMode) return null
  
  const taskId = globalSettings.selectedTaskId
  if (!taskId) return null
  
  return systemsStore.selectedSystem?.tasks?.find(task => task.id === taskId) ?? null
})

const currentLevel = computed(() => systemsStore.selectedSystem?.currentLevel ?? 1)
const taskCount = computed(() => tasks.value.length)
const totalTaskPoints = computed(() =>
  tasks.value.reduce((sum, task) => sum + Number(task.pointsReward ?? 0), 0)
)
const showStudentIntro = computed(() =>
  !globalSettings.teacherMode
  && !!systemsStore.selectedSystem
  && !systemsStore.selectedSystem.startedTasks
  && systemsStore.selectedSystem.exploringSystem
)


const tasks = computed(() =>
  (systemsStore.selectedSystem?.tasks ?? [])
    .map((task, index) => ({ task, index }))
    .sort((a, b) => {
      const levelDiff = normalizeTaskLevel(a.task.level) - normalizeTaskLevel(b.task.level)
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

function normalizeTaskLevel(level: unknown): number {
  const parsed = Number(level)
  return Number.isFinite(parsed) ? parsed : 1
}


function isFirstTaskOfLevel(index: number, task: Task): boolean {
  return index === 0 || normalizeTaskLevel(task.level) !== normalizeTaskLevel(tasks.value[index - 1]?.level)
}

function levelHasVisiblePagesConflict(level: unknown): boolean {
  return globalSettings.teacherMode && levelsWithVisiblePagesConflict.value.has(normalizeTaskLevel(level))
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

  const task = new Task(crypto.randomUUID(), 'New Task', '')
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

async function deleteTask(taskId: string) {
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

async function startTaskSolving() {
  const system = systemsStore.selectedSystem
  if (!system) {
    return
  }

  globalSettings.selectedTaskId = null
  globalSettings.solvedComponentIds = []
  system.startedTasks = true
  system.exploringSystem = false
  await systemsStore.updateSystem(system)
}

function isTaskLocked(task: Task): boolean {
  return !globalSettings.teacherMode && task.isTaskLevelLocked(currentLevel.value)
}
</script>
