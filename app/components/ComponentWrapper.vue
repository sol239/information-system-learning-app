<template>
  <div
    ref="wrapperRef"
    :data-component-id="props.component.id"
    :class="['component-wrapper', {
      'highlight-active': highlightStore.isHighlightActive,
      'is-highlighted': highlightStore.isHighlightActive && highlightStore.selectedHighlightedComponentsIds.has(props.component.id),
      'teacher-outline': globalSettings.teacherMode && globalSettings.teacherHighlightEnabled,
      'teacher-outline--selected': globalSettings.teacherMode && globalSettings.teacherHighlightEnabled && globalSettings.selectedComponents?.has(props.component.id),
    }]"
    @click="handleClick"
    @input="handleInput"
    @change="handleChange"
  >
    <div :class="['content-container', { 'edit-mode': isEditEnabled }]">
      <div v-if="isJustRepaired" class="repaired-overlay" />

      <div v-if="!globalSettings.teacherMode">
        <span
          v-if="isEditEnabled"
          :class="['edit-icon', `edit-component-button-${String(props.component.id)}`]"
          @click.stop="handleEdit"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        </span>
      </div>
      <div
        v-else-if="globalSettings.teacherHighlightEnabled"
        class="teacher-mode-overlay"
        @click.stop="handleTeacherModeClick"
      >
        <UBadge
          :color="globalSettings.selectedComponents?.has(props.component.id) ? 'red' : 'blue'"
          variant="solid"
          size="md"
          class="teacher-icon"
          style="cursor: pointer;"
        >
          {{ globalSettings.selectedComponents?.has(props.component.id) ? '✓ ' + props.component.name : props.component.name }}
        </UBadge>
      </div>

      <div
        :class="['component-html', { 'content-interaction-disabled': (globalSettings.teacherMode && globalSettings.teacherHighlightEnabled) || highlightStore.isHighlightActive }]"
        v-html="resolvedComponentHtml"
      />
    </div>

    <EditComponentModal
      v-model:open="isEditModalOpened"
      :component="props.component"
      :variables="componentVariables"
      :code-edit-permissions="selectedTaskCodeEditPermissions"
      @save="handleModalSave"
    />
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-dynamic-delete, vue/no-mutating-props */
/* 1. Imports */
import type { QueryExecResult } from 'sql.js'
import { computed, nextTick, onBeforeUnmount, onBeforeUpdate, onMounted, onUpdated, reactive, ref, watch } from 'vue'
import { HtmlHandler } from '~/core/components/variables/HtmlHandler.js'
import { JsHandler } from '~/core/components/variables/JsHandler.js'
import { SqlHandler } from '~/core/components/variables/SqlHandler.js'
import { TableMap } from '~/core/components/variables/TableMap.js'
import { useSystemInputVariables } from '~/composables/useSystemInputVariables'
import type { Component as SystemComponent } from '~/model/Component'
import { ComponentVariables, Variable } from '~/model/ComponentVariables'
import type { VariableType } from '~/model/types/VariableType'
import { useHighlightStore } from '~/stores/highlightStore'
import { useSystemsStore } from '~/stores/systemsStore'
import { DatabaseHandler } from '~/utils/DatabaseHandler'
import type { DatabaseWrapper } from '~/utils/DatabaseWrapper'
import type { CodeEditPermissions } from '~/utils/codeEditPermissions'
import { OperationResultType } from '~/utils/Operation/OperationResultType.js'
import EditComponentModal from './EditComponentModal.vue'

/* 2. Stores */
const systemsStore = useSystemsStore()
const highlightStore = useHighlightStore()
const globalSettings = useGlobalSettingsStore()

/* 3. Context hooks */
const toast = useToast()
const { t } = useI18n()
const { systemInputVariables, upsertSystemInputVariable, upsertSystemComputedVariable, removeSystemInputVariable } = useSystemInputVariables()

/* 4. Constants (non-reactive) */
const componentCodeUpdatedEventName = 'component-code-updated'
const componentsRepairedEventName = 'components-repaired'

/* 5. Props */
const props = defineProps<{
  component: SystemComponent
}>()

/* 6. Emits */
const emit = defineEmits<{
  'action-completed': [payload: { componentId: string; type: 'click-sql' | 'modal-sql'; sql?: string }]
}>()

/* 7. Template refs */
const wrapperRef = ref<HTMLElement | null>(null)

