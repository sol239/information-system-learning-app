<template>
  <div class="modal-overlay">
    <div class="modal">
      <div class="editor-container">
        <div v-for="section in availableSections" :key="section.key" class="editor-section">
          <div class="title-row">
            <h3 class="editor-label" :class="getSectionLabelClass(section.key)">{{ getSectionLabel(section.key) }}</h3>
            <UButton v-if="section.key === 'sql'" @click="toggleTables" class="tables-button">
              Tables: {{ availableTables.length }}
            </UButton>
          </div>
          <ul v-if="section.key === 'sql' && showTables" class="tables-list">
            <li v-for="table in availableTables" :key="table">{{ table }}</li>
          </ul>
          <textarea 
            :value="section.value" 
            @input="(event) => onSectionInput(event, section.key)" 
            class="code-editor" 
            :class="[getSectionEditorClass(section.key), { 'invalid-sql': section.key === 'sql' && !sqlValid }]"
            spellcheck="false" 
          />
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

// Dynamic section handling
const sectionValues = ref<Record<string, string>>({})

// Initialize section values from component or error components
const initializeSectionValues = () => {
  const sections = ['html', 'css', 'js', 'sql', 'additionals']
  sections.forEach(section => {
    const errorValue = isErrorComponent ? ComponentHandler.getVariableValue(highlightStore.selectedComponentId ?? '', section) : null
    const componentValue = editedComponent?.[section as keyof Component] as Record<string, string>
    
    // Try multiple possible keys: section name, 'default', or first available key
    let value = ''
    if (componentValue) {
      value = componentValue[section] || componentValue['default'] || Object.values(componentValue)[0] || ''
    }
    
    sectionValues.value[section] = errorValue || value
    console.log(`Initialized ${section}:`, sectionValues.value[section])
  })
}

initializeSectionValues()

// Computed property to get available sections (only those with content)
const availableSections = computed(() => {
  return Object.entries(sectionValues.value)
    .filter(([key, value]) => value.trim() !== '')
    .map(([key, value]) => ({ key, value }))
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

function onSectionInput(event: Event, section: string) {
  const value = (event.target as HTMLTextAreaElement)?.value || ''
  sectionValues.value[section] = value
  console.log(`Current ${section.toUpperCase()}:`, value)

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
  // This function is kept for backward compatibility but redirects to onSectionInput
  onSectionInput(event, 'sql')
}

function onHtmlInput(event: Event) {
  // This function is kept for backward compatibility but redirects to onSectionInput
  onSectionInput(event, 'html')
}

function onJsInput(event: Event) {
  // This function is kept for backward compatibility but redirects to onSectionInput
  onSectionInput(event, 'js')
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
    const updateSection = (sectionData: Record<string, string>, sectionKey: string, newValue: string) => {
      // If the section already has data, use the existing key structure
      if (Object.keys(sectionData).length > 0) {
        const existingKey = sectionData[sectionKey] !== undefined ? sectionKey : 
                           sectionData['default'] !== undefined ? 'default' : 
                           Object.keys(sectionData)[0]
        return { ...sectionData, [existingKey]: newValue }
      } else {
        // If no existing data, use 'default' key
        return { 'default': newValue }
      }
    }

    // Update the entire component object using updateComponent function
    const updatedComponent = {
      ...currentComponent,
      html: updateSection(currentComponent.html, 'html', sectionValues.value.html || ''),
      css: updateSection(currentComponent.css, 'css', sectionValues.value.css || ''),
      js: updateSection(currentComponent.js, 'js', sectionValues.value.js || ''),
      sql: updateSection(currentComponent.sql, 'sql', sectionValues.value.sql || ''),
      additionals: updateSection(currentComponent.additionals, 'additionals', sectionValues.value.additionals || '')
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

  // Update ComponentHandler for all sections
  Object.entries(sectionValues.value).forEach(([section, value]) => {
    ComponentHandler.setVariableValue(`${highlightStore.selectedComponentId}`, section, value)
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
