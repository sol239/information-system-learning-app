<template>
    <BaseEdge
        :id="id"
        :path="path"
        :label-x="labelX"
        :label-y="labelY"
        :marker-start="markerStart"
        :marker-end="markerEnd"
        :style="style"
        :interaction-width="interactionWidth"
    />
    <circle
        :cx="sourceX"
        :cy="sourceY"
        r="4.5"
        :fill="edgeColor"
        :stroke="edgeColor"
        stroke-width="1"
        pointer-events="none"
    />
</template>

<script setup lang="ts">
import { BaseEdge, Position, getSmoothStepPath } from '@vue-flow/core'

const props = withDefaults(defineProps<{
    id: string
    sourceX: number
    sourceY: number
    targetX: number
    targetY: number
    sourcePosition?: Position
    targetPosition?: Position
    markerStart?: string
    markerEnd?: string
    interactionWidth?: number
    style?: Record<string, string | number>
}>(), {
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    interactionWidth: 20,
    markerStart: '',
    markerEnd: '',
    style: () => ({}),
})

const edgeColor = computed(() => String(props.style.stroke ?? '#1f2937'))
const pathResult = computed(() =>
    getSmoothStepPath({
        sourceX: props.sourceX,
        sourceY: props.sourceY,
        sourcePosition: props.sourcePosition,
        targetX: props.targetX,
        targetY: props.targetY,
        targetPosition: props.targetPosition,
        borderRadius: 0,
    })
)
const path = computed(() => pathResult.value[0])
const labelX = computed(() => pathResult.value[1])
const labelY = computed(() => pathResult.value[2])
</script>
