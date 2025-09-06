<template>
    <UBadge v-if="statusData" class="highlightable" :color="getSessionStatusColor()" variant="soft"
        :id="'sessions-status-' + props.sessionId"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-status-' + props.sessionId, $event)">
        {{ getSessionStatus() }}
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

const statusData = ref<{ capacity: number; participantCount: number } | null>(null)

const loadStatusData = () => {
    if (!selectedSystemStore.selectedSystem?.db) {
        console.error('Database not available')
        return
    }

    try {
        const sessionsTable = selectedSystemStore.selectedSystem.db.getTableName('sessions')
        const sessionsParticipantsTable = selectedSystemStore.selectedSystem.db.getTableName('sessions_participants')

        // Get session capacity
        const sessionQuery = selectedSystemStore.selectedSystem.db.query(
            `SELECT capacity FROM ${sessionsTable} WHERE session_id = ?`,
            [props.sessionId]
        )

        // Get participant count
        const participantQuery = selectedSystemStore.selectedSystem.db.query(
            `SELECT COUNT(*) as count FROM ${sessionsParticipantsTable} WHERE session_id = ?`,
            [props.sessionId]
        )

        if (sessionQuery.success && sessionQuery.results.length > 0 && participantQuery.success) {
            const capacity = sessionQuery.results[0].capacity
            const participantCount = participantQuery.results[0].count
            statusData.value = { capacity, participantCount }
        }
    } catch (error) {
        console.error('Error loading status data:', error)
    }
}

const getCapacityPercentage = (): number => {
    if (!statusData.value) return 0
    return Math.round((statusData.value.participantCount / statusData.value.capacity) * 100)
}

const getSessionStatus = (): string => {
    if (!statusData.value) return ''
    if (statusData.value.participantCount >= statusData.value.capacity) return t('full')
    const percentage = getCapacityPercentage()
    if (percentage >= 70) return t('almost_full')
    if (percentage > 0) return t('available')
    return t('empty')
}

const getSessionStatusColor = (): 'red' | 'yellow' | 'green' | 'neutral' => {
    if (!statusData.value) return 'neutral'
    if (statusData.value.participantCount >= statusData.value.capacity) return 'red'
    const percentage = getCapacityPercentage()
    if (percentage >= 70) return 'yellow'
    if (percentage > 0) return 'green'
    return 'neutral'
}

onMounted(() => {
    loadStatusData()
})
</script>
