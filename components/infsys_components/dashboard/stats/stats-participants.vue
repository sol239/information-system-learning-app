<template>
  <div>
    <div class="stat-card-wrapper">
      <div id="stats-participants" @click="navigate" class="cursor-pointer" v-html="renderedHtml"></div>
      <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" :componentId="componentId" />
    </div>
  </div>
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

/* 2. Stores */
const selectedSystemStore = useSelectedSystemStore()
const selectedTableStore = useSelectedTableStore()
const highlightStore = useHighlightStore()
const selectedTaskStore = useSelectedTaskStore()
const componentCodeStore = useComponentCodeStore()

/* 3. Context hooks */
const { t } = useI18n()

/* 4. Constants (non-reactive) */
const componentId = 'stats-participants';

/* 5. Props */

/* 6. Emits */

/* 8. Local state (ref, reactive) */
const system = selectedSystemStore.selectedSystem;

/* 9. Computed */

// Use a component object for participants, similar to meals
const participantsComponent = computed(() => componentCodeStore.getComponentById(componentId) || componentCodeStore.getDefaultComponent(componentId))

const correctSqlQuery = computed(() => participantsComponent.value?.sql?.['default'] || '')
const correctHtmlTemplate = computed(() => participantsComponent.value?.html?.['default'] || '')
const correctNavigateJs = computed(() => participantsComponent.value?.js?.['default'] || '')

const sqlQuery = computed(() => {
  if (ComponentHandler.isInErrorComponents(componentId + ".vue")) {
    const errorSql = ComponentHandler.getVariableValue(componentId + ".vue", "sql") || correctSqlQuery.value
    if (participantsComponent.value) {
      componentCodeStore.updateComponent(componentId, { ...participantsComponent.value, sql: { ...participantsComponent.value.sql, 'default': errorSql } })
    }
    return errorSql
  }
  return correctSqlQuery.value
})

const htmlTemplate = computed(() => {
  if (ComponentHandler.isInErrorComponents(componentId + ".vue")) {
    const errorHtml = ComponentHandler.getVariableValue(componentId + ".vue", "html") || correctHtmlTemplate.value
    if (participantsComponent.value) {
      componentCodeStore.updateComponent(componentId, { ...participantsComponent.value, html: { ...participantsComponent.value.html, 'default': errorHtml } })
    }
    return errorHtml
  }
  return correctHtmlTemplate.value
})

const navigateJs = computed(() => {
  if (ComponentHandler.isInErrorComponents(componentId + ".vue")) {
    const errorJs = ComponentHandler.getVariableValue(componentId + ".vue", "js") || correctNavigateJs.value
    if (participantsComponent.value) {
      componentCodeStore.updateComponent(componentId, { ...participantsComponent.value, js: { ...participantsComponent.value.js, 'default': errorJs } })
    }
    return errorJs
  }
  return correctNavigateJs.value
})

const participantsCount = computed(() => {
  if (!system?.db || typeof system?.db?.query !== "function") {
    return 0
  }
  const result = system?.db.query(sqlQuery.value).results?.[0]?.count
  return result || 0
})

const renderedHtml = computed(() => {
  return htmlTemplate.value
    .replace('{{ participantsCount }}', String(participantsCount.value))
    .replace('{{ label }}', t('participants'))
})

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