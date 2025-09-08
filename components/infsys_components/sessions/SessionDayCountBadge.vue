<template>
  <div class="highlightable" :id="componentId"
    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement(componentId, $event)">
    <div class="badge-wrapper">
      <!-- Rendered HTML -->
      <div v-html="renderedHtml" class="badge-content"></div>

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
const componentId = 'session-day-count-badge'
const system = selectedSystemStore.selectedSystem

// Component code from store
const sessionDayCountComponent = computed(() => componentCodeStore.getComponentById(componentId) || componentCodeStore.getDefaultComponent(componentId))

const correctSqlQuery = computed(() => sessionDayCountComponent.value?.sql?.['sql'] || '')
const correctHtmlTemplate = computed(() => sessionDayCountComponent.value?.html?.['html'] || '')
const correctCss = computed(() => sessionDayCountComponent.value?.css?.['css'] || '')
const correctJs = computed(() => sessionDayCountComponent.value?.js?.['js'] || '')

const sqlQuery = computed(() => ComponentHandler.getComponentValue(componentId, 'sql', correctSqlQuery.value))
const htmlTemplate = computed(() => ComponentHandler.getComponentValue(componentId, 'html', correctHtmlTemplate.value))
const css = computed(() => ComponentHandler.getComponentValue(componentId, 'css', correctCss.value))
const js = computed(() => ComponentHandler.getComponentValue(componentId, 'js', correctJs.value))

// Local state
const dayCount = computed(() => {
  if (!system?.db || typeof system?.db?.query !== "function") {
    return 0
  }
  const queryResult = system?.db.query(sqlQuery.value, [props.sessionId])
  if (queryResult?.success && queryResult.results.length > 0) {
    const row = queryResult.results[0]
    const start = new Date(row.from_date)
    const end = new Date(row.to_date)
    return dayCountFunction.value(start, end)
  }
  return 0
})

// Computed properties
const renderedHtml = computed(() => {
  const html = htmlTemplate.value
    .replace('{{ dayCount }}', String(dayCount.value))
    .replace('{{ label }}', t('days_count'))
  return `<style>${css.value}</style>${html}`;
});

const dayCountFunction = computed(() => new Function('start', 'end', js.value))

// Watchers
useHighlightWatchers(highlightStore.highlightHandler, highlightStore)

</script>

<style>
.badge-wrapper {
  position: relative; /* Needed for absolute positioning of the button */
  display: inline-block;
  width: 100%;
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

.badge-section {
  margin-bottom: 1.5rem;
}
</style>
