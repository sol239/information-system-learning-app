<template>
  <div class="flex items-center w-full justify-between text-lg py-4 px-4 text-black" style="border-bottom: 1px; border-color: #05df72; border-bottom-style: solid;">
    <!-- Navigation Menu on the left/center -->
    <UNavigationMenu :items="items" class="flex-grow justify-start" style="z-index: 10000;"/>

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
    <UButton 
      v-if="isOnSystemDetailPage"
      :label="highlightStore.isHighlightMode ? $t('disable_highlight') : $t('enable_highlight')" 
      color="lime"
      :variant="highlightStore.isHighlightMode ? 'solid' : 'subtle'" 
      style="margin-left: 10px"
      @click="highlightStore.toggleHighlight" 
    />
    <UButton 
      v-if="isOnSystemDetailPage"
      :label="highlightStore.isEditModeActive ? $t('disable_edit') : $t('enable_edit')" 
      color="yellow"
      :variant="highlightStore.isEditModeActive ? 'solid' : 'subtle'" 
      style="margin-left: 10px"
      @click="highlightStore.toggleEdit" 
    />
  </div>
</template>

<script setup lang="ts">
/* 1. Imports */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { NavigationMenuItem } from '@nuxt/ui'
import { useHighlightStore } from '~/stores/useHighlightStore'
import { ComponentHandler, TaskQueue, useScoreStore } from '#imports'
import { useErrorComponentStore } from '#imports'
import { Task } from '~/model/Task'
import { useSelectedTaskStore } from '#imports'
import { useSelectedSystemStore } from '#imports'
/* 2. Stores */
const highlightStore = useHighlightStore()
const scoreStore = useScoreStore()
const errorComponentStore = useErrorComponentStore()
const selectedTaskStore = useSelectedTaskStore()
const selectedSystemStore = useSelectedSystemStore()
import { useValuatorStore } from '#imports';
import { useComponentCodeStore } from '#imports';

useValuatorStore()
const componentCodeStore = useComponentCodeStore()

/* 3. Context hooks */
const route = useRoute()
const { t } = useI18n()

/* 4. Constants (non-reactive) */
// none

/* 5. Props */
// none

/* 6. Emits */
// none

/* 7. Template refs */
// none

/* 8. Local state (ref, reactive) */
const tasksPopoverOpen = ref(false)

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
  //console.log(componentCodeStore.getComponentCode("stats-supervisors-sql.vue"));
  console.log(componentCodeStore.actualComponentCodeMap);
  console.log(ComponentHandler.isInErrorComponents("stats-supervisors.vue"));
}

/* 12. Lifecycle */
// none

/* 13. defineExpose */
// none
</script>
