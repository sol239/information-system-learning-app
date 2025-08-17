<template>
  <div>
    <div class="stat-card-wrapper">
      <div id="stats-participants" @click="navigate" class="cursor-pointer" v-html="renderedHtml"></div>
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
import { useComponentCodeStore } from '#imports'

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

const sqlQuery = computed(() => {
  if (isInErrorComponents("stats-participants.vue")) {
    const errorSql = ComponentHandler.getVariableValue("stats-participants.vue", "sql") || componentCodeStore.getComponentCode("stats-participants-sql.vue")
    componentCodeStore.updateComponentCode("stats-participants-sql.vue", errorSql)
    return errorSql
  }
  return componentCodeStore.getComponentCode("stats-participants-sql.vue")
})

const htmlTemplate = computed(() => {
  if (isInErrorComponents("stats-participants.vue")) {
    const errorHtml = ComponentHandler.getVariableValue("stats-participants.vue", "html") || componentCodeStore.getComponentCode("stats-participants-html.vue")
    componentCodeStore.updateComponentCode("stats-participants-html.vue", errorHtml)
    return errorHtml
  }
  return componentCodeStore.getComponentCode("stats-participants-html.vue")
})

const participantsCount = computed(() => {
  const result = props.system?.db.query(sqlQuery.value).results
  return result?.[0]?.count || 0
})

const renderedHtml = computed(() => {
  return htmlTemplate.value
    .replace('{{ participantsCount }}', String(participantsCount.value))
    .replace('{{ label }}', t('participants'))
})

/* 11. Methods */
function openEditor() {
  draftSqlQuery.value = sqlQuery.value
  draftHtmlTemplate.value = htmlTemplate.value
  emit('openModal', {
    componentId: 'stats-participants',
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
  selectedTableStore.select('účastníci')
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