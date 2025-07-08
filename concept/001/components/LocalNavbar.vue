<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { defineProps } from 'vue'

const props = defineProps<{
  items: NavigationMenuItem[]
}>()
</script>

<template>
  <UNavigationMenu orientation="vertical" :items="props.items" class="data-[orientation=vertical]:w-48" />
</template>