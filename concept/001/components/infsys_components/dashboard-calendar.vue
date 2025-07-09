<template>
  <div class="calendar-section">
    <div class="calendar-header">
      <h2>Sessions Calendar</h2>
      <div class="calendar-controls">
        <button @click="previousMonth" class="nav-button">‹</button>
        <span class="current-month">{{ monthNames[currentMonth] }} {{ currentYear }}</span>
        <button @click="nextMonth" class="nav-button">›</button>
        <button @click="goToToday" class="today-button">Today</button>
      </div>
    </div>

    <div class="calendar">
      <div class="calendar-grid">
        <div v-for="day in weekDays" :key="day" class="weekday-header">
          {{ day }}
        </div>
        <div v-for="day in calendarDays" :key="day.date.toISOString()" class="calendar-day" :class="{
          'other-month': !day.isCurrentMonth,
          'today': day.isToday
        }">
          <div class="day-number">{{ day.day }}</div>
          <div class="day-sessions">
            <div v-for="session in getSessionsForDate(day.date)" :key="session.id"
              class="session-indicator"
              :style="{ backgroundColor: sessionColorMap.get(session.id) }"
              :title="session.name || `Session ${session.id}`">
              <span class="session-name">{{ session.name || `S${session.id}` }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  monthNames: string[]
  currentMonth: number
  currentYear: number
  previousMonth: () => void
  nextMonth: () => void
  goToToday: () => void
  weekDays: string[]
  calendarDays: Array<any>
  getSessionsForDate: (date: Date) => any[]
  sessionColorMap: Map<number, string>
}>()
</script>

<style scoped>
/* Custom Calendar Styles */
.calendar-section {
    margin-top: 2rem;
}

.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.calendar-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.nav-button {
    background: #3B82F6;
    color: white;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
}

.nav-button:hover {
    background: #2563EB;
}

.current-month {
    font-size: 1.1rem;
    font-weight: 600;
    min-width: 160px;
    text-align: center;
}

.today-button {
    background: #10B981;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
}

.today-button:hover {
    background: #059669;
}

.calendar {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    overflow: hidden;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
}

.weekday-header {
    background: #f3f4f6;
    padding: 1rem;
    text-align: center;
    font-weight: 600;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;
}

.calendar-day {
    min-height: 100px;
    padding: 0.5rem;
    border-right: 1px solid #e5e7eb;
    border-bottom: 1px solid #e5e7eb;
    background: white;
    position: relative;
}

.calendar-day:nth-child(7n) {
    border-right: none;
}

.calendar-day.other-month {
    background: #f9fafb;
    color: #9ca3af;
}

.calendar-day.today {
    background: #eff6ff;
}

.calendar-day.today .day-number {
    background: #3B82F6;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
}

.day-number {
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
}

.day-sessions {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.session-indicator {
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 0.7rem;
    color: white;
    font-weight: 500;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: opacity 0.2s;
}

.session-indicator:hover {
    opacity: 0.8;
}

.session-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}
</style>