/* 8. State (ref, reactive) */
const styleId = `component-style-${props.component.id}`
const isEditModalOpened = ref(false)
const isActionModalOpened = ref(false)
const isSubmittingActionModal = ref(false)
const actionModalError = ref('')
const modalFormState = reactive<Record<string, string | number>>({})
const isJustRepaired = ref(false)
const componentVariables = ref<ComponentVariables>(new ComponentVariables())
const ownedSystemVariableNames = new Set<string>()
const ownedComputedVariableNames = new Set<string>()

let db: DatabaseWrapper | undefined = undefined
let isRefreshingSqlVars = false
let activeInputSnapshotBeforeUpdate: ActiveInputSnapshot | null = null

type ComponentCodeUpdatedEvent = CustomEvent<{ componentId: string }>
type ComponentsRepairedEvent = CustomEvent<{ componentIds?: string[] }>

type ActiveInputSnapshot = {
  identifier: string
  value: string
  selectionStart: number | null
  selectionEnd: number | null
}

type SystemFormControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

/* 9. Computed */
const isEditEnabled = computed(() => highlightStore.isEditModeActive)
const declaredJsVariableNames = computed(() => new Set(JsHandler.getDeclaredVariableNames(props.component.js ?? '')))
const selectedTaskCodeEditPermissions = computed<Partial<CodeEditPermissions> | undefined>(() => {
  const taskId = globalSettings.selectedTaskId
  if (!taskId) return undefined

  return systemsStore.selectedSystem?.tasks?.find(task => task.id === taskId)?.codeEditPermissions
})

const externalSystemVariables = computed(() =>
  systemInputVariables.value.filter(variable => !declaredJsVariableNames.value.has(variable.name))
)

const resolvedVariables = computed<ComponentVariables>(() => {
  const merged = new ComponentVariables()
  merged.generalVariables = [...(componentVariables.value.generalVariables ?? [])]
  merged.sqlVariables = [...(componentVariables.value.sqlVariables ?? [])]
  merged.jsVariables = mergeVariablesByName(
    componentVariables.value.jsVariables ?? [],
    externalSystemVariables.value
  )
  return merged
})

const resolvedComponentHtml = computed(() =>
  HtmlHandler.ReplaceHtmlForVariables(resolvedVariables.value, props.component.html)
)

const jsVarsHeader = computed<string>(() => {
  const vars = mergeVariablesByName(
    componentVariables.value.generalVariables ?? [],
    componentVariables.value.sqlVariables ?? [],
    externalSystemVariables.value
  )

  if (vars.length === 0) return ''

  return JsHandler.getVariablesIntoJs(vars)
})

/* 10. Watchers */
watch(() => [componentVariables.value, systemInputVariables.value], () => applyStyle(props.component.css), { deep: true });

watch(systemInputVariables, () => {
  void refreshJsVariables({ preserveActiveInput: true });
}, { deep: true });

watch(() => props.component.variables?.generalVariables, (newVars) => {
  componentVariables.value.generalVariables = newVars ?? [];
}, { deep: true, immediate: true });

watch(() => globalSettings.solvedComponentIds.includes(props.component.id), (isSolved, wasSolved) => {
  if (isSolved && wasSolved === false) {
    showRepairedOverlay();
  }
}, { immediate: true });

watch(() => [props.component.html, props.component.css, props.component.js, props.component.sql], async (newVals, oldVals) => {
  const changed = newVals.some((val, i) => val !== oldVals[i]);
  if (changed) {
    await refreshComponentCode();
  }
});

watch(() => systemsStore.selectedSystem?.database?.dbNumber, async () => {
  if (!db || !props.component.sql || isRefreshingSqlVars) return;
  isRefreshingSqlVars = true;
  try {
    componentVariables.value.sqlVariables = [];
    const replacedSql: Record<string, string> = SqlHandler.ReplaceSqlForVariablesInRecord(componentVariables.value, props.component.sql);
    await populateSqlVariables(replacedSql);
  } finally {
    isRefreshingSqlVars = false;
  }
});

/* 11. Methods */
function mergeVariablesByName(...groups: Array<Variable[] | undefined>): Variable[] {
  const merged = new Map<string, Variable>()

  for (const group of groups) {
    for (const variable of group ?? []) {
      merged.set(variable.name, variable)
    }
  }

  return Array.from(merged.values())
}

