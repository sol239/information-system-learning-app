<template>
  <div class="modal-overlay">
    <div class="modal">
      <div class="editor-container">
        <div v-for="section in availableSections" :key="section.key" class="editor-section">
          <div class="title-row">
            <h3 class="editor-label" :class="getSectionLabelClass(section.key)">{{ getSectionLabel(section.key) }}</h3>

            <!-- SQL specific buttons -->
            <div v-if="section.key === 'sql' && section.entries.length > 1" class="sql-buttons">
              <button
                v-for="(entry, index) in section.entries"
                :key="entry.key"
                @click="selectSqlEntry(entry.key)"
                :class="['sql-button', { 'active': selectedSqlKey === entry.key }]"
                :title="entry.key">
                {{ index + 1 }}
              </button>
            </div>

            <UButton v-if="section.key === 'sql'" @click="toggleTables" class="tables-button">
              Tables: {{ availableTables.length }}
            </UButton>
          </div>

          <ul v-if="section.key === 'sql' && showTables" class="tables-list">
            <li v-for="table in availableTables" :key="table">{{ table }}</li>
          </ul>

          <!-- Show all entries for non-SQL sections -->
          <div v-if="section.key !== 'sql'" class="entries-container">
            <div v-for="entry in section.entries" :key="entry.key" class="entry-section">
              <div v-if="section.entries.length > 1" class="entry-title">{{ entry.key }}</div>
              <textarea
                :value="entry.value"
                @input="(event) => onEntryInput(event, section.key, entry.key)"
                class="code-editor"
                :class="getSectionEditorClass(section.key)"
                spellcheck="false"
              />
            </div>
          </div>

          <!-- Show selected SQL entry -->
          <div v-else-if="section.key === 'sql'" class="sql-editor-container">
            <div class="current-sql-key">{{ selectedSqlKey }}</div>
            <textarea
              :value="getSelectedSqlValue()"
              @input="(event) => onEntryInput(event, section.key, selectedSqlKey)"
              class="code-editor"
              :class="[getSectionEditorClass(section.key), { 'invalid-sql': !sqlValid }]"
              spellcheck="false"
            />
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <UButton @click="onApplyChanges" :disabled="!sqlValid"
          :style="getApplyButtonStyle()"
          class="apply-button"
          @mouseover="applyButtonHover = true"
          @mouseleave="applyButtonHover = false">
          {{ t('apply') }}
        </UButton>
        <UButton @click="closeModal" :style="getCloseButtonStyle()"
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
import { ref, watch, computed } from 'vue'
import type { InformationSystem } from '~/model/InformationSystem'
import { useInformationSystemStore } from '~/stores/useInformationSystemStore'
import { useSelectedSystemStore } from '~/stores/useSelectedSystemStore'
import { useComponentCodeStore } from '#imports'
import { highlight } from '@nuxt/ui/runtime/utils/fuse.js'
import { useHighlightStore } from '#imports'
import type { Component } from '~/model/Component'
import { ComponentHandler } from '~/composables/ComponentHandler'

/* 2. Stores */
const informationSystemStore = useInformationSystemStore()
const selectedSystemStore = useSelectedSystemStore()
const componentCodeStore = useComponentCodeStore()
const highlightStore = useHighlightStore()

/* 4. Constants (non-reactive) */
const selectedSystem = informationSystemStore.systems.find(s => s.id === selectedSystemStore.selectedId) || null
const { t } = useI18n()
const availableTables: string[] = selectedSystem?.db?.getAllTableNames() || []
const toast = useToast()


/* 5. Props */


/* 6. Emits */

/* 8. Local state (ref, reactive) */
const editedComponent: Component | null = componentCodeStore.getComponentById(highlightStore.selectedComponentId ?? '') ?? null;
console.log("Edited Component:", editedComponent, "for ID:", highlightStore.selectedComponentId);
console.log("Edited Component JSON:", JSON.stringify(editedComponent, null, 2));
const sqlValid = ref(true)

// Check if component is in error components and load error code if available
const isErrorComponent = ComponentHandler.isInErrorComponents(highlightStore.selectedComponentId ?? '')

// Dynamic section handling with multiple entries
const sectionEntries = ref<Record<string, Record<string, string>>>({})
const selectedSqlKey = ref<string>('')

// Initialize section entries from component or error components
const initializeSectionEntries = () => {
  const sections = ['html', 'css', 'js', 'sql', 'additionals']
  sections.forEach(section => {
    const errorValue = isErrorComponent ? ComponentHandler.getVariableValue(highlightStore.selectedComponentId ?? '', section) : null
    const componentValue = editedComponent?.[section as keyof Component] as Record<string, string>

    sectionEntries.value[section] = {}

    // If there's error value, use it for the first/default key
    if (errorValue) {
      sectionEntries.value[section]['default'] = errorValue
    }
    // Otherwise use component values
    else if (componentValue && Object.keys(componentValue).length > 0) {
      sectionEntries.value[section] = { ...componentValue }
    }

    console.log(`Initialized ${section} entries:`, sectionEntries.value[section])
  })

  // Set default SQL key
  if (sectionEntries.value['sql'] && Object.keys(sectionEntries.value['sql']).length > 0) {
    selectedSqlKey.value = Object.keys(sectionEntries.value['sql'])[0]
  }
}

initializeSectionEntries()

// Computed property to get available sections with entries (excluding empty ones)
const availableSections = computed(() => {
  return Object.entries(sectionEntries.value)
    .map(([key, entries]) => ({
      key,
      entries: Object.entries(entries)
        .filter(([entryKey, entryValue]) => entryValue && entryValue.trim() !== '')
        .map(([entryKey, entryValue]) => ({
          key: entryKey,
          value: entryValue
        }))
    }))
    .filter(section => section.entries.length > 0)
})

