<template>
    <div class="h-full">
        <div v-if="error" class="flex h-full items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-500">
            <UIcon name="i-heroicons-exclamation-circle" class="w-5 h-5" />
            <span>{{ error }}</span>
        </div>

        <div v-else-if="columns.length === 0" class="flex h-full flex-col items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400">
            <UIcon name="i-heroicons-table-cells" class="w-10 h-10 mb-2" />
            <span>No data to display</span>
        </div>

        <div v-else class="h-full overflow-auto rounded-lg border border-gray-200 bg-white">
            <table class="min-w-full divide-y divide-gray-200 text-sm">
                <thead class="bg-gray-50">
                    <tr>
                        <th
                            v-for="col in columns"
                            :key="col"
                            class="px-4 py-2 text-left font-semibold text-gray-600 whitespace-nowrap"
                        >
                            <span>{{ col }}</span>
                            <span v-if="columnTypes[col]" class="ml-1 text-[10px] font-normal text-gray-400 uppercase">{{ columnTypes[col] }}</span>
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white">
                    <tr
                        v-for="(row, rowIndex) in rows"
                        :key="rowIndex"
                        class="hover:bg-gray-50"
                    >
                        <td
                            v-for="(cell, colIndex) in row"
                            :key="colIndex"
                            class="px-4 py-2 text-gray-700 whitespace-nowrap"
                        >
                            <span v-if="cell === null" class="italic text-gray-400">NULL</span>
                            <span v-else>{{ cell }}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Operation } from '~/utils/Operation/Operation'
import { OperationResultType } from '~/utils/Operation/OperationResultType'
import { DatabaseHandler } from '~/utils/DatabaseHandler'
import type { ColumnType } from '~/utils/ColumnType'
import { useSystemsStore } from '~/stores/systemsStore'

const PAGE_SIZE = 10

const props = defineProps<{
    queryResult: Operation<any> | null
    page: number
    tableName?: string
}>()

const emit = defineEmits<{
    'update:page': [page: number]
    'update:totalPages': [total: number]
    'update:rowCount': [count: number]
}>()

const allColumns = computed<string[]>(() => {
    if (!props.queryResult || props.queryResult.result !== OperationResultType.SUCCESS) return []
    const row0 = props.queryResult.data?.[0]
    // sql.js minifies 'columns' to 'lc' in the bundled build
    return row0?.columns ?? (row0 as any)?.lc ?? []
})

const allRows = computed<(string | number | null)[][]>(() => {
    if (!props.queryResult || props.queryResult.result !== OperationResultType.SUCCESS) return []
    return props.queryResult.data?.[0]?.values ?? []
})

const totalPages = computed(() => Math.max(1, Math.ceil(allRows.value.length / PAGE_SIZE)))

watch(totalPages, (val) => emit('update:totalPages', val), { immediate: true })
watch(allRows, (val) => emit('update:rowCount', val.length), { immediate: true })

const columns = allColumns

const rows = computed(() => {
    const start = (props.page - 1) * PAGE_SIZE
    return allRows.value.slice(start, start + PAGE_SIZE)
})

const error = computed<string | null>(() => {
    if (!props.queryResult) return null
    if (props.queryResult.result !== OperationResultType.SUCCESS) return props.queryResult.message
    return null
})

const systemsStore = useSystemsStore()
const columnTypes = ref<Record<string, ColumnType>>({})

watch(() => props.tableName, async (name) => {
    if (!name) { columnTypes.value = {}; return }
    const db = systemsStore.selectedSystem?.database?.sqlJsDatabase
    if (!db) { columnTypes.value = {}; return }
    const result = await DatabaseHandler.getColumnTypes(db, name)
    columnTypes.value = result.data ?? {}
}, { immediate: true })
</script>
