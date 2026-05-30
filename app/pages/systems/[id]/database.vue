<template>
    <div class="p-6">
        <div v-if="!isDbReady" class="flex items-center gap-2 mb-6">
            <UButton v-if="!isDbReady" @click="handleCheckReady" icon="i-heroicons-shield-check" color="sky"
                variant="soft" size="sm" :loading="isChecking">
                Check Status
            </UButton>
            <UButton v-if="!isDbReady" @click="handleInitialize" icon="i-heroicons-arrow-path" color="teacher"
                variant="soft" size="sm" :loading="isInitializing">
                Initialize Database
            </UButton>
        </div>

        <div v-if="isDbReady" class="flex flex-col gap-4">
            <div class="grid gap-3 lg:grid-cols-[16rem_minmax(0,1fr)]">
                <div class="hidden lg:block"></div>
                <div class="flex items-center justify-between gap-3">
                    <div v-if="!isSchemaPreviewSelected" class="flex items-center gap-2">
                        <UButton icon="i-heroicons-chevron-left" variant="soft" color="neutral" size="sm"
                            :disabled="tablePage <= 1" @click="tablePage--" />
                        <span class="text-sm text-gray-500 whitespace-nowrap">{{ tablePage }} / {{ tableTotalPages }}</span>
                        <UButton icon="i-heroicons-chevron-right" variant="soft" color="neutral" size="sm"
                            :disabled="tablePage >= tableTotalPages" @click="tablePage++" />
                        <span class="text-xs text-gray-400 whitespace-nowrap">{{ tableRowCount }} {{ t('rows') }}</span>
                    </div>
                    <div class="ml-auto flex justify-end">
                        <ModernHoverPopover
                            :title="t('refresh_database_popover_title')"
                            :description="t('refresh_database_popover_description')"
                            icon="i-heroicons-circle-stack"
                        >
                            <UButton @click="handleRefreshDatabase" icon="i-heroicons-circle-stack" color="orange"
                                variant="soft" size="sm" :loading="isRefreshingDatabase">
                                {{ t('refresh_database') }}
                            </UButton>
                        </ModernHoverPopover>
                    </div>
                </div>

                <aside class="h-[70vh] w-full overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                    <CustomScrollbar always-visible>
                        <button
                            v-for="item in tableMenuItems"
                            :key="item.value"
                            type="button"
                            class="flex w-full items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 pr-6 text-left text-sm transition-colors last:border-b-0 dark:border-gray-800"
                            :class="value === item.value
                                ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300'
                                : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/70'"
                            @click="value = item.value"
                        >
                            <span class="min-w-0 truncate font-medium">{{ item.label }}</span>
                            <UIcon v-if="value === item.value" name="i-lucide-check" class="h-4 w-4 shrink-0" />
                        </button>
                    </CustomScrollbar>
                </aside>

                <div class="h-[70vh] min-w-0">
                    <DatabaseSchemaDiagram
                        v-if="isSchemaPreviewSelected"
                        :database="systemsStore.selectedSystem?.database?.sqlJsDatabase"
                        :schema-version="systemsStore.selectedSystem?.database?.dbNumber"
                    />
                    <DatabaseTable v-else-if="value" :queryResult="tableQueryResult" :page="tablePage" :tableName="value"
                        @update:totalPages="tableTotalPages = $event" @update:rowCount="tableRowCount = $event" />
                </div>
            </div>
        </div>

        <div v-else
            class="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <UIcon name="i-lucide-database-zap" class="w-12 h-12 text-gray-400 mb-4" />
            <p class="text-gray-500 dark:text-gray-400 font-medium">Database is not ready or being initialized...</p>
        </div>

        <USeparator class="my-4" />

        <!-- Query Execution -->
        <div v-if="canExecuteQuery" class="flex flex-col gap-4">
            <CodeBlock v-model:code="query" language="sql" :label="t('sql_query')" height="125px" :correct="isQueryValid" />
            <div class="flex justify-end items-center">
                <UButton @click="handleExecuteQuery" icon="i-heroicons-arrow-path" color="teacher" variant="soft"
                    size="lg" :loading="isExecuting" :disabled="!isQueryValid">
                    {{ t('execute_query') }}
                </UButton>
            </div>
            <DatabaseTable v-if="queryResult !== null" :queryResult="queryResult" :page="queryPage"
                @update:totalPages="queryTotalPages = $event" @update:rowCount="queryRowCount = $event" />
            <div v-if="queryResult !== null" class="flex items-center gap-2">
                <UButton icon="i-heroicons-chevron-left" variant="soft" color="neutral" size="sm"
                    :disabled="queryPage <= 1" @click="queryPage--" />
                <span class="text-sm text-gray-500 whitespace-nowrap">{{ queryPage }} / {{ queryTotalPages }}</span>
                <UButton icon="i-heroicons-chevron-right" variant="soft" color="neutral" size="sm"
                    :disabled="queryPage >= queryTotalPages" @click="queryPage++" />
                <span class="text-xs text-gray-400 whitespace-nowrap">{{ queryRowCount }} {{ t('rows') }}</span>
            </div>
        </div>
        <div v-else
            class="grid min-h-[210px] place-items-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 text-center dark:border-gray-700 dark:bg-gray-800/50">
            <div>
                <p class="font-medium text-gray-700 dark:text-gray-200">{{ t('database_query_disabled_title') }}</p>
                <p class="mt-1 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                    {{ t('database_query_disabled_description') }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { SqlHandler } from '~/core/SqlHandler'
