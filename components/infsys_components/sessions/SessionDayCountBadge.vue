<template>
    <UBadge v-if="dayCount !== null" class="highlightable" color="sky" variant="soft"
        :id="'sessions-day-count-' + props.sessionId"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-day-count-' + props.sessionId, $event)">
        {{ t('days_count') }}: {{ dayCount }}
    </UBadge>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHighlightStore } from '#imports'
import { useSelectedSystemStore } from '#imports'

interface Props {
    sessionId: number
}

const props = defineProps<Props>()
const { t } = useI18n()
const highlightStore = useHighlightStore()
const selectedSystemStore = useSelectedSystemStore()

const dayCount = ref<number | null>(null)

const loadDayCount = () => {
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
            const start = new Date(row.from_date)
            const end = new Date(row.to_date)
            const diff = end.getTime() - start.getTime()
            dayCount.value = Math.ceil(diff / (1000 * 3600 * 24)) + 1
        }
    } catch (error) {
        console.error('Error loading day count:', error)
    }
}

onMounted(() => {
    loadDayCount()
})
</script>
