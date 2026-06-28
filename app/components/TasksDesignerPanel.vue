<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <UFormField>
        <template #label>
          <span>{{ t('task_level_count') }}</span>
          <span class="ml-1 font-normal text-gray-500">
            ({{ t('task_level_count_info') }})
          </span>
        </template>
        <UInput
          v-model.number="systemLevelCount"
          type="number"
          :min="minimumLevelCount"
          class="w-[8rem] max-w-full"
        />
      </UFormField>

      <div class="flex flex-wrap items-center justify-end gap-2">
        <UPopover mode="hover" arrow>
          <UButton
            :icon="previewStudentView ? 'i-lucide-pencil' : 'i-lucide-eye'"
            color="neutral"
            :variant="previewStudentView ? 'solid' : 'soft'"
            @click="previewStudentView = !previewStudentView"
           size="sm">
            {{ previewStudentView ? t('task_editor_view') : t('task_student_preview') }}
          </UButton>
          <template #content>
            <div class="app-popover-content">
              <UIcon :name="previewStudentView ? 'i-lucide-eye' : 'i-lucide-pencil'" class="app-popover-icon" />
              <div class="app-popover-text">
                <strong class="app-popover-title">
                  {{ previewStudentView ? t('task_preview_student_title') : t('task_preview_editor_title') }}
                </strong>
                <span class="app-popover-description">
                  {{ previewStudentView ? t('task_preview_student_desc') : t('task_preview_editor_desc') }}
                </span>
              </div>
            </div>
          </template>
        </UPopover>

        <UButton
          icon="i-lucide-plus"
          color="primary"
          variant="soft"
          @click="createTask"
         size="sm">
          {{ t('task_new_task') }}
        </UButton>

        <UPopover v-model:open="optionsOpen" arrow>
          <UButton
            icon="i-lucide-ellipsis"
            color="neutral"
            variant="soft"
            @mouseenter="optionsOpen = true"
           size="sm">
            {{ t('task_options_menu') }}
          </UButton>

          <template #content>
            <div
              class="flex min-w-[230px] flex-col gap-1 rounded-lg border border-gray-200 bg-white p-2 shadow-xl"
              @mouseenter="optionsOpen = true"
              @mouseleave="optionsOpen = false"
            >
              <UButton
                icon="i-lucide-file-json"
                color="neutral"
                variant="ghost"
                class="justify-start"
                @click="openImportTaskModal"
               size="sm">
                {{ t('task_add_from_json') }}
              </UButton>
              <UButton
                icon="i-lucide-download"
                color="neutral"
                variant="ghost"
                class="justify-start"
                :disabled="!selectedTask"
                @click="downloadSelectedTaskJson"
               size="sm">
                {{ t('task_download_json') }}
              </UButton>
            </div>
          </template>
        </UPopover>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <span class="text-sm font-semibold text-gray-900">{{ t('tasks') }}</span>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="task in sortedTasks"
          :key="task.id"
          role="button"
          tabindex="0"
          class="inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition"
          :class="selectedTask?.id === task.id
            ? 'bg-gray-950 text-white ring-gray-950'
            : 'bg-gray-50 text-gray-900 ring-gray-200 hover:bg-gray-100'"
          @click="toggleSelectedTask(task)"
          @keydown.enter.prevent="toggleSelectedTask(task)"
          @keydown.space.prevent="toggleSelectedTask(task)"
        >
          <span
            class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
            :class="selectedTask?.id === task.id
              ? 'bg-white/20 text-white'
              : 'bg-gray-200 text-gray-700'"
          >
            {{ normalizeTaskLevel(task.round) }}
          </span>
          <span class="cursor-pointer">
            {{ task.title || t('task_untitled') }}
          </span>
          <HoverHint :text="t('task_remove_task_action')">
            <UButton
              icon="i-lucide-trash-2"
              color="red"
              variant="ghost"
              size="sm"
              class="shrink-0"
              @click.stop="deleteTask(task.id)"
            />
          </HoverHint>
        </span>
      </div>
    </div>

    <TaskStudentDetail
      v-if="previewStudentView"
      :task="selectedTask"
      readonly
    />
    <TaskDetail
      v-else
      :selected-task="selectedTask"
      @update:selected-task="handleTaskUpdate"
    />

    <UModal v-model:open="showImportModal" :title="t('task_import_title')" :ui="{ content: 'w-[560px]' }">
      <template #body>
        <div class="flex flex-col gap-4">
          <p class="text-sm text-gray-500">
            {{ t('task_import_description') }}
          </p>
          <UFileUpload
            v-model="importFile"
            accept=".json,application/json"
            icon="i-lucide-file-json"
            :label="t('task_upload_json')"
          />
          <UTextarea
            v-model="importJsonText"
            :placeholder='"{ \"id\": \"...\", \"title\": \"...\" }"'
            :rows="10"
            class="font-mono w-full"
          />
          <p v-if="importError" class="text-sm text-red-500">
            {{ importError }}
          </p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="showImportModal = false" size="sm">{{ t('cancel') }}</UButton>
          <UButton color="primary" @click="importFromJson" size="sm">{{ t('task_import_btn') }}</UButton>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="showImportAllModal" :title="t('task_import_all_title')" :ui="{ content: 'w-[560px]' }">
      <template #body>
        <div class="flex flex-col gap-4">
          <p class="text-sm text-gray-500">
            {{ t('task_import_all_description') }}
          </p>
          <UFileUpload
            v-model="importAllFile"
            accept=".json,application/json"
            icon="i-lucide-file-json"
            :label="t('task_upload_json')"
          />
          <UTextarea
            v-model="importAllJsonText"
            placeholder="[ { &quot;id&quot;: &quot;...&quot;, &quot;title&quot;: &quot;...&quot; }, ... ]"
            :rows="10"
            class="font-mono w-full"
          />
          <p v-if="importAllError" class="text-sm text-red-500">
            {{ importAllError }}
          </p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="showImportAllModal = false" size="sm">{{ t('cancel') }}</UButton>
          <UButton color="primary" @click="importAllFromJson" size="sm">{{ t('task_import_all_btn') }}</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import HoverHint from '~/components/HoverHint.vue'
