<template>
    <div class="highlightable" id="supervisors-filter-input"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-filter-input', $event)">
        <UInput v-model="modelValue" color="violet" :placeholder="placeholder"
            size="sm" @update:modelValue="$emit('update:modelValue', $event)" />
    </div>
</template>

<script setup lang="ts">
import { useHighlightStore } from '#imports'

interface Props {
    modelValue: string
    placeholder: string
}

interface Emits {
    (e: 'update:modelValue', value: string): void
}

defineProps<Props>()
defineEmits<Emits>()

const highlightStore = useHighlightStore()
</script>
