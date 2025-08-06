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
import { computed } from 'vue'
import { useInformationSystemStore } from '~/stores/informationSystems'
import { useSelectedSystemStore } from '~/stores/selectedSystemId'
import StatsSessions from '~/components/infsys_components/stats/stats-sessions.vue'
import StatsParticipants from '~/components/infsys_components/stats/stats-participants.vue'
import StatsSupervisors from '~/components/infsys_components/stats/stats-supervisors.vue'
import StatsMeals from '~/components/infsys_components/stats/stats-meals.vue'
const { t } = useI18n()

const props = defineProps<{
  systemId?: number
}>()

const selectedSystemStore = useSelectedSystemStore()
const informationSystemStore = useInformationSystemStore()
import '@/assets/css/stats.css'

const system = computed(() => {
  const id = props.systemId ?? selectedSystemStore.selectedId
  return informationSystemStore.systems.find(sys => sys.id === id)
})


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