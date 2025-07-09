<script lang="ts" setup>
import { useRoute } from 'vue-router'
import type { InformationSystem } from '~/model/types/InformationSystem'
import { ref, computed, watch } from 'vue'
import { useInformationSystemStore } from '~/stores/informationSystems'
import { useHighlightStore } from '~/stores/highlightElements'
import dashboardStats from '~/components/infsys_components/dashboard-stats.vue'
import dashboardCalendar from '~/components/infsys_components/dashboard-calendar.vue'
import dashboardPillows from '~/components/infsys_components/dashboard-pillows.vue'

const route = useRoute()
const systemId = route.params.id
const store = useInformationSystemStore()
const highlightStore = useHighlightStore()
const systems = store.systems
const system = ref<InformationSystem | null>(null)

// Add selected element tracking
const selectedElement = ref<string | null>(null)

// Watch for highlight mode changes and deselect when disabled
watch(() => highlightStore.isHighlightMode, (newValue) => {
    if (!newValue) {
        selectedElement.value = null
    }
})

const selectElement = (elementId: string) => {
    if (selectedElement.value === elementId) {
        selectedElement.value = null // Deselect if already selected
    } else {
        selectedElement.value = elementId
    }
}

const isElementSelected = (elementId: string) => {
    return selectedElement.value === elementId
}

const isElementDimmed = (elementId: string) => {
    return highlightStore.isHighlightMode && selectedElement.value && selectedElement.value !== elementId
}

system.value = systems.find(sys => sys.id === parseInt(systemId as string, 10)) || null

const sessions = computed(() => system.value?.tables.find(t => t.name === 'sessions')?.data || [])
const participants = computed(() => system.value?.tables.find(t => t.name === 'participants')?.data || [])
const supervisors = computed(() => system.value?.tables.find(t => t.name === 'supervisors')?.data || [])
const meals = computed(() => system.value?.tables.find(t => t.name === 'meals')?.data || [])

// Color palette for sessions
const sessionColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
    '#14B8A6', '#F97316', '#84CC16', '#6366F1', '#06B6D4', '#64748B'
]

// Create color mapping for sessions
const sessionColorMap = computed(() => {
    const map = new Map()
    sessions.value.forEach((session: any, index: number) => {
        map.set(session.id, sessionColors[index % sessionColors.length])
    })
    return map
})

// Calculate session fill progress
const sessionProgress = computed(() => {
    return sessions.value.map((session: any) => {
        const count = participants.value.filter((p: any) => p.sessionId === session.id).length
        const percent = session.capacity ? Math.min(100, Math.round((count / session.capacity) * 100)) : 0
        return {
            id: session.id,
            name: session.name || `Session ${session.id}`,
            color: sessionColorMap.value.get(session.id),
            count,
            capacity: session.capacity,
            percent
        }
    })
})

// Current date navigation
const currentDate = ref(new Date())
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

// Calendar data
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Get calendar days for current month
const calendarDays = computed(() => {
    const year = currentYear.value
    const month = currentMonth.value
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const current = new Date(startDate)

    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
        days.push({
            date: new Date(current),
            isCurrentMonth: current.getMonth() === month,
            isToday: current.toDateString() === new Date().toDateString(),
            day: current.getDate()
        })
        current.setDate(current.getDate() + 1)
    }

    return days
})

// Get sessions for a specific date
const getSessionsForDate = (date: Date) => {
    return sessions.value.filter((session: any) => {
        const sessionStart = new Date(session.fromDate)
        const sessionEnd = new Date(session.toDate)
        return date >= sessionStart && date <= sessionEnd
    })
}

