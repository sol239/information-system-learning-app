<template>
  <div>
    <!-- Rendered Stat Card -->
    <div class="stat-card-wrapper">
      <div class="stat-card" v-html="renderedHtml"></div>

      <!-- Edit Icon Button -->
      <EditComponentModalOpenButton @open="showEditor = true" />

      <EditComponentModal :showEditor="showEditor" :draftHtmlTemplate="draftHtmlTemplate" :draftSqlQuery="draftSqlQuery"
        @update:showEditor="showEditor = $event" @update:draftHtmlTemplate="draftHtmlTemplate = $event"
        @update:draftSqlQuery="draftSqlQuery = $event" @applyChanges="applyChanges" />

    </div>


  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import EditComponentModal from '../../EditComponentModal.vue';

const { t } = useI18n()
const props = defineProps<{ system: any }>()




// Default SQL and HTML template
const sqlQuery = ref(`SELECT COUNT(*) as count FROM jídla`)
const htmlTemplate = ref(`
  <div class="stat-card">
    <div class="stat-icon">🍽️</div>
    <div class="stat-content">
      <div class="stat-number">{{ mealsCount }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </div>
`)
const showEditor = ref(false)

// Drafts for editing
const draftSqlQuery = ref(sqlQuery.value)
const draftHtmlTemplate = ref(htmlTemplate.value)

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

// Re-evaluate meals count based on current query
const mealsCount = computed(() => {
  const result = props.system?.db.query(sqlQuery.value).results
  return result?.[0]?.count || 0
})

// Rendered HTML with injected values
const renderedHtml = computed(() => {
  return htmlTemplate.value
    .replace('{{ mealsCount }}', String(mealsCount.value))
    .replace('{{ label }}', t('meals'))
})

</script>

<style scoped>
.stat-card-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}
</style>
