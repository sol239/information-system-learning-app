<template>
    <USelect class="highlightable" :id="'participants-session-menu'"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-session-menu', $event)"
        v-model="modelValue" :items="items" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHighlightStore } from '#imports'

interface Props {
    modelValue: string
    items: any[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
    'update:modelValue': [value: string]
}>()

const highlightStore = useHighlightStore()

const modelValue = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})
</script>