function handleEdit() {
  isEditModalOpened.value = true;
}

function handleTeacherModeClick() {
  if (!globalSettings.selectedTaskId) return
  const system = systemsStore.selectedSystem
  if (!system) return

  const task = system.tasks?.find(t => t.id === globalSettings.selectedTaskId)
  if (!task) return

  const componentId = props.component.id
  if (globalSettings.selectedComponents?.has(componentId)) {
    task.errorComponents = task.errorComponents.filter(c => c.id !== componentId)
    globalSettings.selectedComponents.delete(componentId)
  } else {
    task.errorComponents.push(props.component)
    globalSettings.selectedComponents.add(componentId)
  }
  void systemsStore.updateSystem(system)
}

function hasDisabledActionControl() {
  return !!wrapperRef.value?.querySelector('button:disabled, input:disabled, select:disabled, textarea:disabled, [aria-disabled="true"]');
}

function resolveActionTemplate(template: string) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key: string) => {
    const value = modalFormState[key];
    return String(value ?? '').replace(/'/g, "''");
  });
}

function validateActionModal() {
  const modalConfig = props.component.modal;
  if (!modalConfig) return null;

  for (const field of modalConfig.fields) {
    const rawValue = modalFormState[field.name];
    const value = typeof rawValue === 'string' ? rawValue.trim() : rawValue;

    if (field.required && (value === '' || value === undefined || value === null)) {
      return `Field "${field.label}" is required.`;
    }

    if (field.type === 'number' && value !== '' && Number.isNaN(Number(value))) {
      return `Field "${field.label}" must be a valid number.`;
    }
  }

  if ('from' in modalFormState && 'to' in modalFormState) {
    const fromDate = new Date(String(modalFormState.from));
    const toDate = new Date(String(modalFormState.to));
    if (!Number.isNaN(fromDate.getTime()) && !Number.isNaN(toDate.getTime()) && fromDate > toDate) {
      return 'The "from" date must be earlier than or equal to the "to" date.';
    }
  }

  if ('capacity' in modalFormState && Number(modalFormState.capacity) < 1) {
    return 'Capacity must be at least 1.';
  }

  return null;
}

async function executeActionSql(sql: string) {
  //console.log('Executing SQL:', sql);
  if (!db) {
    throw new Error('Database is not ready.');
  }

  const trimmedSql = sql.trim();
  if (!trimmedSql) {
    throw new Error('SQL query is empty.');
  }

  const operation = /^\s*select\b/i.test(trimmedSql)
    ? await db.query(trimmedSql)
    : await db.execute(trimmedSql);

  if (operation.result !== OperationResultType.SUCCESS) {
    throw new Error(operation.message);
  }
}

async function persistDatabaseChanges() {
  if (systemsStore.selectedSystem) {
    await systemsStore.updateSystem(systemsStore.selectedSystem);
  }
}

async function handleActionModalSubmit() {
  const modalConfig = props.component.modal;
  if (!modalConfig) return;

  actionModalError.value = '';
  const validationError = validateActionModal();
  if (validationError) {
    actionModalError.value = validationError;
    return;
  }

  const sqlFieldName = modalConfig.submitSqlFieldName;
  const sqlTemplate = sqlFieldName ? String(modalFormState[sqlFieldName] ?? '') : '';
  const resolvedSql = resolveActionTemplate(sqlTemplate);

  if (!resolvedSql.trim()) {
    actionModalError.value = 'SQL query is empty.';
    return;
  }

  isSubmittingActionModal.value = true;

  try {
    await executeActionSql(resolvedSql);
    await persistDatabaseChanges();

    toast.add({
      title: modalConfig.successMessage ?? 'Action completed successfully.',
      color: 'primary',
      icon: 'i-heroicons-check'
    });

    isActionModalOpened.value = false;
    emit('action-completed', { componentId: props.component.id, type: 'modal-sql', sql: resolvedSql });
  } catch (error) {
    actionModalError.value = error instanceof Error ? error.message : String(error);
  } finally {
    isSubmittingActionModal.value = false;
  }
}

