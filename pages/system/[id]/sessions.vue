<template>
    <div>
        <LocalNavbar :items="localItems" />

        <div class="container mx-auto px-4 py-8">

            <!-- Sessions Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="session in sessions" :key="session.id" class="session-card">

                    <!-- Session Header -->
                    <div class="session-header">
                        <!-- Session Capacity Status -->
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-semibold text-gray-900">
                                {{ t('session') }} {{ session.id }}
                            </h3>
                            <UBadge class="highlightable" :color="getSessionStatusColor(session)" variant="soft"
                                :id="'sessions-status-' + session.id"
                                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-status-' + session.id, $event)">
                                {{ getSessionStatus(session) }}
                            </UBadge>
                        </div>

                        <!-- Date Range + Day Count Badge -->
                        <div class="flex items-center gap-2 text-sm text-gray-600 mb-4">
                            <UIcon name="i-heroicons-calendar-days" />
                            <span class="highlightable"
                            :id="'sessions-date-' + session.id"
                            @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-date-' + session.id, $event)">{{ formatDateRange(session.fromDate, session.toDate) }}</span>
                            <UBadge class="highlightable" color="sky" variant="soft"
                                :id="'sessions-day-count-' + session.id"
                                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-day-count-' + session.id, $event)">
                                {{ t('days_count') }}: {{ getDayCount(session) }}
                            </UBadge>
                        </div>

                        <!-- Capacity Progress -->
                        <div class="capacity-section mb-6 highlightable" :id="'sessions-capacity-' + session.id"
                            @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-capacity-' + session.id, $event)">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm font-medium text-gray-700">{{ t('capacity') }}</span>
                                <span class="text-sm text-gray-600">
                                    {{ session.participants.length }}/{{ session.capacity }}
                                </span>
                            </div>
                            <div class="capacity-bar">
                                <div class="capacity-fill" :style="{
                                    width: getCapacityPercentage(session) + '%',
                                    backgroundColor: getCapacityColor(session)
                            }"></div>
                            </div>
                            <div class="text-xs text-gray-500 mt-1">
                                {{ getCapacityPercentage(session) }}% {{ t('occupied') }}
                            </div>
                        </div>

                        <!-- Participants Section -->
                        <div class="participants-section mb-6 highlightable"
                            :id="'sessions-participants-' + session.id"
                            @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-participants-' + session.id, $event)">
                            <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <UIcon name="i-heroicons-users" />
                                {{ t('participants') }} ({{ session.participants.length }})
                            </h4>
                            <div v-if="session.participants.length > 0" class="space-y-2">
                                <div v-for="participant in session.participants.slice(0, 3)" :key="participant.id"
                                    class="participant-item">
                                    <div class="participant-avatar">
                                        {{ getInitials(participant.name) }}
                                    </div>
                                    <div class="participant-info">
                                        <div class="participant-name">{{ participant.name }}</div>
                                        <div class="participant-details">{{ t('age') }}: {{ participant.age }}</div>
                                    </div>
                                </div>
                                <div v-if="session.participants.length > 3" class="text-xs text-gray-500">
                                    + {{ session.participants.length - 3 }} {{ t('more_participants') }}
                                </div>
                            </div>
                            <div v-else class="text-sm text-gray-500 italic">
                                {{ t('no_participants') }}
                            </div>
                        </div>

                        <!-- Supervisors Section -->
                        <div class="supervisors-section mb-6 highlightable"
                            :id="'sessions-supervisors-' + session.id"
                            @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-supervisors-' + session.id, $event)">
                            <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <UIcon name="i-heroicons-user-group" />
                                {{ t('supervisors') }} ({{ getSessionSupervisors(session.id).length }})
                            </h4>
                            <div v-if="getSessionSupervisors(session.id).length > 0" class="space-y-2">
                                <div v-for="supervisor in getSessionSupervisors(session.id)" :key="supervisor.id"
                                    class="supervisor-item">
                                    <div class="supervisor-avatar">
                                        {{ getInitials(supervisor.name) }}
                                    </div>
                                    <div class="supervisor-info">
                                        <div class="supervisor-name">{{ supervisor.name }}</div>
                                        <div class="supervisor-details">{{ supervisor.email }}</div>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="text-sm text-gray-500 italic">
                                {{ t('no_supervisors') }}
                            </div>
                        </div>

                        <!-- Session Actions -->
                        <div class="session-actions mt-6 pt-4 border-t border-gray-200">
                            <div class="flex gap-2">
                                <div><UButton size="sm" variant="outline" @click="!highlightStore.isHighlightMode ? viewSessionDetails(session) : highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-view-' + session.id, $event)"
                                    class="flex-1 highlightable" :id="'sessions-view-' + session.id">h
                                    TO-DO
                                </UButton>
                                </div>
                                    <UButton size="sm" color="primary" @click="!highlightStore.isHighlightMode ? manageSession(session) : highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-manage-' + session.id, $event)"
                                        class="flex-1 highlightable" :id="'sessions-manage-' + session.id">
                                        TO-DO
                                    </UButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-if="sessions.length === 0" class="empty-state">
                <UIcon name="i-heroicons-calendar-x-mark" class="empty-icon" />
                <h3 class="empty-title">{{ t('no_sessions') }}</h3>
                <p class="empty-description">{{ t('no_sessions_description') }}</p>
                <UButton @click="createNewSession" class="mt-4">
                    {{ t('create_session') }}
                </UButton>
            </div>
        </div>

        <!-- Session Detail Modal 
        <SessionDetailModal v-model="showDetailModal" :session="selectedSession"
            :supervisors="getSessionSupervisors(selectedSession?.id || 0)" @manage="manageSession" />
            -->
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSelectedSystemStore } from '#imports'
import { Session } from '~/model/Session'
import { Participant } from '~/model/Participant'
import { Supervisor } from '~/model/Supervisor'
import { useI18n } from 'vue-i18n'
import { useHighlightStore } from '#imports'

