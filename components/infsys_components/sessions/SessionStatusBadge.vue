<template>
  <div class="highlightable" :id="componentId"
    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement(componentId, $event)">
    <div class="status-badge-wrapper">
      <!-- Rendered HTML -->
      <div v-html="renderedHtml" class="status-badge-content"></div>

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
const componentId = 'session-status-badge'
const system = selectedSystemStore.selectedSystem

// Component code from store
const sessionStatusBadgeComponent = computed(() => componentCodeStore.getComponentById(componentId) || componentCodeStore.getDefaultComponent(componentId))

const correctSqlQuery = computed(() => sessionStatusBadgeComponent.value?.sql?.['sql'] || '')
const correctHtmlTemplate = computed(() => sessionStatusBadgeComponent.value?.html?.['html'] || '')
const correctCss = computed(() => sessionStatusBadgeComponent.value?.css?.['css'] || '')

const sqlQuery = computed(() => ComponentHandler.getComponentValue(componentId, 'sql', correctSqlQuery.value))
const htmlTemplate = computed(() => ComponentHandler.getComponentValue(componentId, 'html', correctHtmlTemplate.value))
const css = computed(() => ComponentHandler.getComponentValue(componentId, 'css', correctCss.value))

// Local state
const statusData = ref<{ capacity: number; participantCount: number } | null>(null)

// Computed properties
const renderedHtml = computed(() => {
  if (!statusData.value) return ''

  const status = getSessionStatus()
  const color = getSessionStatusColor()
  const html = htmlTemplate.value
    .replace('{{ status }}', status)
    .replace('{{ color }}', color)
    .replace('{{ capacity }}', String(statusData.value.capacity))
    .replace('{{ participantCount }}', String(statusData.value.participantCount))

  return `<style>${css.value}</style>${html}`;
});

// Watchers
useHighlightWatchers(highlightStore.highlightHandler, highlightStore)

const loadStatusData = () => {
    if (!selectedSystemStore.selectedSystem?.db) {
        console.error('Database not available')
        return
    }

    try {
        const sessionsTable = selectedSystemStore.selectedSystem.db.getTableName('sessions')
        const sessionsParticipantsTable = selectedSystemStore.selectedSystem.db.getTableName('sessions_participants')

        // Get session capacity
        const sessionQuery = selectedSystemStore.selectedSystem.db.query(
            `SELECT capacity FROM ${sessionsTable} WHERE session_id = ?`,
            [props.sessionId]
        )

        // Get participant count
        const participantQuery = selectedSystemStore.selectedSystem.db.query(
            `SELECT COUNT(*) as count FROM ${sessionsParticipantsTable} WHERE session_id = ?`,
            [props.sessionId]
        )

        if (sessionQuery.success && sessionQuery.results.length > 0 && participantQuery.success) {
            const capacity = sessionQuery.results[0].capacity
            const participantCount = participantQuery.results[0].count
            statusData.value = { capacity, participantCount }
        }
    } catch (error) {
        console.error('Error loading status data:', error)
    }
}

const getCapacityPercentage = (): number => {
    if (!statusData.value) return 0
    // Handle division by zero case
    if (statusData.value.capacity === 0) return 0
    return Math.round((statusData.value.participantCount / statusData.value.capacity) * 100)
}

const getSessionStatus = (): string => {
    if (!statusData.value) return ''
    if (statusData.value.participantCount >= statusData.value.capacity) return t('full')
    const percentage = getCapacityPercentage()
    if (percentage >= 70) return t('almost_full')
    if (percentage > 0) return t('available')
    return t('empty')
}

const getSessionStatusColor = (): 'red' | 'yellow' | 'green' | 'neutral' => {
    if (!statusData.value) return 'neutral'
    if (statusData.value.participantCount >= statusData.value.capacity) return 'red'
    const percentage = getCapacityPercentage()
    if (percentage >= 70) return 'yellow'
    if (percentage > 0) return 'green'
    return 'neutral'
}

onMounted(() => {
    loadStatusData()
})
</script>

<style>
.status-badge-wrapper {
  position: relative; /* Needed for absolute positioning of the button */
  display: inline-block;
}

.status-badge-content {
  /* Optional: add padding so button doesn't overlap content */
  padding: 0.25rem;
}

.edit-button {
  position: absolute;
  top: 0.25rem;   /* Adjust distance from top */
  right: 0.25rem; /* Adjust distance from right */
  z-index: 10;
}
</style>
