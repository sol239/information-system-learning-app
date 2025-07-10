<template>
  <div>
    <div class="dashboard-header">
      <h1 class="dashboard-title">{{ system?.name || 'Dashboard' }}</h1>
      <p class="dashboard-subtitle">System overview and statistics</p>
    </div>
    <div class="stats">
      <div class="stat-card">
        <div class="stat-icon">🏫</div>
        <div class="stat-content">
          <div class="stat-number">{{ sessions.length }}</div>
          <div class="stat-label">Sessions</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <div class="stat-number">{{ participants.length }}</div>
          <div class="stat-label">Participants</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👨‍🏫</div>
        <div class="stat-content">
          <div class="stat-number">{{ supervisors.length }}</div>
          <div class="stat-label">Supervisors</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🍽️</div>
        <div class="stat-content">
          <div class="stat-number">{{ meals.length }}</div>
          <div class="stat-label">Meals</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useInformationSystemStore } from '~/stores/informationSystems'
import { useSelectedSystemStore } from '~/stores/selectedSystemId'

const props = defineProps<{
  systemId?: number
}>()

const selectedSystemStore = useSelectedSystemStore()
const informationSystemStore = useInformationSystemStore()

const system = computed(() => {
  const id = props.systemId ?? selectedSystemStore.selectedId
  return informationSystemStore.systems.find(sys => sys.id === id)
})

const sessions = computed(() => system.value?.tables.find(t => t.name === 'sessions')?.data || [])
const participants = computed(() => system.value?.tables.find(t => t.name === 'participants')?.data || [])
const supervisors = computed(() => system.value?.tables.find(t => t.name === 'supervisors')?.data || [])
const meals = computed(() => system.value?.tables.find(t => t.name === 'meals')?.data || [])
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

.stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 160px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8, #3b82f6);
  background-size: 200% 100%;
  animation: shimmer-top 3s ease-in-out infinite;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  font-size: 2rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-radius: 12px;
  border: 1px solid #bfdbfe;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 3.5rem;
  height: 3.5rem;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@keyframes shimmer-top {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>