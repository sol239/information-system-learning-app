<template>
  <div class="highlightable" :id="componentId"
    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement(componentId, $event)">
    <div class="delete-button-wrapper">
      <!-- Rendered HTML -->
      <div v-html="renderedHtml" class="delete-button-content" @click.stop="handleDelete"></div>

      <!-- Edit button positioned absolutely -->
      <EditComponentModalOpenButton
        v-if="highlightStore.isEditModeActive"
        :componentId="componentId"
        class="edit-button"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/* 1. Imports */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSelectedSystemStore, useToast } from '#imports'
import { useHighlightStore } from '#imports'
import { useComponentCodeStore } from '~/stores/useComponentCodeStore'
import { ComponentHandler } from '~/composables/ComponentHandler'
import { useHighlightWatchers } from '~/composables/highlightWatchers'
import '~/assets/css/highlight.css'

interface Props {
    sessionId: number
}

const props = defineProps<Props>()
const { t } = useI18n()
const selectedSystemStore = useSelectedSystemStore()
const toast = useToast()
const isDeleting = ref(false)
const highlightStore = useHighlightStore()
const componentCodeStore = useComponentCodeStore()

// Constants
const componentId = 'session-delete-button'

// Component code from store
const sessionDeleteButtonComponent = computed(() => componentCodeStore.getComponentById(componentId) || componentCodeStore.getDefaultComponent(componentId))

const correctSqlQuery1 = computed(() => sessionDeleteButtonComponent.value?.sql?.['sql-1'] || '')
const correctSqlQuery2 = computed(() => sessionDeleteButtonComponent.value?.sql?.['sql-2'] || '')
const correctSqlQuery3 = computed(() => sessionDeleteButtonComponent.value?.sql?.['sql-3'] || '')
const correctHtmlTemplate = computed(() => sessionDeleteButtonComponent.value?.html?.['html'] || '')
const correctCss = computed(() => sessionDeleteButtonComponent.value?.css?.['css'] || '')

const sqlQuery1 = computed(() => ComponentHandler.getComponentValue(componentId, 'sql-1', correctSqlQuery1.value))
const sqlQuery2 = computed(() => ComponentHandler.getComponentValue(componentId, 'sql-2', correctSqlQuery2.value))
const sqlQuery3 = computed(() => ComponentHandler.getComponentValue(componentId, 'sql-3', correctSqlQuery3.value))
const htmlTemplate = computed(() => ComponentHandler.getComponentValue(componentId, 'html', correctHtmlTemplate.value))
const css = computed(() => ComponentHandler.getComponentValue(componentId, 'css', correctCss.value))

// Computed properties
const renderedHtml = computed(() => {
  const html = htmlTemplate.value
    .replace('{{ deleteLabel }}', t('delete'))
    .replace('{{ sessionId }}', String(props.sessionId))
    .replace('onclick="handleDelete()"', '')

  return `<style>${css.value}</style>${html}`;
});

// Watchers
useHighlightWatchers(highlightStore.highlightHandler, highlightStore)

const handleDelete = async () => {
    if (!selectedSystemStore.selectedSystem?.db) {
        console.error('Database not available')
        return
    }

    isDeleting.value = true

    try {
        // Execute SQL statements in order (due to foreign key constraints)
        selectedSystemStore.selectedSystem.db.exec(sqlQuery1.value, [props.sessionId])
        selectedSystemStore.selectedSystem.db.exec(sqlQuery2.value, [props.sessionId])
        selectedSystemStore.selectedSystem.db.exec(sqlQuery3.value, [props.sessionId])

        // Refresh the sessions data in the store
        selectedSystemStore.loadSessions()

        toast.add({
            title: t('session_deleted_success'),
            color: 'primary',
            icon: 'i-heroicons-check'
        })
    } catch (error) {
        console.error('Error deleting session:', error)
        toast.add({
            title: t('error_deleting_session'),
            color: 'red',
            icon: 'i-heroicons-exclamation-triangle'
        })
    } finally {
        isDeleting.value = false
    }
}
</script>

<style>
.delete-button-wrapper {
  position: relative; /* Needed for absolute positioning of the button */
  display: inline-block;
}

.delete-button-content {
  /* Optional: add padding so button doesn't overlap content */
  padding: 0.25rem;
}

.edit-button {
  position: absolute;
  top: 0.25rem;   /* Adjust distance from top */
  right: 0.25rem; /* Adjust distance from right */
  z-index: 10;
}
</style>
