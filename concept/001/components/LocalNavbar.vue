<script setup lang="ts">
/* 1. Imports */
import type { NavigationMenuItem } from '@nuxt/ui'

/* 2. Stores */
// none

/* 3. Context hooks */
// none

/* 4. Constants (non-reactive) */
// none

/* 5. Props */
const props = defineProps<{
  items: NavigationMenuItem[]
}>()

/* 6. Emits */
// none

/* 7. Template refs */
// none

/* 8. Local state (ref, reactive) */
// none

/* 9. Computed */
// none

/* 10. Watchers */
// none

/* 11. Methods */
// none

/* 12. Lifecycle */
// none

/* 13. defineExpose */
// none
</script>

<template>
  <UNavigationMenu orientation="horizontal" :items="props.items" class="data-[orientation=vertical]:w-48" />
</template>