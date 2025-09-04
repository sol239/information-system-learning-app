<template>
  <div>
    <div class="stat-card-wrapper">
      <div id="stats-sessions" @click="navigate" class="cursor-pointer" v-html="renderedHtml"></div>
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
const componentId = 'stats-sessions';

/* 5. Props */

/* 6. Emits */

/* 8. Local state (ref, reactive) */
const system = selectedSystemStore.selectedSystem;

/* 9. Computed */

// Use a component object for sessions, similar to meals/participants
const sessionsComponent = computed(() => componentCodeStore.getComponentById(componentId) || componentCodeStore.getDefaultComponent(componentId))

const correctSqlQuery = computed(() => sessionsComponent.value?.sql?.['default'] || '')
const correctHtmlTemplate = computed(() => sessionsComponent.value?.html?.['default'] || '')
const correctNavigateJs = computed(() => sessionsComponent.value?.js?.['default'] || '')

const sqlQuery = computed(() => {
  if (ComponentHandler.isInErrorComponents("stats-sessions.vue")) {
    const errorSql = ComponentHandler.getVariableValue("stats-sessions.vue", "sql") || correctSqlQuery.value
    if (sessionsComponent.value) {
      componentCodeStore.updateComponent("stats-sessions", { ...sessionsComponent.value, sql: { ...sessionsComponent.value.sql, 'default': errorSql } })
    }
    return errorSql
  }
  return correctSqlQuery.value
})

const htmlTemplate = computed(() => {
  if (ComponentHandler.isInErrorComponents("stats-sessions.vue")) {
    const errorHtml = ComponentHandler.getVariableValue("stats-sessions.vue", "html") || correctHtmlTemplate.value
    if (sessionsComponent.value) {
      componentCodeStore.updateComponent("stats-sessions", { ...sessionsComponent.value, html: { ...sessionsComponent.value.html, 'default': errorHtml } })
    }
    return errorHtml
  }
  return correctHtmlTemplate.value
})

const navigateJs = computed(() => {
  if (ComponentHandler.isInErrorComponents("stats-sessions.vue")) {
    const errorJs = ComponentHandler.getVariableValue("stats-sessions.vue", "js") || correctNavigateJs.value
    if (sessionsComponent.value) {
      componentCodeStore.updateComponent("stats-sessions", { ...sessionsComponent.value, js: { ...sessionsComponent.value.js, 'default': errorJs } })
    }
    return errorJs
  }
  return correctNavigateJs.value
})

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