async function handleModalSave(payload: { updatedComponent: SystemComponent, updatedVariables: ComponentVariables }) {
  const originalComponent = systemsStore.getComponentById(props.component.id);
  if (originalComponent) {
    // Update the original component so all instances are updated and it successfully synchronizes to DB
    Object.assign(originalComponent, payload.updatedComponent);
    
    // If the current component is a clone (Object.create), avoid masking the prototype with own properties
    if (originalComponent !== props.component) {
      for (const key in payload.updatedComponent) {
        if (Object.prototype.hasOwnProperty.call(props.component, key) && key !== 'variables') {
          delete (props.component as any)[key];
        }
      }
    }
  } else {
    // Update local component properties
    Object.assign(props.component, payload.updatedComponent);
  }

  // Update local variables for v-html rendering
  componentVariables.value = payload.updatedVariables;

  // Apply new CSS
  applyStyle(props.component.css);

  if (import.meta.client) {
    window.dispatchEvent(new CustomEvent(componentCodeUpdatedEventName, {
      detail: { componentId: props.component.id }
    }));
  }

  if (systemsStore.selectedSystem) {
    await systemsStore.updateSystem(systemsStore.selectedSystem);
  }
}

function handleClick(event: MouseEvent) {
  if (globalSettings.teacherMode && globalSettings.teacherHighlightEnabled) {
    return;
  }

  if (highlightStore.isHighlightActive) {
    highlightStore.selectHighlightedComponent(props.component.id);
    return;
  }

  const target = event.target;
  if (
    target instanceof Element &&
    target.closest('button:disabled, input:disabled, select:disabled, textarea:disabled, [aria-disabled="true"]')
  ) {
    return;
  }

  if (hasDisabledActionControl()) {
    return;
  }

  // execute js code on click if exists
  if (props.component.js_click) {
    try {
      const resolvedJs = HtmlHandler.ReplaceTextForVariables(resolvedVariables.value, props.component.js_click);
      const fullCode = jsVarsHeader.value ? `${jsVarsHeader.value}\n${resolvedJs}` : resolvedJs;
      componentVariables.value.jsVariables = JsHandler.getJsVariables(fullCode, resolvedJs);
    } catch (e) {
      console.error('Error executing click JS code:', e);
    }
  }

  // execute all sql
  if (props.component.sql_click) {
    void (async () => {
      try {
        for (const sql of Object.values(props.component.sql_click)) {
          const resolvedSql = HtmlHandler.ReplaceTextForVariables(resolvedVariables.value, sql);
          await executeActionSql(resolvedSql);
        }

        await persistDatabaseChanges();
        emit('action-completed', { componentId: props.component.id, type: 'click-sql' });
      }
      catch (e) {
        console.error('Error executing click SQL code:', e);
      }
    })();
  }
}

function applyStyle(css: string) {
  let el = document.getElementById(styleId);
  if (!el) {
    el = document.createElement('style');
    el.id = styleId;
    document.head.appendChild(el);
  }
  const resolvedCss = HtmlHandler.ReplaceCssForVariables(resolvedVariables.value, css);
  el.textContent = resolvedCss;
}

function showRepairedOverlay() {
  isJustRepaired.value = false;
  void nextTick(() => {
    isJustRepaired.value = true;
    setTimeout(() => {
      isJustRepaired.value = false;
    }, 1500);
  });
}

async function populateSqlVariables(sqlRecord: Record<string, string>) {
  const tableMap = await DatabaseHandler.getTableColumnMap(db.sqlJsDatabase!);

  for (const [queryName, sql] of Object.entries(sqlRecord)) {
    const result: QueryExecResult[] = (await DatabaseHandler.query(db!.sqlJsDatabase!, sql)).data ?? [];
    const values = result.length > 0 ? Object.values(result[0].values) : [];

    const vars: TableMap[] = SqlHandler.GetSqlVariableNames(sql, tableMap.data ?? {}, result);

    if (vars === undefined || vars.length === 0) continue;

    const pushIfUnique = (variable: Variable) => {
      if (!componentVariables.value.sqlVariables.some(v => v.name === variable.name)) {
        componentVariables.value.sqlVariables.push(variable);
      }
    };

    if (values.length == 1) {
      for (let i = 0; i < vars.length; i++) {
        const varType: VariableType = TableMap.getVariableTypeFromColumnType(vars[i].columnType) || 'unknown';
        const rawValue = values[0][i];
        const value: VariableType = varType instanceof Date && rawValue !== null
          ? new Date(rawValue as string)
          : rawValue as VariableType;
        pushIfUnique(new Variable(vars[i].variableAsName, value));
      }
    } else if (values.length > 1) {
      for (let i = 0; i < vars.length; i++) {
        const varType: VariableType = TableMap.getVariableTypeFromColumnType(vars[i].columnType) || 'unknown';
        const columnValues: VariableType[] = values.map(row => {
          const rawValue = row[i];
          return varType instanceof Date && rawValue !== null
            ? new Date(rawValue as string)
            : rawValue as VariableType;
        });
        pushIfUnique(new Variable(vars[i].variableAsName, columnValues));
      }
    }
  }
}

