<template>
    <UBadge class="highlightable" :color="getSessionStatusColor(session)" variant="soft"
        :id="'sessions-status-' + session.id"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-status-' + session.id, $event)">
        {{ getSessionStatus(session) }}
    </UBadge>
</template>

<script setup lang="ts">
import { useHighlightStore } from '#imports'

interface Props {
    session: any
    getSessionStatus: (session: any) => string
    getSessionStatusColor: (session: any) => 'red' | 'yellow' | 'green' | 'neutral'
}

const props = defineProps<Props>()
const highlightStore = useHighlightStore()
</script>
