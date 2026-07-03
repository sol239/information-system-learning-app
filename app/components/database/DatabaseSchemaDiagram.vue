<template>
    <div class="h-full overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div v-if="schemaError" class="flex h-full items-center justify-center px-6 text-center text-sm text-red-500">
            {{ schemaError }}
        </div>
        <div v-else-if="!schema.length" class="flex h-full flex-col items-center justify-center text-gray-400">
            <UIcon name="i-lucide-git-fork" class="mb-2 h-10 w-10" />
            <span>{{ t('task_list_empty') }}</span>
        </div>
        <VueFlow
            v-else
            v-model:nodes="nodes"
            v-model:edges="edges"
            class="database-schema-flow"
            fit-view-on-init
            :node-types="nodeTypes"
            :edge-types="edgeTypes"
            :min-zoom="0.2"
            :max-zoom="1.6"
            :nodes-draggable="false"
            :nodes-connectable="false"
            :elements-selectable="false"
            :edges-updatable="false"
            :nodes-focusable="false"
            :edges-focusable="false"
            @pane-ready="handlePaneReady"
            @nodes-initialized="fitDiagram"
            @node-click="handleNodeClick"
            @pane-click="clearFocusedTable"
        >
            <Background :gap="18" />
            <Controls :show-interactive="false" />

            <template #node-table-node="nodeProps">
                <TableSchemaNode v-bind="nodeProps" />
            </template>
        </VueFlow>
    </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Database } from 'sql.js'
import { VueFlow } from '@vue-flow/core'
import type { VueFlowStore } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import TableSchemaNode from './TableSchemaNode.vue'
import TableRelationshipEdge from './TableRelationshipEdge.vue'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'

type SchemaColumn = {
    cid: number
    name: string
    type: string
    notNull: boolean
    defaultValue: string | number | null
    pk: boolean
}

type SchemaForeignKey = {
    fromColumn: string
    toTable: string
    toColumn: string
}

type SchemaTable = {
    name: string
    columns: SchemaColumn[]
    foreignKeys: SchemaForeignKey[]
}

const props = defineProps<{
    database: Database | null | undefined
    schemaVersion?: number
}>()

const { t } = useI18n()
const schema = ref<SchemaTable[]>([])
const schemaError = ref('')
const nodes = ref<any[]>([])
const edges = ref<any[]>([])
const focusedTable = ref<string | null>(null)
const flowStore = shallowRef<VueFlowStore | null>(null)
const nodeTypes = {
    'table-node': markRaw(TableSchemaNode),
}
const edgeTypes = {
    'table-relationship': markRaw(TableRelationshipEdge),
}

watch(
    () => [props.database, props.schemaVersion] as const,
    () => {
        loadSchema()
    },
    { immediate: true }
)

function loadSchema() {
    schemaError.value = ''
    schema.value = []
    nodes.value = []
    edges.value = []
    focusedTable.value = null

    if (!props.database) {
        return
    }

    try {
        const nextSchema = extractSchema(props.database)
        const flow = schemaToFlow(nextSchema)
        schema.value = nextSchema
        nodes.value = flow.nodes
        edges.value = flow.edges
        fitDiagram()
    } catch (error) {
        schemaError.value = `Schéma databáze se nepodařilo načíst: ${String(error)}`
    }
}

function handleNodeClick({ node }: { node: { id: string } }) {
    focusedTable.value = focusedTable.value === node.id ? null : node.id
    applyDiagramFocus()
}

function clearFocusedTable() {
    focusedTable.value = null
    applyDiagramFocus()
}

function applyDiagramFocus() {
    const tableName = focusedTable.value
    const connectedTables = tableName ? connectedTableNames(tableName) : new Set<string>()
    const connectedEdgeIds = tableName ? connectedRelationshipIds(tableName) : new Set<string>()

    nodes.value = nodes.value.map(node => {
        const isMuted = Boolean(tableName) && !connectedTables.has(node.id)

        return {
            ...node,
            zIndex: isMuted ? 0 : 20,
            data: {
                ...node.data,
                isFocusMuted: isMuted,
            },
        }
    })

    edges.value = edges.value.map(edge => {
        const baseColor = String(edge.data?.color ?? edge.style?.stroke ?? '#1f2937')
        const hasFocus = Boolean(tableName)
        const isMuted = hasFocus && !connectedEdgeIds.has(edge.id)
        const color = isMuted ? '#cbd5e1' : baseColor

        return {
            ...edge,
            zIndex: hasFocus && !isMuted ? 80 : 1,
            data: {
                ...edge.data,
                color: baseColor,
                isFocusMuted: isMuted,
            },
            style: {
                ...edge.style,
                stroke: color,
                strokeWidth: isMuted ? 1.5 : 2,
            },
        }
    })
}

function connectedTableNames(tableName: string): Set<string> {
    const names = new Set([tableName])

    for (const edge of edges.value) {
        if (edge.source === tableName) {
            names.add(edge.target)
        }
        if (edge.target === tableName) {
            names.add(edge.source)
        }
    }

    return names
}