const applyButtonHover = ref(false)
const closeButtonHover = ref(false)
const showTables = ref(false)
const showEditor: boolean = highlightStore.isEditModeActive


/* 10. Watchers */

/* 11. Methods */
function getSectionLabel(section: string): string {
  const labels: Record<string, string> = {
    html: t('html_template'),
    css: t('css_styles') || 'CSS Styles',
    js: t('js_code'),
    sql: t('sql_query'),
    additionals: t('additionals') || 'Additional Code'
  }
  return labels[section] || section.toUpperCase()
}

function getSectionLabelClass(section: string): string {
  const classes: Record<string, string> = {
    html: 'html-label',
    css: 'css-label',
    js: 'js-label',
    sql: 'sql-label',
    additionals: 'additionals-label'
  }
  return classes[section] || 'default-label'
}

function getSectionEditorClass(section: string): string {
  const classes: Record<string, string> = {
    html: 'html-editor',
    css: 'css-editor',
    js: 'js-editor',
    sql: 'sql-editor',
    additionals: 'additionals-editor'
  }
  return classes[section] || 'default-editor'
}

function onEntryInput(event: Event, section: string, entryKey: string) {
  const value = (event.target as HTMLTextAreaElement)?.value || ''
  sectionEntries.value[section][entryKey] = value
  console.log(`Current ${section.toUpperCase()} ${entryKey}:`, value)

  // Special handling for SQL validation
  if (section === 'sql') {
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
}

function selectSqlEntry(entryKey: string) {
  selectedSqlKey.value = entryKey
}

function getSelectedSqlValue(): string {
  return sectionEntries.value['sql'][selectedSqlKey.value] || ''
}
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
  // This function is kept for backward compatibility but redirects to onEntryInput
  onEntryInput(event, 'sql', selectedSqlKey.value)
}

function onHtmlInput(event: Event) {
  // This function is kept for backward compatibility but redirects to onEntryInput
  onEntryInput(event, 'html', 'html')
}

function onJsInput(event: Event) {
  // This function is kept for backward compatibility but redirects to onEntryInput
  onEntryInput(event, 'js', 'js')
}

function onApplyChanges(event: MouseEvent) {
  console.log("Applying changes to: ", highlightStore.selectedComponentId)
  console.log("DB NUMBER BEFORE INCREMENT: ", selectedSystemStore.dbNumber)
  selectedSystemStore.incrementDbNumber()
  console.log("DB NUMBER AFTER INCREMENT: ", selectedSystemStore.dbNumber)

  // Get current component
  const currentComponent = componentCodeStore.getComponentById(highlightStore.selectedComponentId ?? '')

  if (currentComponent) {
    // Helper function to preserve the original key structure
    const updateSection = (sectionData: Record<string, string>, newEntries: Record<string, string>) => {
      return { ...sectionData, ...newEntries }
    }

    // Update the entire component object using updateComponent function
    const updatedComponent = {
      ...currentComponent,
      html: updateSection(currentComponent.html, sectionEntries.value.html || {}),
      css: updateSection(currentComponent.css, sectionEntries.value.css || {}),
      js: updateSection(currentComponent.js, sectionEntries.value.js || {}),
      sql: updateSection(currentComponent.sql, sectionEntries.value.sql || {}),
      additionals: updateSection(currentComponent.additionals, sectionEntries.value.additionals || {})
    }

    componentCodeStore.updateComponent(highlightStore.selectedComponentId ?? '', updatedComponent)

     toast.add({
      title: t('changes_applied_successfully'),
      color: 'primary',
    })
  } else {
     toast.add({
      title: t('changes_applied_successfully'),
      color: 'red',
    })
  }

  // Update ComponentHandler for all sections and entries
  Object.entries(sectionEntries.value).forEach(([section, entries]) => {
    Object.entries(entries).forEach(([entryKey, value]) => {
      ComponentHandler.setVariableValue(`${highlightStore.selectedComponentId}-${entryKey}`, section, value)
    })
  })

  closeModal()
}

function toggleTables() {
  showTables.value = !showTables.value
}

function closeModal() {
  highlightStore.selectedComponentId = ''
  console.log("Edit mode deactivated", highlightStore.isEditModeActive)
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

.css-label {
  color: #f97316;
}

.sql-label {
  color: #facc15;
}

.js-label {
  color: #10b981;
}

.additionals-label {
  color: #a855f7;
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

.css-editor:focus {
  border-color: #f97316;
}

.sql-editor:focus {
  border-color: #facc15;
}

.js-editor:focus {
  border-color: #10b981;
}

.additionals-editor:focus {
  border-color: #a855f7;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 1.2rem;
}

/* New styles for multiple entries */
.entries-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.entry-section {
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 10px;
  background: #1e293b;
}

.entry-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sql-buttons {
  display: flex;
  gap: 8px;
  margin-left: auto;
  margin-right: 10px;
}

.sql-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #38bdf8;
  background: transparent;
  color: #38bdf8;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sql-button:hover {
  background: #38bdf8;
  color: #0f172b;
  transform: scale(1.1);
}

.sql-button.active {
  background: #38bdf8;
  color: #0f172b;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
}

.sql-editor-container {
  position: relative;
}

.current-sql-key {
  position: absolute;
  top: -25px;
  right: 10px;
  font-size: 0.8rem;
  color: #94a3b8;
  background: #1e293b;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid #334155;
}

.invalid-sql {
  border-color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.1) !important;
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
