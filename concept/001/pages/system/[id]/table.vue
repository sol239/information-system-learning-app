<script setup lang="ts">
/* 1. Imports */
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { InformationSystem } from '~/model/InformationSystem'
import { useInformationSystemStore } from '~/stores/useInformationSystemStore'
import { useSelectedSystemStore } from '~/stores/useSelectedSystemStore'
import { useSelectedTableStore } from '~/stores/useSelectedTableStore'
import LocalNavbar from '~/components/LocalNavbar.vue'
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

/* 4. Constants (non-reactive) */
const systemId = route.params.id
const systems = informationSystemStore.systems

/* 5. Local state (ref, reactive) */
const system = ref<InformationSystem | null>(null)
const selectedTableData = ref<any[]>([])
const tableInfo = ref<any[]>([])
const columnNames = ref<string[]>([])
const columnTypes = ref<string[]>([])
const selectedTableName = ref('')
const editModalOpen = ref(false)
const columnValuesMap = ref<Record<string, string[]>>({})

let formState = reactive<Record<string, any>>({})

const localItems = ref([
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

/* 6. Computed */
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

// Computed to detect data changes and trigger reload
const tableDataHash = computed(() => {
    if (!selectedTableName.value || !system.value?.db) return ''
    
    try {
        // Get row count and basic structure to detect changes
        const countRes = system.value.db.query(`SELECT COUNT(*) as count FROM ${selectedTableName.value}`)
        const count = countRes?.results?.[0]?.count || 0
        
        // Get a simple hash of the data to detect changes
        const columnList = columnNames.value.map(col => `"${col}"`).join(', ')
        if (columnList) {
            const dataRes = system.value.db.query(`SELECT ${columnList} FROM ${selectedTableName.value} ORDER BY id LIMIT 5`)
            const sample = JSON.stringify(dataRes?.results || [])
            return `${count}-${sample.length}-${Date.now()}`
        }
        return `${count}-${Date.now()}`
    } catch (error) {
        return `error-${Date.now()}`
    }
})

/* 7. Watchers */
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

// Watch selectedTableName and columnNames to fetch values for array columns
watch([selectedTableName, columnNames], ([tableName, cols]) => {
    const arrayCols = cols.filter(col => isArrayType(propertyStore.propertiesNameTypeMap[col]))
    if (tableName && arrayCols.length) {
        fetchColumnValues(tableName, arrayCols)
    }
})

// Watch for table data changes and reload when detected
watch(tableDataHash, () => {
    reloadTableData()
}, { flush: 'post' })

/* 8. Methods */
function initializeSystem() {
    system.value = systems.find(sys => sys.id === parseInt(systemId as string, 10)) || null
}

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

function reloadTableData() {
    if (!selectedTableName.value || !system.value?.db) return
    
    try {
        const columnList = columnNames.value.map(col => `"${col}"`).join(', ')
        const dataRes = system.value.db.query(`SELECT ${columnList} FROM ${selectedTableName.value}`)
        selectedTableData.value = dataRes?.results || []
    } catch (error) {
        console.error(`Error reloading data from table ${selectedTableName.value}:`, error)
    }
}

function handleTableSelect(tableName: string) {
    selectedTableName.value = tableName
}

function handleAdd() {
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

function handleEdit(row: any) {
    // Use system.value for DB operations (unify with table display)
    if (!system.value?.db || !selectedTableName.value || row.id === undefined) return

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

function handleDelete(row: any) {

    console.log('Delete row:', row)

    if (!selectedTableName.value || !system.value?.db) return
    try {
        // Delete data from the selected table
        system.value.db.exec(`DELETE FROM ${selectedTableName.value} WHERE id = '${row.id}'`)

        // Reload data after delete
        reloadTableData()

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

function handleEntitySaved() {
    reloadTableData()
}

function handleSortChange(field: string, order: 'asc' | 'desc' | null) {
    console.log('Sort changed:', field, order)
    // Handle sort change logic if needed
}

function handleFilterChange(filter: string) {
    console.log('Filter changed:', filter)
    // Handle filter change logic if needed
}

function handleOpenEditor(column: any) {
    console.log('Open editor for column:', column)
    // Handle opening editor for column
}

/* 9. Lifecycle */
onMounted(() => {
    initializeSystem()
})
</script>

<template>
    <div>
        <LocalNavbar :items="localItems" />
        
        <TableView
            :system="system"
            :table-names="tableNames"
            :selected-table-name="selectedTableName"
            :selected-table-data="selectedTableData"
            :column-names="columnNames"
            :column-types="columnTypes"
            :table-info="tableInfo"
            :column-values-map="columnValuesMap"
            @table-select="handleTableSelect"
            @add="handleAdd"
            @edit="handleEdit"
            @delete="handleDelete"
            @open-editor="handleOpenEditor"
            @sort-change="handleSortChange"
            @filter-change="handleFilterChange"
        />

        <EntityFormModal
            :open="editModalOpen"
            :selectedSystem="system"
            :selectedTableName="selectedTableName"
            :columnNames="columnNames"
            :formState="formState"
            :columnValuesMap="columnValuesMap"
            @update:open="editModalOpen = $event"
            @update:formState="formState = $event"
            @entitySaved="handleEntitySaved"
        />
    </div>
</template>