<template>
    <UButton class="highlightable" id="supervisors-filter-reset" variant="outline" color="violet"
        size="sm" @click="onClick" icon="i-lucide-rotate-ccw"
        @click.stop="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-filter-reset', $event)">
    </UButton>
</template>

<script setup lang="ts">
import { useHighlightStore } from '#imports'

interface Props {
    onClick: () => void
}

defineProps<Props>()

const highlightStore = useHighlightStore()
</script>
