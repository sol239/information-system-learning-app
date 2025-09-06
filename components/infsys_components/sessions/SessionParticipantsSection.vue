<template>
    <div class="participants-section mb-6 highlightable" :id="'sessions-participants-' + session.id"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-participants-' + session.id, $event)">
        <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <UIcon name="i-heroicons-users" />
            {{ t('participants') }} ({{ session.participants.length }})
        </h4>
        <div v-if="session.participants.length > 0" class="space-y-2">
            <div v-for="participant in getDisplayedParticipants()" :key="participant.id"
                class="participant-item">
                <div class="participant-avatar">
                    {{ getInitials(participant.name) }}
                </div>
                <div class="participant-info">
                    <div class="participant-name">{{ participant.name }}</div>
                    <div class="participant-details">{{ t('age') }}: {{ participant.age }}</div>
                </div>
            </div>
            <div v-if="session.participants.length > 3 && !isParticipantsExpanded()"
                class="text-xs text-gray-500 cursor-pointer hover:text-gray-700"
                @click="toggleParticipantsExpanded()">
                + {{ session.participants.length - 3 }} {{ t('more_participants') }}
            </div>
            <div v-if="session.participants.length > 3 && isParticipantsExpanded()"
                class="text-xs text-gray-500 cursor-pointer hover:text-gray-700"
                @click="toggleParticipantsExpanded()">
                {{ t('show_less') }}
            </div>
        </div>
        <div v-else class="text-sm text-gray-500 italic">
            {{ t('no_participants') }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHighlightStore } from '#imports'

interface Props {
    session: any
}

const props = defineProps<Props>()
const { t } = useI18n()
const highlightStore = useHighlightStore()

const expandedParticipants = ref<Set<number>>(new Set())

const getDisplayedParticipants = (): any[] => {
    if (isParticipantsExpanded()) {
        return props.session.participants
    }
    return props.session.participants.slice(0, 3)
}

const isParticipantsExpanded = (): boolean => {
    return expandedParticipants.value.has(props.session.id)
}

const toggleParticipantsExpanded = () => {
    if (expandedParticipants.value.has(props.session.id)) {
        expandedParticipants.value.delete(props.session.id)
    } else {
        expandedParticipants.value.add(props.session.id)
    }
}

const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
}
</script>

<style scoped>
.participants-section {
    margin-bottom: 1rem;
}

.participant-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: 0.5rem;
    transition: background-color 0.2s ease;
}

.participant-item:hover {
    background-color: #f9fafb;
}

.participant-avatar {
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

.participant-info {
    flex: 1;
    min-width: 0;
}

.participant-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.participant-details {
    font-size: 0.75rem;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (max-width: 768px) {
    .participant-item {
        padding: 0.25rem;
    }
}
</style>
