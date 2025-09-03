<template>
    <USelect class="highlightable" :id="'supervisors-session-menu'"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-session-menu', $event)"
        v-model="modelValue" :items="items" @update:modelValue="$emit('update:modelValue', $event)" />
</template>

<script setup lang="ts">
import { useHighlightStore } from '#imports'

interface Props {
    modelValue: string | number
    items: Array<{ label: string; value: string | number }>
}

interface Emits {
    (e: 'update:modelValue', value: string | number): void
}

defineProps<Props>()
defineEmits<Emits>()

const highlightStore = useHighlightStore()
</script>
