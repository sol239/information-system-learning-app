<template>
    <div class="dashboard-layout">
        <!--<aside class="dashboard-sidebar">
            <LocalNavbar :items="localItems" />
            <TaskList :system-id="system?.id" />
        </aside>-->
        <LocalNavbar :items="localItems" class />
        <main class="dashboard-main">
            <div class="dashboard-content-row">
                <div class="dashboard-content-main">
                    <div id="stats">
                        <!-- <dashboardStatsError v-if="!isElementTaskCompleted('stats')" :system-id="system?.id" /> -->
                        <dashboardStats :system-id="system?.id" />
                    </div>

                    <!-- Sessions Progress Pillows -->
                    <UCard style="border: 2px solid; border-color: #05df72;">
                        <h1 class="dashboard-section-title">{{ t('dashboard_session_progress_title') }}</h1>
                        <div id="dashboard-pillows">
                            <dashboardPillows :sessionProgress="sessionProgress" />
                        </div>
                    </UCard>
                </div>
                <!-- Custom Calendar -->
                <!--
                <div id="calendar" class="highlightable dashboard-calendar-side"
                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('calendar', $event)">
                    <dashboardCalendar :monthNames="monthNames" :currentMonth="currentMonth" :currentYear="currentYear"
                        :previousMonth="previousMonth" :nextMonth="nextMonth" :goToToday="goToToday" :weekDays="weekDays"
                        :calendarDays="calendarDays" :getSessionsForDate="getSessionsForDate"
                        :sessionColorMap="sessionColorMap" />
                </div>-->
            </div>
        </main>
    </div>
</template>

<script lang="ts" setup>
/* 1. Imports */
import { ref, computed, reactive, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useInformationSystemStore } from '~/stores/useInformationSystemStore'
import { useHighlightStore } from '~/stores/useHighlightStore'
import { useSelectedComponentStore } from '~/stores/useSelectedComponentStore'
import dashboardStats from '~/components/infsys_components/dashboard/stats.vue'
import dashboardCalendar from '~/components/infsys_components/dashboard/dashboard-calendar.vue'
import dashboardPillows from '~/components/infsys_components/dashboard/dashboard-pillows.vue'
import { usePersistentStorageTestStore} from "#imports"
import { useHighlightWatchers } from '~/composables/highlightWatchers'
import '~/assets/css/highlight.css'

/* 2. Stores */
const store = useInformationSystemStore()
const highlightStore = useHighlightStore()
const selectedComponentStore = useSelectedComponentStore()
const persistentStorageTestStore = usePersistentStorageTestStore()
/* 3. Kontextové hooky */
const route = useRoute()
const { t } = useI18n()

/* 4. Konstanty (nereaktivní) */
const systemId = route.params.id
const sessionColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
    '#14B8A6', '#F97316', '#84CC16', '#6366F1', '#06B6D4', '#64748B'
]
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/* 5. Props */
// none

/* 6. Emits */
// none

/* 7. Template refs */
// none

/* 8. State */
const systems = store.systems
const system = ref<InformationSystem | null>(null)
const repairedElement = ref<string | null>(null)
const currentDate = ref(new Date())

/* 9. Computed */
system.value = systems.find(function (sys) { return sys.id === parseInt(systemId as string, 10) }) || null
const sessions = computed(function () { return system.value?.tables.find(function (t) { return t.name === 'sessions' })?.data || [] })
const participants = computed(function () { return system.value?.tables.find(function (t) { return t.name === 'participants' })?.data || [] })
const supervisors = computed(function () { return system.value?.tables.find(function (t) { return t.name === 'supervisors' })?.data || [] })
const meals = computed(function () { return system.value?.tables.find(function (t) { return t.name === 'meals' })?.data || [] })
const sessionColorMap = computed(function () {
    const map = new Map()
    sessions.value.forEach(function (session, index) {
        map.set(session.id, sessionColors[index % sessionColors.length])
    })
    return map
})
const sessionProgress = computed(() => {
    // Check if system exists and database is initialized
    if (!system.value?.db || typeof system.value.db.query !== 'function') {
        return []
    }
    
    try {
        const result = system.value.db.query(`SELECT * FROM turnusy`).results || []
        return result.map((turnus, idx) => {
            const countResult = system.value?.db.query(`SELECT COUNT(*) as count FROM účastníci WHERE turnus_id = ${turnus.id}`)
            const count = countResult?.results?.[0]?.count || 0
            const percent = turnus.kapacita ? Math.min(100, Math.round((count / turnus.kapacita) * 100)) : 0

            return {
                id: turnus.id,
                name: `Turnus ${turnus.id}`,
                color: sessionColors[idx % sessionColors.length],
                count: count,
                capacity: turnus.kapacita,
                percent: percent
            }
        })
    } catch (error) {
        console.warn('Database query failed in sessionProgress:', error)
        return []
    }
})

