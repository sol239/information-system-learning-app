<template>
  <div>
    <div class="dashboard-header">
      <h1 class="dashboard-title">{{ system?.name || 'Dashboard' }}</h1>
      <p class="dashboard-subtitle">{{ t('dashboard_subtitle') }}</p>
    </div>
    <div class="stats">
      <StatsSessions :system="system" />
      <StatsParticipants :system="system" />
      <StatsSupervisors :system="system" />
      <StatsMeals :system="system" />
    </div>
  </div>
</template>

<script setup lang="ts">
/* 1. Imports */
import { computed } from 'vue'
import { useInformationSystemStore } from '~/stores/useInformationSystemStore'
import { useSelectedSystemStore } from '~/stores/useSelectedSystemStore'
import StatsSessions from '~/components/infsys_components/dashboard/stats/stats-sessions.vue'
import StatsParticipants from '~/components/infsys_components/dashboard/stats/stats-participants.vue'
import StatsSupervisors from '~/components/infsys_components/dashboard/stats/stats-supervisors.vue'
import StatsMeals from '~/components/infsys_components/dashboard/stats/stats-meals.vue'
import '@/assets/css/stats.css'

/* 2. Stores */
const selectedSystemStore = useSelectedSystemStore()
const informationSystemStore = useInformationSystemStore()

/* 3. Context hooks */
const { t } = useI18n()

/* 4. Constants (non-reactive) */
// none

/* 5. Props */
const props = defineProps<{
  systemId?: number
}>()

/* 6. Emits */
// none

/* 7. Template refs */
// none

/* 8. Local state (ref, reactive) */
// none

/* 9. Computed */
const system = computed(() => {
  const id = props.systemId ?? selectedSystemStore.selectedId
  return informationSystemStore.systems.find(sys => sys.id === id)
})

/* 10. Watchers */
// none

/* 11. Methods */
// none

/* 12. Lifecycle */
// none

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