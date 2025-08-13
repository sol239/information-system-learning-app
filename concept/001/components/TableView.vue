<script setup lang="ts">
/* 1. Imports */
import { ref, computed, reactive, watch, h, resolveComponent, readonly, onMounted, type Ref } from 'vue'
import { useClipboard } from '@vueuse/core'
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import type { Column } from '@tanstack/vue-table'
import type { InformationSystem } from '~/model/InformationSystem'
import { EditComponentModal } from '#components'
import { usePropertyStore } from '#imports'
import { useHighlightWatchers } from '~/composables/highlightWatchers'
import '~/assets/css/highlight.css'
import { useHighlightStore } from '#imports'

/* 2. Stores */
const propertyStore = usePropertyStore()
const highlightStore = useHighlightStore()

/* 3. Context hooks */
const { t } = useI18n()
const toast = useToast()
const { copy } = useClipboard()

/* 4. Constants (non-reactive) */
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

/* 5. Props */
const props = defineProps<{
    system: InformationSystem | null
    tableNames: string[]
    selectedTableName: string
    selectedTableData: any[]
    columnNames: string[]
    columnTypes: string[]
    tableInfo: any[]
    columnValuesMap: Record<string, string[]>
    onSortChange?: (sortField: string, sortOrder: 'asc' | 'desc' | null) => void
    onFilterChange?: (filter: string) => void
    onTableSelect?: (tableName: string) => void
    onAdd?: () => void
    onEdit?: (row: any) => void
    onDelete?: (row: any) => void
}>()

/* 6. Emits */
const emit = defineEmits<{
    'table-select': [tableName: string]
    'add': []
    'edit': [row: any]
    'delete': [row: any]
    'open-editor': [column: any]
    'sort-change': [field: string, order: 'asc' | 'desc' | null]
    'filter-change': [filter: string]
}>()

/* 7. Local state (ref, reactive) */
const globalFilter = ref('')
const currentSort = ref<{
    field: string | null
    order: 'asc' | 'desc' | null
}>({
    field: null,
    order: null
})
const editingColumn = ref<string | null>(null)
const showEditor = ref(false)
const draftSqlQuery = ref('')
const draftHtmlTemplate = ref('')

/* 8. Computed */
const data = computed(() => {
    return props.selectedTableData
})

const autoColumns = computed<TableColumn<any>[]>(() => {
    const keys = props.columnNames
    console.log("KEYS:", keys)

    const columns: TableColumn<any>[] = keys.map(key => ({
        accessorKey: key,
        header: () => getHeader(key.charAt(0).toUpperCase() + key.slice(1), key)
    }))

    console.log("COLUMNS:", columns)

    // remove columns: id, turnus_id, rodné_číslo
    const filteredColumns = columns.filter(col => !['id', 'turnus_id', 'rodné_číslo'].includes(col.accessorKey || ''))

    // print data for column=Alergeny
    if (props.columnNames.includes('alergeny')) {
        console.log("Data for Alergeny:", data.value.map(row => row.Alergeny))
    }

    // Add action column at the end
    return [
        ...filteredColumns,
        {
            id: 'action',
            header: 'Akce'
        }
    ]
})

const filteredAndSortedData = computed(() => {
    let d = [...data.value]

    // Apply filtering first
    if (globalFilter.value.trim()) {
        const filter = globalFilter.value.toLowerCase()
        d = d.filter(item => {
            return Object.values(item).some(value =>
                String(value).toLowerCase().includes(filter)
            )
        })
    }

    // Then apply sorting
    if (currentSort.value.field && currentSort.value.order) {
        d.sort((a, b) => {
            const field = currentSort.value.field!
            const aValue = a[field]
            const bValue = b[field]
            if (aValue == null && bValue == null) return 0
            if (aValue == null) return 1
            if (bValue == null) return -1
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return currentSort.value.order === 'asc' ? aValue - bValue : bValue - aValue
            }
            return currentSort.value.order === 'asc'
                ? String(aValue).localeCompare(String(bValue))
                : String(bValue).localeCompare(String(aValue))
        })
    }
    return d
})

