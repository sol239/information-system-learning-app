<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { computed } from 'vue'
import { useHighlightStore } from '~/stores/highlightElements'

const route = useRoute()
const highlightStore = useHighlightStore()
const { t } = useI18n()

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
</script>

<template>
  <div class="flex items-center w-full justify-between text-lg py-4 px-4 text-black border-b border-gray-200">
    <!-- Navigation Menu on the left/center -->
    <UNavigationMenu :items="items" class="flex-grow justify-start" />


    <!-- Tasks Popover - Only visible on /system/[id] pages -->
    <UPopover v-if="isOnSystemDetailPage" arrow>

      <UButton :label="$t('tasks')" color="primary" variant="subtle" />

      <template #content>
        <TaskList />
      </template>
    </UPopover>

    <UButton v-if="isOnSystemDetailPage"
      :label="highlightStore.isHighlightMode ? $t('disable_highlight') : $t('enable_highlight')" color="secondary"
      :variant="highlightStore.isHighlightMode ? 'solid' : 'subtle'" style="margin-left: 10px"
      @click="highlightStore.toggleHighlight" />
  </div>
</template>
