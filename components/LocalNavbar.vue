<script setup lang="ts">
/* 1. Imports */
import type { NavigationMenuItem } from '@nuxt/ui'
import { ref } from 'vue'
import { useSelectedSystemStore } from '#imports'

/* 2. Stores */
// none

/* 3. Context hooks */
// none

/* 4. Constants (non-reactive) */
const { t } = useI18n()
/* 5. Props */
// Removed items prop as per the code change

/* 6. Emits */
// none

/* 7. Template refs */
// none

/* 8. Local state (ref, reactive) */
const selectedSystemStore = useSelectedSystemStore()

const localItems = ref<NavigationMenuItem[]>([
    {
        label: t('dashboard'),
        icon: 'i-heroicons-chart-bar-20-solid',
        to: `/system/${selectedSystemStore.selectedId}/dashboard`,
        data_target: 'system-dashboard',
    }, 
    {
        label: t('sessions'),
        icon: 'i-heroicons-calendar-date-range',
        to: `/system/${selectedSystemStore.selectedId}/sessions`,
        data_target: 'system-sessions',
    },
    {
        label: t('participants'),
        to: `/system/${selectedSystemStore.selectedId}/participants`,
        data_target: 'system-participants',
    },
    {
        label: t('supervisors'),
        to: `/system/${selectedSystemStore.selectedId}/supervisors`,
        data_target: 'system-supervisors',
    },
    {
        label: t('database'),
        icon: 'i-heroicons-table-cells',
        to: `/system/${selectedSystemStore.selectedId}/database`,
        data_target: 'system-table',
    },
    {
        label: t('meals'),
        to: `/system/${selectedSystemStore.selectedId}/meals`,
        data_target: 'system-meals',
    }
])

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
  <UNavigationMenu orientation="horizontal" :items="localItems" class="data-[orientation=vertical]:w-48" />
</template>