function getVariableValue(input: SystemFormControl): VariableType | null {
  if (input instanceof HTMLSelectElement) {
    return input.value;
  }

  if (input instanceof HTMLTextAreaElement) {
    return input.value;
  }

  switch (input.type) {
    case 'number':
      return input.value === '' ? '' : Number(input.value);

    case 'date':
    case 'datetime-local':
      return input.value === '' ? '' : new Date(input.value);

    default:
      return input.value; // string
  }
}

function getInputIdentifier(input: SystemFormControl) {
  return input.name || input.id;
}

function syncSystemInput(input: SystemFormControl) {
  const inputIdentifier = getInputIdentifier(input);
  if (!inputIdentifier.startsWith('system-')) return;

  const value = getVariableValue(input);
  if (value === null) return;

  const varName = inputIdentifier.replace(/^system-/, '');
  ownedSystemVariableNames.add(varName);
  upsertSystemInputVariable(varName, value);
}

function captureActiveSystemInput(): ActiveInputSnapshot | null {
  if (!import.meta.client) return null;
  if (!wrapperRef.value) return null;

  const activeElement = document.activeElement;
  if (
    !(activeElement instanceof HTMLInputElement) &&
    !(activeElement instanceof HTMLSelectElement) &&
    !(activeElement instanceof HTMLTextAreaElement)
  ) return null;
  if (!wrapperRef.value.contains(activeElement)) return null;

  const identifier = getInputIdentifier(activeElement);
  if (!identifier.startsWith('system-')) return null;

  let selectionStart: number | null = null;
  let selectionEnd: number | null = null;
  try {
    if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
      selectionStart = activeElement.selectionStart;
      selectionEnd = activeElement.selectionEnd;
    }
  } catch {
    // Some input types do not expose cursor selection information.
  }

  return {
    identifier,
    value: activeElement.value,
    selectionStart,
    selectionEnd,
  };
}

async function restoreActiveSystemInput(snapshot: ActiveInputSnapshot | null) {
  if (!import.meta.client) return;
  if (!snapshot || !wrapperRef.value) return;

  await nextTick();

  const input = Array.from(wrapperRef.value.querySelectorAll<SystemFormControl>('input, select, textarea'))
    .find(inputElement => getInputIdentifier(inputElement) === snapshot.identifier);

  if (!input) return;

  input.value = snapshot.value;
  input.focus({ preventScroll: true });

  if (
    (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) &&
    snapshot.selectionStart !== null &&
    snapshot.selectionEnd !== null
  ) {
    try {
      input.setSelectionRange(snapshot.selectionStart, snapshot.selectionEnd);
    } catch {
      // Some input types, such as number/date/email, do not support text selections.
    }
  }
}

function handleInput(event: Event) {
  const target = event.target;

  if (
    !(target instanceof HTMLInputElement) &&
    !(target instanceof HTMLSelectElement) &&
    !(target instanceof HTMLTextAreaElement)
  ) return;

  syncSystemInput(target);
}

async function handleChange() {
  await nextTick();
  registerInitialSystemInputs();
}

function registerInitialSystemInputs() {
  if (!wrapperRef.value) return;

  const inputs = Array.from(wrapperRef.value.querySelectorAll<SystemFormControl>('input, select, textarea'));
  for (const input of inputs) {
    syncSystemInput(input);
  }
}

async function refreshComponentCode() {
  db = systemsStore.selectedSystem?.database ?? db;
  applyStyle(props.component.css);

  componentVariables.value.sqlVariables = [];
  if (db && props.component.sql) {
    const replacedSql: Record<string, string> = SqlHandler.ReplaceSqlForVariablesInRecord(componentVariables.value, props.component.sql);
    await populateSqlVariables(replacedSql);
  }

  await refreshJsVariables();
}

