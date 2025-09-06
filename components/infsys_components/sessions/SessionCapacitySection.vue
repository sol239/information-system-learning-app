<template>
    <div v-if="session" class="capacity-section mb-6 highlightable" :id="'sessions-capacity-' + session.id"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-capacity-' + session.id, $event)">
        <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">{{ t('capacity') }}</span>
            <span class="text-sm text-gray-600">
                {{ session.participants.length }}/{{ session.capacity }}
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
import { computed } from 'vue'
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

const session = computed(() => selectedSystemStore.sessions.find(s => s.id === props.sessionId))

const getCapacityPercentage = (): number => {
    if (!session.value) return 0
    return Math.round((session.value.participants.length / session.value.capacity) * 100)
}

const getCapacityColor = (): string => {
    if (!session.value) return '#10b981'
    const percentage = getCapacityPercentage()
    if (percentage >= 90) return '#ef4444' // red
    if (percentage >= 70) return '#f59e0b' // amber
    return '#10b981' // emerald
}
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
