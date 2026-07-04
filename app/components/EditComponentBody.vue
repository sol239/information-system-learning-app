<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-2 justify-end -mt-2">
      <UTooltip :text="t('decrease_font')" :ui="tooltipUi">
        <UButton
          icon="i-lucide-minus"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="sizeMultiplier -= 0.05"
        />
      </UTooltip>
      <span class="text-xs text-gray-500 font-medium w-10 text-center">
        {{ Math.round(sizeMultiplier * 100) }}%
      </span>
      <UTooltip :text="t('increase_font')" :ui="tooltipUi">
        <UButton
          icon="i-lucide-plus"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="sizeMultiplier += 0.05"
        />
      </UTooltip>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full">
      <CodeBlock
        v-if="htmlAvailable"
        v-model:code="editedHtml"
        language="html"
        label="HTML"
        height="400px"
        :correct="undefined"
        :info-title="t('html_block_info_title')"
        :info-description="t('html_block_info_description')"
        :size-multiplier="sizeMultiplier"
        @is-edited="setCodeBlockEdited('html', $event)"
      />
      <CodeBlock
        v-if="cssAvailable"
        v-model:code="editedCss"
        language="css"
        label="CSS"
        height="400px"
        :correct="undefined"
        :info-title="t('css_block_info_title')"
        :info-description="t('css_block_info_description')"
        :size-multiplier="sizeMultiplier"
        @is-edited="setCodeBlockEdited('css', $event)"
      />
      <CodeBlock
        v-if="jsAvailable"
        v-model:code="editedJs"
        language="typescript"
        label="JS"
        height="400px"
        :correct="undefined"
        :info-title="t('js_block_info_title')"
        :info-description="t('js_block_info_description')"
        :protected-prefix="jsVarsHeader || undefined"
        :size-multiplier="sizeMultiplier"
        @is-edited="setCodeBlockEdited('js', $event)"
      />
      <div v-if="sqlAvailable" class="flex flex-col gap-2">
        <div class="flex flex-row gap-2 w-full items-center">
          <USelect
            id="query-select"
            v-model="selectedSqlQuery"
            :items="sqlQueryNames"
            :placeholder="t('select_sql_query')"
            size="xs"
            class="flex-1"
            :disabled="Object.keys(sqlRecord).length === 1"
            :ui="selectOverlayUi"
          />
          <div class="flex gap-1">
            <UTooltip :text="t('add_sql_query')" :ui="tooltipUi">
              <UButton icon="i-lucide-plus" size="sm" variant="ghost" @click="addQuery" />
            </UTooltip>
            <UTooltip :text="t('remove_sql_query')" :ui="tooltipUi">
              <UButton
                icon="i-lucide-trash-2"
                size="sm"
                variant="ghost"
                color="red"
                :disabled="sqlQueryNames.length <= 1"
                @click="removeQuery"
              />
            </UTooltip>
          </div>
        </div>
        <CodeBlock
          v-model:code="editedSql"
          language="sql"
          label="SQL"
          height="400px"
          :correct="isEditedSqlValid"
          :info-title="t('sql_block_info_title')"
          :info-description="t('sql_block_info_description')"
          :size-multiplier="sizeMultiplier"
          :original-code="originalSqlRecord[selectedSqlQuery] || ''"
          @is-edited="setCodeBlockEdited('sql', $event)"
        />
      </div>
    </div>

    <div v-if="clickActionsAvailable" class="flex items-center gap-2">
      <USeparator class="flex-1" />
      <span class="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {{ t('click_actions') }}
      </span>
      <UPopover mode="hover" arrow :ui="popoverUi">
        <UButton
          icon="i-lucide-info"
          color="neutral"
          variant="ghost"
          size="sm"
          :aria-label="t('show_info')"
        />
        <template #content>
          <div class="app-popover-content">
            <UIcon name="i-lucide-info" class="app-popover-icon" />
            <div class="app-popover-text">
              <strong class="app-popover-title">{{ t('click_actions_info_title') }}</strong>
              <span class="app-popover-description">{{ t('click_actions_info_description') }}</span>
            </div>
          </div>
        </template>
      </UPopover>
      <USeparator class="flex-1" />
    </div>

    <div v-if="clickActionsAvailable" class="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
      <div v-if="jsClickAvailable" class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {{ t('js_click_action') }}
          </span>
          <UButton
            v-if="!editedJsClick"
            icon="i-lucide-plus"
            size="sm"
            variant="ghost"
            :label="t('add_action')"
            @click="editedJsClick = '// click logic here'"
          />
          <UButton
            v-else
            icon="i-lucide-trash-2"
            size="sm"
            variant="ghost"
            color="red"
            @click="editedJsClick = ''"
          />
        </div>

        <CodeBlock
          v-if="editedJsClick"
          v-model:code="editedJsClick"
          language="typescript"
          height="200px"
          label="JS Click"
          :correct="undefined"
          :info-title="t('js_click_block_info_title')"
          :info-description="t('js_click_block_info_description')"
          :size-multiplier="sizeMultiplier"
          @is-edited="setCodeBlockEdited('jsClick', $event)"
        />
        <div
          v-else
          class="flex flex-row items-center gap-2 py-4 px-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200"
        >
          <UIcon name="i-lucide-mouse-pointer-2" class="w-5 h-5 text-gray-400" />
          <p class="text-xs text-gray-500 font-medium">{{ t('no_js_click_action') }}</p>
        </div>
      </div>

      <div v-if="sqlClickAvailable" class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0">
            {{ t('sql_click_actions') }}
          </span>
          <USelect
            v-if="sqlClickQueryNames.length > 0"
            v-model="selectedSqlClickQuery"
            :items="sqlClickQueryNames"
            placeholder="Select SQL click query"
            size="xs"
            class="flex-1"
            :disabled="sqlClickQueryNames.length <= 1"
            :ui="selectOverlayUi"
          />
          <div class="flex gap-1">
            <UTooltip :text="t('add_sql_click_query')" :ui="tooltipUi">
              <UButton icon="i-lucide-plus" size="sm" variant="ghost" @click="addClickQuery" />
            </UTooltip>
            <UTooltip :text="t('remove_sql_click_query')" :ui="tooltipUi">
              <UButton
                icon="i-lucide-trash-2"
                size="sm"
                variant="ghost"
                color="red"
                :disabled="sqlClickQueryNames.length === 0"
                @click="removeClickQuery"
              />
            </UTooltip>
          </div>
        </div>

        <div v-if="sqlClickQueryNames.length > 0" class="flex flex-col gap-2">
          <CodeBlock
            v-model:code="editedSqlClick"
            language="sql"
            height="200px"
            label="SQL Click"
            :info-title="t('sql_click_block_info_title')"
            :info-description="t('sql_click_block_info_description')"
            :size-multiplier="sizeMultiplier"
            :original-code="originalSqlClickRecord[selectedSqlClickQuery] || ''"
            @is-edited="setCodeBlockEdited('sqlClick', $event)"
          />
        </div>
        <div
          v-else
          class="flex flex-row items-center gap-2 py-4 px-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200"
        >
          <UIcon name="i-lucide-database-zap" class="w-5 h-5 text-gray-400" />
          <p class="text-xs text-gray-500 font-medium">{{ t('no_sql_click_action') }}</p>
        </div>
      </div>
    </div>

    <USeparator />

    <div class="flex flex-wrap items-start gap-4">
      <div v-if="generalVariableNames.length > 0" class="text-left">
        <div class="mb-2 flex items-center gap-1">
          <p class="text-xs text-left font-semibold uppercase tracking-wider text-indigo-600">
            {{ t('available_general_variables') }}
          </p>
          <UPopover mode="hover" arrow :ui="popoverUi">
            <UButton icon="i-lucide-info" color="neutral" variant="ghost" size="sm" :aria-label="t('show_info')" />
            <template #content>
              <div class="app-popover-content">
                <UIcon name="i-lucide-info" class="app-popover-icon" />
                <div class="app-popover-text">
                  <strong class="app-popover-title">{{ t('available_general_variables') }}</strong>
                  <span class="app-popover-description">{{ t('general_variables_info_description') }}</span>
                </div>
              </div>
            </template>
          </UPopover>
        </div>
        <div class="flex flex-wrap gap-2 text-left">
          <div v-for="name in generalVariableNames" :key="name" class="general-var-card text-left">
            <span class="general-var-name">{{ name }}</span>
            <span class="general-var-value">{{ formatVariablesPreview(name, localVariables.generalVariables) }}</span>
          </div>
        </div>
      </div>

      <div v-if="sqlVariableNames.length > 0">
        <div class="mb-2 flex items-center gap-1">
          <p class="text-xs font-semibold uppercase tracking-wider text-sky-600">
            {{ t('available_sql_variables') }}
          </p>
          <UPopover mode="hover" arrow :ui="popoverUi">
            <UButton icon="i-lucide-info" color="neutral" variant="ghost" size="sm" :aria-label="t('show_info')" />
            <template #content>
              <div class="app-popover-content">
                <UIcon name="i-lucide-info" class="app-popover-icon" />
                <div class="app-popover-text">
                  <strong class="app-popover-title">{{ t('available_sql_variables') }}</strong>
                  <span class="app-popover-description">{{ t('sql_variables_info_description') }}</span>
                </div>
              </div>
            </template>
          </UPopover>
        </div>
        <div class="flex flex-wrap gap-2">
          <div v-for="name in sqlVariableNames" :key="name" class="sql-var-card">
            <span class="sql-var-name">{{ name }}</span>
            <span class="sql-var-value">{{ formatVariablesPreview(name, localVariables.sqlVariables) }}</span>
          </div>
        </div>
      </div>

      <div v-if="jsVariableNames.length > 0">
        <div class="mb-2 flex items-center gap-1">
          <p class="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            {{ t('available_js_variables') }}
          </p>
          <UPopover mode="hover" arrow :ui="popoverUi">
            <UButton icon="i-lucide-info" color="neutral" variant="ghost" size="sm" :aria-label="t('show_info')" />
            <template #content>
              <div class="app-popover-content">
                <UIcon name="i-lucide-info" class="app-popover-icon" />
                <div class="app-popover-text">
                  <strong class="app-popover-title">{{ t('available_js_variables') }}</strong>
                  <span class="app-popover-description">{{ t('js_variables_info_description') }}</span>
                </div>
              </div>
            </template>
          </UPopover>
        </div>
        <div class="flex flex-wrap gap-2">
          <div v-for="name in jsVariableNames" :key="name" class="js-var-card">
            <span class="js-var-name">{{ name }}</span>
            <span class="js-var-value">{{ formatVariablesPreview(name, localVariables.jsVariables) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-dynamic-delete, @typescript-eslint/unified-signatures */
/* 1. Imports */
import type { QueryExecResult } from 'sql.js'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { JsHandler } from '~/core/components/variables/JsHandler'
import { SqlHandler } from '~/core/components/variables/SqlHandler'
import { TableMap } from '~/core/components/variables/TableMap'
import type { Component as SystemComponent } from '~/model/Component'
import { ComponentVariables, Variable } from '~/model/ComponentVariables'
import type { VariableType } from '~/model/types/VariableType'
import { useSystemsStore } from '~/stores/systemsStore'
import {
  codeEditEnvironmentFromRuntimeConfig,
  effectiveCodeEditPermissions,
  type CodeEditPermissions
} from '~/utils/codeEditPermissions'
import { DatabaseHandler } from '~/utils/DatabaseHandler'
import { DatabaseWrapper } from '~/utils/DatabaseWrapper'

/* 2. Stores */
const systemsStore = useSystemsStore()

/* 3. Context hooks */
const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()

/* 4. Constants (non-reactive) */
const selectOverlayUi = {
  content: 'z-[10020]'
}
const popoverUi = {
  content: 'z-[10050]'
}
const tooltipUi = {
  content: 'z-[10050]'
}

/* 5. Props */
const props = defineProps<{
  component: SystemComponent
  variables?: ComponentVariables
  codeEditPermissions?: Partial<CodeEditPermissions>
  ignoreTaskCodeEditPermissions?: boolean
}>()

/* 6. Emits */
const emit = defineEmits<{
  (e: 'validation-change', isValid: boolean): void
  (e: 'edit-change', isEdited: boolean): void
}>()

/* 7. Template refs */

/* 8. State (ref, reactive) */
const editedHtml = ref(props.component.html)
const editedCss = ref(props.component.css)
const editedJs = ref(props.component.js)
const editedSql = ref('')
const editedJsClick = ref(props.component.js_click || '')
const editedSqlClick = ref('')
const sizeMultiplier = ref(0.7)
const selectedSqlQuery = ref<string>('')
const selectedSqlClickQuery = ref<string>('')
const isEditedSqlValid = ref(true)
const localVariables = ref<ComponentVariables>(new ComponentVariables())
const sqlRecord = ref<Record<string, string>>({ ...(props.component.sql ?? {}) })
const sqlClickRecord = ref<Record<string, string>>({ ...(props.component.sql_click ?? {}) })
const codeBlockEdited = reactive<Record<string, boolean>>({})
const originalSqlRecord = { ...(props.component.sql ?? {}) }
const originalSqlClickRecord = { ...(props.component.sql_click ?? {}) }

/* 9. Computed */
const db = computed(() => systemsStore.selectedSystem?.database ?? undefined)
const codeEditEnvironment = computed(() =>
  codeEditEnvironmentFromRuntimeConfig(runtimeConfig.public as Record<string, unknown>)
)
const availableCodeEdits = computed(() =>
  props.ignoreTaskCodeEditPermissions
    ? codeEditEnvironment.value
    : effectiveCodeEditPermissions(props.codeEditPermissions, codeEditEnvironment.value)
)
const htmlAvailable = computed(() => availableCodeEdits.value.html)
const cssAvailable = computed(() => availableCodeEdits.value.css)
const jsAvailable = computed(() => availableCodeEdits.value.js)
const sqlAvailable = computed(() => availableCodeEdits.value.sql)
const jsClickAvailable = computed(() => availableCodeEdits.value.js_click)
const sqlClickAvailable = computed(() => availableCodeEdits.value.sql_click)
const clickActionsAvailable = computed(() => jsClickAvailable.value || sqlClickAvailable.value)
const sqlQueryNames = computed(() => Object.keys(sqlRecord.value))
const sqlClickQueryNames = computed(() => Object.keys(sqlClickRecord.value))
const sqlVariableNames = computed(() => localVariables.value.sqlVariables.map(v => v.name))
const jsVariableNames = computed(() => localVariables.value.jsVariables.map(v => v.name))
const generalVariableNames = computed(() => localVariables.value.generalVariables.map(v => v.name))
const isBodyEdited = computed(() => {
  return Object.values(codeBlockEdited).some(Boolean)
    || editedHtml.value !== props.component.html
    || editedCss.value !== props.component.css
    || editedJs.value !== props.component.js
    || (editedJsClick.value || '') !== (props.component.js_click || '')
    || !recordsEqual(sqlRecord.value, originalSqlRecord)
    || !recordsEqual(sqlClickRecord.value, originalSqlClickRecord)
})
const jsVarsHeader = computed<string>(() => {
  const vars = [...(localVariables.value.generalVariables ?? []), ...(localVariables.value.sqlVariables ?? [])]
  const userCodeComment = `// ${t('js_user_code_comment')}`

  if (vars.length === 0) return userCodeComment

  return [
    `// ${t('js_available_constants_comment')}`,
    JsHandler.getVariablesIntoJs(vars).trimEnd(),
    '',
    userCodeComment
  ].join('\n')
})

/* 10. Watchers */
watch(isEditedSqlValid, (valid) => emit('validation-change', valid), { immediate: true })
watch(isBodyEdited, (edited) => emit('edit-change', edited), { immediate: true })

watch(editedJs, (newJs) => {
  if (!newJs) {
    localVariables.value.jsVariables = []
    return
  }

  try {
    const fullCode = jsVarsHeader.value ? `${jsVarsHeader.value}\n${newJs}` : newJs
    localVariables.value.jsVariables = JsHandler.getJsVariables(fullCode, newJs)
  } catch {
    localVariables.value.jsVariables = []
  }
})

watch(editedSql, async (newSql) => {
  if (!db.value) return

  sqlRecord.value[selectedSqlQuery.value] = newSql
  localVariables.value.sqlVariables = []

  const replacedSql = SqlHandler.ReplaceSqlForVariablesInRecord(localVariables.value, sqlRecord.value)
  await populateSqlVariables(replacedSql)
})

watch(editedSqlClick, (newSql) => {
  if (!selectedSqlClickQuery.value) return

  sqlClickRecord.value[selectedSqlClickQuery.value] = newSql
})

watch(selectedSqlQuery, (newQuery) => {
  editedSql.value = sqlRecord.value[newQuery] || ''
})

watch(selectedSqlClickQuery, (newQuery) => {
  editedSqlClick.value = sqlClickRecord.value[newQuery] || ''
})

/* 11. Methods */
function recordsEqual(first: Record<string, string>, second: Record<string, string>) {
  const firstKeys = Object.keys(first).sort()
  const secondKeys = Object.keys(second).sort()

  if (firstKeys.length !== secondKeys.length) return false

  return firstKeys.every((key, index) => key === secondKeys[index] && (first[key] || '') === (second[key] || ''))
}

function formatVariablesPreview(name: string, variables: Variable[]): string {
  const values = variables?.find(v => v.name === name)?.variable

  if (!values && values !== 0 && values !== false as any) return '---'

  if (Array.isArray(values)) {
    const preview = values.slice(0, 5).map(v => String(v)).join(', ')
    return values.length > 5 ? `${preview}, ... (${values.length} total)` : preview
  }

  return String(values)
}

function addQuery() {
  const newQueryName = `query${Object.keys(sqlRecord.value).length + 1}`
  sqlRecord.value[newQueryName] = ''
  selectedSqlQuery.value = newQueryName
}

function setCodeBlockEdited(block: string, edited: boolean) {
  codeBlockEdited[block] = edited
}

function removeQuery() {
  const current = selectedSqlQuery.value
  if (!current || sqlQueryNames.value.length <= 1) return

  delete sqlRecord.value[current]
  selectedSqlQuery.value = Object.keys(sqlRecord.value).sort((a, b) => a.localeCompare(b))[0] || ''
}

function addClickQuery() {
  const newQueryName = `clickQuery${Object.keys(sqlClickRecord.value).length + 1}`
  sqlClickRecord.value[newQueryName] = ''
  selectedSqlClickQuery.value = newQueryName
  editedSqlClick.value = ''
}

function removeClickQuery() {
  const current = selectedSqlClickQuery.value
  if (!current) return

  delete sqlClickRecord.value[current]
  selectedSqlClickQuery.value = Object.keys(sqlClickRecord.value).sort((a, b) => a.localeCompare(b))[0] || ''
  editedSqlClick.value = sqlClickRecord.value[selectedSqlClickQuery.value] || ''
}

async function populateSqlVariables(queries: Record<string, string>) {
  const tableMap = await DatabaseHandler.getTableColumnMap(db.value?.sqlJsDatabase ?? null)

  for (const sql of Object.values(queries)) {
    const result: QueryExecResult[] = (await db.value!.query(sql)).data ?? []
    const values = result.length > 0 ? Object.values(result[0].values) : []
    const vars: TableMap[] = SqlHandler.GetSqlVariableNames(sql, tableMap.data ?? {}, result)

    if (!vars || vars.length === 0) continue

    const pushIfUnique = (variable: Variable) => {
      if (!localVariables.value.sqlVariables.some(v => v.name === variable.name)) {
        localVariables.value.sqlVariables.push(variable)
      }
    }

    if (values.length === 1) {
      for (let i = 0; i < vars.length; i++) {
        const varType: VariableType = TableMap.getVariableTypeFromColumnType(vars[i].columnType) || 'unknown'
        const rawValue = values[0][i]
        const value: VariableType = varType instanceof Date && rawValue !== null ? new Date(rawValue as string) : (rawValue as VariableType) ?? varType
        pushIfUnique(new Variable(vars[i].variableAsName, value))
      }
    } else if (values.length > 1) {
      for (let i = 0; i < vars.length; i++) {
        const varType: VariableType = TableMap.getVariableTypeFromColumnType(vars[i].columnType) || 'unknown'
        const columnValues: VariableType[] = values.map(row => {
          const rawValue = row[i]
          return varType instanceof Date && rawValue !== null ? new Date(rawValue as string) : (rawValue as VariableType) ?? varType
        })
        pushIfUnique(new Variable(vars[i].variableAsName, columnValues))
      }
    }
  }
}

function getDraftData() {
  if (selectedSqlClickQuery.value) {
    sqlClickRecord.value[selectedSqlClickQuery.value] = editedSqlClick.value
  }

  const updatedComponent = {
    ...props.component,
    html: editedHtml.value,
    css: editedCss.value,
    js: editedJs.value,
    sql: { ...sqlRecord.value },
    js_click: editedJsClick.value,
    sql_click: { ...sqlClickRecord.value }
  }

  return {
    updatedComponent: updatedComponent as SystemComponent,
    updatedVariables: localVariables.value
  }
}

/* 12. Lifecycle */
onMounted(() => {
  selectedSqlQuery.value = sqlQueryNames.value.sort((a, b) => a.localeCompare(b))[0] || ''
  editedSql.value = sqlRecord.value[selectedSqlQuery.value] || ''

  selectedSqlClickQuery.value = sqlClickQueryNames.value.sort((a, b) => a.localeCompare(b))[0] || ''
  editedSqlClick.value = sqlClickRecord.value[selectedSqlClickQuery.value] || ''

  const source = props.variables ?? props.component.variables
  localVariables.value.generalVariables = [...source.generalVariables]
  localVariables.value.sqlVariables = [...source.sqlVariables]

  if (editedJs.value) {
    try {
      const fullCode = jsVarsHeader.value ? `${jsVarsHeader.value}\n${editedJs.value}` : editedJs.value
      localVariables.value.jsVariables = JsHandler.getJsVariables(fullCode, editedJs.value)
    } catch {
      localVariables.value.jsVariables = [...source.jsVariables]
    }
  } else {
    localVariables.value.jsVariables = [...source.jsVariables]
  }
})

/* 13. defineExpose */
defineExpose({
  getDraftData
})

</script>

<style scoped>
.sql-var-card,
.js-var-card,
.general-var-card {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 14px;
  border-radius: 10px;
  min-width: 80px;
  transition: border-color 0.15s, background 0.15s;
}

.sql-var-card {
  border: 1px solid rgba(14, 165, 233, 0.25);
  background: rgba(14, 165, 233, 0.06);
}

.sql-var-card:hover {
  border-color: rgba(14, 165, 233, 0.5);
  background: rgba(14, 165, 233, 0.1);
}

.sql-var-name {
  font-size: 0.7rem;
  font-weight: 600;
  color: #0ea5e9;
  opacity: 0.8;
}

.sql-var-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.js-var-card {
  border: 1px solid rgba(16, 185, 129, 0.25);
  background: rgba(16, 185, 129, 0.06);
}

.js-var-card:hover {
  border-color: rgba(16, 185, 129, 0.5);
  background: rgba(16, 185, 129, 0.1);
}

.js-var-name {
  font-size: 0.7rem;
  font-weight: 600;
  color: #10b981;
  opacity: 0.8;
}

.js-var-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.general-var-card {
  border: 1px solid rgba(99, 102, 241, 0.25);
  background: rgba(99, 102, 241, 0.06);
}

.general-var-card:hover {
  border-color: rgba(99, 102, 241, 0.5);
  background: rgba(99, 102, 241, 0.1);
}

.general-var-name {
  font-size: 0.7rem;
  font-weight: 600;
  color: #6366f1;
  opacity: 0.8;
}

.general-var-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}
</style>
