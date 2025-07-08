<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

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

</script>

<template>
    <UNavigationMenu orientation="vertical" :items="items" class="data-[orientation=vertical]:w-48" />
</template>