const selectedSystemStore = useSelectedSystemStore()
const { t } = useI18n()
const highlightStore = useHighlightStore()

const localItems = ref([
    {
        label: t('dashboard'),
        icon: 'i-heroicons-chart-bar-20-solid',
        to: `/system/${selectedSystemStore.selectedId}/dashboard`,
        data_target: 'system-dashboard',
    },
    {
        label: t('sessions'),
        icon: 'i-heroicons-calendar-date-range',
        to: `/system/${selectedSystemStore.selectedId}/sessions`,
        data_target: 'system-sessions',
    },
    {
        label: t('participants'),
        to: `/system/${selectedSystemStore.selectedId}/participants`,
        data_target: 'system-participants',
    },
    {
        label: t('supervisors'),
        to: `/system/${selectedSystemStore.selectedId}/supervisors`,
        data_target: 'system-supervisors',
    },
    {
        label: t('database'),
        icon: 'i-heroicons-table-cells',
        to: `/system/${selectedSystemStore.selectedId}/database`,
        data_target: 'system-table',
    }
])
// Data from database
const sessions = ref<Session[]>([])
const supervisors = ref<Supervisor[]>([])
const showDetailModal = ref(false)
const selectedSession = ref<Session | null>(null)

// Load data from database
const loadSessionsFromDatabase = () => {
    if (!selectedSystemStore.selectedSystem?.db) {
        console.error('Database not available')
        return
    }

    try {
        // Load sessions (turnusy)
        const sessionsQuery = selectedSystemStore.selectedSystem.db.query('SELECT * FROM turnusy ORDER BY id')
        if (sessionsQuery.success) {
            const sessionsData = sessionsQuery.results.map((row: any) => {
                // Load participants for this session
                const participantsQuery = selectedSystemStore.selectedSystem?.db.query(
                    'SELECT * FROM účastníci WHERE turnus_id = ?',
                    [row.id]
                )

                const participants = participantsQuery?.success ?
                    participantsQuery.results.map((p: any) => new Participant(
                        p.id,
                        p.jméno,
                        p.email,
                        p.rodné_číslo,
                        p.telefon,
                        p.adresa,
                        p.věk,
                        p.turnus_id
                    )) : []

                return new Session(
                    row.id,
                    new Date(row.od),
                    new Date(row.do),
                    row.kapacita,
                    participants
                )
            })

            sessions.value = sessionsData
        }

        // Load supervisors (vedoucí)
        const supervisorsQuery = selectedSystemStore.selectedSystem.db.query('SELECT * FROM vedoucí ORDER BY id')
        if (supervisorsQuery.success) {
            supervisors.value = supervisorsQuery.results.map((row: any) => new Supervisor(
                row.id,
                row.jméno,
                row.email,
                row.rodné_číslo,
                row.telefon,
                row.adresa,
                row.věk,
                row.turnus_id
            ))
        }

    } catch (error) {
        console.error('Error loading data from database:', error)
    }
}

