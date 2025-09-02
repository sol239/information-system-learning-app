<template>
  <div class="flex items-center w-full justify-between text-lg py-4 px-4 text-black"
    style="border-bottom: 1px; border-color: #05df72; border-bottom-style: solid;">
    <!-- Navigation Menu on the left/center -->
    <UNavigationMenu :items="items" class="flex-grow justify-start" style="z-index: 10000;" />

    <UButton style="margin-right: 10px ;" label="Helper" @click="handleHelperClick"></UButton>

    <UBadge v-if="isOnSystemDetailPage" color="red" variant="outline" size="xl" style="margin-right: 10px;">
      {{ $t('score') }}: {{ scoreStore.score }}
    </UBadge>

    <!-- Tasks Popover - Only visible on /system/[id] pages -->
    <UPopover v-if="isOnSystemDetailPage" v-model:open="tasksPopoverOpen" arrow>
      <UButton :label="selectedTaskStore.selectedTask?.title || $t('tasks')" color="primary" variant="subtle" />

      <template #content>
        <TaskList />
      </template>
    </UPopover>
    <UButton v-if="isOnSystemDetailPage"
      :label="highlightStore.isHighlightMode ? $t('disable_highlight') : $t('enable_highlight')" color="lime"
      :variant="highlightStore.isHighlightMode ? 'solid' : 'subtle'" style="margin-left: 10px"
      @click="highlightStore.toggleHighlight" />
    <UButton v-if="isOnSystemDetailPage"
      :label="highlightStore.isEditModeActive ? $t('disable_edit') : $t('enable_edit')" color="yellow"
      :variant="highlightStore.isEditModeActive ? 'solid' : 'subtle'" style="margin-left: 10px"
      @click="highlightStore.toggleEdit" />
    <UPopover v-if="isOnSystemDetailPage" v-model:open="resetPopoverOpen" arrow>
      <UButton icon="i-heroicons-arrow-path" :label="$t('refresh_system')" color="primary" variant="subtle" style="margin-left: 10px" />

      <template #content>
        <UCard>
          <div class="flex flex-col gap-2">
            <UButton :label="$t('refresh_components')" color="primary" variant="outline" icon="i-heroicons-arrow-path"
              @click="refreshComponents" />
            <UButton :label="$t('refresh_database')" color="lime" variant="outline" icon="i-heroicons-arrow-path"
              @click="refreshDatabase" />
            <UButton :label="$t('refresh_tasks')" color="sky" variant="outline" icon="i-heroicons-arrow-path"
              @click="refreshTasks" />

          </div>
        </UCard>
      </template>
    </UPopover>
  </div>

</template>

<script setup lang="ts">
/* 1. Imports */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { NavigationMenuItem } from '@nuxt/ui'
import { useHighlightStore } from '~/stores/useHighlightStore'
import { ComponentHandler, SystemReset, TaskAnswerEval, TaskQueue, useScoreStore } from '#imports'
import { useErrorComponentStore } from '#imports'
import { Task } from '~/model/Task'
import { useSelectedTaskStore } from '#imports'
import { useSelectedSystemStore } from '#imports'
import { useSettingsStore } from '#imports'
import { useInformationSystemStore } from '#imports'


/* 2. Stores */
const highlightStore = useHighlightStore()
const scoreStore = useScoreStore()
const errorComponentStore = useErrorComponentStore()
const selectedTaskStore = useSelectedTaskStore()
const selectedSystemStore = useSelectedSystemStore()
const settingsStore = useSettingsStore()
const informationSystemStore = useInformationSystemStore()

import { useComponentCodeStore } from '#imports';
import type { InformationSystem } from '~/model/InformationSystem'

const componentCodeStore = useComponentCodeStore()

/* 3. Context hooks */
const route = useRoute()
const { t } = useI18n()

/* 4. Constants (non-reactive) */
const toast = useToast()

/* 5. Props */
// none

/* 6. Emits */
// none

/* 7. Template refs */
// none

/* 8. Local state (ref, reactive) */
const tasksPopoverOpen = ref(false)
const resetPopoverOpen = ref(false)


