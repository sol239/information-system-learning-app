<template>
  <div>
    <!-- Rendered Stat Card -->
    <div class="stat-card-wrapper" >
      <div id="stats-meals" @click="navigate" class="cursor-pointer" v-html="renderedHtml"></div>

      <!-- Edit Icon Button -->
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
function isInErrorComponents(componentFilename: string): boolean {
  const getNotCompletedTasks = TaskQueue.getNotCompletedTasks(selectedTaskStore.currentRound)
  const isInErrorComponents = getNotCompletedTasks.some(task => {
    return Array.isArray(task.errorComponents) &&
      task.errorComponents.some(ec => ec.name === componentFilename)
  })
  return isInErrorComponents
}

const correctSqlQuery = computed(() => componentCodeStore.getComponentCode("stats-meals-sql.vue"))
const correctHtmlTemplate = computed(() => componentCodeStore.getComponentCode("stats-meals-html.vue"))

const sqlQuery = computed(() => {
  if (isInErrorComponents("stats-meals.vue")) {
    const errorSql = ComponentHandler.getVariableValue("stats-meals.vue", "sql") || correctSqlQuery.value
    componentCodeStore.updateComponentCode("stats-meals-sql.vue", errorSql)
    return errorSql
  }
  return correctSqlQuery.value
})

const htmlTemplate = computed(() => {
  if (isInErrorComponents("stats-meals.vue")) {
    const errorHtml = ComponentHandler.getVariableValue("stats-meals.vue", "html") || correctHtmlTemplate.value
    componentCodeStore.updateComponentCode("stats-meals-html.vue", errorHtml)
    return errorHtml
  }
  return correctHtmlTemplate.value
})

const mealsCount = computed(() => {
  const result = props.system?.db.query(sqlQuery.value).results
  return result?.[0]?.count || 0
})

const renderedHtml = computed(() => {
  return htmlTemplate.value
    .replace('{{ mealsCount }}', String(mealsCount.value))
    .replace('{{ label }}', t('meals'))
})

/* 11. Methods */
function openEditor() {
  draftSqlQuery.value = sqlQuery.value
  draftHtmlTemplate.value = htmlTemplate.value
  emit('openModal', {
    componentId: 'stats-meals',
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

  const systemId = selectedSystemStore.selectedId;
  selectedTableStore.select('jídla')
  navigateTo({
    path: `/system/${systemId}/table`,
  })
}

/* 12. Lifecycle */
// none

/* 13. defineExpose (if needed) */
defineExpose({
  applyChanges
})
</script>

<style scoped>
.stat-card-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}
</style>