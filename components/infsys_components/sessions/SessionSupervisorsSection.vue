<template>
    <div class="supervisors-section mb-6 highlightable" :id="'sessions-supervisors-' + session.id"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-supervisors-' + session.id, $event)">
        <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <UIcon name="i-heroicons-user-group" />
            {{ t('supervisors') }} ({{ getSessionSupervisors().length }})
        </h4>
        <div v-if="getSessionSupervisors().length > 0" class="space-y-2">
            <div v-for="supervisor in getSessionSupervisors()" :key="supervisor.id"
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHighlightStore } from '#imports'
import { useSelectedSystemStore } from '#imports'
import { Supervisor } from '~/model/Supervisor'

interface Props {
    session: any
}

const props = defineProps<Props>()
const { t } = useI18n()
const highlightStore = useHighlightStore()
const selectedSystemStore = useSelectedSystemStore()

const supervisors = ref<Supervisor[]>([])

const loadSupervisors = () => {
    if (!selectedSystemStore.selectedSystem?.db) {
        return
    }

    try {
        const supervisorsTable = selectedSystemStore.selectedSystem.db.getTableName('supervisors')
        const sessionsSupervisorsTable = selectedSystemStore.selectedSystem.db.getTableName('sessions_supervisors')

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
        console.error('Error loading supervisors:', error)
    }
}

const getSessionSupervisors = (): Supervisor[] => {
    return supervisors.value.filter(s => s.sessions.includes(props.session.id))
}

const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

onMounted(() => {
    loadSupervisors()
})
</script>

<style scoped>
.supervisors-section {
    margin-bottom: 1rem;
}

.supervisor-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: 0.5rem;
    transition: background-color 0.2s ease;
}

.supervisor-item:hover {
    background-color: #f9fafb;
}

.supervisor-avatar {
    width: 2rem;
    height: 2rem;
    background-color: #e9d5ff;
    color: #7c3aed;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
}

.supervisor-info {
    flex: 1;
    min-width: 0;
}

.supervisor-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.supervisor-details {
    font-size: 0.75rem;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (max-width: 768px) {
    .supervisor-item {
        padding: 0.25rem;
    }
}
</style>
