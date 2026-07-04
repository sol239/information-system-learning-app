<template>
  <div
    class="flex min-h-[57px] flex-wrap items-center justify-end gap-2 overflow-x-auto border-b border-gray-200 py-2 pr-4">
    <UButton v-if="globalSettings.teacherMode"
      :icon="globalSettings.teacherHighlightEnabled ? 'i-lucide-eye' : 'i-lucide-eye-off'"
      :color="globalSettings.teacherHighlightEnabled ? 'sky' : 'neutral'"
      :variant="globalSettings.teacherHighlightEnabled ? 'soft' : 'ghost'" size="sm"
      @click="globalSettings.teacherHighlightEnabled = !globalSettings.teacherHighlightEnabled" />

    <UButton v-if="globalSettings.teacherMode" icon="i-lucide-pencil-ruler" color="teacher" variant="subtle" size="sm"
      @click="openTaskDesigner">
      <span class="mobile-hidden">{{ t('designer') }}</span>
    </UButton>

    <UPopover>
      <template #content>
        <div class="p-3 bg-white border border-gray-200 rounded-xl shadow-xl min-w-[240px] space-y-2">
          <UButton block variant="soft" color="neutral" icon="i-heroicons-command-line" class="justify-start" size="sm"
            @click="printTableData">
            Print table names
          </UButton>
          <UButton block variant="soft" color="neutral" icon="i-heroicons-question-mark-circle" class="justify-start"
            size="sm" @click="isDbNull">
            Check DB Status
          </UButton>
          <UButton block variant="soft" color="neutral" icon="i-heroicons-magnifying-glass-circle" class="justify-start"
            size="sm" @click="openComponentExplorer">
            Component Explorer
          </UButton>
        </div>
      </template>
    </UPopover>

    <div v-if="!globalSettings.teacherMode" class="flex items-center gap-2">
      <UButton id="toggle-edits-button"
        :icon="highlightStore.isEditModeActive ? 'i-lucide-pencil' : 'i-lucide-pencil-off'" color="yellow"
        :variant="highlightStore.isEditModeActive ? 'solid' : 'subtle'" size="sm"
        @click="highlightStore.toggleEditMode">
        <span class="mobile-hidden">
          {{ highlightStore.isEditModeActive ? t('disable_edit') : t('enable_edit') }}
        </span>
      </UButton>
    </div>

    <UButton v-if="!globalSettings.teacherMode" id="reset-system-button" :label="t('reset_system')" size="sm" color="green" variant="subtle" icon="i-lucide-refresh-cw"
      @click="openResetSystemModal" />

    <UButton v-if="globalSettings.teacherModeEnv"
      :icon="globalSettings.teacherMode ? 'i-lucide-graduation-cap' : 'i-lucide-pencil-ruler'" color="teacher"
      variant="subtle" size="sm" @click="versionSwitchModalOpen = true">
      <span class="mobile-hidden">{{ t('change_version') }}</span>
    </UButton>

    <UModal v-model:open="resetSystemModalOpen" :title="t('reset_system_modal_title')" :ui="resetSystemModalUi">
      <template #body>
        <div class="flex flex-col gap-4">
          <p class="text-sm text-gray-600">
            {{ t('reset_system_modal_description') }}
          </p>

          <div class="flex flex-col gap-3">
            <div class="rounded-lg border border-gray-200 p-4">
              <div class="mb-3 flex flex-col gap-1">
                <span class="text-sm font-medium text-gray-900">
                  {{ t('reset_database') }}
                </span>
                <span class="text-xs text-gray-500">
                  {{ t('reset_database_modal_option_description') }}
                </span>
              </div>
              <UButton id="reset-database-button" block color="orange" variant="soft" icon="i-heroicons-circle-stack" size="sm"
                @click="resetDatabaseFromModal">
                {{ t('reset_database') }}
              </UButton>
            </div>

            <div class="rounded-lg border border-gray-200 p-4">
              <div class="mb-3 flex flex-col gap-1">
                <span class="text-sm font-medium text-gray-900">
                  {{ t('reset_components') }}
                </span>
                <span class="text-xs text-gray-500">
                  {{ t('reset_components_modal_option_description') }}
                </span>
              </div>
              <UButton id="reset-components-button" block color="primary" variant="soft" icon="i-heroicons-squares-2x2" size="sm"
                @click="resetComponentsFromModal">
                {{ t('reset_components') }}
              </UButton>
            </div>

            <div class="rounded-lg border border-green-200 bg-green-50/50 p-4">
              <div class="mb-3 flex flex-col gap-1">
                <span class="text-sm font-medium text-gray-900">
                  {{ t('reset_all') }}
                </span>
                <span class="text-xs text-gray-500">
                  {{ t('reset_all_modal_option_description') }}
                </span>
              </div>
              <UButton id="reset-all-button" block color="green" variant="solid" icon="i-lucide-refresh-cw" size="sm"
                @click="resetAllFromModal">
                {{ t('reset_all') }}
              </UButton>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton  color="neutral" variant="ghost" size="sm" @click="resetSystemModalOpen = false">
            {{ t('cancel') }}
          </UButton>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="versionSwitchModalOpen" :title="t('change_version')" :ui="versionSwitchModalUi">
      <template #body>
        <p class="text-sm text-gray-600">
          {{ t('change_version_modal_description') }}
        </p>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="ghost" size="sm" @click="versionSwitchModalOpen = false">
            {{ t('cancel') }}
          </UButton>
          <UButton color="teacher"
            :icon="globalSettings.teacherMode ? 'i-lucide-graduation-cap' : 'i-lucide-pencil-ruler'" size="sm"
            @click="changeVersion">
            {{
              globalSettings.teacherMode
                ? t('switch_to_student_version')
                : t('switch_to_teacher_version')
            }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>


<script setup lang="ts">
/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
/* 1. Imports */
import { ref } from 'vue'
import { DefaultSystemLoader } from '~/core/systems/DefaultSystemLoader'
import { TaskHelper } from '~/core/systems/TaskHelper'
import { Component } from '~/model/Component'
import { IndexedDbHandler } from '~/utils/IndexedDbHandler'
import { OperationResultType } from '~/utils/Operation/OperationResultType'

/* 2. Stores */
const highlightStore = useHighlightStore()
const systemsStore = useSystemsStore()
const globalSettings = useGlobalSettingsStore()

/* 3. Context hooks */
const { t } = useI18n()
const toast = useToast()
const route = useRoute()

/* 4. Constants (non-reactive) */
const resetSystemModalUi = {
  content: 'w-[520px]'
}
const versionSwitchModalUi = {
  content: 'w-[420px]'
}

/* 5. Props */

/* 6. Emits */

/* 7. Template refs */

/* 8. State (ref, reactive) */
const resetPopoverOpen = ref(false)
const exitPopoverOpen = ref(false)
const studentDrawerOpen = ref(false)
const resetSystemModalOpen = ref(false)
const versionSwitchModalOpen = ref(false)

/* 9. Computed */

/* 10. Watchers */

/* 11. Methods */
async function printTableData() { }

async function isDbNull() {
  const system = systemsStore.selectedSystem
  if (system) {
    // console.log(system.database === null ? 'Database is null.' : 'Database is not null.')
  } else {
    // console.log('No system selected.')
  }
}

function openComponentExplorer() {
  navigateTo(`/systems/${systemsStore.selectedSystemId}/component-explorer`)
}

function openTaskDesigner() {
  navigateTo({
    path: `/systems/${systemsStore.selectedSystemId}/designer`,
    query: {
      backTo: route.fullPath,
    },
  })
}

function openResetSystemModal() {
  resetSystemModalOpen.value = true
}

async function resetComponents() {
  const system = systemsStore.selectedSystem
  if (!system) return

  const cloneComponent = (component: Component) =>
    Component.fromJSON(JSON.parse(JSON.stringify(component)))

  system.actualComponents = system.defaultComponents.map((component) =>
    cloneComponent(component)
  )

  const defaultTasksById = new Map(
    (system.defaultTasks ?? []).map((task) => [String(task.id), task])
  )

  for (const task of system.tasks ?? []) {
    const defaultTask = defaultTasksById.get(String(task.id))
    if (!defaultTask) continue

    task.errorComponents = (defaultTask.errorComponents ?? []).map((component) =>
      cloneComponent(component)
    )

    if (task.activity && defaultTask.activity) {
      task.activity.activityComponents = (defaultTask.activity.activityComponents ?? []).map((component) =>
        cloneComponent(component)
      )
    }
  }

  await systemsStore.updateSystem(system)
  toast.add({
    title: t('component_reset_success') || 'Components reset',
    color: 'primary',
    icon: 'i-lucide-check-circle',
  })
}

async function resetSystem(options: { silent?: boolean } = {}) {
  const currentSystemId = systemsStore.selectedSystemId
  if (!currentSystemId) {
    return
  }

  try {
    const loadResult = await new DefaultSystemLoader().loadSystem(currentSystemId)

    if (loadResult.result !== OperationResultType.SUCCESS || !loadResult.data) {
      if (!options.silent) {
        toast.add({
          title: t('reset_system_error'),
          color: 'red',
          icon: 'i-lucide-alert-triangle',
        })
      }
      resetPopoverOpen.value = false
      return
    }

    const freshSystem = loadResult.data

    globalSettings.selectedTaskId = null
    globalSettings.solvedComponentIds = []

    const result = await systemsStore.updateSystem(freshSystem)
    if (result.result !== OperationResultType.SUCCESS) {
      if (!options.silent) {
        toast.add({
          title: t('reset_system_error'),
          color: 'red',
          icon: 'i-lucide-alert-triangle',
        })
      }
      resetPopoverOpen.value = false
      return
    }

    globalSettings.studentWelcomeModalOpen = true
    systemsStore.selectedSystemId = String(freshSystem.id)
    if (!options.silent) {
      toast.add({
        title: t('reset_system_success'),
        color: 'primary',
        icon: 'i-lucide-check-circle',
      })
    }
  } catch (error) {
    console.error('System reset failed:', error)
    if (!options.silent) {
      toast.add({
        title: t('reset_system_error'),
        color: 'red',
        icon: 'i-lucide-alert-triangle',
      })
    }
  } finally {
    resetPopoverOpen.value = false
  }
}

async function resetDatabaseFromModal() {
  resetSystemModalOpen.value = false
  await resetDatabase()
  await pushFirstAvailablePage()
}

async function resetComponentsFromModal() {
  resetSystemModalOpen.value = false
  await resetComponents()
  await pushFirstAvailablePage()
}

async function resetAllFromModal() {
  resetSystemModalOpen.value = false
  await resetSystem()
  await pushFirstAvailablePage()
}

async function resetDatabase() {
  const system = systemsStore.selectedSystem
  if (!system) return

  if (system.database) {
    await system.database.resetDatabase()
    await systemsStore.updateSystem(system)
    toast.add({
      title: t('reset_database_success') || 'Database reset',
      color: 'primary',
      icon: 'i-lucide-check-circle',
    })
  }
}

async function pushFirstAvailablePage() {
  const system = systemsStore.selectedSystem
  const systemId = systemsStore.selectedSystemId
  const availableTasks = system?.availableTasks() ?? []
  const availablePages = TaskHelper.getVisiblePages(availableTasks)
  const firstPage = availablePages[0]?.route ?? ''

  if (!systemId || !firstPage) {
    return
  }

  await navigateTo(`/systems/${systemId}${firstPage}`)
}

async function changeVersion() {
  globalSettings.toggleTeacherMode()
  versionSwitchModalOpen.value = false
  await resetSystem({ silent: true })
  await pushFirstAvailablePage()
}

async function leaveAndSave() {
  try {
    const system = systemsStore.selectedSystem
    if (!system) throw new Error('No system selected')

    await systemsStore.updateSystem(system)

    if (system.database?.sqlJsDatabase) {
      // database is persisted as part of updateSystem.
    }

    toast.add({
      title: t('save_success') || 'Results saved successfully',
      color: 'primary',
      icon: 'i-lucide-check-circle',
    })
    await navigateTo('/systems')
    exitPopoverOpen.value = false
  } catch (error) {
    console.error('Save failed:', error)
    toast.add({
      title: t('save_error') || 'Save failed',
      color: 'red',
      icon: 'i-lucide-alert-triangle',
    })
  }
}

function stayInSystem() {
  exitPopoverOpen.value = false
}

/* 12. Lifecycle */

/* 13. defineExpose */
defineExpose({
})
</script>

<style scoped>
@media (max-width: 639px) {
  .mobile-hidden {
    display: none;
  }
}
</style>
