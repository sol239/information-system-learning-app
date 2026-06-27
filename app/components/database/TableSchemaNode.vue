<template>
    <div
        class="table-schema-node"
        :class="{ 'table-schema-node--muted': data.isFocusMuted }"
    >
        <div class="table-schema-node__header">
            <span class="truncate">{{ data.name }}</span>
        </div>
        <div class="table-schema-node__columns">
            <div
                v-for="column in data.columns"
                :key="column.name"
                class="table-schema-node__column"
            >
                <Handle
                    type="target"
                    :id="columnHandleId('target', column.name)"
                    :position="Position.Left"
                    class="table-schema-node__handle table-schema-node__handle--left"
                />
                <Handle
                    type="source"
                    :id="columnHandleId('source', column.name)"
                    :position="Position.Right"
                    class="table-schema-node__handle table-schema-node__handle--right"
                />
                <div class="min-w-0 flex-1 truncate">
                    <span v-if="column.pk" class="table-schema-node__prefix">#</span>
                    <span v-else-if="foreignKeyColumns.has(column.name)" class="table-schema-node__prefix">*</span>
                    <span v-else class="table-schema-node__prefix">-</span>
                    <span class="font-medium">{{ column.name }}</span>
                </div>
                <span class="shrink-0 text-gray-500">{{ column.type || 'TYPE' }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

const props = defineProps<{
    data: {
        name: string
        columns: Array<{
            name: string
            type: string
            notNull: boolean
            pk: boolean
        }>
        foreignKeys: Array<{
            fromColumn: string
        }>
        isFocusMuted?: boolean
    }
}>()

const foreignKeyColumns = computed(() =>
    new Set(props.data.foreignKeys.map(foreignKey => foreignKey.fromColumn))
)

function columnHandleId(type: 'source' | 'target', columnName: string): string {
    return `${type}:${columnName}`
}
</script>

<style scoped>
.table-schema-node {
    min-width: 230px;
    max-width: 280px;
    overflow: hidden;
    border: 1.5px solid rgb(31 41 55);
    border-radius: 2px;
    background: white;
    box-shadow: none;
    color: rgb(31 41 55);
    font-family: ui-sans-serif, system-ui, sans-serif;
    transition: opacity 160ms ease, filter 160ms ease;
}

.table-schema-node--muted {
    opacity: 0.34;
    filter: grayscale(1);
}

.table-schema-node__header {
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1.5px solid rgb(31 41 55);
    background: white;
    padding: 9px 12px;
    font-size: 14px;
    font-weight: 700;
    color: rgb(15 23 42);
}

.table-schema-node__columns {
    display: flex;
    flex-direction: column;
}

.table-schema-node__column {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border-bottom: 1px solid rgb(226 232 240);
    padding: 6px 10px;
    font-size: 12px;
}

.table-schema-node__column:last-child {
    border-bottom: 0;
}

.table-schema-node__prefix {
    display: inline-block;
    width: 14px;
    color: rgb(100 116 139);
}

.table-schema-node__handle {
    top: 50%;
    height: 6px;
    width: 6px;
    min-width: 6px;
    min-height: 6px;
    transform: translateY(-50%);
    border: 0;
    background: transparent;
    opacity: 0;
    pointer-events: none;
}

.table-schema-node__handle--left {
    left: -4px;
}

.table-schema-node__handle--right {
    right: -4px;
}

</style>
