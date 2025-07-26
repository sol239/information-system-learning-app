<script setup lang="ts">
import type { TableColumn, DropdownMenuItem, FormSubmitEvent } from '@nuxt/ui'
import { useClipboard } from '@vueuse/core'
import { ref, computed, toValue, h, resolveComponent, watch, readonly } from 'vue'
import type { Column } from '@tanstack/vue-table'
import { useInformationSystemStore } from '~/stores/informationSystems';
import { useSelectedSystemStore } from '~/stores/selectedSystemId'
import type { InformationSystem } from '~/model/types/InformationSystem';
import LocalNavbar from '~/components/LocalNavbar.vue'

const informationSystemStore = useInformationSystemStore();
const selectedSystemStore = useSelectedSystemStore();

const selectedSystem: InformationSystem | null = informationSystemStore.systems.find(s => s.id === selectedSystemStore.selectedId) || null

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const toast = useToast()
const { copy } = useClipboard()

const props = defineProps<{
    items?: any[] | Ref<any[]>,

    tableName?: string
    onSortChange?: (sortField: string, sortOrder: 'asc' | 'desc' | null) => void
    onFilterChange?: (filter: string) => void
}>()

const globalFilter = ref('')
const currentSort = ref<{
    field: string | null
    order: 'asc' | 'desc' | null
}>({
    field: null,
    order: null
})

const selectedTableData = ref<any[]>([])

const data = computed(() => {
    return selectedTableData.value
})

// Watch for filter changes and emit to parent
watch(globalFilter, (newFilter) => {
    if (props.onFilterChange) {
        props.onFilterChange(newFilter)
    }
}, { debounce: 300 })

// Generate SQL ORDER BY clause
const generateSqlOrderBy = (field: string, order: 'asc' | 'desc') => {
    const sanitizedField = field.replace(/[^a-zA-Z0-9_]/g, '')
    return `ORDER BY ${sanitizedField} ${order.toUpperCase()}`
}

