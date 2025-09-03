<template>
    <UButton class="highlightable" id="participants-filter-reset" variant="outline" color="sky"
        size="sm" @click="handleClick" icon="i-lucide-rotate-ccw"
        @click.stop="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-filter-reset', $event)">
    </UButton>
</template>

<script setup lang="ts">
import { useHighlightStore } from '#imports'

interface Props {
    onClick: () => void
}

const props = defineProps<Props>()
const highlightStore = useHighlightStore()

const handleClick = () => {
    if (!highlightStore.isHighlightMode) {
        props.onClick()
    }
}
</script>
