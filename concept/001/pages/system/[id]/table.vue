<script setup lang="ts">
/* 1. Imports */
import { ref, computed, reactive, watch, h, resolveComponent, readonly, onMounted, toValue, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { useClipboard } from '@vueuse/core'
import type { TableColumn, DropdownMenuItem, FormSubmitEvent } from '@nuxt/ui'
import type { Column } from '@tanstack/vue-table'
import type { InformationSystem } from '~/model/InformationSystem'
import { useInformationSystemStore } from '~/stores/useInformationSystemStore'
import { useSelectedSystemStore } from '~/stores/useSelectedSystemStore'
import { useSelectedTableStore } from '~/stores/useSelectedTableStore'
import LocalNavbar from '~/components/LocalNavbar.vue'
import { EditComponentModal } from '#components'
import { usePropertyStore } from '#imports'

/* 2. Stores */
const informationSystemStore = useInformationSystemStore()
const selectedSystemStore = useSelectedSystemStore()
const selectedTableStore = useSelectedTableStore()
const propertyStore = usePropertyStore()

/* 3. Context hooks */
const route = useRoute()
const { t } = useI18n()
const toast = useToast()
const { copy } = useClipboard()

/* 4. Constants (non-reactive) */
const systemId = route.params.id
const systems = informationSystemStore.systems
const selectedSystem: InformationSystem | null = informationSystemStore.systems.find(s => s.id === selectedSystemStore.selectedId) || null
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

/* 5. Props */
const props = defineProps<{
    items?: any[] | Ref<any[]>,
    tableName?: string
    onSortChange?: (sortField: string, sortOrder: 'asc' | 'desc' | null) => void
    onFilterChange?: (filter: string) => void
    selectedTable?: string | null
}>()

/* 6. Emits */
// none

/* 7. Template refs */
// none

/* 8. Local state (ref, reactive) */
const system = ref<InformationSystem | null>(null)
const globalFilter = ref('')
const currentSort = ref<{
    field: string | null
    order: 'asc' | 'desc' | null
}>({
    field: null,
    order: null
})
const selectedTableData = ref<any[]>([])
const tableInfo = ref<any[]>([])
const columnNames = ref<string[]>([])
const columnTypes = ref<string[]>([])
const selectedTableName = ref('')
const editModalOpen = ref(false)
const editingColumn = ref<string | null>(null)
const sqlQuery = ref(`SELECT COUNT(*) as count FROM jídla`)
const htmlTemplate = ref("")
const showEditor = ref(false)
const draftSqlQuery = ref(sqlQuery.value)
const draftHtmlTemplate = ref(htmlTemplate.value)
const menuType = ref(true);

let formState = reactive<Record<string, any>>({})

const localItems = ref([
    {
        label: system.value?.name || 'System',
    },
    {
        label: t('dashboard'),
        icon: 'i-heroicons-chart-bar-20-solid',
        to: `/system/${systemId}/dashboard`,
        data_target: 'system-dashboard',
    },
    {
        label: t('tables'),
        icon: 'i-heroicons-table-cells',
        to: `/system/${systemId}/table`,
        data_target: 'system-table',
    }
])

/* 9. Computed */
const data = computed(() => {
    return selectedTableData.value
})

const tableNames = computed(() => {
    if (!system.value?.db || typeof system.value.db.query !== 'function') return []
    try {
        const tablesRes = system.value.db.query(`SELECT name FROM sqlite_master WHERE type='table'`)
        return tablesRes?.results?.map((table: any) => table.name) || []
    } catch (error) {
        console.error('Error fetching table names:', error)
        return []
    }
})

const autoColumns = computed<TableColumn<any>[]>(() => {
    const keys = columnNames.value
    console.log("KEYS:", keys)

    const columns: TableColumn<any>[] = keys.map(key => ({
        accessorKey: key,
        header: () => getHeader(key.charAt(0).toUpperCase() + key.slice(1), key)
    }))

    console.log("COLUMNS:", columns)

    // remove columns: id, turnus_id, rodné_číslo
    const filteredColumns = columns.filter(col => !['id', 'turnus_id', 'rodné_číslo'].includes(col.accessorKey || ''))

    // print data for column=Alergeny
    if (columnNames.value.includes('alergeny')) {
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
    if (!selectedTableName.value || columnNames.value.length === 0) return ''
    const columnList = columnNames.value.map(col => `"${col}"`).join(', ')
    return `SELECT ${columnList} FROM ${selectedTableName.value}`
})

/* 10. Watchers */
watch(globalFilter, (newFilter) => {
    if (props.onFilterChange) {
        props.onFilterChange(newFilter)
    }
}, { debounce: 300 })

watch(tableNames, (newTableNames) => {
    // Prefer store.selectedTableName, then props.selectedTable, otherwise fallback to first table
    if (newTableNames.length > 0 && !selectedTableName.value) {
        selectedTableName.value = selectedTableStore.selectedTableName || newTableNames[0]
    }
}, { immediate: true })

watch(selectedTableName, async (newTableName) => {
    if (!newTableName || !system.value?.db) {
        selectedTableData.value = []
        return
    }
    try {
        // Get column names first
        const tableInfoRes = system.value.db.query(`PRAGMA table_info(${newTableName})`)
        tableInfo.value = tableInfoRes?.results || []

        columnNames.value = []
        columnTypes.value = []

        tableInfo.value.forEach((col: any) => {
            columnNames.value.push(col.name)
            columnTypes.value.push(col.type)
        })

        // Build explicit column list for SELECT
        const columnList = columnNames.value.map(col => `"${col}"`).join(', ')
        const dataRes = system.value.db.query(`SELECT ${columnList} FROM ${newTableName}`)

        formState = reactive(
            columnNames.value.reduce((acc, col) => {
                acc[col] = ''
                return acc
            }, {} as Record<string, any>)
        )

        selectedTableData.value = dataRes?.results || []
    } catch (error) {
        console.error(`Error fetching data from table ${newTableName}:`, error)
        selectedTableData.value = []
    }
}, { immediate: true })

watch(showEditor, (newValue) => {
    console.log('Editor visibility changed:', newValue)
})

/* 11. Methods */
function initializeSystem() {
    system.value = systems.find(sys => sys.id === parseInt(systemId as string, 10)) || null
}

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

    if (props.onSortChange) {
        props.onSortChange(field, newOrder)
    }

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
        /*
        {
            label: t('copy_id'),
            icon: 'i-lucide-copy',
            onSelect: () => {
                if (row.id !== undefined) {
                    copy(row.id.toString())
                    toast.add({
                        title: t('copy_id_toast_success'),
                        color: 'success',
                        icon: 'i-lucide-circle-check'
                    })
                }
            }
        },
        */
        {
            label: t('edit'),
            icon: 'i-lucide-edit',
            onSelect: () => {
                // Use system.value for DB operations (unify with table display)
                if (!system.value?.db || !selectedTableName.value || row.id === undefined) return;

                // Get table info (columns)
                const pragmaRes = system.value.db.query(`PRAGMA table_info(${selectedTableName.value})`)
                tableInfo.value = pragmaRes?.results || []

                // Build column list for SELECT
                const columnList = columnNames.value.map(col => `"${col}"`).join(', ')
                const entityRes = system.value.db.query(
                    `SELECT ${columnList} FROM ${selectedTableName.value} WHERE id = '${row.id}'`
                )
                const entity = entityRes?.results?.[0]
                if (!entity) {
                    toast.add({
                        title: t('edit_entity_toast_error') || 'Entity not found',
                        color: 'error',
                        icon: 'i-lucide-alert-triangle'
                    })
                    return
                }

                formState = reactive(
                    Object.keys(entity).reduce((acc, key) => {
                        acc[key] = entity[key]
                        return acc
                    }, {} as Record<string, any>)
                )

                editModalOpen.value = true
            }
        },
        {
            label: t('delete'),
            icon: 'i-lucide-trash',
            color: 'error',
            onSelect: () => {
                if (!selectedTableName.value || !system.value?.db) return
                try {
                    // Delete data from the selected table
                    system.value.db.exec(`DELETE FROM ${selectedTableName.value} WHERE id = '${row.id}'`)

                    // Build explicit column list for SELECT
                    const columnList = columnNames.value.map(col => `"${col}"`).join(', ')
                    // Reload data after delete
                    const dataRes = system.value.db.query(`SELECT ${columnList} FROM ${selectedTableName.value}`)
                    selectedTableData.value = dataRes?.results || []

                    // Notify user of success
                    toast.add({
                        title: t('delete_toast_success'),
                        color: 'success',
                        icon: 'i-lucide-circle-check'
                    })
                } catch (error) {
                    console.error(`Error deleting row from table ${selectedTableName.value}:`, error)
                    toast.add({
                        title: t('delete_toast_error'),
                        color: 'error',
                        icon: 'i-lucide-alert-triangle'
                    })
                }
            }
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

async function onSubmit() {
    // Handle form submission logic here
    console.log('Form submitted with data:', formState)

    // Transform array fields to JSON string before saving
    columnNames.value.forEach(col => {
        if (isArrayType(propertyStore.propertiesNameTypeMap[col]) && Array.isArray(formState[col])) {
            formState[col] = JSON.stringify(formState[col])
        }
    })


    const id = formState['id']
    if (!id) {
        // Insert new row (skip 'id' column)
        const insertCols = columnNames.value.filter(col => col !== 'id')
        const insertVals = insertCols.map(col =>
            typeof formState[col] === 'string'
                ? `'${formState[col].replace(/'/g, "''")}'`
                : formState[col]
        )
        const sql = `INSERT INTO ${selectedTableName.value} (${insertCols.join(', ')}) VALUES (${insertVals.join(', ')})`
        selectedSystem?.db.exec(sql)
        // Build explicit column list for SELECT
        const columnList = columnNames.value.map(col => `"${col}"`).join(', ')
        // Reload data after insert
        const dataRes = selectedSystem?.db.query(`SELECT ${columnList} FROM ${selectedTableName.value}`)
        selectedTableData.value = dataRes?.results || []
        toast.add({ title: t('add_toast_success'), color: 'success' })
        return
    }

    // Update the row if id is present
    const setClause = columnNames.value
        .filter(col => col !== 'id')
        .map(col => `${col} = ${typeof formState[col] === 'string' ? `'${formState[col].replace(/'/g, "''")}'` : formState[col]}`)
        .join(', ')

    const sql = `UPDATE ${selectedTableName.value} SET ${setClause} WHERE id = '${id}'`
    selectedSystem?.db.exec(sql)

    // Build explicit column list for SELECT
    const columnList = columnNames.value.map(col => `"${col}"`).join(', ')
    // Reload data after update
    const dataRes = selectedSystem?.db.query(`SELECT ${columnList} FROM ${selectedTableName.value}`)
    selectedTableData.value = dataRes?.results || []

    toast.add({ title: t('edit_entity_toast_success'), color: 'success' })
}

function addMethod() {
    // Reset form state for new row, skip 'id'
    formState = reactive(
        columnNames.value
            .filter(col => col !== 'id')
            .reduce((acc, col) => {
                acc[col] = ''
                return acc
            }, {} as Record<string, any>)
    )
    editModalOpen.value = true
}

function openEditor() {
    showEditor.value = true
    console.log("Show editor:", showEditor.value)
}

function applyChanges() {
    // Použije SQL a HTML z modalu do hlavních reaktivních proměnných
    sqlQuery.value = draftSqlQuery.value
    htmlTemplate.value = draftHtmlTemplate.value
    showEditor.value = false
    console.log('Changes applied:', {
        sqlQuery: sqlQuery.value,
        htmlTemplate: htmlTemplate.value,
        show: showEditor.value
    })
}

function openEditorForColumn(col: any) {
    editingColumn.value = col.accessorKey || col.id
    draftHtmlTemplate.value = ''
    if (selectedTableName.value && editingColumn.value) {
        // Add ORDER BY if this column is currently sorted
        let orderClause = ''
        if (
            currentSort.value.field === editingColumn.value &&
            currentSort.value.order
        ) {
            orderClause = ` ORDER BY "${editingColumn.value}" ${currentSort.value.order.toUpperCase()}`
        }
        draftSqlQuery.value = `SELECT "${editingColumn.value}" FROM ${selectedTableName.value}${orderClause}`
    } else {
        draftSqlQuery.value = ''
    }
    showEditor.value = true
}

/* 12. Lifecycle */
onMounted(() => {
    initializeSystem()
})

/* 13. defineExpose */
defineExpose({
    getSqlQuery,
    currentSort: readonly(currentSort),
    globalFilter: readonly(globalFilter)
})

/* 14. Map for column values for select menu */
const columnValuesMap = ref<Record<string, string[]>>({})

// Helper to detect array type
function isArrayType(type: string) {
    return type === 'array'
}

// Fetch possible values for array columns
async function fetchColumnValues(tableName: string, columns: string[]) {
    if (!system.value?.db) return
    columns.forEach(col => {
        let sourceTable = tableName
        let valueField = col
        // If column is 'alergeny', use table 'alergeny' and field 'název'
        if (col === 'alergeny') {
            sourceTable = 'alergeny'
            valueField = 'název'
        }
        try {
            const res = system.value.db.query(`SELECT DISTINCT "${valueField}" FROM "${sourceTable}"`)
            let values: string[] = []
            res.results.forEach(row => {
                const val = row[valueField]
                if (Array.isArray(val)) {
                    values.push(...val)
                } else if (typeof val === 'string') {
                    try {
                        const arr = JSON.parse(val)
                        if (Array.isArray(arr)) values.push(...arr)
                        else if (val) values.push(val)
                    } catch {
                        if (val) values.push(val)
                    }
                } else if (val) {
                    values.push(val)
                }
            })
            columnValuesMap.value[col] = Array.from(new Set(values.filter(v => v)))
        } catch (e) {
            columnValuesMap.value[col] = []
        }
    })
}

// Watch selectedTableName and columnNames to fetch values for array columns
watch([selectedTableName, columnNames], ([tableName, cols]) => {
    const arrayCols = cols.filter(col => isArrayType(propertyStore.propertiesNameTypeMap[col]))
    if (tableName && arrayCols.length) {
        fetchColumnValues(tableName, arrayCols)
    }
})
</script>

<template>
    <LocalNavbar :items="localItems" />

    <div class="flex flex-row items-center gap-4 w-full px-4 py-2">

        <!-- Table Selector -->
        <div class="flex items-center gap-2">
            <label for="table-select">{{ t('select_table') }}:</label>
            <USelect v-model="selectedTableName" :items="tableNames" class="w-48" />
        </div>

        <!-- Add Button -->
        <UButton variant="subtle" @click="addMethod">{{ t('add') }}</UButton>

        <!-- Global Filter Input -->
        <UInput v-model="globalFilter" class="max-w-sm"
            :placeholder="`${t('filter')} ${selectedTableName || 'items'}...`" />

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
                <th v-for="col in autoColumns.filter(col => col.id !== 'action')" :key="col.id"
                    class="px-4 py-2 text-left font-semibold relative">
                    <span v-if="typeof col.header === 'function'">
                        <component :is="col.header()" />
                    </span>
                    <span v-else>
                        {{ col.header }}
                    </span>
                    <!-- Edit icon for column -->
                    <EditComponentModalOpenButton @click="openEditorForColumn(col)" />
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(row, rowIndex) in filteredAndSortedData" :key="row.id || rowIndex"
                class="hover:border hover:border-gray-400 border-collapse">

                              <td v-for="col in autoColumns.filter(col => col.id !== 'action')" :key="col.accessorKey || col.id"
                    class="px-4 py-2">
                    <!-- Special rendering for 'name' column with avatar -->
                    <template v-if="col.accessorKey === 'name'">
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

    <UModal v-model:open="editModalOpen" :title="formState.id ? t('edit_entity') : t('add_entity')">
        <template #content>
            <UCard>
                <template #header>
                    <h3 class="text-lg font-semibold">{{ formState.id ? t('edit_entity') : t('add_entity') }}</h3>
                </template>
                <UForm :state="formState" @submit="onSubmit">
                    <div class="grid grid-cols-2 gap-4">
                        <div v-for="(col, index) in columnNames.filter(col => col !== 'id')" :key="index"
                            class="flex flex-col">
                            <label class="mb-1 font-medium text-sm text-gray-700">
                                {{ col }}
                                <span v-if="propertyStore.propertiesNameTypeMap[col]" class="text-xs text-gray-400 ml-2">
                                    ({{ propertyStore.propertiesNameTypeMap[col] }})
                                </span>
                            </label>
                            <template v-if="isArrayType(propertyStore.propertiesNameTypeMap[col])">
                                <USelectMenu
                                    v-model="formState[col]"
                                    :items="columnValuesMap[col]"
                                    class="w-48"
                                    :multiple="menuType"
                                />
                            </template>
                            <template v-else>
                                <UInput v-model="formState[col]" :placeholder="`Enter ${col}`" />
                            </template>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 mt-6">
                        <UButton type="submit" color="primary" @click="editModalOpen = false">{{ t('save') }}</UButton>
                        <UButton variant="outline" @click="editModalOpen = false">{{ t('cancel') }}</UButton>
                    </div>
                </UForm>
            </UCard>
        </template>
    </UModal>
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