import type { GUID } from '~/model/GUID'
import type { InformationSystem } from '~/model/InformationSystem'
import { Task } from '~/model/Task/Task'
import { useSystemsStore } from '~/stores/systemsStore'

const showImportModal = ref(false)
const importJsonText = ref('')
const importError = ref('')
const importFile = ref<File | null>(null)
const showImportAllModal = ref(false)
const importAllJsonText = ref('')
const importAllError = ref('')
const importAllFile = ref<File | null>(null)
const previewStudentView = ref(false)
const optionsOpen = ref(false)

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

watch(importFile, async (file) => {
  if (!file) return
  importJsonText.value = await readFileAsText(file)
})

watch(importAllFile, async (file) => {
  if (!file) return
  importAllJsonText.value = await readFileAsText(file)
})

const { t } = useI18n()
const systemsStore = useSystemsStore()
const globalSettings = useGlobalSettingsStore()
const selectedTask = ref<Task | null>(null)
const systemLevelCount = ref(1)
const tasks = computed(() => systemsStore.selectedSystem?.tasks ?? [])
const sortedTasks = computed(() =>
  [...tasks.value].sort((a, b) => normalizeTaskLevel(a.round) - normalizeTaskLevel(b.round))
)
const minimumLevelCount = computed(() =>
  tasks.value.reduce((maxLevel, task) => Math.max(maxLevel, normalizeTaskLevel(task.round)), 1)
)
let persistSystemTimeout: ReturnType<typeof setTimeout> | null = null

watch(selectedTask, (task) => {
  globalSettings.selectedTaskId = task?.id ?? null
})

watch(() => globalSettings.selectedTaskId, (id) => {
  if (selectedTask.value?.id === id) return
  selectedTask.value = tasks.value.find(t => t.id === id) ?? null
}, { immediate: true })

watch(
  () => systemsStore.selectedSystem?.levelCount,
  (levelCount) => {
    systemLevelCount.value = normalizeLevelCount(levelCount)
  },
  { immediate: true }
)

watch(minimumLevelCount, (minimum) => {
  if (systemLevelCount.value < minimum) {
    systemLevelCount.value = minimum
  }
})

watch(systemLevelCount, (levelCount) => {
  handleLevelCountUpdate(levelCount)
})

const importFromJson = async () => {
  importError.value = ''
  let data: unknown
  try {
    data = JSON.parse(importJsonText.value)
  } catch {
    importError.value = t('task_import_error_json')
    return
  }

  const system = systemsStore.selectedSystem
  if (!system) {
    importError.value = t('task_import_error_no_system')
    return
  }

  const importedTask = Task.fromJSON(data)
  importedTask.id = crypto.randomUUID() as GUID

  system.tasks.push(importedTask)
  selectedTask.value = importedTask
  showImportModal.value = false
  importJsonText.value = ''
  importFile.value = null

  await persistSystemNow(system)
}

