<template>
  <div class="highlightable" :id="componentId"
    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement(componentId, $event)">
    <div class="participants-wrapper">
      <!-- Rendered HTML -->
     <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <UIcon name="i-heroicons-users" />
            {{ t('participants') }} ({{ participantCount }})
        </h4>
        <div v-if="participantCount > 0" class="participants-list space-y-2">
            <div v-for="participant in participantsData" :key="participant.id"
                class="participant-item">
                <div class="participant-avatar">
                    {{ getInitials(participant.name) }}
                </div>
                <div class="participant-info">
                    <div class="participant-name">{{ participant.name }}</div>
                    <div class="participant-details">{{ t('age') }}: {{ participant.age }}</div>
                </div>
            </div>
        </div>
        <div v-else class="text-sm text-gray-500 italic">
            {{ t('no_participants') }}
        </div>

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
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHighlightStore } from '#imports'
import { useSelectedSystemStore } from '#imports'
import { useComponentCodeStore } from '~/stores/useComponentCodeStore'
import { ComponentHandler } from '~/composables/ComponentHandler'
import { useHighlightWatchers } from '~/composables/highlightWatchers'
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
const componentId = 'session-participants-section'
const system = selectedSystemStore.selectedSystem

// Component code from store
const sessionParticipantsComponent = computed(() => componentCodeStore.getComponentById(componentId) || componentCodeStore.getDefaultComponent(componentId))

const correctSqlQuery = computed(() => sessionParticipantsComponent.value?.sql?.['sql-1'] || ``)

const correctCountQuery = computed(() => sessionParticipantsComponent.value?.sql?.['sql-2'] || ``)

const sqlQuery = computed(() => ComponentHandler.getComponentValue(componentId, 'sql-1', correctSqlQuery.value))
const countQuery = computed(() => ComponentHandler.getComponentValue(componentId, 'sql-2', correctCountQuery.value))

// Computed participants fetched with SQL query
const participantsData = computed(() => {
  if (!system?.db || typeof system?.db?.query !== "function") {
    return []
  }
  const result = system?.db.query(sqlQuery.value, [props.sessionId])?.results || []
  return result
})

// Computed participant count using sql-2 query
const participantCount = computed(() => {
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
.participants-wrapper {
  position: relative; /* Needed for absolute positioning of the button */
  display: inline-block;
  width: 100%;
}

.participants-content {
  /* Optional: add padding so button doesn't overlap content */
  padding: 0.5rem;
}

.edit-button {
  position: absolute;
  top: 0.25rem;   /* Adjust distance from top */
  right: 0.25rem; /* Adjust distance from right */
  z-index: 10;
}

.participants-list {
  max-height: 200px;
  overflow-y: auto;
}

/* Modern custom scrollbar */
.participants-list::-webkit-scrollbar {
  width: 8px;
}

.participants-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.participants-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
  border: 2px solid #f1f5f9;
}

.participants-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.participants-list::-webkit-scrollbar-thumb:active {
  background: #64748b;
}

.participant-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: 0.5rem;
    transition: background-color 0.2s ease;
}

.participant-item:hover {
    background-color: #f9fafb;
}

.participant-avatar {
    width: 2rem;
    height: 2rem;
    background-color: #dbeafe;
    color: #2563eb;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
}

.participant-info {
    flex: 1;
    min-width: 0;
}

.participant-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.participant-details {
    font-size: 0.75rem;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (max-width: 768px) {
    .participant-item {
        padding: 0.25rem;
    }
}
</style>
