<template>
    <UBadge class="highlightable" color="sky" variant="soft"
        :id="'sessions-day-count-' + session.id"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-day-count-' + session.id, $event)">
        {{ t('days_count') }}: {{ getDayCount() }}
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

const getDayCount = (): number => {
    const start = props.session.fromDate
    const end = props.session.toDate
    const diff = end.getTime() - start.getTime()
    return Math.ceil(diff / (1000 * 3600 * 24)) + 1
}
</script>
