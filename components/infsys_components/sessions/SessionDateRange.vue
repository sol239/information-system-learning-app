<template>
    <span class="highlightable" :id="'sessions-date-' + session.id"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-date-' + session.id, $event)">
        <UIcon name="i-heroicons-calendar-days" class="inline-block mr-1" />
        {{ formatDateRange(session.fromDate, session.toDate) }}
    </span>
</template>

<script setup lang="ts">
import { useHighlightStore } from '#imports'

interface Props {
    session: any
    formatDateRange: (fromDate: Date, toDate: Date) => string
}

const props = defineProps<Props>()
const highlightStore = useHighlightStore()
</script>
