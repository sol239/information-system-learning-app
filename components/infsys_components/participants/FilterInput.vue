<template>
    <div class="highlightable" id="participants-filter-input"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-filter-input', $event)">
        <UInput v-model="modelValue" color="sky" :placeholder="placeholder"
            size="sm" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHighlightStore } from '#imports'

interface Props {
    modelValue: string
    placeholder: string
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
