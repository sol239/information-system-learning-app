<template>
    <UBadge v-if="session" class="highlightable" :color="getSessionStatusColor()" variant="soft"
        :id="'sessions-status-' + session.id"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-status-' + session.id, $event)">
        {{ getSessionStatus() }}
    </UBadge>
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

const getCapacityPercentage = (session: any): number => {
    return Math.round((session.participants.length / session.capacity) * 100)
}

const getSessionStatus = (): string => {
    if (!session.value) return ''
    if (session.value.ifFull()) return t('full')
    const percentage = getCapacityPercentage(session.value)
    if (percentage >= 70) return t('almost_full')
    if (percentage > 0) return t('available')
    return t('empty')
}

const getSessionStatusColor = (): 'red' | 'yellow' | 'green' | 'neutral' => {
    if (!session.value) return 'neutral'
    if (session.value.ifFull()) return 'red'
    const percentage = getCapacityPercentage(session.value)
    if (percentage >= 70) return 'yellow'
    if (percentage > 0) return 'green'
    return 'neutral'
}
</script>