const currentSqlQuery = computed(() => {
    if (!props.selectedTableName || props.columnNames.length === 0) return ''
    const columnList = props.columnNames.map(col => `"${col}"`).join(', ')
    return `SELECT ${columnList} FROM ${props.selectedTableName}`
})

/* 9. Watchers */
watch(globalFilter, (newFilter) => {
    emit('filter-change', newFilter)
}, { debounce: 300 })

useHighlightWatchers(highlightStore.highlightHandler, highlightStore)

watch(showEditor, (newValue) => {
    console.log('Editor visibility changed:', newValue)
})

/* 10. Methods */
// Add these new helper methods
function isArrayColumn(value: any): boolean {
    if (!value) return false
    
    // Check if it's already an array
    if (Array.isArray(value)) return true
    
    // Check if it's a string that looks like an array
    if (typeof value === 'string') {
        const trimmed = value.trim()
        return trimmed.startsWith('[') && trimmed.endsWith(']')
    }
    
    return false
}

function parseArrayData(value: any): string[] {
    if (!value) return []
    
    // If it's already an array, return it
    if (Array.isArray(value)) return value
    
    // If it's a string representation of an array, parse it
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value)
            return Array.isArray(parsed) ? parsed : []
        } catch (error) {
            // If JSON parsing fails, try to split by comma (fallback)
            const trimmed = value.replace(/^\[|\]$/g, '').trim()
            if (trimmed) {
                return trimmed.split(',').map(item => item.trim().replace(/^"|"$/g, ''))
            }
        }
    }
    
    return []
}

function generateSqlOrderBy(field: string, order: 'asc' | 'desc') {
    const sanitizedField = field.replace(/[^a-zA-Z0-9_]/g, '')
    return `ORDER BY ${sanitizedField} ${order.toUpperCase()}`
}

