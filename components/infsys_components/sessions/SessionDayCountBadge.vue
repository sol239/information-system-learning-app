<template>
    <UBadge class="highlightable" color="sky" variant="soft"
        :id="'sessions-day-count-' + session.id"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-day-count-' + session.id, $event)">
        {{ t('days_count') }}: {{ getDayCount(session) }}
    </UBadge>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useHighlightStore } from '#imports'

interface Props {
    session: any
    getDayCount: (session: any) => number
}

const props = defineProps<Props>()
const { t } = useI18n()
const highlightStore = useHighlightStore()
</script>
