<template>
    <span v-if="dateRange" class="highlightable" :id="'sessions-date-' + props.sessionId"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-date-' + props.sessionId, $event)">
        <UIcon name="i-heroicons-calendar-days" class="inline-block mr-1" />
        {{ formatDateRange(dateRange.fromDate, dateRange.toDate) }}
    </span>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHighlightStore } from '#imports'
import { useSelectedSystemStore } from '#imports'

interface Props {
    sessionId: number
}

const props = defineProps<Props>()
const highlightStore = useHighlightStore()
const selectedSystemStore = useSelectedSystemStore()

const dateRange = ref<{ fromDate: Date; toDate: Date } | null>(null)

const loadDateRange = () => {
    if (!selectedSystemStore.selectedSystem?.db) {
        console.error('Database not available')
        return
    }

    try {
        const sessionsTable = selectedSystemStore.selectedSystem.db.getTableName('sessions')
        const query = selectedSystemStore.selectedSystem.db.query(
            `SELECT from_date, to_date FROM ${sessionsTable} WHERE session_id = ?`,
            [props.sessionId]
        )

        if (query.success && query.results.length > 0) {
            const row = query.results[0]
            dateRange.value = {
                fromDate: new Date(row.from_date),
                toDate: new Date(row.to_date)
            }
        }
    } catch (error) {
        console.error('Error loading date range:', error)
    }
}

const formatDateRange = (fromDate: Date, toDate: Date): string => {
    const from = fromDate.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })
    const to = toDate.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric' })
    return `${from} - ${to}`
}

onMounted(() => {
    loadDateRange()
})
</script>