function generateSqlWhere(filter: string, columns: string[]) {
    if (!filter.trim()) return ''

    const sanitizedFilter = filter.replace(/'/g, "''") // Escape single quotes
    const conditions = columns.map(col => {
        const sanitizedCol = col.replace(/[^a-zA-Z0-9_]/g, '')
        return `${sanitizedCol} LIKE '%${sanitizedFilter}%'`
    }).join(' OR ')

    return `WHERE (${conditions})`
}

function handleSort(field: string) {
    let newOrder: 'asc' | 'desc' | null = 'asc'

    if (currentSort.value.field === field) {
        // Cycle through: asc -> desc -> null
        if (currentSort.value.order === 'asc') {
            newOrder = 'desc'
        } else if (currentSort.value.order === 'desc') {
            newOrder = null
        }
    }

    currentSort.value = {
        field: newOrder ? field : null,
        order: newOrder
    }

    emit('sort-change', field, newOrder)

    // Generate SQL for debugging/logging
    if (newOrder) {
        const sqlOrderBy = generateSqlOrderBy(field, newOrder)
        console.log('Generated SQL ORDER BY:', sqlOrderBy)
    }
}

function getHeader(label: string, field: string) {
    const isCurrentField = currentSort.value.field === field
    const currentOrder = isCurrentField ? currentSort.value.order : null
    return h(
        'button',
        {
            class: [
                'sort-header',
                isCurrentField ? 'active' : '',
                currentOrder === 'asc' ? 'asc' : '',
                currentOrder === 'desc' ? 'desc' : ''
            ],
            onClick: () => handleSort(field),
            style: {
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: isCurrentField ? 'bold' : 'normal',
                color: isCurrentField ? '#2563EB' : 'inherit',
                outline: 'none',
                padding: '0',
            }
        },
        [
            label,
            currentOrder === 'asc' ? ' \u25B2' : currentOrder === 'desc' ? ' \u25BC' : ''
        ]
    )
}

function getDropdownActions(row: any): DropdownMenuItem[] {
    return [
        {
            label: t('edit'),
            icon: 'i-lucide-edit',
            onSelect: () => emit('edit', row)
        },
        {
            label: t('delete'),
            icon: 'i-lucide-trash',
            color: 'error',
            onSelect: () => emit('delete', row)
        }
    ]
}

function getSqlQuery(baseQuery: string, columns: string[]) {
    let query = baseQuery

    // Add WHERE clause for filtering
    if (globalFilter.value.trim()) {
        const whereClause = generateSqlWhere(globalFilter.value, columns)
        if (whereClause) {
            query += ` ${whereClause}`
        }
    }

    // Add ORDER BY clause for sorting
    if (currentSort.value.field && currentSort.value.order) {
        const orderClause = generateSqlOrderBy(currentSort.value.field, currentSort.value.order)
        query += ` ${orderClause}`
    }

    return query
}

function addMethod() {
    emit('add')
}

function openEditorForColumn(col: any) {
    editingColumn.value = col.accessorKey || col.id
    draftHtmlTemplate.value = ''
    if (props.selectedTableName && editingColumn.value) {
        // Add ORDER BY if this column is currently sorted
        let orderClause = ''
        if (
            currentSort.value.field === editingColumn.value &&
            currentSort.value.order
        ) {
            orderClause = ` ORDER BY "${editingColumn.value}" ${currentSort.value.order.toUpperCase()}`
        }
    draftSqlQuery.value = `SELECT "${editingColumn.value}" FROM ${props.selectedTableName}${orderClause}`
    } else {
        draftSqlQuery.value = ''
    }
    showEditor.value = true
    emit('open-editor', col)
}

function applyChanges() {
    showEditor.value = false
    console.log('Changes applied:', {
        draftSqlQuery: draftSqlQuery.value,
        draftHtmlTemplate: draftHtmlTemplate.value,
        show: showEditor.value
    })
}

function handleTableSelect(tableName: string) {
    emit('table-select', tableName)
}

// Helper to detect array type
function isArrayType(type: string) {
    return type === 'array'
}

/* Helper pro formátování ISO data na DD.MM.YYYY */
function formatDate(dateStr: string): string {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`
}

/* Helper pro výpočet délky v dnech mezi dvěma daty */
function getDaysLength(from: string, to: string): number | '' {
    if (!from || !to) return ''
    const d1 = new Date(from)
    const d2 = new Date(to)
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return ''
    // Zaokrouhlit na celé dny
    return Math.max(0, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)))
}

/* 11. Lifecycle */
onMounted(() => {
    const highlightStore = useHighlightStore()
    console.log("HIGHLIGHT  ON:", highlightStore.isHighlightMode)
    console.log(highlightStore.highlightHandler.getHighlightedElements)
})

/* 12. defineExpose */
defineExpose({
    getSqlQuery,
    currentSort: readonly(currentSort),
    globalFilter: readonly(globalFilter)
})
</script>

<template>
    <div>
        <div class="flex flex-row items-center gap-4 w-full px-4 py-2">
            <!-- Table Selector -->
            <div class="flex items-center gap-2">
                <label for="table-select">{{ t('select_table') }}:</label>
                <USelect 
                    :model-value="selectedTableName" 
                    :items="tableNames" 
                    class="w-48" 
                    @update:model-value="handleTableSelect"
                />
            </div>

            <!-- Add Button -->
            <UButton variant="subtle" @click="addMethod">{{ t('add') }}</UButton>

            <!-- Global Filter Input -->
            <UInput 
                v-model="globalFilter" 
                class="max-w-sm"
                :placeholder="`${t('filter')} ${selectedTableName || 'items'}...`" 
            />

            <!-- SQL Query Display -->
            <div class="ml-auto text-sm text-gray-500 font-mono flex items-center">
                <span>{{ t('sql_query') }}:</span>
                <span class="ml-2 p-2 bg-gray-100 rounded text-xs">
                    {{getSqlQuery(`SELECT * FROM ${selectedTableName || 'table'}`, autoColumns.map(col => (col as
                        any)?.accessorKey || '').filter(Boolean))}}
                </span>
            </div>
        </div>

        <!-- Replace UTable with native HTML table -->
        <table class="min-w-full divide-y divide-gray-200 my-4 rounded shadow custom-table-bg">
            <thead>
                <tr>
                    <th v-for="col in autoColumns.filter(col => col.id !== 'action')" :key="col.accessorKey || col.id"
                        class="px-4 py-2 text-left font-semibold relative">
                        <span :id="`table-${col.accessorKey}`" v-if="typeof col.header === 'function'" class="highlightable" @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement(`table-${col.accessorKey}`, $event)">
                            <component :is="col.header()" />
                        </span>
                        <span v-else :id="`table-${col.accessorKey}`" class="highlightable" @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement(`table-${col.accessorKey}`, $event)">
                            {{ col.header }}
                        </span>
                        <!-- Edit icon for column -->
                        <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" @click="openEditorForColumn(col)" />
                    </th>
                    <!-- Pokud existuje sloupec 'od' a 'do', přidej třetí sloupec 'délka' -->
                    <th v-if="columnNames.includes('od') && columnNames.includes('do')" class="px-4 py-2 text-left font-semibold">
                        Délka
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, rowIndex) in filteredAndSortedData" :key="row.id || rowIndex"
                    class="hover:border hover:border-gray-400 border-collapse">

                    <td v-for="col in autoColumns.filter(col => col.id !== 'action')" :key="col.accessorKey || col.id"
                        class="px-4 py-2">
                        <!-- Formátování pro sloupce 'od' a 'do' -->
                        <template v-if="col.accessorKey === 'od' || col.accessorKey === 'do'">
                            {{ formatDate(row[col.accessorKey]) }}
                        </template>
                        <!-- Special rendering for 'name' column with avatar -->
                        <template v-else-if="col.accessorKey === 'name'">
                            <div class="flex items-center gap-3">
                                <UAvatar v-if="row.id" size="lg" :alt="`${row.name || row.id} avatar`" />
                                <div>
                                    <p class="font-medium text-highlighted">
                                        {{ row.name }}
                                    </p>
                                    <p v-if="row.age">
                                        {{ row.age }}
                                    </p>
                                </div>
                            </div>
                        </template>
                        <!-- Special rendering for array data columns (like roles, alergeny, etc.) -->
                        <template v-else-if="isArrayColumn(row[col.accessorKey])">
                            <div class="flex flex-wrap gap-1">
                                <UBadge 
                                    v-for="(item, index) in parseArrayData(row[col.accessorKey])" 
                                    :key="index"
                                    size="md"
                                >
                                    {{ item }}
                                </UBadge>
                            </div>
                        </template>
                        <!-- Default rendering for other columns -->
                        <template v-else>
                            {{ row[col.accessorKey] }}
                        </template>
                    </td>
                    <!-- Nový sloupec 'délka' -->
                    <td v-if="columnNames.includes('od') && columnNames.includes('do')" class="px-4 py-2">
                        {{ getDaysLength(row['od'], row['do']) }}
                    </td>
                    <td v-if="autoColumns.some(col => col.id === 'action')" class="px-4 py-2">
                        <UDropdownMenu :items="getDropdownActions(row)">
                            <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost"
                                aria-label="Actions" />
                        </UDropdownMenu>
                    </td>
                </tr>
                <tr v-if="filteredAndSortedData.length === 0">
                    <td :colspan="autoColumns.length" class="text-center text-gray-400 py-4">
                        {{ t('no_data') }}
                    </td>
                </tr>
            </tbody>
        </table>

        <EditComponentModal
            :showEditor="showEditor"
            :draftHtmlTemplate="draftHtmlTemplate"
            :draftSqlQuery="draftSqlQuery"
            @update:showEditor="showEditor = $event"
            @update:draftHtmlTemplate="draftHtmlTemplate = $event"
            @update:draftSqlQuery="draftSqlQuery = $event"
            @applyChanges="applyChanges"
        />
    </div>
</template>

<style scoped>
.sort-header {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    transition: color 0.2s;
}

.sort-header.active {
    color: #2563EB;
    font-weight: bold;
}

.sort-header.asc:after {
    content: ' \u25B2';
}

.sort-header.desc:after {
    content: ' \u25BC';
}

/* Add custom table background color */
.custom-table-bg {
    background-color: #0f172b !important;
}
</style>