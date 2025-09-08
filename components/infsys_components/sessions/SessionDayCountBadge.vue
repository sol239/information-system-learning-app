<template>
  <div class="highlightable" :id="componentId"
    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement(componentId, $event)">
    <div class="badge-wrapper">
      <!-- Rendered HTML -->
      <div v-html="renderedHtml" class="badge-content"></div>

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
const componentId = 'session-day-count-badge'
const system = selectedSystemStore.selectedSystem

// Component code from store
const sessionDayCountComponent = computed(() => componentCodeStore.getComponentById(componentId) || componentCodeStore.getDefaultComponent(componentId))

const correctSqlQuery = computed(() => sessionDayCountComponent.value?.sql?.['sql'] || '')
const correctHtmlTemplate = computed(() => sessionDayCountComponent.value?.html?.['html'] || '')
const correctCss = computed(() => sessionDayCountComponent.value?.css?.['css'] || '')

const sqlQuery = computed(() => ComponentHandler.getComponentValue(componentId, 'sql', correctSqlQuery.value))
const htmlTemplate = computed(() => ComponentHandler.getComponentValue(componentId, 'html', correctHtmlTemplate.value))
const css = computed(() => ComponentHandler.getComponentValue(componentId, 'css', correctCss.value))

// Local state
const dayCount = ref<number | null>(null)

// Computed properties
const renderedHtml = computed(() => {
  const html = htmlTemplate.value
    .replace('{{ dayCount }}', String(dayCount.value || 0))
    .replace('{{ label }}', t('days_count'))

  return `<style>${css.value}</style>${html}`;
});

// Watchers
useHighlightWatchers(highlightStore.highlightHandler, highlightStore)

const loadDayCount = () => {
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
            const start = new Date(row.from_date)
            const end = new Date(row.to_date)
            const diff = end.getTime() - start.getTime()
            dayCount.value = Math.ceil(diff / (1000 * 3600 * 24)) + 1
        }
    } catch (error) {
        console.error('Error loading day count:', error)
    }
}

onMounted(() => {
    loadDayCount()
})
</script>

<style>
.badge-wrapper {
  position: relative; /* Needed for absolute positioning of the button */
  display: inline-block;
}

.badge-content {
  /* Optional: add padding so button doesn't overlap content */
  padding: 0.5rem;
}

.edit-button {
  position: absolute;
  top: 0.25rem;   /* Adjust distance from top */
  right: 0.25rem; /* Adjust distance from right */
  z-index: 10;
}
</style>
