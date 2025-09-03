<template>
    <span class="text-sm font-medium text-gray-700 highlightable" :id="'participants-capacity-count'"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-capacity-count', $event)">
        {{ t('capacity') }}: {{ currentCount }}/{{ totalCapacity }}
    </span>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useHighlightStore } from '#imports'

interface Props {
    currentCount: number
    totalCapacity: number
}

const props = defineProps<Props>()
const { t } = useI18n()
const highlightStore = useHighlightStore()
</script>
