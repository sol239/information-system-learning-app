<template>
  <div>
    <div class="stat-card-wrapper">
      <div id="stats-participants" @click="navigate" class="cursor-pointer stat-card" v-html="renderedHtml"></div>
      <EditComponentModalOpenButton @open="showEditor = true" />
      <EditComponentModal :showEditor="showEditor" :draftHtmlTemplate="draftHtmlTemplate" :draftSqlQuery="draftSqlQuery"
        @update:showEditor="showEditor = $event" @update:draftHtmlTemplate="draftHtmlTemplate = $event"
        @update:draftSqlQuery="draftSqlQuery = $event" @applyChanges="applyChanges" />
    </div>
  </div>
</template>

<script setup lang="ts">
/* 1. Imports */
import { computed, ref } from 'vue'
import { useSelectedSystemStore } from '~/stores/useSelectedSystemStore'
import { useSelectedTableStore } from '#imports'
import { ComponentHandler } from '~/composables/ComponentHandler'

/* 2. Stores */
const selectedSystemStore = useSelectedSystemStore()
const selectedTableStore = useSelectedTableStore()

/* 3. Context hooks */
const { t } = useI18n()

/* 4. Constants (non-reactive) */
// none

/* 5. Props */
const props = defineProps<{ 
  system: any 
}>()

/* 6. Emits */
// none

/* 7. Template refs */
// none

/* 8. Local state (ref, reactive) */
const sqlQuery = ref(ComponentHandler.getVariableValue("stats-participants.vue", "sql") || `SELECT COUNT(*) as count FROM účastníci`)
const htmlTemplate = ref(ComponentHandler.getVariableValue("stats-participants.vue", "html") || `
  <div class="stat-card">
    <div class="stat-icon">👥</div>
    <div class="stat-content">
      <div class="stat-number">{{ participantsCount }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </div>
`)

const showEditor = ref(false)
const draftSqlQuery = ref(sqlQuery.value)
const draftHtmlTemplate = ref(htmlTemplate.value)

/* 9. Computed */
const participantsCount = computed(() => {
  const result = props.system?.db.query(sqlQuery.value).results
  return result?.[0]?.count || 0
})

const renderedHtml = computed(() => {
  return htmlTemplate.value
    .replace('{{ participantsCount }}', String(participantsCount.value))
    .replace('{{ label }}', t('participants'))
})

/* 10. Watchers */
// none

/* 11. Methods */
function applyChanges() {
  sqlQuery.value = draftSqlQuery.value
  htmlTemplate.value = draftHtmlTemplate.value
  showEditor.value = false
  console.log('Changes applied:', {
    sqlQuery: sqlQuery.value,
    htmlTemplate: htmlTemplate.value,
    show: showEditor.value
  })
}

function navigate() {
  const systemId = selectedSystemStore.selectedId;
  selectedTableStore.select('účastníci')
  navigateTo({
    path: `/system/${systemId}/table`,
  })
}

/* 12. Lifecycle */
// none

/* 13. defineExpose (if needed) */
// none
</script>

<style scoped>
.stat-card-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}
</style>