async function refreshJsVariables(options: { preserveActiveInput?: boolean } = {}) {
  const activeInputSnapshot = options.preserveActiveInput ? captureActiveSystemInput() : null;

  if (props.component.js) {
    try {
      const fullCode = jsVarsHeader.value ? `${jsVarsHeader.value}\n${props.component.js}` : props.component.js;
      const nextJsVariables = JsHandler.getJsVariables(fullCode, props.component.js);
      componentVariables.value.jsVariables = nextJsVariables;
      syncComputedSystemVariables();

      if (props.component.js.includes('document.')) {
        await nextTick();
        JsHandler.getJsVariables(fullCode, props.component.js);
      }
    } catch (e) {
      console.error('Error parsing JS variables:', e);
      componentVariables.value.jsVariables = [];
    }
  } else {
    componentVariables.value.jsVariables = [];
  }

  await restoreActiveSystemInput(activeInputSnapshot);
}

function syncComputedSystemVariables() {
  const nextComputedNames = new Set<string>();

  for (const variable of componentVariables.value.jsVariables) {
    if (typeof variable.variable !== 'boolean') continue;

    nextComputedNames.add(variable.name);
    ownedComputedVariableNames.add(variable.name);
    upsertSystemComputedVariable(variable.name, variable.variable);
  }

  for (const variableName of Array.from(ownedComputedVariableNames)) {
    if (nextComputedNames.has(variableName)) continue;

    ownedComputedVariableNames.delete(variableName);
    removeSystemInputVariable(variableName);
  }
}

function handleComponentCodeUpdated(event: Event) {
  const detail = (event as ComponentCodeUpdatedEvent).detail;
  if (!detail || detail.componentId !== props.component.id) return;
  void refreshComponentCode();
}

function handleComponentsRepaired(event: Event) {
  const detail = (event as ComponentsRepairedEvent).detail;
  if (!detail?.componentIds?.some(id => String(id) === String(props.component.id))) return;
  showRepairedOverlay();
}

/* 12. Lifecycle */
onMounted(async () => {
  db = systemsStore.selectedSystem?.database ?? undefined;

  componentVariables.value.generalVariables = props.component.variables?.generalVariables ?? [];
  await refreshComponentCode();

  await nextTick();
  registerInitialSystemInputs();

  if (import.meta.client) {
    window.addEventListener(componentCodeUpdatedEventName, handleComponentCodeUpdated);
    window.addEventListener(componentsRepairedEventName, handleComponentsRepaired);
  }
});

onBeforeUpdate(() => {
  activeInputSnapshotBeforeUpdate = captureActiveSystemInput();
});

onUpdated(() => {
  const snapshot = activeInputSnapshotBeforeUpdate;
  activeInputSnapshotBeforeUpdate = null;
  void restoreActiveSystemInput(snapshot);
});

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener(componentCodeUpdatedEventName, handleComponentCodeUpdated);
    window.removeEventListener(componentsRepairedEventName, handleComponentsRepaired);
  }

  for (const variableName of ownedSystemVariableNames) {
    removeSystemInputVariable(variableName);
  }

  for (const variableName of ownedComputedVariableNames) {
    removeSystemInputVariable(variableName);
  }
});

/* 13. defineExpose */
defineExpose({
})
</script>

<style scoped>
@keyframes glow-yellow {
  0%, 100% {
    outline: 4px solid rgba(250, 204, 21, 0.4);
    background-color: rgba(250, 204, 21, 0.05);
  }
  50% {
    outline: 4px solid rgba(250, 204, 21, 0.8);
    background-color: rgba(250, 204, 21, 0.15);
  }
}

@keyframes glow-orange {
  0%, 100% {
    outline: 4px solid rgba(249, 115, 22, 0.6);
    background-color: rgba(249, 115, 22, 0.15);
  }
  50% {
    outline: 4px solid rgba(249, 115, 22, 1);
    background-color: rgba(249, 115, 22, 0.25);
  }
}

@keyframes glow-border {
  0%, 100% {
    outline: 4px solid rgba(249, 115, 22, 0.4);
    background-color: transparent;
  }
  50% {
    outline: 4px solid rgba(249, 115, 22, 0.8);
    background-color: transparent;
  }
}

