<template>
    <div class="participant-card highlightable" :id="'participants-card-' + participant.id"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-card-' + participant.id, $event)">
        <!-- Participant Header -->
        <div class="participant-header">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-semibold text-gray-900">
                    {{ participant.name }}
                </h3>
                <UBadge size="lg" color="sky" variant="soft">
                    {{ t('age') }}: {{ participant.age }}
                </UBadge>
            </div>
            <div class="flex items-center gap-2 text-base font-semibold text-gray-700">
                <UIcon name="i-heroicons-envelope" class="w-4 h-4" />
                <span>{{ participant.email }}</span>
            </div>
        </div>

        <!-- Turnus Info -->
        <div class="turnus-section mb-4">
            <div v-if="participant.sessions.length > 0" class="space-y-1">
                <div v-for="sessionId in participant.sessions" :key="sessionId"
                    class="text-sm text-gray-600">
                    <UIcon name="i-heroicons-calendar-days" class="w-4 h-4 inline mr-1" />
                    {{ getSessionName(sessionId) }}
                </div>
            </div>
            <div v-else class="text-sm text-gray-400 italic">
                <UIcon name="i-heroicons-calendar-x-mark" class="w-4 h-4 inline mr-1" />
                {{ t('no_sessions') }}
            </div>
        </div>

        <!-- Contact Info -->
        <div class="contact-section mb-6 space-y-2">
            <div class="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <UIcon name="i-heroicons-phone" class="w-4 h-4" />
                <span>{{ participant.phone }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
                <span>{{ participant.address }}</span>
            </div>
            <!-- Allergies Badge -->
            <UBadge size="sm" :color="participant.allergens.length > 0 ? 'red' : 'green'" variant="soft" class="mt-2">
                {{ t("allergens") }}: {{ participant.allergens.length }}
            </UBadge>
        </div>

        <!-- Participant Actions -->
        <div class="participant-actions mt-6 pt-4 border-t border-gray-200">
            <div class="flex gap-2">
                <!-- Edit Participant Button only -->
                <div class="ml-auto">
                    <UButton size="sm" color="sky" variant="solid"
                        @click="handleViewDetails" class="flex-1">
                        {{ t('view_details') }}
                    </UButton>
                </div>
                <UButton size="sm" color="red" variant="outline" @click="handleRemove">
                    {{ t('delete') }}
                </UButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useHighlightStore } from '#imports'

interface Props {
    participant: any
    getSessionName: (sessionId: number) => string
    onViewDetails: (participant: any) => void
    onRemove: (participant: any) => void
}

const props = defineProps<Props>()
const { t } = useI18n()
const highlightStore = useHighlightStore()

const handleViewDetails = () => {
    if (!highlightStore.isHighlightMode) {
        props.onViewDetails(props.participant)
    }
}

const handleRemove = () => {
    if (!highlightStore.isHighlightMode) {
        props.onRemove(props.participant)
    }
}
</script>

<style scoped>
.participant-card {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    border: 4px solid #00bcff;
    padding: 1.5rem;
}

.participant-header {
    border-bottom: 1px solid #f3f4f6;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
}

.turnus-section,
.contact-section {
    margin-bottom: 1.5rem;
}

.participant-actions {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
    .participant-card {
        padding: 1rem;
    }
}
</style>
