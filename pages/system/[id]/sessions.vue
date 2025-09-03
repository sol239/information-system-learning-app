<template>
    <div>
        <LocalNavbar />

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
                            <SessionStatusBadge
                                :session="session"
                                :get-session-status="getSessionStatus"
                                :get-session-status-color="getSessionStatusColor"
                            />
                        </div>

                        <!-- Date Range + Day Count Badge -->
                        <div class="flex items-center gap-2 text-sm text-gray-600 mb-4">
                            <SessionDateRange
                                :session="session"
                                :format-date-range="formatDateRange"
                            />
                            <SessionDayCountBadge
                                :session="session"
                                :get-day-count="getDayCount"
                            />
                        </div>

                        <!-- Capacity Progress -->
                        <SessionCapacitySection
                            :session="session"
                            :get-capacity-percentage="getCapacityPercentage"
                            :get-capacity-color="getCapacityColor"
                        />

                        <!-- Participants Section -->
                        <SessionParticipantsSection
                            :session="session"
                            :get-displayed-participants="getDisplayedParticipants"
                            :is-participants-expanded="isParticipantsExpanded"
                            :toggle-participants-expanded="toggleParticipantsExpanded"
                            :get-initials="getInitials"
                        />

                        <!-- Supervisors Section -->
                        <SessionSupervisorsSection
                            :session="session"
                            :get-session-supervisors="getSessionSupervisors"
                            :get-initials="getInitials"
                        />

                        <!-- Session Actions -->
                        <div class="session-actions mt-6 pt-4 border-t border-gray-200">
                            <div class="flex gap-2">
                                <div>
                                    <UButton size="sm" variant="outline" @click="viewSessionDetails(session)"
                                        class="flex-1" :id="'sessions-view-' + session.id">
                                        TO-DO
                                    </UButton>
                                </div>
                                <div>
                                    <UButton size="sm" color="primary" @click="manageSession(session)" class="flex-1"
                                        :id="'sessions-manage-' + session.id">
                                        TO-DO
                                    </UButton>
                                </div>
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
import { useHighlightWatchers } from '~/composables/highlightWatchers'
import SessionStatusBadge from '~/components/infsys_components/sessions/SessionStatusBadge.vue'
import SessionDateRange from '~/components/infsys_components/sessions/SessionDateRange.vue'
import SessionDayCountBadge from '~/components/infsys_components/sessions/SessionDayCountBadge.vue'
import SessionCapacitySection from '~/components/infsys_components/sessions/SessionCapacitySection.vue'
import SessionParticipantsSection from '~/components/infsys_components/sessions/SessionParticipantsSection.vue'
import SessionSupervisorsSection from '~/components/infsys_components/sessions/SessionSupervisorsSection.vue'
import LocalNavbar from '~/components/LocalNavbar.vue'

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
const expandedParticipants = ref<Set<number>>(new Set())

// Load data from database
const loadSessionsFromDatabase = () => {
    if (!selectedSystemStore.selectedSystem?.db) {
        console.error('Database not available')
        return
    }

    try {
        // Load sessions (turnusy)
        const sessionsTable = selectedSystemStore.selectedSystem.db.tableNameMap.get('sessions')
        const participantsTable = selectedSystemStore.selectedSystem.db.tableNameMap.get('participants')
        const sessionsParticipantsTable = selectedSystemStore.selectedSystem.db.tableNameMap.get('sessions_participants')
        const supervisorsTable = selectedSystemStore.selectedSystem.db.tableNameMap.get('supervisors')
        const sessionsSupervisorsTable = selectedSystemStore.selectedSystem.db.tableNameMap.get('sessions_supervisors')

        const sessionsQuery = selectedSystemStore.selectedSystem.db.query(`SELECT * FROM ${sessionsTable} ORDER BY session_id`)
        if (sessionsQuery.success) {
            const sessionsData = sessionsQuery.results.map((row: any) => {
                // Load participants for this session
                const participantsQuery = selectedSystemStore.selectedSystem.db.query(
                    `SELECT p.* FROM ${participantsTable} p
                     JOIN ${sessionsParticipantsTable} sp ON p.participant_id = sp.participant_id
                     WHERE sp.session_id = ?`,
                    [row.session_id]
                )

                const participants = participantsQuery?.success ?
                    participantsQuery.results.map((p: any) => new Participant(
                        p.participant_id,
                        p.name,
                        p.email,
                        p.personal_number,
                        p.phone,
                        p.address,
                        p.age
                    )) : []

                return new Session(
                    row.session_id,
                    new Date(row.from_date),
                    new Date(row.to_date),
                    row.capacity,
                    participants
                )
            })

            sessions.value = sessionsData
        }

        // Load supervisors (vedoucí)
        const supervisorsQuery = selectedSystemStore.selectedSystem.db.query(`SELECT * FROM ${supervisorsTable} ORDER BY supervisor_id`)
        if (supervisorsQuery.success) {
            const supervisorsData = supervisorsQuery.results.map((row: any) => new Supervisor(
                row.supervisor_id,
                row.name,
                row.email,
                row.personal_number,
                row.phone,
                row.address,
                row.age
            ))
            supervisors.value = supervisorsData
        }

        // Load sessions-supervisors relationships
        const sessionsSupervisorsQuery = selectedSystemStore.selectedSystem.db.query(`SELECT * FROM ${sessionsSupervisorsTable}`)
        if (sessionsSupervisorsQuery.success) {
            sessionsSupervisorsQuery.results.forEach((row: any) => {
                const supervisor = supervisors.value.find(s => s.id === row.supervisor_id)
                if (supervisor) {
                    supervisor.sessions.push(row.session_id)
                }
            })
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
    const _supervisors = supervisors.value.filter(s => s.sessions.includes(sessionId));
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

const getDisplayedParticipants = (session: Session): Participant[] => {
    if (isParticipantsExpanded(session.id)) {
        return session.participants
    }
    return session.participants.slice(0, 3)
}

const isParticipantsExpanded = (sessionId: number): boolean => {
    return expandedParticipants.value.has(sessionId)
}

const toggleParticipantsExpanded = (sessionId: number) => {
    if (expandedParticipants.value.has(sessionId)) {
        expandedParticipants.value.delete(sessionId)
    } else {
        expandedParticipants.value.add(sessionId)
    }
}

const createNewSession = () => {
    // Implementation for creating new session
    console.log('Creating new session')
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
}
</style>