.component-wrapper {
  width: fit-content;
  max-width: 100%;
  min-width: 0;
  display: block;
  transition: all 0.2s ease-in-out;
  border-radius: 8px;
  cursor: default;
  box-sizing: border-box;
}

.highlight-active {
  outline-offset: 4px;
  animation: glow-yellow 2s ease-in-out infinite;
}

.highlight-active.is-highlighted {
  outline-offset: 4px;
  animation: glow-orange 2s ease-in-out infinite;
}

.is-highlighted {
  outline-offset: 4px;
  animation: glow-border 2s ease-in-out infinite;
}

.content-container {
  position: relative;
  width: fit-content;
  max-width: 100%;
  min-width: 0;
  cursor: initial;
  box-sizing: border-box;
}

.edit-icon {
  position: absolute;
  top: -12px;
  right: -12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: #fbc02d;
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
  color: #424242;
  z-index: 50;
  opacity: 1;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform: scale(1);
}

.edit-icon:hover {
  background-color: #f9a825;
  transform: scale(1.1);
}

.teacher-icon {
  position: absolute;
  top: -12px;
  right: -12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  opacity: 1;
  transform: scale(1);
}

.component-html {
  display: block;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.component-html :deep(*) {
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.component-html :deep(img),
.component-html :deep(video),
.component-html :deep(canvas),
.component-html :deep(svg) {
  max-width: 100%;
  height: auto;
}

.component-html :deep(table) {
  width: 100%;
  table-layout: fixed;
}

.component-html :deep(input),
.component-html :deep(select),
.component-html :deep(textarea),
.component-html :deep(button) {
  max-width: 100%;
}

.component-wrapper[data-component-id="statistika-jidel"] :deep(#statistika-jidel-karta),
.component-wrapper[data-component-id="statistika-max-vek-ucastnika"] :deep(#statistika-max-vek-ucastnika-card) {
  padding: 10px !important;
  gap: 10px !important;
  width: 158px !important;
  max-width: 158px !important;
}

.component-wrapper[data-component-id="statistika-jidel"] :deep(#statistika-jidel-ikona),
.component-wrapper[data-component-id="statistika-max-vek-ucastnika"] :deep(#statistika-max-vek-ucastnika-icon) {
  font-size: 21px !important;
}

.component-wrapper[data-component-id="statistika-max-vek-ucastnika"] :deep(#statistika-max-vek-ucastnika-icon) {
  font-size: 14px !important;
}

.component-wrapper[data-component-id="statistika-jidel"] :deep(#statistika-jidel-pocet),
.component-wrapper[data-component-id="statistika-max-vek-ucastnika"] :deep(#statistika-max-vek-ucastnika-number) {
  font-size: 20px !important;
}

.component-wrapper[data-component-id="statistika-jidel"] :deep(#statistika-jidel-popisek),
.component-wrapper[data-component-id="statistika-max-vek-ucastnika"] :deep(#statistika-max-vek-ucastnika-label) {
  font-size: 11px !important;
  margin-top: 2px !important;
}

.component-wrapper[data-component-id="statistika-max-vek-ucastnika"] :deep(#statistika-max-vek-ucastnika-label) {
  max-width: 95px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.content-interaction-disabled {
  pointer-events: none;
}

.teacher-outline {
  outline: 4px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 6px;
}

.teacher-outline--selected {
  outline: 4px solid #ef4444;
  outline-offset: 2px;
  background-color: rgba(239, 68, 68, 0.08);
}

.teacher-mode-overlay {
  position: absolute;
  inset: -8px;
  z-index: 40;
  border-radius: 8px;
  cursor: pointer;
}

.repaired-overlay {
  position: absolute;
  inset: -8px;
  z-index: 40;
  border-radius: 8px;
  pointer-events: none;
  animation: glow-emerald 1.5s ease-out forwards;
}

@keyframes glow-emerald {
  0% {
    background-color: rgba(16, 185, 129, 0.6);
    box-shadow: 0 0 4px rgba(16, 185, 129, 0.6), 0 0 16px rgba(16, 185, 129, 0.8);
    opacity: 1;
  }
  70% {
    background-color: rgba(16, 185, 129, 0.2);
    box-shadow: 0 0 2px rgba(16, 185, 129, 0.2);
    opacity: 1;
  }
  100% {
    background-color: transparent;
    box-shadow: none;
    opacity: 0;
  }
}
</style>