// Navigation functions
const previousMonth = () => {
    currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

const nextMonth = () => {
    currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

const goToToday = () => {
    currentDate.value = new Date()
}

const localItems = ref([
    {
        label: system.value?.name || 'System',
    },
    {
        label: 'Dashboard',
        icon: 'i-heroicons-chart-bar-20-solid',
        to: `/system/${systemId}/dashboard`,
        data_target: 'system-dashboard',
    },
    {
        label: 'Tables',
        icon: 'i-heroicons-table-cells',
        to: `/system/${systemId}/table`,
        data_target: 'system-table',
    }

]);
</script>

<template>
    <div class="dashboard-layout">
        <aside class="dashboard-sidebar">
            <LocalNavbar :items="localItems" />
            <TaskList :system-id="system?.id" />
        </aside>
        <main class="dashboard-main">
            <div :class="['highlightable', 'dashboard-stats', { 'highlighted-yellow': highlightStore.isHighlightMode && !isElementDimmed('stats'), 'highlighted-selected': isElementSelected('stats'), 'highlighted-dimmed': isElementDimmed('stats') }]"
                @click="highlightStore.isHighlightMode && selectElement('stats')">
                <dashboardStats :system-id="system?.id" />
            </div>

            <!-- Sessions Progress Pillows -->
            <div :class="['highlightable', 'dashboard-pillows', { 'highlighted-yellow': highlightStore.isHighlightMode && !isElementDimmed('pillows'), 'highlighted-selected': isElementSelected('pillows'), 'highlighted-dimmed': isElementDimmed('pillows') }]"
                @click="highlightStore.isHighlightMode && selectElement('pillows')">
                <dashboardPillows :sessionProgress="sessionProgress" />
            </div>

            <!-- Custom Calendar -->
            <div :class="['highlightable', 'dashboard-calendar', { 'highlighted-yellow': highlightStore.isHighlightMode && !isElementDimmed('calendar'), 'highlighted-selected': isElementSelected('calendar'), 'highlighted-dimmed': isElementDimmed('calendar') }]"
                @click="highlightStore.isHighlightMode && selectElement('calendar')">
                <dashboardCalendar :monthNames="monthNames" :currentMonth="currentMonth" :currentYear="currentYear"
                    :previousMonth="previousMonth" :nextMonth="nextMonth" :goToToday="goToToday" :weekDays="weekDays"
                    :calendarDays="calendarDays" :getSessionsForDate="getSessionsForDate"
                    :sessionColorMap="sessionColorMap" />
            </div>
        </main>
    </div>
</template>

<style scoped>
.dashboard-layout {
    display: flex;
    min-height: 100vh;
}

.dashboard-sidebar {
    width: 40%;
    border-right: 1px solid #e5e7eb;
    padding: 2rem 1rem 2rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.dashboard-main {
    flex: 1;
    max-width: 1000px;
    margin: 2rem auto;
    padding: 2rem;
}
.dashboard {
    max-width: 1000px;
    margin: 2rem auto;
    padding: 2rem;
}

.stats {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

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

.highlighted-yellow {
    border: 2px solid #facc15;
    border-radius: 6px;
    transition: all 0.3s;
    background: none !important;
    position: relative;
    overflow: hidden;
    animation: illuminate 2s ease-in-out infinite alternate;
    box-shadow: 0 0 15px rgba(250, 204, 21, 0.5);
    cursor: pointer;
}

.highlighted-selected {
    border: 3px solid #f59e0b;
    border-radius: 8px;
    transition: all 0.3s;
    background: none !important;
    position: relative;
    overflow: hidden;
    animation: illuminate-selected 1.5s ease-in-out infinite alternate;
    box-shadow: 0 0 30px rgba(245, 158, 11, 0.8);
    cursor: pointer;
    z-index: 10;
}

.highlighted-dimmed {
    border: 1px solid #facc15;
    border-radius: 6px;
    transition: all 0.3s;
    background: none !important;
    opacity: 0.4;
    box-shadow: 0 0 5px rgba(250, 204, 21, 0.2);
    cursor: pointer;
}

.highlighted-yellow::before,
.highlighted-selected::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, transparent, rgba(250, 204, 21, 0.1), transparent);
    z-index: 1;
    pointer-events: none;
}

.highlighted-selected::before {
    background: linear-gradient(45deg, transparent, rgba(245, 158, 11, 0.2), transparent);
}

.highlighted-yellow>*,
.highlighted-selected>*,
.highlighted-dimmed>* {
    position: relative;
    z-index: 2;
}

@keyframes illuminate {
    0% {
        box-shadow: 0 0 15px rgba(250, 204, 21, 0.3);
        border-color: #facc15;
    }

    100% {
        box-shadow: 0 0 25px rgba(250, 204, 21, 0.8);
        border-color: #fbbf24;
    }
}

@keyframes illuminate-selected {
    0% {
        box-shadow: 0 0 25px rgba(245, 158, 11, 0.6);
        border-color: #f59e0b;
    }

    100% {
        box-shadow: 0 0 40px rgba(245, 158, 11, 1);
        border-color: #d97706;
    }
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