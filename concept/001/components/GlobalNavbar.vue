<script setup lang="ts">
// Navigation bar which is used across the application.

import type { NavigationMenuItem } from '@nuxt/ui'
import { ref, computed } from 'vue'
import { useHighlightStore } from '~/stores/highlightElements'

const route = useRoute()
const highlightStore = useHighlightStore()

const items = ref<NavigationMenuItem[]>([
  {
    label: 'Home',
    icon: 'i-heroicons-home',
    to: '/',
    data_target: 'home',
  },
  {
    label: 'Systems',
    icon: 'i-heroicons-computer-desktop',
    to: '/system',
    data_target: 'systems',
  },
  {
    label: 'Settings',
    icon: 'i-heroicons-cog',
    to: '/settings',
    data_target: 'settings',
  },
])

// Check if we're on the system/[id] page
const isOnSystemDetailPage = computed(() => {
  return route.path.startsWith('/system/') && route.params.id
})
</script>

<template>
  <div class="flex items-center w-full justify-between text-lg py-4 px-4 text-black border-b border-gray-200">
    <!-- Navigation Menu on the left/center -->
    <UNavigationMenu :items="items" class="flex-grow justify-start" />


    <!-- Tasks Popover - Only visible on /system/[id] pages -->
    <UPopover v-if="isOnSystemDetailPage" arrow>

      <UButton label="Tasks" color="primary" variant="subtle" />

      <template #content>
        <TaskList />
      </template>
    </UPopover>

    <UButton
      :label="highlightStore.isHighlightMode ? 'Disable Highlight' : 'Enable Highlight'"
      color="secondary"
      :variant="highlightStore.isHighlightMode ? 'solid' : 'subtle'"
      style="margin-left: 10px"
      @click="highlightStore.toggleHighlight"
    />
  </div>
</template>