const currentYear = computed(function () { return currentDate.value.getFullYear() })
const currentMonth = computed(function () { return currentDate.value.getMonth() })
const calendarDays = computed(function () {
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

/* 10. Watchers */
/*
watch(
    function () { return system.value?.tasks.map(function (t) { return { id: t.elementClass, completed: t.completed } }) },
    function (newTasks, oldTasks) {
        if (!oldTasks) return;
        newTasks.forEach(function (task, idx) {
            const oldTask = oldTasks[idx];
            if (task && oldTask && !oldTask.completed && task.completed) {
                repairedElement.value = task.id;
                setTimeout(function () {
                    if (selectedElements.value.includes(task.id)) {
                        selectedElements.value = []
                        selectedComponentStore.clear();
                    }
                    repairedElement.value = null;
                }, 1200);
            }
        });
    },
    { deep: true }
)
    */

// Highlight watchers
useHighlightWatchers(highlightStore.highlightHandler, highlightStore);

/* 11. Methods */

function getSessionsForDate(date: Date) {
    return sessions.value.filter(function (session) {
        const sessionStart = new Date(session.fromDate)
        const sessionEnd = new Date(session.toDate)
        return date >= sessionStart && date <= sessionEnd
    })
}
function previousMonth() {
    currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}
function nextMonth() {
    currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}
function goToToday() {
    currentDate.value = new Date()
}
const localItems = ref([
    {
        label: t('dashboard'),
        icon: 'i-heroicons-chart-bar-20-solid',
        to: `/system/${systemId}/dashboard`,
        data_target: 'system-dashboard',
    },
    {
        label: t('sessions'),
        icon: 'i-heroicons-calendar-date-range',
        to: `/system/${systemId}/sessions`,
        data_target: 'system-sessions',
    },
    {
        label: t('participants'),
        to: `/system/${systemId}/participants`,
        data_target: 'system-participants',
    },
    {
        label: t('supervisors'),
        to: `/system/${systemId}/supervisors`,
        data_target: 'system-supervisors',
    },
    {
        label: t('database'),
        icon: 'i-heroicons-table-cells',
        to: `/system/${systemId}/database`,
        data_target: 'system-table',
    }
])
function isElementTaskCompleted(elementId: string): boolean {
    if (!system.value) return false;
    const task = system.value.tasks.find(function (task) { return task.elementClass === elementId })
    return task ? task.completed : false;
}

/* 12. Lifecycle */
// none

/* 13. defineExpose */
// none
</script>

<style scoped>
.dashboard-layout {
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

/* Nový flex řádek pro obsah */
.dashboard-content-row {
    display: flex;
    gap: 2rem;
    align-items: flex-start;
}

/* Hlavní část (stats + pillows) */
.dashboard-content-main {
    flex: 2 1 0;
    min-width: 0;
}

/* Kalendář vedle */
.dashboard-calendar-side {
    flex: 1 1 320px;
    min-width: 320px;
    max-width: 400px;
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

.dashboard-section-title {
    font-size: 2.2rem;
    font-weight: 800;
    margin-bottom: 1.2rem;
    background: linear-gradient(90deg, #05df72 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
    letter-spacing: 0.03em;
    text-align: left;
}
</style>