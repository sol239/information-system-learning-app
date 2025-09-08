<template>
  <div class="highlightable" :id="componentId"
    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement(componentId, $event)">
    <div class="capacity-wrapper">
      <!-- Rendered HTML -->
      <div v-html="renderedHtml" class="capacity-content"></div>

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
const componentId = 'session-capacity-section'
const system = selectedSystemStore.selectedSystem

// Component code from store
const sessionCapacityComponent = computed(() => componentCodeStore.getComponentById(componentId) || componentCodeStore.getDefaultComponent(componentId))

const correctSqlQuery = computed(() => sessionCapacityComponent.value?.sql?.['sql'] || '')
const correctHtmlTemplate = computed(() => sessionCapacityComponent.value?.html?.['html'] || '')
const correctCss = computed(() => sessionCapacityComponent.value?.css?.['css'] || '')

const sqlQuery = computed(() => ComponentHandler.getComponentValue(componentId, 'sql', correctSqlQuery.value))
const htmlTemplate = computed(() => ComponentHandler.getComponentValue(componentId, 'html', correctHtmlTemplate.value))
const css = computed(() => ComponentHandler.getComponentValue(componentId, 'css', correctCss.value))

// Local state
const capacityData = ref<{ capacity: number; participantCount: number } | null>(null)

// Computed properties
const renderedHtml = computed(() => {
  if (!capacityData.value) return ''

  const percentage = getCapacityPercentage()
  const color = getCapacityColor()
  const html = htmlTemplate.value
    .replace('{{ capacity }}', String(capacityData.value.capacity))
    .replace('{{ participantCount }}', String(capacityData.value.participantCount))
    .replace('{{ percentage }}', String(percentage))
    .replace('{{ color }}', color)
    .replace('{{ label }}', t('capacity'))
    .replace('{{ occupied }}', t('occupied'))

  return `<style>${css.value}</style>${html}`;
});

// Watchers
useHighlightWatchers(highlightStore.highlightHandler, highlightStore)

const loadCapacityData = () => {
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
            capacityData.value = { capacity, participantCount }
        }
    } catch (error) {
        console.error('Error loading capacity data:', error)
    }
}

const getCapacityPercentage = (): number => {
    if (!capacityData.value) return 0
    // Handle division by zero case
    if (capacityData.value.capacity === 0) return 0
    return Math.round((capacityData.value.participantCount / capacityData.value.capacity) * 100)
}

const getCapacityColor = (): string => {
    if (!capacityData.value) return '#10b981'
    const percentage = getCapacityPercentage()
    if (percentage >= 90) return '#ef4444' // red
    if (percentage >= 70) return '#f59e0b' // amber
    return '#10b981' // emerald
}

onMounted(() => {
    loadCapacityData()
})
</script>

<style>
.capacity-wrapper {
  position: relative; /* Needed for absolute positioning of the button */
  display: inline-block;
  width: 100%;
}

.capacity-content {
  /* Optional: add padding so button doesn't overlap content */
  padding: 0.5rem;
}

.edit-button {
  position: absolute;
  top: 0.25rem;   /* Adjust distance from top */
  right: 0.25rem; /* Adjust distance from right */
  z-index: 10;
}

.capacity-section {
    margin-bottom: 1.5rem;
}

.capacity-bar {
    width: 100%;
    background-color: #e5e7eb;
    border-radius: 9999px;
    height: 0.5rem;
    overflow: hidden;
}

.capacity-fill {
    height: 100%;
    transition: all 0.5s ease-out;
    border-radius: 9999px;
}
</style>