/* 9. Computed */
const items = computed<NavigationMenuItem[]>(() => [
  {
    label: t('home'),
    icon: 'i-heroicons-home',
    to: '/',
    data_target: 'home',
  },
  {
    label: t('systems'),
    icon: 'i-heroicons-computer-desktop',
    to: '/system',
    data_target: 'systems',
  },
  {
    label: t('settings'),
    icon: 'i-heroicons-cog',
    to: '/settings',
    data_target: 'settings',
  },
  {
    label: t('development'),
    icon: 'i-heroicons-code-bracket',
    to: '/development',
    data_target: 'development',
  },
])

const isOnSystemDetailPage = computed(() => {
  return route.path.startsWith('/system/') && route.params.id
})

/* 10. Watchers */
// Keyboard shortcut for highlight toggle
onMounted(() => {
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'h' && isOnSystemDetailPage.value) {
      highlightStore.toggleHighlight()
    }
    if (event.key === 'e' && isOnSystemDetailPage.value) {
      highlightStore.toggleEdit()
    }
    if (event.key === 't' && event.altKey && isOnSystemDetailPage.value) {
      event.preventDefault()
      tasksPopoverOpen.value = !tasksPopoverOpen.value
    }
  }

  document.addEventListener('keydown', handleKeydown)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
})




/* 11. Methods */
async function handleHelperClick() {
  // Placeholder for helper click logic
  //console.log(componentCodeStore.getComponentCode("stats-supervisors-sqsl.vue"));
  console.log(TaskAnswerEval.getQuestions(selectedTaskStore.selectedTask?.answer || ''));
}


async function refreshComponents() {
  console.log("Refreshing components...");
  try {
    componentCodeStore.resetAllComponentCodes();
    toast.add({
      title: t('component_refresh_success') || 'Component refresh successful',
      color: 'primary',
      icon: 'i-lucide-check-circle'
    })
  } catch {
    toast.add({
      title: t('component_refresh_error') || 'Component refresh error',
      color: 'red',
      icon: 'i-lucide-alert-triangle'
    })
  }
}

async function refreshTasks() {
  try {
    selectedTaskStore.resetTasks()
    scoreStore.resetScore()
    errorComponentStore.clearErrorComponents()
    ComponentHandler.getComponentMap(selectedTaskStore.currentRound)

    for (let j = 0; j < informationSystemStore.systems.length; j++) {
      const system = informationSystemStore.systems[j];
      for (let i = 0; i < system.tasks.length; i++) {
        system.tasks[i].completed = false;
        system.tasks[i].componentsRepaired = false;
      }
    }

    toast.add({
      title: t('refresh_tasks_success') || 'Tasks refreshed successfully',
      color: 'primary',
      icon: 'i-lucide-check-circle'
    })
  } catch {
    toast.add({
      title: t('refresh_tasks_error') || 'Tasks refresh error',
      color: 'red',
      icon: 'i-lucide-alert-triangle'
    })
  }
}

async function refreshDatabase() {
  try {
    // This could involve reloading the current database state, resetting states, etc.
    console.log("Refreshing database...");
    const systems: InformationSystem[] = FileHandler.getInformationSystems();
    console.log(selectedSystemStore.selectedId);
    console.log(systems);

    // from systems find system with current id as selectedSystemId and use its table

    for (const system of systems) {
      console.log("SYSTEM ID:", system.id);
      console.log("SELECTED ID:", selectedSystemStore.selectedId);
      if (system.id === selectedSystemStore.selectedId) {
        if (selectedSystemStore.selectedSystem) {
          selectedSystemStore.selectedSystem.tables = system.tables;
        }
        console.log("UPDATED");
        break;
      }
    }

    if (selectedSystemStore.selectedSystem) {
      await selectedSystemStore.selectedSystem.db.init(selectedSystemStore.selectedSystem.configData)
      toast.add({
        title: t('refresh_database_success') || 'Database refreshed successfully',
        color: 'primary',
        icon: 'i-lucide-check-circle'
      })
    }

  } catch {
    toast.add({
      title: t('refresh_database_error') || 'Database refresh error',
      color: 'red',
      icon: 'i-lucide-alert-triangle'
    })
  }
}


/* 12. Lifecycle */
// none

/* 13. defineExpose */
// none
</script>
