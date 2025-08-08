<template>
  <div class="flex items-center w-full justify-between text-lg py-4 px-4 text-black border-b border-gray-200">
    <!-- Navigation Menu on the left/center -->
    <UNavigationMenu :items="items" class="flex-grow justify-start" />

    <UButton label="Helper" @click="handleHelperClick"></UButton>

    <UBadge v-if="isOnSystemDetailPage" color="error" variant="outline" size="xl" style="margin-right: 10px;">
      {{ $t('score') }}: {{ scoreStore.score }}
    </UBadge>

    <!-- Tasks Popover - Only visible on /system/[id] pages -->
    <UPopover v-if="isOnSystemDetailPage" arrow>
      <UButton :label="$t('tasks')" color="primary" variant="subtle" />

      <template #content>
        <TaskList />
      </template>
    </UPopover>
    <UButton 
      v-if="isOnSystemDetailPage"
      :label="highlightStore.isHighlightMode ? $t('disable_highlight') : $t('enable_highlight')" 
      color="secondary"
      :variant="highlightStore.isHighlightMode ? 'solid' : 'subtle'" 
      style="margin-left: 10px"
      @click="highlightStore.toggleHighlight" 
    />
  </div>
</template>

<script setup lang="ts">
/* 1. Imports */
import { computed } from 'vue'
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
// none

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
// none

/* 11. Methods */
function handleHelperClick() {
  // Placeholder for helper click logic


  const selectedTaskId = selectedTaskStore.selectedId;
  const systemId = selectedSystemStore.selectedId;
  console.log(TaskQueue.getSelectedTaskErrorComponentFilenames(selectedTaskId, systemId))
}

/* 12. Lifecycle */
// none

/* 13. defineExpose */
// none
</script>
