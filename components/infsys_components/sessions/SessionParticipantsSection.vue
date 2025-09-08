<template>
  <div class="highlightable" :id="componentId"
    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement(componentId, $event)">
    <div class="participants-wrapper">
      <!-- Rendered HTML -->
      <div v-html="renderedHtml" class="participants-content"></div>

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

const correctSqlQuery = computed(() => sessionParticipantsComponent.value?.sql?.['sql'] || '')
const correctHtmlTemplate = computed(() => sessionParticipantsComponent.value?.html?.['html'] || '')
const correctCss = computed(() => sessionParticipantsComponent.value?.css?.['css'] || '')

const sqlQuery = computed(() => ComponentHandler.getComponentValue(componentId, 'sql', correctSqlQuery.value))
const htmlTemplate = computed(() => ComponentHandler.getComponentValue(componentId, 'html', correctHtmlTemplate.value))
const css = computed(() => ComponentHandler.getComponentValue(componentId, 'css', correctCss.value))

// Local state
const participantsData = ref<any[] | null>(null)
const expandedParticipants = ref<Set<number>>(new Set())

// Computed properties
const renderedHtml = computed(() => {
  if (!participantsData.value) return ''

  const displayedParticipants = getDisplayedParticipants()
  const participantsHtml = displayedParticipants.map(participant => `
    <div class="participant-item">
      <div class="participant-avatar">${getInitials(participant.name)}</div>
      <div class="participant-info">
        <div class="participant-name">${participant.name}</div>
        <div class="participant-details">${t('age')}: ${participant.age}</div>
      </div>
    </div>
  `).join('')

  const moreLink = participantsData.value.length > 3 && !isParticipantsExpanded()
    ? `<div class="text-xs text-gray-500 cursor-pointer hover:text-gray-700" onclick="toggleParticipantsExpanded()">
        + ${participantsData.value.length - 3} ${t('more_participants')}
       </div>`
    : ''

  const lessLink = participantsData.value.length > 3 && isParticipantsExpanded()
    ? `<div class="text-xs text-gray-500 cursor-pointer hover:text-gray-700" onclick="toggleParticipantsExpanded()">
        ${t('show_less')}
       </div>`
    : ''

  const noParticipants = participantsData.value.length === 0
    ? `<div class="text-sm text-gray-500 italic">${t('no_participants')}</div>`
    : ''

  const html = htmlTemplate.value
    .replace('{{ participantsTitle }}', `${t('participants')} (${participantsData.value.length})`)
    .replace('{{ participantsList }}', participantsHtml)
    .replace('{{ moreLink }}', moreLink)
    .replace('{{ lessLink }}', lessLink)
    .replace('{{ noParticipants }}', noParticipants)

  return `<style>${css.value}</style>${html}`;
});

// Watchers
useHighlightWatchers(highlightStore.highlightHandler, highlightStore)

const loadParticipants = () => {
    if (!selectedSystemStore.selectedSystem?.db) {
        console.error('Database not available')
        return
    }

    try {
        const participantsTable = selectedSystemStore.selectedSystem.db.getTableName('participants')
        const sessionsParticipantsTable = selectedSystemStore.selectedSystem.db.getTableName('sessions_participants')

        const query = selectedSystemStore.selectedSystem.db.query(
            `SELECT p.* FROM ${participantsTable} p
             JOIN ${sessionsParticipantsTable} sp ON p.participant_id = sp.participant_id
             WHERE sp.session_id = ?`,
            [props.sessionId]
        )

        if (query.success) {
            participantsData.value = query.results
        }
    } catch (error) {
        console.error('Error loading participants:', error)
    }
}

const getDisplayedParticipants = (): any[] => {
    if (!participantsData.value) return []
    if (isParticipantsExpanded()) {
        return participantsData.value
    }
    return participantsData.value.slice(0, 3)
}

const isParticipantsExpanded = (): boolean => {
    return expandedParticipants.value.has(props.sessionId)
}

const toggleParticipantsExpanded = () => {
    if (expandedParticipants.value.has(props.sessionId)) {
        expandedParticipants.value.delete(props.sessionId)
    } else {
        expandedParticipants.value.add(props.sessionId)
    }
}

const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

onMounted(() => {
    loadParticipants()
})
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

.participants-section {
    margin-bottom: 1rem;
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
