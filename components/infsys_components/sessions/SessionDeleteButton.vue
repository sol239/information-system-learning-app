<template>
    <div class="highlightable" :id="'sessions-delete-' + sessionId">
        <UButton size="sm" color="red" variant="solid" :loading="isDeleting" 
            @click="highlightStore.isHighlightMode
                ? highlightStore.highlightHandler.selectElement('sessions-delete-' + sessionId, $event)
                : handleDelete()"
            :id="'sessions-delete-' + sessionId">
            <UIcon name="i-heroicons-trash" class="mr-1" />
            {{ t('delete') }}
        </UButton>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSelectedSystemStore, useToast } from '#imports'
import { useHighlightStore } from '#imports'

interface Props {
    sessionId: number
}

const props = defineProps<Props>()
const { t } = useI18n()
const selectedSystemStore = useSelectedSystemStore()
const toast = useToast()
const isDeleting = ref(false)
const highlightStore = useHighlightStore()

const handleDelete = async () => {
    if (!selectedSystemStore.selectedSystem?.db) {
        console.error('Database not available')
        return
    }

    isDeleting.value = true

    try {
        const sessionsTable = selectedSystemStore.selectedSystem.db.getTableName('sessions')
        const sessionsParticipantsTable = selectedSystemStore.selectedSystem.db.getTableName('sessions_participants')
        const sessionsSupervisorsTable = selectedSystemStore.selectedSystem.db.getTableName('sessions_supervisors')

        // Delete related records first (due to foreign key constraints)
        selectedSystemStore.selectedSystem.db.exec(
            `DELETE FROM ${sessionsParticipantsTable} WHERE session_id = ${props.sessionId}`
        )

        selectedSystemStore.selectedSystem.db.exec(
            `DELETE FROM ${sessionsSupervisorsTable} WHERE session_id = ${props.sessionId}`
        )

        // Delete the session
        selectedSystemStore.selectedSystem.db.exec(
            `DELETE FROM ${sessionsTable} WHERE session_id = ${props.sessionId}`
        )

        // Refresh the sessions data in the store
        selectedSystemStore.loadSessions()

        toast.add({
            title: t('session_deleted_success'),
            color: 'primary',
            icon: 'i-heroicons-check'
        })
    } catch (error) {
        console.error('Error deleting session:', error)
        toast.add({
            title: t('error_deleting_session'),
            color: 'red',
            icon: 'i-heroicons-exclamation-triangle'
        })
    } finally {
        isDeleting.value = false
    }
}
</script>
