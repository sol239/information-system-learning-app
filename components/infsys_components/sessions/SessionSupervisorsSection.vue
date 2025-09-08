<template>
  <div class="highlightable" :id="componentId"
    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement(componentId, $event)">
    <div class="supervisors-wrapper">
      <!-- Rendered HTML -->
      <div v-html="renderedHtml" class="supervisors-content"></div>

      <!-- Edit button positioned absolutely -->
      <EditComponentModalOpenButton
        v-if="highlightStore.isEditModeActive"
        :componentId="componentId"
        class="edit-button"
      />
    </div>
  </div>
  <EditComponentModal v-if="highlightStore.isEditModeActive && highlightStore.selectedComponentId" />
</template>

<script setup lang="ts">
/* 1. Imports */
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHighlightStore } from '#imports'
import { useSelectedSystemStore } from '#imports'
import { useComponentCodeStore } from '~/stores/useComponentCodeStore'
import { ComponentHandler } from '~/composables/ComponentHandler'
import { useHighlightWatchers } from '~/composables/highlightWatchers'
import '~/assets/css/highlight.css'

interface Props {
    sessionId: number
}

const props = defineProps<Props>()
const { t } = useI18n()
const highlightStore = useHighlightStore()
const selectedSystemStore = useSelectedSystemStore()
const componentCodeStore = useComponentCodeStore()

// Constants
const componentId = 'session-supervisors-section'
const system = selectedSystemStore.selectedSystem

// Component code from store
const sessionSupervisorsComponent = computed(() => componentCodeStore.getComponentById(componentId) || componentCodeStore.getDefaultComponent(componentId))

const correctSqlQuery = computed(() => sessionSupervisorsComponent.value?.sql?.['sql'] || '')
const correctHtmlTemplate = computed(() => sessionSupervisorsComponent.value?.html?.['html'] || '')
const correctCss = computed(() => sessionSupervisorsComponent.value?.css?.['css'] || '')

const sqlQuery = computed(() => ComponentHandler.getComponentValue(componentId, 'sql', correctSqlQuery.value))
const htmlTemplate = computed(() => ComponentHandler.getComponentValue(componentId, 'html', correctHtmlTemplate.value))
const css = computed(() => ComponentHandler.getComponentValue(componentId, 'css', correctCss.value))

// Local state
const supervisorsData = ref<any[] | null>(null)

// Computed properties
const renderedHtml = computed(() => {
  if (!supervisorsData.value) return ''

  const supervisorsHtml = supervisorsData.value.map(supervisor => `
    <div class="supervisor-item">
      <div class="supervisor-avatar">${getInitials(supervisor.name)}</div>
      <div class="supervisor-info">
        <div class="supervisor-name">${supervisor.name}</div>
        <div class="supervisor-details">${supervisor.email}</div>
      </div>
    </div>
  `).join('')

  const noSupervisors = supervisorsData.value.length === 0
    ? `<div class="text-sm text-gray-500 italic">${t('no_supervisors')}</div>`
    : ''

  const html = htmlTemplate.value
    .replace('{{ supervisorsTitle }}', `${t('supervisors')} (${supervisorsData.value.length})`)
    .replace('{{ supervisorsList }}', supervisorsHtml)
    .replace('{{ noSupervisors }}', noSupervisors)

  return `<style>${css.value}</style>${html}`;
});

// Watchers
useHighlightWatchers(highlightStore.highlightHandler, highlightStore)

const loadSupervisors = () => {
    if (!selectedSystemStore.selectedSystem?.db) {
        console.error('Database not available')
        return
    }

    try {
        const supervisorsTable = selectedSystemStore.selectedSystem.db.getTableName('supervisors')
        const sessionsSupervisorsTable = selectedSystemStore.selectedSystem.db.getTableName('sessions_supervisors')

        const query = selectedSystemStore.selectedSystem.db.query(
            `SELECT s.* FROM ${supervisorsTable} s
             JOIN ${sessionsSupervisorsTable} ss ON s.supervisor_id = ss.supervisor_id
             WHERE ss.session_id = ?`,
            [props.sessionId]
        )

        if (query.success) {
            supervisorsData.value = query.results
        }
    } catch (error) {
        console.error('Error loading supervisors:', error)
    }
}

const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

onMounted(() => {
    loadSupervisors()
})
</script>

<style>
.supervisors-wrapper {
  position: relative; /* Needed for absolute positioning of the button */
  display: inline-block;
  width: 100%;
}

.supervisors-content {
  /* Optional: add padding so button doesn't overlap content */
  padding: 0.5rem;
}

.edit-button {
  position: absolute;
  top: 0.25rem;   /* Adjust distance from top */
  right: 0.25rem; /* Adjust distance from right */
  z-index: 10;
}

.supervisors-section {
    margin-bottom: 1rem;
}

.supervisor-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: 0.5rem;
    transition: background-color 0.2s ease;
}

.supervisor-item:hover {
    background-color: #f9fafb;
}

.supervisor-avatar {
    width: 2rem;
    height: 2rem;
    background-color: #e9d5ff;
    color: #7c3aed;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
}

.supervisor-info {
    flex: 1;
    min-width: 0;
}

.supervisor-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.supervisor-details {
    font-size: 0.75rem;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (max-width: 768px) {
    .supervisor-item {
        padding: 0.25rem;
    }
}
</style>