const importAllFromJson = async () => {
  importAllError.value = ''
  let data: unknown
  try {
    data = JSON.parse(importAllJsonText.value)
  } catch {
    importAllError.value = t('task_import_error_json')
    return
  }

  if (!Array.isArray(data)) {
    importAllError.value = t('task_import_all_error_array')
    return
  }

  const system = systemsStore.selectedSystem
  if (!system) {
    importAllError.value = t('task_import_error_no_system')
    return
  }

  system.tasks = data.map((item: unknown) => {
    const task = Task.fromJSON(item)
    task.id = crypto.randomUUID() as GUID
    return task
  })

  selectedTask.value = system.tasks[0] ?? null
  showImportAllModal.value = false
  importAllJsonText.value = ''
  importAllFile.value = null

  await persistSystemNow(system)
}

const openImportTaskModal = () => {
  optionsOpen.value = false
  showImportModal.value = true
}

const downloadSelectedTaskJson = () => {
  const task = selectedTask.value
  if (!task) {
    return
  }

  optionsOpen.value = false
  const data = JSON.stringify(task, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `task-${task.id}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const createTask = async () => {
  const system = systemsStore.selectedSystem
  if (!system) {
    return
  }

  const taskId = crypto.randomUUID() as GUID
  const newTask = new Task(taskId, 'New Task', '')

  system.tasks.push(newTask)
  selectedTask.value = newTask

  await persistSystemNow(system)
}

function toggleSelectedTask(task: Task) {
  selectedTask.value = selectedTask.value?.id === task.id ? null : task
}

const handleTaskUpdate = (updatedTask: Task) => {
  const system = systemsStore.selectedSystem
  if (!system?.tasks) {
    return
  }

  const taskToUpdate = system.tasks.find(task => task.id === updatedTask.id)
  if (!taskToUpdate) {
    return
  }

  Object.assign(taskToUpdate, updatedTask)
  selectedTask.value = taskToUpdate

  queueSystemPersist(system)
}

const handleLevelCountUpdate = (levelCount: number) => {
  const system = systemsStore.selectedSystem
  if (!system) {
    return
  }

  const normalizedLevelCount = normalizeLevelCount(levelCount)
  if (systemLevelCount.value !== normalizedLevelCount) {
    systemLevelCount.value = normalizedLevelCount
    return
  }

  if (system.levelCount === normalizedLevelCount) {
    return
  }

  system.levelCount = normalizedLevelCount
  system.currentRound = Math.min(system.currentRound, system.levelCount)

  queueSystemPersist(system)
}

const deleteTask = async (taskId: GUID) => {
  const system = systemsStore.selectedSystem
  if (!system?.tasks) {
    return
  }

  system.tasks = system.tasks.filter(task => task.id !== taskId)

  if (selectedTask.value?.id === taskId) {
    selectedTask.value = null
  }

  await persistSystemNow(system)
}

function refreshDefaultTasks(system: InformationSystem) {
  system.defaultTasks = system.tasks.map(task => Task.fromJSON(JSON.parse(JSON.stringify(task))))
}

function queueSystemPersist(system: InformationSystem) {
  if (persistSystemTimeout) {
    clearTimeout(persistSystemTimeout)
  }

  persistSystemTimeout = setTimeout(() => {
    persistSystemTimeout = null
    refreshDefaultTasks(system)
    void systemsStore.updateSystem(system)
  }, 1000)
}

async function persistSystemNow(system: InformationSystem) {
  if (persistSystemTimeout) {
    clearTimeout(persistSystemTimeout)
    persistSystemTimeout = null
  }

  refreshDefaultTasks(system)
  await systemsStore.updateSystem(system)
}

function normalizeLevelCount(value: unknown): number {
  const parsed = Number(value)
  const normalized = Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1
  return Math.max(minimumLevelCount.value, normalized)
}

function normalizeTaskLevel(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1
}

onBeforeUnmount(() => {
  const system = systemsStore.selectedSystem
  if (!system || !persistSystemTimeout) {
    return
  }

  clearTimeout(persistSystemTimeout)
  persistSystemTimeout = null
  refreshDefaultTasks(system)
  void systemsStore.updateSystem(system)
})
</script>
