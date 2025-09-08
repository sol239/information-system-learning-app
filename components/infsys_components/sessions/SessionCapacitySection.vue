<template>
  <div class="highlightable" :id="componentId"
    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement(componentId, $event)">
    <div class="capacity-wrapper">
      <!-- Rendered HTML -->
      <div v-html="renderedHtml" class="capacity-content"></div>

      <!-- Edit button positioned absolutely -->
      <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" :componentId="componentId"
        class="edit-button" />
    </div>
  </div>
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

const correctCapacityQuery = computed(() => sessionCapacityComponent.value?.sql?.['sql-1'] || '')
const correctParticipantCountQuery = computed(() => sessionCapacityComponent.value?.sql?.['sql-2'] || '')
const correctHtmlTemplate = computed(() => sessionCapacityComponent.value?.html?.['html'] || '')
const correctCss = computed(() => sessionCapacityComponent.value?.css?.['css'] || '')
const correctJs = computed(() => sessionCapacityComponent.value?.js?.['js'] || '')

const participantCountQuery = computed(() => ComponentHandler.getComponentValue(componentId, 'sql-2', correctParticipantCountQuery.value))
const capacityQuery = computed(() => ComponentHandler.getComponentValue(componentId, 'sql-1', correctCapacityQuery.value))
const htmlTemplate = computed(() => ComponentHandler.getComponentValue(componentId, 'html', correctHtmlTemplate.value))
const css = computed(() => ComponentHandler.getComponentValue(componentId, 'css', correctCss.value))
const js = computed(() => ComponentHandler.getComponentValue(componentId, 'js', correctJs.value))

// Local state
const capacityData = computed(() => ({
  capacity: capacity.value,
  participantCount: participantCount.value
}))

// Computed properties
const renderedHtml = computed(() => {
  if (!capacityData.value) return ''

  const percentage = capacityPercentage()
  const color = getCapacityColor()
  const html = htmlTemplate.value
    .replace('{{ capacity }}', String(capacity.value))
    .replace('{{ participantCount }}', String(participantCount.value))
    .replace(/{{ percentage }}/g, String(percentage))
    .replace('{{ color }}', color)
    .replace('{{ label }}', t('capacity'))
    .replace('{{ occupied }}', t('occupied'))
  return `<style>${css.value}</style>${html}`;
});

const capacityFunction = computed(() => new Function('participantCount', 'capacity', js.value))

const participantCount = computed(() => {
  if (!system?.db || typeof system?.db?.query !== "function") {
    return 0
  }
  const result = system?.db.query(participantCountQuery.value, [props.sessionId])?.results?.[0]?.count || 0
  return result;
})

const capacity = computed(() => {
  if (!system?.db || typeof system?.db?.query !== "function") {
    return 0
  }
  const queryResult = system?.db.query(capacityQuery.value, [props.sessionId]).results?.[0]?.capacity
  return queryResult || 0
})

const capacityPercentage = (): number => {
  if (!capacityData.value) return 0
  return capacityFunction.value(capacityData.value.participantCount, capacityData.value.capacity)
}

const getCapacityColor = (): string => {
  if (!capacityData.value) return '#10b981'
  const percentage = capacityPercentage()
  if (percentage >= 90) return '#ef4444' // red
  if (percentage >= 70) return '#f59e0b' // amber
  return '#10b981' // emerald
}

// Watchers
useHighlightWatchers(highlightStore.highlightHandler, highlightStore)

</script>

<style>
.capacity-wrapper {
  position: relative;
  /* Needed for absolute positioning of the button */
  display: inline-block;
  width: 100%;
}

.capacity-content {
  /* Optional: add padding so button doesn't overlap content */
  padding: 0.5rem;
}

.edit-button {
  position: absolute;
  top: 0.25rem;
  /* Adjust distance from top */
  right: 0.25rem;
  /* Adjust distance from right */
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
