<template>
  <div class="highlightable" :id="componentId"
    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement(componentId, $event)">
    <div class="date-range-wrapper">
      <!-- Rendered HTML -->
      <div v-html="renderedHtml" class="date-range-content"></div>

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
const highlightStore = useHighlightStore()
const selectedSystemStore = useSelectedSystemStore()
const componentCodeStore = useComponentCodeStore()

// Constants
const componentId = 'session-date-range'
const system = selectedSystemStore.selectedSystem

// Component code from store
const sessionDateRangeComponent = computed(() => componentCodeStore.getComponentById(componentId) || componentCodeStore.getDefaultComponent(componentId))

const correctSqlQuery = computed(() => sessionDateRangeComponent.value?.sql?.['sql'] || '')
const correctHtmlTemplate = computed(() => sessionDateRangeComponent.value?.html?.['html'] || '')
const correctCss = computed(() => sessionDateRangeComponent.value?.css?.['css'] || '')

const sqlQuery = computed(() => ComponentHandler.getComponentValue(componentId, 'sql', correctSqlQuery.value))
const htmlTemplate = computed(() => ComponentHandler.getComponentValue(componentId, 'html', correctHtmlTemplate.value))
const css = computed(() => ComponentHandler.getComponentValue(componentId, 'css', correctCss.value))

// Local state
const dateRange = ref<{ fromDate: Date; toDate: Date } | null>(null)

// Computed properties
const renderedHtml = computed(() => {
  if (!dateRange.value) return ''

  const formattedRange = formatDateRange(dateRange.value.fromDate, dateRange.value.toDate)
  const html = htmlTemplate.value
    .replace('{{ dateRange }}', formattedRange)
    .replace('{{ fromDate }}', dateRange.value.fromDate.toISOString().split('T')[0])
    .replace('{{ toDate }}', dateRange.value.toDate.toISOString().split('T')[0])

  return `<style>${css.value}</style>${html}`;
});

// Watchers
useHighlightWatchers(highlightStore.highlightHandler, highlightStore)

const loadDateRange = () => {
    if (!selectedSystemStore.selectedSystem?.db) {
        console.error('Database not available')
        return
    }

    try {
        const sessionsTable = selectedSystemStore.selectedSystem.db.getTableName('sessions')
        const query = selectedSystemStore.selectedSystem.db.query(
            `SELECT from_date, to_date FROM ${sessionsTable} WHERE session_id = ?`,
            [props.sessionId]
        )

        if (query.success && query.results.length > 0) {
            const row = query.results[0]
            dateRange.value = {
                fromDate: new Date(row.from_date),
                toDate: new Date(row.to_date)
            }
        }
    } catch (error) {
        console.error('Error loading date range:', error)
    }
}

const formatDateRange = (fromDate: Date, toDate: Date): string => {
    const from = fromDate.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })
    const to = toDate.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric' })
    return `${from} - ${to}`
}

onMounted(() => {
    loadDateRange()
})
</script>

<style>
.date-range-wrapper {
  position: relative; /* Needed for absolute positioning of the button */
  display: inline-block;
}

.date-range-content {
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
