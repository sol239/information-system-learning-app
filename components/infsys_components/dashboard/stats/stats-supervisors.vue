<template>
  <div class="highlightable" :id="componentId" @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement(componentId, $event)">
    <div class="stat-card-wrapper">
      <div id="stats-supervisors" @click="navigate" class="cursor-pointer" v-html="renderedHtml"></div>
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
const componentId = 'stats-supervisors';

/* 5. Props */

/* 6. Emits */

/* 8. Local state (ref, reactive) */
const system = selectedSystemStore.selectedSystem;

/* 9. Computed */

// Use a component object for supervisors, similar to meals/participants/sessions
const supervisorsComponent = computed(() => componentCodeStore.getComponentById(componentId) || componentCodeStore.getDefaultComponent(componentId))

const correctSqlQuery = computed(() => supervisorsComponent.value?.sql?.['sql'] || supervisorsComponent.value?.sql?.['default'] || '')
const correctHtmlTemplate = computed(() => supervisorsComponent.value?.html?.['html'] || supervisorsComponent.value?.html?.['default'] || '')
const correctNavigateJs = computed(() => supervisorsComponent.value?.js?.['js'] || supervisorsComponent.value?.js?.['default'] || '')

const sqlQuery = computed(() => {
  if (ComponentHandler.isInErrorComponents(componentId)) {
    const errorSql = ComponentHandler.getVariableValue(componentId, "sql") || correctSqlQuery.value
    return errorSql
  }
  return correctSqlQuery.value
})

const htmlTemplate = computed(() => {
  if (ComponentHandler.isInErrorComponents(componentId)) {
    const errorHtml = ComponentHandler.getVariableValue(componentId, "html") || correctHtmlTemplate.value
    return errorHtml
  }
  return correctHtmlTemplate.value
})

const navigateJs = computed(() => {
  if (ComponentHandler.isInErrorComponents(componentId)) {
    const errorJs = ComponentHandler.getVariableValue(componentId, "js") || correctNavigateJs.value
    return errorJs
  }
  return correctNavigateJs.value
})

const supervisorsCount = computed(() => {
  if (!system?.db || typeof system?.db?.query !== "function") {
    return 0
  }
  const result = system?.db.query(sqlQuery.value).results?.[0]?.count
  return result || 0
})

const renderedHtml = computed(() => {
  return htmlTemplate.value
    .replace('{{ supervisorsCount }}', String(supervisorsCount.value))
    .replace('{{ label }}', t('supervisors'))
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
</script>

<style scoped>
.stat-card-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}
</style>