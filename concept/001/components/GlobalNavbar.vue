<script setup lang="ts">
// Navigation bar which is used across the application.

import type { NavigationMenuItem } from '@nuxt/ui'

const items = ref<NavigationMenuItem[]>( [
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

</script>

<template>
  <div class="flex items-center w-full justify-between text-lg py-4 px-4 text-black border-b border-gray-200">
    <!-- Navigation Menu on the left/center -->
    <UNavigationMenu :items="items" class="flex-grow justify-start" />
  </div>
</template>
