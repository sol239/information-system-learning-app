<template>
  <div>
    <div class="stat-card-wrapper">
      <div id="stats-supervisors" @click="navigate" class="cursor-pointer" v-html="renderedHtml"></div>
      <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" @open="openEditor" />
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
// none

/* 5. Props */
const props = defineProps<{
  system: any
}>()

/* 6. Emits */
const emit = defineEmits<{
  (e: 'openModal', data: { componentId: string, htmlTemplate: string, sqlQuery: string }): void
  (e: 'applyChanges', data: { componentId: string, htmlTemplate: string, sqlQuery: string }): void
}>()

/* 8. Local state (ref, reactive) */
const showEditor = ref(false)
const draftSqlQuery = ref('')
const draftHtmlTemplate = ref('')

/* 9. Computed */

// Use a component object for supervisors, similar to meals/participants/sessions
const supervisorsComponent = computed(() => componentCodeStore.getComponentById('stats-supervisors') || componentCodeStore.getDefaultComponent('stats-supervisors'))

const correctSqlQuery = computed(() => supervisorsComponent.value?.sql || '')
const correctHtmlTemplate = computed(() => supervisorsComponent.value?.html || '')
const correctNavigateJs = computed(() => supervisorsComponent.value?.js || '')

const sqlQuery = computed(() => {
  if (ComponentHandler.isInErrorComponents("stats-supervisors.vue")) {
    const errorSql = ComponentHandler.getVariableValue("stats-supervisors.vue", "sql") || correctSqlQuery.value
    if (supervisorsComponent.value) {
      componentCodeStore.updateComponent("stats-supervisors", { ...supervisorsComponent.value, sql: errorSql })
    }
    return errorSql
  }
  return correctSqlQuery.value
})

const htmlTemplate = computed(() => {
  if (ComponentHandler.isInErrorComponents("stats-supervisors.vue")) {
    const errorHtml = ComponentHandler.getVariableValue("stats-supervisors.vue", "html") || correctHtmlTemplate.value
    if (supervisorsComponent.value) {
      componentCodeStore.updateComponent("stats-supervisors", { ...supervisorsComponent.value, html: errorHtml })
    }
    return errorHtml
  }
  return correctHtmlTemplate.value
})

const navigateJs = computed(() => {
  if (ComponentHandler.isInErrorComponents("stats-supervisors.vue")) {
    const errorJs = ComponentHandler.getVariableValue("stats-supervisors.vue", "js") || correctNavigateJs.value
    if (supervisorsComponent.value) {
      componentCodeStore.updateComponent("stats-supervisors", { ...supervisorsComponent.value, js: errorJs })
    }
    return errorJs
  }
  return correctNavigateJs.value
})

const supervisorsCount = computed(() => {
  if (!props.system?.db || typeof props.system?.db?.query !== "function") {
    return 0
  }
  const result = props.system?.db.query(sqlQuery.value).results?.[0]?.count
  return result || 0
})

const renderedHtml = computed(() => {
  return htmlTemplate.value
    .replace('{{ supervisorsCount }}', String(supervisorsCount.value))
    .replace('{{ label }}', t('supervisors'))
})

/* 11. Methods */
function openEditor() {
  draftSqlQuery.value = sqlQuery.value
  draftHtmlTemplate.value = htmlTemplate.value
  emit('openModal', {
    componentId: 'stats-supervisors',
    htmlTemplate: draftHtmlTemplate.value,
    sqlQuery: draftSqlQuery.value
  })
}

function applyChanges(data: { htmlTemplate: string, sqlQuery: string }) {
  draftSqlQuery.value = data.sqlQuery
  draftHtmlTemplate.value = data.htmlTemplate
  // Optionally, update ComponentHandler here if needed
}

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