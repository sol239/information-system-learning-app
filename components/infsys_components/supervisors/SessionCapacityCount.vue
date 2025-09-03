<template>
    <span class="text-sm font-medium text-gray-700 highlightable" :id="'supervisors-capacity-count'"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-capacity-count', $event)">
        {{ t('supervisors') }}: {{ currentCount }}
    </span>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useHighlightStore } from '#imports'

interface Props {
    currentCount: number
    totalCapacity?: number
}

defineProps<Props>()

const { t } = useI18n()
const highlightStore = useHighlightStore()
</script>