// Generate SQL WHERE clause for filtering
const generateSqlWhere = (filter: string, columns: string[]) => {
    if (!filter.trim()) return ''

    const sanitizedFilter = filter.replace(/'/g, "''") // Escape single quotes
    const conditions = columns.map(col => {
        const sanitizedCol = col.replace(/[^a-zA-Z0-9_]/g, '')
        return `${sanitizedCol} LIKE '%${sanitizedFilter}%'`
    }).join(' OR ')

    return `WHERE (${conditions})`
}

// Handle sorting
const handleSort = (field: string) => {
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

// Generate columns with clickable sorting header for each key if not provided
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

const autoColumns = computed<TableColumn<any>[]>(() => {
    const d = data.value
    if (props.columns && props.columns.length > 0) return props.columns
    if (!d.length) return []
    const keys = Object.keys(d[0])
    // Add action column at the end
    return [
        ...keys.map(key => ({
            accessorKey: key,
            header: () => getHeader(key.charAt(0).toUpperCase() + key.slice(1), key)
        })),
        {
            id: 'action',
            header: 'Akce'
        }
    ]
})

const editModalOpen = ref(false)



function getDropdownActions(row: any): DropdownMenuItem[] {
    return [
        {
            label: `Copy ID`,
            icon: 'i-lucide-copy',
            onSelect: () => {
                if (row.id !== undefined) {
                    copy(row.id.toString())
                    toast.add({
                        title: 'ID copied to clipboard!',
                        color: 'success',
                        icon: 'i-lucide-circle-check'
                    })
                }
            }
        },
        {
            label: 'Edit',
            icon: 'i-lucide-edit',
            onSelect: () => {
                // Log selected system to console
                console.log('Selected system:', selectedSystemStore.selectedId, informationSystemStore.systems.find(s => s.id === selectedSystemStore.selectedSystemId))
                console.log("COLUMNS:", selectedSystem?.db.query(`PRAGMA table_info(${selectedTableName.value})`) || [])

                const entity = selectedSystem?.db.query(`SELECT * FROM ${selectedTableName.value} WHERE id = '${row.id}'`)[0]
                console.log('Selected row data:', entity)

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
            label: 'Delete',
            icon: 'i-lucide-trash',
            color: 'error',
            onSelect: () => {
                if (!selectedTableName.value) return
                try {

                    // Delete data from the selected table
                    selectedSystem?.db.exec(`DELETE FROM ${selectedTableName.value} WHERE id = '${row.id}'`)

                    // Reload data after delete
                    const data = selectedSystem?.db.query(`SELECT * FROM ${selectedTableName.value}`) || []
                    selectedTableData.value = data

                    // Notify user of success
                    toast.add({
                        title: 'Row deleted successfully',
                        color: 'success',
                        icon: 'i-lucide-circle-check'
                    })
                } catch (error) {
                    console.error(`Error deleting row from table ${selectedTableName.value}:`, error)
                    toast.add({
                        title: 'Delete failed',
                        color: 'error',
                        icon: 'i-lucide-alert-triangle'
                    })
                }
            }
        }
    ]
}

// Utility functions for parent components
const getSqlQuery = (baseQuery: string, columns: string[]) => {
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

// Computed property to filter and sort the data
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

// Expose utility functions
defineExpose({
    getSqlQuery,
    currentSort: readonly(currentSort),
    globalFilter: readonly(globalFilter)
})

const route = useRoute()
const systemId = route.params.id
const systems = informationSystemStore.systems
const system = ref<InformationSystem | null>(null)
const tableInfo = ref<any[]>([])
const columnNames = ref<string[]>([])
const columnTypes = ref<string[]>([])

let formState = reactive<Record<string, any>>({});


system.value = systems.find(sys => sys.id === parseInt(systemId as string, 10)) || null

const tableNames = computed(() => {
    if (!system.value?.db) return []
    try {
        const tables = system.value.db.query(`SELECT name FROM sqlite_master WHERE type='table'`)
        return tables.map((table: any) => table.name)
    } catch (error) {
        console.error('Error fetching table names:', error)
        return []
    }
})

const selectedTableName = ref('')
watch(tableNames, (newTableNames) => {
    if (newTableNames.length > 0 && !selectedTableName.value) {
        selectedTableName.value = newTableNames[0]
    }
}, { immediate: true })

watch(selectedTableName, async (newTableName) => {
    if (!newTableName || !system.value?.db) {
        selectedTableData.value = []
        return
    }
    try {
        const data = system.value.db.query(`SELECT * FROM ${newTableName}`)

        tableInfo.value = system.value.db.query(`PRAGMA table_info(${newTableName})`) || []

        columnNames.value = []
        columnTypes.value = []

        tableInfo.value.forEach((col: any) => {
            columnNames.value.push(col.name)
            columnTypes.value.push(col.type)
        })

        formState = reactive(
            columnNames.value.reduce((acc, col) => {
                acc[col] = ''
                return acc
            }, {} as Record<string, any>)
        )

        selectedTableData.value = data
    } catch (error) {
        console.error(`Error fetching data from table ${newTableName}:`, error)
        selectedTableData.value = []
    }
}, { immediate: true })

const localItems = ref([
    {
        label: system.value?.name || 'System',
    },
    {
        label: 'Dashboard',
        icon: 'i-heroicons-chart-bar-20-solid',
        to: `/system/${systemId}/dashboard`,
        data_target: 'system-dashboard',
    },
    {
        label: 'Table',
        icon: 'i-heroicons-table-cells',
        to: `/system/${systemId}/table`,
        data_target: 'system-table',
    }
])

async function onSubmit() {
    // Handle form submission logic here
    console.log('Form submitted with data:', formState)

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
        // Reload data after insert
        const data = selectedSystem?.db.query(`SELECT * FROM ${selectedTableName.value}`) || []
        selectedTableData.value = data
        toast.add({ title: 'Success', description: 'The row has been inserted.', color: 'success' })
        return
    }

    // Update the row if id is present
    const setClause = columnNames.value
        .filter(col => col !== 'id')
        .map(col => `${col} = ${typeof formState[col] === 'string' ? `'${formState[col].replace(/'/g, "''")}'` : formState[col]}`)
        .join(', ')

    const sql = `UPDATE ${selectedTableName.value} SET ${setClause} WHERE id = '${id}'`
    selectedSystem?.db.exec(sql)

    // Reload data after update
    const data = selectedSystem?.db.query(`SELECT * FROM ${selectedTableName.value}`) || []
    selectedTableData.value = data

    toast.add({ title: 'Success', description: 'The row has been updated.', color: 'success' })
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

</script>

<template>
    <LocalNavbar :items="localItems" />

    <div class="flex flex-row items-center gap-4 w-full px-4 py-2">

        <!-- Table Selector -->
        <div class="flex items-center gap-2">
            <label for="table-select">Select table:</label>
            <USelect v-model="selectedTableName" :items="tableNames" class="w-48" />
        </div>

        <!-- Add Button -->
        <UButton label="Add" variant="subtle" @click="addMethod" />

        <!-- Global Filter Input -->
        <UInput v-model="globalFilter" class="max-w-sm" :placeholder="`Filter ${selectedTableName || 'items'}...`" />

        <!-- SQL Query Display -->
        <div class="ml-auto text-sm text-gray-500 font-mono flex items-center">
            <span>SQL Query:</span>
            <span class="ml-2 p-2 bg-gray-100 rounded text-xs">
                {{getSqlQuery(`SELECT * FROM ${selectedTableName || 'table'}`, autoColumns.map(col => (col as
                    any)?.accessorKey || '').filter(Boolean)) }}
            </span>
        </div>

    </div>

    <UTable :data="filteredAndSortedData" :columns="autoColumns" class="flex-1" :sort="false">
        <template #name-cell="{ row }" v-if="autoColumns.some(col => (col as any)?.accessorKey === 'name')">
            <div class="flex items-center gap-3">
                <UAvatar v-if="row.original.id" size="lg" :alt="`${row.original.name || row.original.id} avatar`" />
                <div>
                    <p class="font-medium text-highlighted">
                        {{ row.original.name }}
                    </p>
                    <p v-if="row.original.age">
                        {{ row.original.age }}
                    </p>
                </div>
            </div>
        </template>
        <template #action-cell="{ row }">
            <UDropdownMenu :items="getDropdownActions(row.original)">
                <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" aria-label="Actions" />
            </UDropdownMenu>
        </template>
    </UTable>

    <UModal v-model:open="editModalOpen" title="Edit Row">
        <template #content>
            <UCard>
                <template #header>
                    <h3 class="text-lg font-semibold">Edit Row</h3>
                </template>
                <UForm :state="formState" @submit="onSubmit">
                    <div class="grid grid-cols-2 gap-4">
                        <div v-for="(col, index) in columnNames.filter(col => col !== 'id')" :key="index"
                            class="flex flex-col">
                            <label class="mb-1 font-medium text-sm text-gray-700">{{ col }}</label>
                            <UInput v-model="formState[col]" :placeholder="`Enter ${col}`" />
                        </div>
                    </div>
                    <div class="flex justify-end gap-2 mt-6">
                        <UButton type="submit" color="primary" @click="editModalOpen = false">Save</UButton>
                        <UButton variant="outline" @click="editModalOpen = false">Cancel</UButton>
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
    content: ' \25B2';
}

.sort-header.desc:after {
    content: ' \25BC';
}
</style>
