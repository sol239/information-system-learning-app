<template>
  <div v-if="showEditor" class="modal-overlay">
    <div class="modal">
      <div class="editor-container">
        <template v-if="htmlTemplate">
          <div class="editor-section">
            <h3 class="editor-label html-label">{{ t('html_template') }}</h3>
            <textarea :value="htmlTemplate" @input="onHtmlInput" class="code-editor html-editor" spellcheck="false" />
          </div>
        </template>

        <template v-if="sqlQuery">
          <div class="editor-section">
            <div class="title-row">
              <h3 class="editor-label sql-label">{{ t('sql_query') }}</h3>
              <UButton @click="toggleTables" class="tables-button">
                Tables: {{ availableTables.length }}
              </UButton>
            </div>
            <ul v-if="showTables" class="tables-list">
              <li v-for="table in availableTables" :key="table">{{ table }}</li>
            </ul>
            <textarea :value="sqlQuery" @input="onSqlInput" class="code-editor sql-editor"
              :class="{ 'invalid-sql': !sqlValid }" spellcheck="false" />
          </div>
        </template>

        <template v-if="jsCode">
          <div class="editor-section">
            <h3 class="editor-label js-label">{{ t('js_code') }}</h3>
            <textarea :value="jsCode" @input="onJsInput" class="code-editor js-editor" spellcheck="false" />
          </div>
        </template>
      </div>

      <div class="modal-actions">
        <UButton @click="onApplyChanges" :disabled="!sqlValid"
          :style="getApplyButtonStyle()"
          class="apply-button"
          @mouseover="applyButtonHover = true"
          @mouseleave="applyButtonHover = false">
          {{ t('apply') }}
        </UButton>
        <UButton @click="onClose" :style="getCloseButtonStyle()"
          class="close-button"
          @mouseover="closeButtonHover = true"
          @mouseleave="closeButtonHover = false">
          {{ t('close') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/* 1. Imports */
import { ref, watch } from 'vue'
import type { InformationSystem } from '~/model/InformationSystem'
import { useInformationSystemStore } from '~/stores/useInformationSystemStore'
import { useSelectedSystemStore } from '~/stores/useSelectedSystemStore'
import { useComponentCodeStore } from '#imports'

/* 2. Stores */
const informationSystemStore = useInformationSystemStore()
const selectedSystemStore = useSelectedSystemStore()
const componentCodeStore = useComponentCodeStore()

/* 4. Constants (non-reactive) */
const selectedSystem = informationSystemStore.systems.find(s => s.id === selectedSystemStore.selectedId) || null
const { t } = useI18n()
const availableTables: string[] = selectedSystem?.db?.getAllTableNames() || []


/* 5. Props */
const props = defineProps<{
  showEditor: boolean
  draftHtmlTemplate: string
  draftSqlQuery: string
  draftJsCode: string
  componentId: string
}>()

/* 6. Emits */
const emit = defineEmits<{
  (e: 'update:showEditor', value: boolean): void
}>()

/* 8. Local state (ref, reactive) */
const sqlValid = ref(true)
const htmlTemplate = ref(props.draftHtmlTemplate)
const sqlQuery = ref(props.draftSqlQuery)
const jsCode = ref(props.draftJsCode)
const applyButtonHover = ref(false)
const closeButtonHover = ref(false)
const showTables = ref(false)

/* 10. Watchers */
watch(() => props.showEditor, (val) => {
  if (val) {
    // reset editors to props when opening
    htmlTemplate.value = props.draftHtmlTemplate
    sqlQuery.value = props.draftSqlQuery
    jsCode.value = props.draftJsCode
  }
})

/* 11. Methods */
function getApplyButtonStyle() {
  const baseColor = !sqlValid.value ? '#ef4444' : '#3b82f6'
  const hoverColor = !sqlValid.value ? '#dc2626' : '#2563eb'

  return {
    backgroundColor: applyButtonHover.value ? hoverColor : baseColor,
    color: 'white',
    transition: 'all 0.2s ease',
    transform: applyButtonHover.value ? 'translateY(-1px)' : 'translateY(0)',
    boxShadow: applyButtonHover.value ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none'
  }
}

function getCloseButtonStyle() {
  return {
    backgroundColor: closeButtonHover.value ? '#4b5563' : '#6b7280',
    color: 'white',
    transition: 'all 0.2s ease',
    transform: closeButtonHover.value ? 'translateY(-1px)' : 'translateY(0)',
    boxShadow: closeButtonHover.value ? '0 4px 12px rgba(107, 114, 128, 0.4)' : 'none'
  }
}
function onSqlInput(event: Event) {
  const value = (event.target as HTMLTextAreaElement)?.value || ''
  sqlQuery.value = value
  console.log('Current SQL Query:', value)

  try {
    if (selectedSystem && typeof selectedSystem.db?.validateSql === 'function') {
      console.log('Validating SQL: >', value, "<")
      const isSqlValid = selectedSystem.db.validateSql(value)
      sqlValid.value = isSqlValid
      console.log('SQL Valid:', isSqlValid)
    } else {
      sqlValid.value = true
      console.warn('selectedSystem or validateSql is not available')
    }
  } catch (err) {
    sqlValid.value = true
    console.error('Error validating SQL:', err)
  }
}

function onHtmlInput(event: Event) {
  const value = (event.target as HTMLTextAreaElement)?.value || ''
  htmlTemplate.value = value
  console.log('Current HTML Template:', value)
}

function onJsInput(event: Event) {
  const value = (event.target as HTMLTextAreaElement)?.value || ''
  jsCode.value = value
  console.log('Current JS Code:', value)
}

function onApplyChanges(event: MouseEvent) {
  console.log("Applying changes to: ", props.componentId)
  componentCodeStore.updateComponentCode(`${props.componentId}-html.vue`, htmlTemplate.value)
  componentCodeStore.updateComponentCode(`${props.componentId}-sql.vue`, sqlQuery.value)
  componentCodeStore.updateComponentCode(`${props.componentId}-js.vue`, jsCode.value)

  console.log("====== Changes applied ======")
  console.log("NEW HTML Template:", componentCodeStore.getComponentCode(`${props.componentId}-html.vue`))
  console.log("NEW SQL Query:", componentCodeStore.getComponentCode(`${props.componentId}-sql.vue`))
  console.log("NEW JavaScript Code:", componentCodeStore.getComponentCode(`${props.componentId}-js.vue`))

  ComponentHandler.setVariableValue(`${props.componentId}.vue`, 'html', htmlTemplate.value)
  ComponentHandler.setVariableValue(`${props.componentId}.vue`, 'sql', sqlQuery.value)
  ComponentHandler.setVariableValue(`${props.componentId}.vue`, 'js', jsCode.value)

  emit('update:showEditor', false)
}

function onClose() {
  emit('update:showEditor', false)
}

function toggleTables() {
  showTables.value = !showTables.value
}
</script>

<style scoped>
/* same styles as before */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}

.modal {
  background: #0f172b;
  color: #fff;
  padding: 20px;
  width: 90%;
  max-width: 1200px;
  border-radius: 8px;
  box-shadow: 0 0 10px black;
  z-index: 3001;
  overflow-y: auto;
  max-height: 90%;
}

.editor-container {
  display: flex;
  gap: 20px;
}

.editor-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.editor-label {
  font-family: 'Fira Mono', 'Consolas', 'Menlo', 'Monaco', monospace;
  font-size: 1rem;
  margin-bottom: 0.2rem;
  margin-top: 1.2rem;
  letter-spacing: 0.02em;
  font-weight: 600;
  padding-left: 2px;
}

.html-label {
  color: #38bdf8;
}

.sql-label {
  color: #facc15;
}

.js-label {
  color: #10b981;
}

.code-editor {
  width: 100%;
  height: 300px;
  margin-bottom: 10px;
  font-family: 'Fira Mono', 'Consolas', 'Menlo', 'Monaco', monospace;
  font-size: 1rem;
  background: #181f2a;
  color: #e5e7eb;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 12px;
  resize: vertical;
  outline: none;
  transition: border 0.2s;
  box-shadow: 0 2px 8px #0002;
}

.code-editor:focus {
  border: 1.5px solid #38bdf8;
  background: #1e293b;
}

.html-editor:focus {
  border-color: #38bdf8;
}

.sql-editor:focus {
  border-color: #facc15;
}

.js-editor:focus {
  border-color: #10b981;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 1.2rem;
}

.sql-editor.invalid-sql {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 2px #ef444488;
}

.invalid-sql-button {
  background-color: #ef4444 !important;
  color: white;
  cursor: not-allowed;
  opacity: 0.7;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.2rem;
}

.tables-button {
  background-color: #374151;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.tables-list {
  list-style-type: none;
  padding: 0;
  background: #181f2a;
  border: 1px solid #334155;
  border-radius: 4px;
  max-height: 150px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.tables-list li {
  padding: 4px 8px;
  border-bottom: 1px solid #334155;
}

.tables-list li:last-child {
  border-bottom: none;
}
</style>
