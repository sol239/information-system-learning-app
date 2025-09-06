<template>
    <UBadge v-if="session" class="highlightable" color="sky" variant="soft"
        :id="'sessions-day-count-' + session.id"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-day-count-' + session.id, $event)">
        {{ t('days_count') }}: {{ getDayCount() }}
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

const getDayCount = (): number => {
    if (!session.value) return 0
    const start = session.value.fromDate
    const end = session.value.toDate
    const diff = end.getTime() - start.getTime()
    return Math.ceil(diff / (1000 * 3600 * 24)) + 1
}
</script>
