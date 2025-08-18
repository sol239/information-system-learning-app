<script setup lang="ts">
/* 1. Imports */
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import type { InformationSystem } from '~/model/InformationSystem'
import { useI18n } from '#imports'
import { useSelectedSystemStore } from '#imports'

/* 2. Stores */
const store = useInformationSystemStore()
const selectedSystemStore = useSelectedSystemStore()

/* 3. Context hooks */
const route = useRoute()
const { locales, setLocale } = useI18n()

/* 4. Constants (non-reactive) */
const systemId = route.params.id
const systems = store.systems
const { t } = useI18n()

/* 5. Props */
// none

/* 6. Emits */
// none

/* 7. Template refs */
// none

/* 8. Local state (ref, reactive) */
const system = ref<InformationSystem | null>(null)

/* 9. Computed */
const localItems = ref([
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
    }
])
/* 10. Watchers */
// none

/* 11. Methods */
function initializeSystem() {
  system.value = systems.find(sys => sys.id === parseInt(systemId as string, 10)) || null
  
  // logging for debugging purposes
  console.log('System ID:', systemId);
  console.log('Available Systems:', systems);
  console.log('Current System:', system.value);
}

/* 12. Lifecycle */
onMounted(() => {
  initializeSystem()
})

/* 13. defineExpose */
// none
</script>

<template>
  <LocalNavbar :items="localItems" />
</template>