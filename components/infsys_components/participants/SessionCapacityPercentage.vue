<template>
    <UBadge :color="getCapacityBadgeColor(fillPercentage)" variant="soft" size="sm" class="highlightable"
        :id="'participants-capacity-percentage'"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-capacity-percentage', $event)">
        {{ Math.round(fillPercentage) }}%
    </UBadge>
</template>

<script setup lang="ts">
import { useHighlightStore } from '#imports'

interface Props {
    fillPercentage: number
}

const props = defineProps<Props>()
const highlightStore = useHighlightStore()

const getCapacityBadgeColor = (percentage: number): 'red' | 'yellow' | 'green' => {
    if (percentage >= 90) return 'red'
    if (percentage >= 70) return 'yellow'
    return 'green'
}
</script>
