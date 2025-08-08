<template>
  <div>
    <div class="stat-card-wrapper">
      <div id="stats-participants" @click="navigate" class="cursor-pointer stat-card" v-html="renderedHtml"></div>
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

/* 2. Stores */
const selectedSystemStore = useSelectedSystemStore()
const selectedTableStore = useSelectedTableStore()
const highlightStore = useHighlightStore()
const selectedTaskStore = useSelectedTaskStore()

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

const sqlQuery = computed(() => 
  isInErrorComponents("stats-participants.vue")
    ? ComponentHandler.getVariableValue("stats-participants.vue", "sql") || `SELECT COUNT(*) as count FROM účastníci` : "SELECT COUNT(*) as count FROM účastníci"
)

const htmlTemplate = computed(() => 
  isInErrorComponents("stats-participants.vue")
    ? ComponentHandler.getVariableValue("stats-participants.vue", "html") || `
  <div class="stat-card">
    <div class="stat-icon">👥</div>
    <div class="stat-content">
      <div class="stat-number">{{ participantsCount }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </div> ` : `
  <div class="stat-card">
    <div class="stat-icon">👥</div>
    <div class="stat-content">
      <div class="stat-number">{{ participantsCount }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </div>
`
)

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