import { useSystemsStore } from '~/stores/systemsStore'
import { DatabaseHandler } from '~/utils/DatabaseHandler'
import { DatabaseWrapper } from '~/utils/DatabaseWrapper'
import { OperationResultType } from '~/utils/OperationResultType'

const { t } = useI18n()
const toast = useToast()
const { route, systemsStore, systemId } = useSyncSystemId()
const globalSettings = useGlobalSettingsStore()

const SCHEMA_PREVIEW_VALUE = '__schema_preview__'
const tableNames = ref<string[]>([])
const value = ref(SCHEMA_PREVIEW_VALUE)
const tableQueryResult = ref<Awaited<ReturnType<typeof DatabaseHandler.query>> | null>(null)
const tablePage = ref(1)
const tableTotalPages = ref(1)
const tableRowCount = ref(0)
const isSchemaPreviewSelected = computed(() => value.value === SCHEMA_PREVIEW_VALUE)
const tableMenuItems = computed(() => [
    { value: SCHEMA_PREVIEW_VALUE, label: 'Náhled tabulek' },
    ...tableNames.value.map(tableName => ({ value: tableName, label: tableName })),
])

watch(value, async (tableName) => {
    tableQueryResult.value = null
    tablePage.value = 1
    tableTotalPages.value = 1
    tableRowCount.value = 0
    if (!tableName || tableName === SCHEMA_PREVIEW_VALUE) return
    const db = systemsStore.selectedSystem?.database
    if (!db) return
    tableQueryResult.value = await db.query(`SELECT * FROM "${tableName}"`)
    //console.log("Table query result: ", tableQueryResult.value)
})
const isDbReady = ref(false)
const isInitializing = ref(false)
const isChecking = ref(false)
const isRefreshingDatabase = ref(false)

const query = ref('')

const isQueryValid = ref(false)
const selectedTask = computed(() => {
    const taskId = globalSettings.selectedTaskId
    if (!taskId) {
        return null
    }

    return systemsStore.selectedSystem?.tasks?.find(task => task.id === taskId) ?? null
})
const canExecuteQuery = computed(() => {
    if (globalSettings.teacherMode) {
        return true
    }
    if (!globalSettings.hasStartedTasks(systemsStore.selectedSystemId)) {
        return true
    }
    if (!selectedTask.value) {
        return false
    }
    return Boolean(selectedTask.value.canExecuteQuery)
})

watch(query, async (newQuery) => {
    if (!newQuery || newQuery.trim() === '') {
        isQueryValid.value = false
        return
    }
    const system = systemsStore.selectedSystem
    if (system?.database?.sqlJsDatabase) {
        const result = await DatabaseHandler.isSqlValid(system.database.sqlJsDatabase, newQuery)
        isQueryValid.value = result.result === OperationResultType.SUCCESS
    } else {
        isQueryValid.value = false
    }
}, { immediate: true })

const isExecuting = ref(false)
const queryResult = ref<Awaited<ReturnType<typeof DatabaseHandler.query>> | null>(null)
const queryPage = ref(1)
const queryTotalPages = ref(1)
const queryRowCount = ref(0)

