<template>
    <UBadge class="highlightable" :color="getSessionStatusColor()" variant="soft"
        :id="'sessions-status-' + session.id"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-status-' + session.id, $event)">
        {{ getSessionStatus() }}
    </UBadge>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useHighlightStore } from '#imports'

interface Props {
    session: any
}

const props = defineProps<Props>()
const { t } = useI18n()
const highlightStore = useHighlightStore()

const getCapacityPercentage = (session: any): number => {
    return Math.round((session.participants.length / session.capacity) * 100)
}

const getSessionStatus = (): string => {
    if (props.session.ifFull()) return t('full')
    const percentage = getCapacityPercentage(props.session)
    if (percentage >= 70) return t('almost_full')
    if (percentage > 0) return t('available')
    return t('empty')
}

const getSessionStatusColor = (): 'red' | 'yellow' | 'green' | 'neutral' => {
    if (props.session.ifFull()) return 'red'
    const percentage = getCapacityPercentage(props.session)
    if (percentage >= 70) return 'yellow'
    if (percentage > 0) return 'green'
    return 'neutral'
}
</script>
