<template>
  <div class="highlightable" id="dashboard-table-count-badge"
    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('dashboard-table-count-badge', $event)">
     <div class="badge-wrapper">
      <!-- Rendered HTML -->
      <div v-html="renderedHtml" class="badge-content"></div>

      <!-- Edit button positioned absolutely -->
      <EditComponentModalOpenButton
        v-if="highlightStore.isEditModeActive"
        :componentId="componentId"
        class="edit-button"
      />
    </div>
  </div>
  <EditComponentModal v-if="highlightStore.isEditModeActive && highlightStore.selectedComponentId" />
</template>


<script setup lang="ts">
/* 1. Imports */
import { computed } from 'vue'
import { InformationSystem } from '~/model/InformationSystem'
import { useHighlightStore } from '#imports';
import { useSelectedSystemStore } from '#imports';
import { useComponentCodeStore } from '#imports';

/* 2. Context hooks */
const { t } = useI18n()
const highlightStore = useHighlightStore();
const selectedSystemStore = useSelectedSystemStore();
const componentCodeStore = useComponentCodeStore();

const componentId = 'dashboard-table-count-badge';
const system = selectedSystemStore.selectedSystem;

const tableCountBadgeComponent = computed(() => componentCodeStore.getComponentById(componentId) || componentCodeStore.getDefaultComponent(componentId))

const correctSqlQuery = computed(() => tableCountBadgeComponent.value?.sql?.['sql'] || '')
const correctHtmlTemplate = computed(() => tableCountBadgeComponent.value?.html?.['html'] || '')
const correctCss = computed(() => tableCountBadgeComponent.value?.css?.['css'] || '')

const sqlQuery = computed(() => ComponentHandler.getComponentValue(componentId, 'sql', correctSqlQuery.value))
const htmlTemplate = computed(() => ComponentHandler.getComponentValue(componentId, 'html', correctHtmlTemplate.value))
const css = computed(() => ComponentHandler.getComponentValue(componentId, 'css', correctCss.value))

const renderedHtml = computed(() => {
  const html = htmlTemplate.value
    .replace('{{ tableCount }}', String(tableCount.value))
    .replace('{{ label }}', t('table_count'))

  return `<style>${css.value}</style>${html}`;
});
/* 3. Props */

/* 4. Emits */
// none

/* 5. Computed */
const tableCount = computed(() => {
  if (!system?.db || typeof system?.db?.query !== "function") {
    return 0
  }
  const result = system?.db.query(sqlQuery.value).results?.[0]?.count
  return result || 0
})

useHighlightWatchers(highlightStore.highlightHandler, highlightStore);

</script>

<style>
.badge-wrapper {
  position: relative; /* Needed for absolute positioning of the button */
  display: inline-block;
}

.badge-content {
  /* Optional: add padding so button doesn't overlap content */
  padding: 0.5rem;
}

.edit-button {
  position: absolute;
  top: 0.25rem;   /* Adjust distance from top */
  right: 0.25rem; /* Adjust distance from right */
  z-index: 10;
}
</style>