function connectedRelationshipIds(tableName: string): Set<string> {
    const ids = new Set<string>()

    for (const edge of edges.value) {
        if (edge.source === tableName || edge.target === tableName) {
            ids.add(edge.id)
        }
    }

    return ids
}

function handlePaneReady(store: VueFlowStore) {
    flowStore.value = store
    fitDiagram()
}

async function fitDiagram() {
    if (!import.meta.client) {
        return
    }

    await nextTick()
    window.requestAnimationFrame(() => {
        flowStore.value?.fitView({
            padding: 0.2,
            duration: 250,
        })
    })
}

function extractSchema(db: Database): SchemaTable[] {
    const tablesResult = db.exec(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
          AND name NOT LIKE 'sqlite_%'
        ORDER BY name
    `)
    const tableNames = (tablesResult[0]?.values ?? [])
        .map(row => String(row[0] ?? ''))
        .filter(Boolean)

    const schema = tableNames.map(tableName => {
        const tableInfoResult = db.exec(`PRAGMA table_info(${quoteSqlIdentifier(tableName)})`)
        const foreignKeysResult = db.exec(`PRAGMA foreign_key_list(${quoteSqlIdentifier(tableName)})`)

        return {
            name: tableName,
            columns: (tableInfoResult[0]?.values ?? []).map(row => ({
                cid: Number(row[0] ?? 0),
                name: String(row[1] ?? ''),
                type: String(row[2] ?? ''),
                notNull: Number(row[3] ?? 0) === 1,
                defaultValue: normalizeSqlValue(row[4]),
                pk: Number(row[5] ?? 0) > 0,
            })),
            foreignKeys: (foreignKeysResult[0]?.values ?? []).map(row => ({
                toTable: String(row[2] ?? ''),
                fromColumn: String(row[3] ?? ''),
                toColumn: String(row[4] ?? ''),
            })).filter(foreignKey => foreignKey.toTable && foreignKey.fromColumn),
        }
    })

    const hasDeclaredForeignKeys = schema.some(table => table.foreignKeys.length > 0)
    return hasDeclaredForeignKeys ? schema : addInferredForeignKeys(schema)
}

function addInferredForeignKeys(nextSchema: SchemaTable[]): SchemaTable[] {
    const primaryColumnTargets = new Map<string, { tableName: string; columnName: string }>()

    for (const table of nextSchema) {
        for (const column of table.columns) {
            if (column.pk) {
                primaryColumnTargets.set(column.name, {
                    tableName: table.name,
                    columnName: column.name,
                })
            }
        }
    }

    return nextSchema.map(table => {
        const existingForeignKeys = new Set(
            table.foreignKeys.map(foreignKey => `${foreignKey.fromColumn}:${foreignKey.toTable}:${foreignKey.toColumn}`)
        )
        const inferredForeignKeys: SchemaForeignKey[] = []

        for (const column of table.columns) {
            const target = primaryColumnTargets.get(column.name)
            if (!target || target.tableName === table.name) {
                continue
            }

            const key = `${column.name}:${target.tableName}:${target.columnName}`
            if (existingForeignKeys.has(key)) {
                continue
            }

            inferredForeignKeys.push({
                fromColumn: column.name,
                toTable: target.tableName,
                toColumn: target.columnName,
            })
        }

        return {
            ...table,
            foreignKeys: [
                ...table.foreignKeys,
                ...inferredForeignKeys,
            ],
        }
    })
}

function schemaToFlow(nextSchema: SchemaTable[]) {
    const positions = schemaLayout(nextSchema)
    const nodes = nextSchema.map(table => ({
        id: table.name,
        type: 'table-node',
        position: positions.get(table.name) ?? { x: 0, y: 0 },
        zIndex: 20,
        data: table,
    }))

    const edges = nextSchema.flatMap(table =>
        table.foreignKeys.map((foreignKey, index) => {
            const id = `${table.name}-${foreignKey.fromColumn}-${foreignKey.toTable}-${index}`
            const color = relationshipColor(id)

            return {
                id,
                source: table.name,
                target: foreignKey.toTable,
                sourceHandle: columnHandleId('source', foreignKey.fromColumn),
                targetHandle: columnHandleId('target', foreignKey.toColumn || 'id'),
                type: 'table-relationship',
                animated: false,
                selectable: false,
                updatable: false,
                focusable: false,
                zIndex: 1,
                data: {
                    color,
                    isFocusMuted: false,
                },
                style: {
                    stroke: color,
                    strokeWidth: 2,
                },
            }
        })
    )

    return { nodes, edges }
}

function columnHandleId(type: 'source' | 'target', columnName: string): string {
    return `${type}:${columnName}`
}

function schemaLayout(nextSchema: SchemaTable[]): Map<string, { x: number; y: number }> {
    const tableByName = new Map(nextSchema.map(table => [table.name, table]))
    const adjacency = new Map<string, Set<string>>()

    for (const table of nextSchema) {
        adjacency.set(table.name, new Set())
    }

    for (const table of nextSchema) {
        for (const foreignKey of table.foreignKeys) {
            if (!tableByName.has(foreignKey.toTable) || foreignKey.toTable === table.name) {
                continue
            }

            adjacency.get(table.name)?.add(foreignKey.toTable)
            adjacency.get(foreignKey.toTable)?.add(table.name)
        }
    }

    const layers: string[][] = []
    const unplaced = new Set(nextSchema.map(table => table.name))
    let previousLayer: string[] = []

    while (unplaced.size > 0) {
        const nextLayer = previousLayer.length
            ? directUnplacedNeighbors(previousLayer, adjacency, unplaced)
            : strongestUnplacedTables(unplaced, adjacency, 2)

        const layer = nextLayer.length ? nextLayer : strongestUnplacedTables(unplaced, adjacency, 2)
        const sortedLayer = sortLayerByPreviousConnections(layer, previousLayer, adjacency)

        for (const name of sortedLayer) {
            unplaced.delete(name)
        }

        layers.push(sortedLayer)
        previousLayer = sortedLayer
    }

    const positions = new Map<string, { x: number; y: number }>()
    const horizontalGap = 360
    const rowGap = 90
    let currentY = 0

    layers.forEach((names) => {
        const totalWidth = Math.max(0, (names.length - 1) * horizontalGap)
        names.forEach((name, index) => {
            positions.set(name, {
                x: index * horizontalGap - totalWidth / 2,
                y: currentY,
            })
        })

        currentY += Math.max(...names.map(name => estimatedTableNodeHeight(tableByName.get(name)))) + rowGap
    })

    return positions
}

function estimatedTableNodeHeight(table: SchemaTable | undefined): number {
    const headerHeight = 39
    const columnHeight = 30
    return headerHeight + (table?.columns.length ?? 0) * columnHeight
}

function directUnplacedNeighbors(
    sourceLayer: string[],
    adjacency: Map<string, Set<string>>,
    unplaced: Set<string>,
): string[] {
    const neighbors = new Set<string>()

    for (const source of sourceLayer) {
        for (const neighbor of adjacency.get(source) ?? []) {
            if (unplaced.has(neighbor)) {
                neighbors.add(neighbor)
            }
        }
    }

    return Array.from(neighbors)
}

function strongestUnplacedTables(
    unplaced: Set<string>,
    adjacency: Map<string, Set<string>>,
    limit: number,
): string[] {
    return Array.from(unplaced)
        .sort((a, b) => nodeWeight(b, adjacency) - nodeWeight(a, adjacency) || a.localeCompare(b))
        .slice(0, limit)
}

function sortLayerByPreviousConnections(
    layer: string[],
    previousLayer: string[],
    adjacency: Map<string, Set<string>>,
): string[] {
    const previousOrder = new Map(previousLayer.map((name, index) => [name, index]))

    return [...layer].sort((a, b) => {
        const aScore = previousLayerScore(a, adjacency, previousOrder)
        const bScore = previousLayerScore(b, adjacency, previousOrder)

        return aScore - bScore || nodeWeight(b, adjacency) - nodeWeight(a, adjacency) || a.localeCompare(b)
    })
}

function previousLayerScore(
    name: string,
    adjacency: Map<string, Set<string>>,
    previousOrder: Map<string, number>,
): number {
    const connectedPreviousIndexes = Array.from(adjacency.get(name) ?? [])
        .map(neighbor => previousOrder.get(neighbor))
        .filter((index): index is number => typeof index === 'number')

    if (!connectedPreviousIndexes.length) {
        return Number.POSITIVE_INFINITY
    }

    return connectedPreviousIndexes.reduce((sum, index) => sum + index, 0) / connectedPreviousIndexes.length
}

function nodeWeight(
    name: string,
    adjacency: Map<string, Set<string>>,
): number {
    return adjacency.get(name)?.size ?? 0
}

function quoteSqlIdentifier(identifier: string): string {
    return `"${identifier.replace(/"/g, '""')}"`
}

function normalizeSqlValue(value: unknown): string | number | null {
    if (typeof value === 'string' || typeof value === 'number') {
        return value
    }
    return null
}

function relationshipColor(value: string): string {
    const colors = [
        '#0f766e',
        '#1d4ed8',
        '#7e22ce',
        '#be123c',
        '#b45309',
        '#047857',
        '#4338ca',
        '#a21caf',
        '#0369a1',
        '#9f1239',
        '#166534',
        '#6d28d9',
    ]
    let hash = 0

    for (const char of value) {
        hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0
    }

    return colors[Math.abs(hash) % colors.length]
}
</script>

<style scoped>
.database-schema-flow {
    height: 100%;
    width: 100%;
}

:deep(.vue-flow__edge-path) {
    stroke-width: 2;
}
</style>
