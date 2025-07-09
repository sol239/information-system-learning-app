<template>
  <div class="sessions-progress" v-if="sessionProgress.length">
    <div class="progress-pillows">
      <div v-for="session in sessionProgress" :key="session.id" class="progress-pillow">
        <div class="pillow-header">
          <span class="pillow-title">{{ session.name }}</span>
          <span class="pillow-count">{{ session.count }}/{{ session.capacity }}</span>
        </div>
        <div class="pillow-bar-bg">
          <div class="pillow-bar"
            :style="{ width: session.percent + '%', backgroundColor: session.color }"></div>
        </div>
        <div class="pillow-percent">{{ session.percent }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  sessionProgress: Array<{
    id: number
    name: string
    color: string
    count: number
    capacity: number
    percent: number
  }>
}>()
</script>

<style scoped>

.sessions-legend {
    margin-bottom: 2rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.sessions-legend h3 {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    color: #374151;
}

.legend-items {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    background: white;
    border: 1px solid #e5e7eb;
}

.color-indicator {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.1);
}

.sessions-progress {
    margin-bottom: 2rem;
}

.progress-pillows {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
}

.progress-pillow {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    padding: 1rem 1.5rem;
    min-width: 220px;
    max-width: 300px;
    flex: 1 1 220px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    border: 1px solid #e5e7eb;
}

.pillow-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.pillow-title {
    font-weight: 600;
    color: #374151;
}

.pillow-count {
    font-size: 0.95rem;
    color: #6b7280;
}

.pillow-bar-bg {
    width: 100%;
    height: 18px;
    background: #f3f4f6;
    border-radius: 9px;
    overflow: hidden;
    margin-bottom: 0.5rem;
    margin-top: 0.25rem;
}

.pillow-bar {
    height: 100%;
    border-radius: 9px 0 0 9px;
    transition: width 0.4s cubic-bezier(.4, 0, .2, 1);
}

.pillow-percent {
    font-size: 0.95rem;
    color: #000000;
    font-weight: 500;
}

</style>