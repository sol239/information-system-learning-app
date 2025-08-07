<template>
  <div>
    <div class="stat-card-wrapper">
      <div class="stat-card" v-html="renderedHtml"></div>
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
import EditComponentModal from '../../EditComponentModal.vue'

/* 2. Stores */
// none

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
const sqlQuery = ref(`SELECT COUNT(*) as count FROM turnusy`)
const htmlTemplate = ref(`
  <div class=\"stat-card\">
    <div class=\"stat-icon\">🏫</div>
    <div class=\"stat-content\">
      <div class=\"stat-number\">{{ sessionsCount }}</div>
      <div class=\"stat-label\">{{ label }}</div>
    </div>
  </div>
`)
const showEditor = ref(false)
const draftSqlQuery = ref(sqlQuery.value)
const draftHtmlTemplate = ref(htmlTemplate.value)

/* 9. Computed */
const sessionsCount = computed(() => {
  const result = props.system?.db.query(sqlQuery.value).results
  return result?.[0]?.count || 0
})

const renderedHtml = computed(() => {
  return htmlTemplate.value
    .replace('{{ sessionsCount }}', String(sessionsCount.value))
    .replace('{{ label }}', t('sessions'))
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