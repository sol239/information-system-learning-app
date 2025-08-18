<template>

    <LocalNavbar :items="localItems" class />
</template>

<script setup lang="ts">

import { useSelectedSystemStore } from '#imports';

const selectedSystemStore = useSelectedSystemStore()

const {t} = useI18n()


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
        to: `/system/${selectedSystemStore.selectedId}/session`,
        data_target: 'system-sessions',
    },
    {
        label: t('database'),
        icon: 'i-heroicons-table-cells',
        to: `/system/${selectedSystemStore.selectedId}/database`,
        data_target: 'system-table',
    }
])

</script>