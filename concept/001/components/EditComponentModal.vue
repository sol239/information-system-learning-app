<template>
  <div v-if="showEditor" class="modal-overlay">
    <div class="modal">
      <template v-if="draftHtmlTemplate">
        <h3 class="editor-label html-label">HTML Template</h3>
        <textarea
          :value="draftHtmlTemplate"
          @input="onHtmlInput"
          class="code-editor html-editor"
          spellcheck="false"
        />
      </template>

      <template v-if="draftSqlQuery">
        <h3 class="editor-label sql-label">SQL Query</h3>
        <textarea
          :value="draftSqlQuery"
          @input="onSqlInput"
          class="code-editor sql-editor"
          :class="{ 'invalid-sql': !sqlValid }"
          spellcheck="false"
        />
      </template>

      <div class="modal-actions">
        <UButton
          @click="emit('applyChanges')"
          :disabled="!sqlValid"
          :style="{ backgroundColor: !sqlValid ? '#ef4444' : '#3b82f6', color: 'white' }"
        >
          Apply
        </UButton>
        <UButton
          @click="onClose"
          class="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Close
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

/* 2. Stores */
const informationSystemStore = useInformationSystemStore()
const selectedSystemStore = useSelectedSystemStore()

/* 3. Context hooks */
// none

/* 4. Constants (non-reactive) */
const selectedSystem = informationSystemStore.systems.find(s => s.id === selectedSystemStore.selectedId) || null

/* 5. Props */
const props = defineProps<{
  showEditor: boolean
  draftHtmlTemplate: string
  draftSqlQuery: string
}>()

/* 6. Emits */
const emit = defineEmits<{
  (e: 'update:showEditor', value: boolean): void
  (e: 'update:draftHtmlTemplate', value: string): void
  (e: 'update:draftSqlQuery', value: string): void
  (e: 'applyChanges'): void
}>()

/* 7. Template refs */
// none

/* 8. Local state (ref, reactive) */
const sqlValid = ref(true)
const originalHtmlTemplate = ref(props.draftHtmlTemplate)
const originalSqlQuery = ref(props.draftSqlQuery)

/* 9. Computed */
// none

/* 10. Watchers */
watch(() => props.showEditor, (val) => {
  if (val) {
    // Save originals when opening
    originalHtmlTemplate.value = props.draftHtmlTemplate
    originalSqlQuery.value = props.draftSqlQuery
  }
})

/* 11. Methods */
function printCurrentHtml() {
  console.log('Current HTML Template:', props.draftHtmlTemplate)
}

function printCurrentSql() {
  console.log('Current SQL Query:', props.draftSqlQuery)
}

function onSqlInput(event: Event) {
  const value = (event.target as HTMLTextAreaElement)?.value || ''
  emit('update:draftSqlQuery', value)
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
  emit('update:draftHtmlTemplate', value)
  printCurrentHtml()
}

async function validateHtml(html: string): Promise<boolean> {
  const options = {
    data: html,
    format: 'json'
  }

  try {
    const result = await validator(options)
    if (result.errors.length > 0) {
      console.error('HTML Validation Errors:', result.errors)
      return false
    }
    return true
  } catch (err) {
    console.error('Validation failed:', err)
    return false
  }
}

function onClose() {
  emit('update:draftHtmlTemplate', originalHtmlTemplate.value)
  emit('update:draftSqlQuery', originalSqlQuery.value)
  emit('update:showEditor', false)
}

/* 12. Lifecycle */
// none

/* 13. defineExpose */
// none
</script>

<style scoped>
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
  width: 50%;
  border-radius: 8px;
  box-shadow: 0 0 10px black;
  z-index: 3001;
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

textarea {
  /* Remove default textarea styles for code editors */
  background: none;
  color: inherit;
  border: none;
  outline: none;
  box-shadow: none;
  font-family: inherit;
  font-size: inherit;
  padding: 0;
  margin: 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 1.2rem;
}

.sql-editor.invalid-sql {
  border-color: #ef4444 !important; /* Tailwind red-500 */
  box-shadow: 0 0 0 2px #ef444488;
}

.invalid-sql-button {
  background-color: #ef4444 !important; /* Tailwind red-500 */
  color: white;
  cursor: not-allowed;
  opacity: 0.7;
}
</style>