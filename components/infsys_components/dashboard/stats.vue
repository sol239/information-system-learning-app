<template>
  <div>
    <div class="dashboard-header">
      <h1 class="dashboard-title">{{ system?.name || 'Dashboard' }}</h1>
      <p class="dashboard-subtitle">{{ t('dashboard_subtitle') }}</p>
    </div>
    <div class="stats">
      <StatsSessions ref="statsSessionsRef" id="stats-sessions" class="highlightable"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('stats-sessions', $event)"
        @openModal="handleOpenModal" :system="system" />
      <StatsParticipants ref="statsParticipantsRef" id="stats-participants" class="highlightable"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('stats-participants', $event)"
        @openModal="handleOpenModal" :system="system" />
      <StatsSupervisors ref="statsSupervisorsRef" id="stats-supervisors" class="highlightable"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('stats-supervisors', $event)"
        @openModal="handleOpenModal" :system="system" />
      <StatsMeals ref="statsMealsRef" id="stats-meals" class="highlightable"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('stats-meals', $event)"
        @openModal="handleOpenModal" :system="system" />
    </div>

    <!-- Modal rendered outside of stats container using Teleport -->
    <Teleport to="body">
      <EditComponentModal v-if="showEditor" :showEditor="showEditor" :draftHtmlTemplate="draftHtmlTemplate"
        :draftSqlQuery="draftSqlQuery"
        :draftJsCode="componentCodeStore.getComponentCode(currentComponentId + '-js.vue')"
        :componentId="currentComponentId" @update:showEditor="showEditor = $event"
        @update:draftHtmlTemplate="draftHtmlTemplate = $event" @update:draftSqlQuery="draftSqlQuery = $event"
        @applyChanges="applyChanges" />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
/* 1. Imports */
import { computed, ref } from 'vue'
import { useInformationSystemStore } from '~/stores/useInformationSystemStore'
import { useSelectedSystemStore } from '~/stores/useSelectedSystemStore'
import StatsSessions from '~/components/infsys_components/dashboard/stats/stats-sessions.vue'
import StatsParticipants from '~/components/infsys_components/dashboard/stats/stats-participants.vue'
import StatsSupervisors from '~/components/infsys_components/dashboard/stats/stats-supervisors.vue'
import StatsMeals from '~/components/infsys_components/dashboard/stats/stats-meals.vue'
import '@/assets/css/stats.css'
import { useHighlightWatchers } from '~/composables/highlightWatchers'
import '~/assets/css/highlight.css'
import { useHighlightStore } from '#imports'
import { useComponentCodeStore } from '#imports'


/* 2. Stores */
const selectedSystemStore = useSelectedSystemStore()
const informationSystemStore = useInformationSystemStore()
const highlightStore = useHighlightStore()

/* 3. Context hooks */
const { t } = useI18n()

/* 4. Constants (non-reactive) */
const componentCodeStore = useComponentCodeStore()

/* 5. Props */
const props = defineProps<{
  systemId?: number
}>()

/* 6. Emits */
// none

/* 7. Template refs */
const statsSessionsRef = ref()
const statsParticipantsRef = ref()
const statsSupervisorsRef = ref()
const statsMealsRef = ref()

/* 8. Local state (ref, reactive) */
const showEditor = ref(false)
const draftHtmlTemplate = ref('')
const draftSqlQuery = ref('')
const currentComponentId = ref('')

/* 9. Computed */
const system = computed(() => {
  const id = props.systemId ?? selectedSystemStore.selectedId
  return informationSystemStore.systems.find(sys => sys.id === id)
})

/* 10. Watchers */

useHighlightWatchers(highlightStore.highlightHandler, highlightStore);

/* 11. Methods */
function handleOpenModal(data: { componentId: string, htmlTemplate: string, sqlQuery: string }) {
  currentComponentId.value = data.componentId
  console.log("Opening editor for component:", currentComponentId.value)
  draftHtmlTemplate.value = data.htmlTemplate
  draftSqlQuery.value = data.sqlQuery
  showEditor.value = true
}

function applyChanges() {
  const componentRef = getComponentRef(currentComponentId.value)
  if (componentRef) {
    componentRef.applyChanges({
      htmlTemplate: draftHtmlTemplate.value,
      sqlQuery: draftSqlQuery.value
    })
  }
  showEditor.value = false
}

function getComponentRef(componentId: string) {
  switch (componentId) {
    case 'stats-sessions':
      return statsSessionsRef.value
    case 'stats-participants':
      return statsParticipantsRef.value
    case 'stats-supervisors':
      return statsSupervisorsRef.value
    case 'stats-meals':
      return statsMealsRef.value
    default:
      return null
  }
}

/* 12. Lifecycle */
onMounted(() => {
  const highlightStore = useHighlightStore()
  console.log("HIGHLIGHT  ON:", highlightStore.isHighlightMode)
  console.log(highlightStore.highlightHandler.getHighlightedElements())
})


/* 13. defineExpose (if needed) */
// none
</script>

<style scoped>
.dashboard-header {
  margin-bottom: 2rem;
  text-align: center;
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dashboard-subtitle {
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

.stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}
</style>