watch(canExecuteQuery, (isAllowed) => {
    if (isAllowed) {
        return
    }

    queryResult.value = null
    queryPage.value = 1
})

async function handleExecuteQuery() {
    if (!canExecuteQuery.value) return
    if (!query.value) return
    isExecuting.value = true
    queryResult.value = null
    queryPage.value = 1
    try {
        const system = systemsStore.selectedSystem
        if (system && system.database) {
            queryResult.value = await system.database.query(query.value)
            //console.log("Query result: ", queryResult.value);
            if (queryResult.value.data && queryResult.value.data.length > 0) {
                //console.log("Query result[0]: ", (queryResult.value.data[0] as any).lc);
            }

            const tableColumnMapResult = await DatabaseHandler.getTableColumnMap(system.database.sqlJsDatabase);
            const x = SqlHandler.GetSqlVariableNames(query.value, tableColumnMapResult.data ?? {}, queryResult.value.data ?? []);
            //console.log("Len: ", x.length)
            for (const variable of x) {
                //console.log(variable.toString())
            }

            const isMutation = /^\s*(?:DROP|CREATE|ALTER|INSERT|UPDATE|DELETE|REPLACE)\b/i.test(query.value);
            if (isMutation) {
                await loadDatabaseInfo();
                await systemsStore.updateSystem(system);
            }
        }
    } finally {
        isExecuting.value = false
    }
}

async function handleCheckReady() {
    const system = systemsStore.selectedSystem
    //console.log("Is system missing: ", !system)
    //console.log("Is database missing: ", !system?.database)
}

async function handleInitialize() {
    const system = systemsStore.selectedSystem
    if (system && system.database) {
        isInitializing.value = true
        try {
            await system.database.initializeDatabase()
            await loadDatabaseInfo()
        } catch (error) {
            console.error("Failed to initialize database", error)
        } finally {
            isInitializing.value = false
        }
    }
}

async function handleRefreshDatabase() {
    const system = systemsStore.selectedSystem
    if (!system?.database) {
        toast.add({ title: t('refresh_database_error'), color: 'red', icon: 'i-lucide-alert-triangle' })
        return
    }

    isRefreshingDatabase.value = true
    try {
        await system.database.resetDatabase()
        await systemsStore.updateSystem(system)

        value.value = SCHEMA_PREVIEW_VALUE
        tableQueryResult.value = null
        queryResult.value = null
        tablePage.value = 1
        queryPage.value = 1
        await loadDatabaseInfo()

        toast.add({ title: t('refresh_database_success'), color: 'primary', icon: 'i-lucide-check-circle' })
    } catch (error) {
        console.error("Failed to refresh database", error)
        toast.add({ title: t('refresh_database_error'), color: 'red', icon: 'i-lucide-alert-triangle' })
    } finally {
        isRefreshingDatabase.value = false
    }
}

/**
 * Loads database information including ready status and table names.
 */
const loadDatabaseInfo = async () => {
    const system = systemsStore.selectedSystem
    if (system && system.database) {
        // Use the databaseWrapper method to check if ready
        isDbReady.value = await DatabaseWrapper.isDatabaseInitialized(system.database)

        if (isDbReady.value && system.database.sqlJsDatabase) {
            const result = await DatabaseHandler.getTableNames(system.database.sqlJsDatabase)
            if (result.result === OperationResultType.SUCCESS && result.data) {
                tableNames.value = result.data
                if (value.value !== SCHEMA_PREVIEW_VALUE && !result.data.includes(value.value)) {
                    value.value = SCHEMA_PREVIEW_VALUE
                }
            } else {
                tableNames.value = []
                value.value = SCHEMA_PREVIEW_VALUE
            }
        } else {
            tableNames.value = []
            value.value = SCHEMA_PREVIEW_VALUE
        }
    } else {
        isDbReady.value = false
        tableNames.value = []
        value.value = SCHEMA_PREVIEW_VALUE
    }
}

// Reactively update info when selected system or database state changes
watch(() => systemsStore.selectedSystem?.database, loadDatabaseInfo, { immediate: true })

// Watch for manual database initialization triggers (dbNumber increment)
watch(() => systemsStore.selectedSystem?.database?.dbNumber, loadDatabaseInfo)

</script>
