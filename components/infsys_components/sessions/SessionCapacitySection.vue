<template>
    <div v-if="capacityData" class="capacity-section mb-6 highlightable" :id="'sessions-capacity-' + props.sessionId"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-capacity-' + props.sessionId, $event)">
        <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">{{ t('capacity') }}</span>
            <span class="text-sm text-gray-600">
                {{ capacityData.participantCount }}/{{ capacityData.capacity }}
            </span>
        </div>
        <div class="capacity-bar">
            <div class="capacity-fill" :style="{
                width: getCapacityPercentage() + '%',
                backgroundColor: getCapacityColor()
            }"></div>
        </div>
        <div class="text-xs text-gray-500 mt-1">
            {{ getCapacityPercentage() }}% {{ t('occupied') }}
        </div>
    </div>
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

const capacityData = ref<{ capacity: number; participantCount: number } | null>(null)

const loadCapacityData = () => {
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
            capacityData.value = { capacity, participantCount }
        }
    } catch (error) {
        console.error('Error loading capacity data:', error)
    }
}

const getCapacityPercentage = (): number => {
    if (!capacityData.value) return 0
    return Math.round((capacityData.value.participantCount / capacityData.value.capacity) * 100)
}

const getCapacityColor = (): string => {
    if (!capacityData.value) return '#10b981'
    const percentage = getCapacityPercentage()
    if (percentage >= 90) return '#ef4444' // red
    if (percentage >= 70) return '#f59e0b' // amber
    return '#10b981' // emerald
}

onMounted(() => {
    loadCapacityData()
})
</script>

<style scoped>
.capacity-section {
    margin-bottom: 1.5rem;
}

.capacity-bar {
    width: 100%;
    background-color: #e5e7eb;
    border-radius: 9999px;
    height: 0.5rem;
    overflow: hidden;
}

.capacity-fill {
    height: 100%;
    transition: all 0.5s ease-out;
    border-radius: 9999px;
}
</style>
