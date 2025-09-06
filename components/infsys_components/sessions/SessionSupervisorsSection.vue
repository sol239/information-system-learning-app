<template>
    <div v-if="supervisorsData" class="supervisors-section mb-6 highlightable" :id="'sessions-supervisors-' + props.sessionId"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-supervisors-' + props.sessionId, $event)">
        <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <UIcon name="i-heroicons-user-group" />
            {{ t('supervisors') }} ({{ supervisorsData.length }})
        </h4>
        <div v-if="supervisorsData.length > 0" class="space-y-2">
            <div v-for="supervisor in supervisorsData" :key="supervisor.id"
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

interface Props {
    sessionId: number
}

const props = defineProps<Props>()
const { t } = useI18n()
const highlightStore = useHighlightStore()
const selectedSystemStore = useSelectedSystemStore()

const supervisorsData = ref<any[] | null>(null)

const loadSupervisors = () => {
    if (!selectedSystemStore.selectedSystem?.db) {
        console.error('Database not available')
        return
    }

    try {
        const supervisorsTable = selectedSystemStore.selectedSystem.db.getTableName('supervisors')
        const sessionsSupervisorsTable = selectedSystemStore.selectedSystem.db.getTableName('sessions_supervisors')

        const query = selectedSystemStore.selectedSystem.db.query(
            `SELECT s.* FROM ${supervisorsTable} s
             JOIN ${sessionsSupervisorsTable} ss ON s.supervisor_id = ss.supervisor_id
             WHERE ss.session_id = ?`,
            [props.sessionId]
        )

        if (query.success) {
            supervisorsData.value = query.results
        }
    } catch (error) {
        console.error('Error loading supervisors:', error)
    }
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
