<template>
  <div class="highlightable" :id="componentId" @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement(componentId, $event)">
    <div class="stat-card-wrapper">
      <div id="stats-sessions" @click="navigate" class="cursor-pointer" v-html="renderedHtml"></div>
      <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" :componentId="componentId" />
    </div>
  </div>
  <EditComponentModal v-if="highlightStore.isEditModeActive && highlightStore.selectedComponentId"/>
</template>

<script setup lang="ts">
/* 1. Imports */
import { computed, ref } from 'vue'
import { useSelectedSystemStore } from '~/stores/useSelectedSystemStore'
import { TaskQueue, useSelectedTableStore } from '#imports'
import { ComponentHandler } from '~/composables/ComponentHandler'
import { useHighlightStore } from '#imports'
import { useSelectedTaskStore } from '#imports'
import { useComponentCodeStore } from '~/stores/useComponentCodeStore'
import type { Component } from '~/model/Component'
import { useHighlightWatchers } from '~/composables/highlightWatchers'
import '~/assets/css/highlight.css'


/* 2. Stores */
const selectedSystemStore = useSelectedSystemStore()
const selectedTableStore = useSelectedTableStore()
const highlightStore = useHighlightStore()
const selectedTaskStore = useSelectedTaskStore()
const componentCodeStore = useComponentCodeStore()

/* 3. Context hooks */
const { t } = useI18n()

/* 4. Constants (non-reactive) */
const componentId = 'stats-sessions';

/* 5. Props */

/* 6. Emits */

/* 8. Local state (ref, reactive) */
const system = selectedSystemStore.selectedSystem;

/* 9. Computed */

// - 1. Get the component by its ID or use a default if not found
//   * It shall be computed because solving tasks might change the component code in the store and also editing the component in the editor shall update the displayed component
const sessionsComponent = computed(() => componentCodeStore.getComponentById(componentId) || componentCodeStore.getDefaultComponent(componentId))

// - 2. Get the correct attributes from the component. Simplified by directly accessing with fallbacks.
const correctSqlQuery = computed(() => sessionsComponent.value?.sql?.['sql'] || sessionsComponent.value?.sql?.['default'] || '')
const correctHtmlTemplate = computed(() => sessionsComponent.value?.html?.['html'] || sessionsComponent.value?.html?.['default'] || '')
const correctNavigateJs = computed(() => sessionsComponent.value?.js?.['js'] || sessionsComponent.value?.js?.['default'] || '')

const sqlQuery = computed(() => ComponentHandler.getComponentValue(componentId, 'sql', correctSqlQuery.value))
const htmlTemplate = computed(() => ComponentHandler.getComponentValue(componentId, 'html', correctHtmlTemplate.value))
const navigateJs = computed(() => ComponentHandler.getComponentValue(componentId, 'js', correctNavigateJs.value))

const sessionsCount = computed(() => {
  if (!system?.db || typeof system?.db?.query !== "function") {
    return 0
  }
  const result = system?.db.query(sqlQuery.value).results?.[0]?.count
  return result || 0
})

const renderedHtml = computed(() => {
  return htmlTemplate.value
    .replace('{{ sessionsCount }}', String(sessionsCount.value))
    .replace('{{ label }}', t('sessions'))
})

/* 10. Watchers */
useHighlightWatchers(highlightStore.highlightHandler, highlightStore);

/* 11. Methods */
function navigate() {
  if (highlightStore.isHighlightMode) {
    return
  }
  const navigateFunction = new Function('selectedTableStore', 'navigateTo', 'systemId', navigateJs.value)
  navigateFunction(selectedTableStore, navigateTo, selectedSystemStore.selectedId)
}

/* 12. Lifecycle */
// none

/* 13. defineExpose (if needed) */

</script>

<style scoped>
.stat-card-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}
</style>