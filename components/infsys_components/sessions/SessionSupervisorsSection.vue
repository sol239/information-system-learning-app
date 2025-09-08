<template>
  <div class="highlightable" :id="componentId"
    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement(componentId, $event)">
    <div class="supervisors-wrapper">
      <!-- Rendered HTML -->
     <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <UIcon name="i-heroicons-user-group" />
            {{ t('supervisors') }} ({{ supervisorCount }})
        </h4>
        <div v-if="supervisorCount > 0" class="supervisors-list space-y-2">
            <div v-for="supervisor in supervisorsData" :key="supervisor.id"
                class="supervisor-item">
                <div class="supervisor-avatar">
                    {{ getInitials(supervisor.name) }}
                </div>
                <div class="supervisor-info">
                    <div class="supervisor-name">{{ supervisor.name }}</div>
                    <div class="supervisor-details">{{ supervisor.email }}</div>
                </div>
            </div>
        </div>
        <div v-else class="text-sm text-gray-500 italic">
            {{ t('no_supervisors') }}
        </div>

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
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHighlightStore } from '#imports'
import { useSelectedSystemStore } from '#imports'
import { useComponentCodeStore } from '~/stores/useComponentCodeStore'
import { ComponentHandler } from '~/composables/ComponentHandler'
import { useHighlightWatchers } from '~/composables/highlightWatchers'
import EditComponentModal from '~/components/EditComponentModal.vue'
import EditComponentModalOpenButton from '~/components/EditComponentModalOpenButton.vue'
import '~/assets/css/highlight.css'

interface Props {
    sessionId: number
}

const props = defineProps<Props>()
const { t } = useI18n()
const highlightStore = useHighlightStore()
const selectedSystemStore = useSelectedSystemStore()
const componentCodeStore = useComponentCodeStore()

// Constants
const componentId = 'session-supervisors-section'
const system = selectedSystemStore.selectedSystem

// Component code from store
const sessionSupervisorsComponent = computed(() => componentCodeStore.getComponentById(componentId) || componentCodeStore.getDefaultComponent(componentId))

const correctSqlQuery = computed(() => sessionSupervisorsComponent.value?.sql?.['sql-1'] || `SELECT s.* FROM ${system?.db?.getTableName('supervisors')} s
             JOIN ${system?.db?.getTableName('sessions_supervisors')} ss ON s.supervisor_id = ss.supervisor_id
             WHERE ss.session_id = ?`)

const correctCountQuery = computed(() => sessionSupervisorsComponent.value?.sql?.['sql-2'] || `SELECT COUNT(*) as count FROM ${system?.db?.getTableName('supervisors')} s
             JOIN ${system?.db?.getTableName('sessions_supervisors')} ss ON s.supervisor_id = ss.supervisor_id
             WHERE ss.session_id = ?`)

const sqlQuery = computed(() => ComponentHandler.getComponentValue(componentId, 'sql-1', correctSqlQuery.value))
const countQuery = computed(() => ComponentHandler.getComponentValue(componentId, 'sql-2', correctCountQuery.value))

// Computed supervisors fetched with SQL query
const supervisorsData = computed(() => {
  if (!system?.db || typeof system?.db?.query !== "function") {
    return []
  }
  const result = system?.db.query(sqlQuery.value, [props.sessionId])?.results || []
  return result
})

// Computed supervisor count using sql-2 query
const supervisorCount = computed(() => {
  if (!system?.db || typeof system?.db?.query !== "function") {
    return 0
  }
  const result = system?.db.query(countQuery.value, [props.sessionId])?.results?.[0]?.count || 0
  return result
})


// Watchers
useHighlightWatchers(highlightStore.highlightHandler, highlightStore)

const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
}
</script>

<style>
.supervisors-wrapper {
  position: relative; /* Needed for absolute positioning of the button */
  display: inline-block;
  width: 100%;
}

.supervisors-content {
  /* Optional: add padding so button doesn't overlap content */
  padding: 0.5rem;
}

.edit-button {
  position: absolute;
  top: 0.25rem;   /* Adjust distance from top */
  right: 0.25rem; /* Adjust distance from right */
  z-index: 10;
}

.supervisors-list {
  max-height: 200px;
  overflow-y: auto;
}

/* Modern custom scrollbar */
.supervisors-list::-webkit-scrollbar {
  width: 8px;
}

.supervisors-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.supervisors-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
  border: 2px solid #f1f5f9;
}

.supervisors-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.supervisors-list::-webkit-scrollbar-thumb:active {
  background: #64748b;
}

.supervisor-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: 0.5rem;
    transition: background-color 0.2s ease;
}

.supervisor-item:hover {
    background-color: #f9fafb;
}

.supervisor-avatar {
    width: 2rem;
    height: 2rem;
    background-color: #e9d5ff;
    color: #7c3aed;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
}

.supervisor-info {
    flex: 1;
    min-width: 0;
}

.supervisor-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.supervisor-details {
    font-size: 0.75rem;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (max-width: 768px) {
    .supervisor-item {
        padding: 0.25rem;
    }
}
</style>