// Helper functions
const getCapacityPercentage = (session: Session): number => {
    return Math.round((session.participants.length / session.capacity) * 100)
}

const getCapacityColor = (session: Session): string => {
    const percentage = getCapacityPercentage(session)
    if (percentage >= 90) return '#ef4444' // red
    if (percentage >= 70) return '#f59e0b' // amber
    return '#10b981' // emerald
}

const getSessionStatus = (session: Session): string => {
    if (session.ifFull()) return t('full')
    const percentage = getCapacityPercentage(session)
    if (percentage >= 70) return t('almost_full')
    if (percentage > 0) return t('available')
    return t('empty')
}

const getSessionStatusColor = (session: Session): 'red' | 'yellow' | 'green' | 'neutral' => {
    if (session.ifFull()) return 'red'
    const percentage = getCapacityPercentage(session)
    if (percentage >= 70) return 'yellow'
    if (percentage > 0) return 'green'
    return 'neutral'
}

const formatDateRange = (fromDate: Date, toDate: Date): string => {
    const from = fromDate.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })
    const to = toDate.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric' })
    return `${from} - ${to}`
}

const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const getSessionSupervisors = (sessionId: number): Supervisor[] => {
    const _supervisors = supervisors.value.filter(s => s.sessionId === sessionId);
    console.log("SUPERVISORS: ", _supervisors);
    return _supervisors
}

const viewSessionDetails = (session: Session) => {
    selectedSession.value = session
    showDetailModal.value = true
}

const manageSession = (session: Session) => {
    // Implementation for managing session
    console.log('Managing session:', session.id)
}
useHighlightWatchers(highlightStore.highlightHandler, highlightStore);

function getDayCount(session: Session): number {
    const start = session.fromDate
    const end = session.toDate
    const diff = end.getTime() - start.getTime()
    return Math.ceil(diff / (1000 * 3600 * 24)) + 1
}

onMounted(() => {
    loadSessionsFromDatabase()
})
</script>

<style scoped>
.session-card {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    border: 1px solid #e5e7eb;
    padding: 1.5rem;
    transition: box-shadow 0.3s ease;
}

.session-card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.session-header {
    border-bottom: 1px solid #f3f4f6;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
}

.capacity-section {
    margin-bottom: 1.5rem;
}

.capacity-bar {
    width: 100%;
    background-color: #e5e7eb;
    border-radius: 9999px;
    height: 0.5rem;
    overflow: hidden;
}

.capacity-fill {
    height: 100%;
    transition: all 0.5s ease-out;
    border-radius: 9999px;
}

.participants-section,
.supervisors-section {
    margin-bottom: 1rem;
}

.participant-item,
.supervisor-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: 0.5rem;
    transition: background-color 0.2s ease;
}

.participant-item:hover,
.supervisor-item:hover {
    background-color: #f9fafb;
}

.participant-avatar,
.supervisor-avatar {
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

.supervisor-avatar {
    background-color: #e9d5ff;
    color: #7c3aed;
}

.participant-info,
.supervisor-info {
    flex: 1;
    min-width: 0;
}

.participant-name,
.supervisor-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.participant-details,
.supervisor-details {
    font-size: 0.75rem;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.session-actions {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
}

.empty-state {
    text-align: center;
    padding: 3rem 0;
}

.empty-icon {
    width: 4rem;
    height: 4rem;
    margin: 0 auto 1rem;
    color: #9ca3af;
}

.empty-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.5rem;
}

.empty-description {
    color: #4b5563;
    max-width: 28rem;
    margin: 0 auto;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .session-card {
        padding: 1rem;
    }

    .participant-item,
    .supervisor-item {
        padding: 0.25rem;
    }
}
</style>