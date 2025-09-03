<template>
    <div class="supervisor-card highlightable" :id="'supervisors-card-' + supervisor.id"
        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-card-' + supervisor.id, $event)">
        <!-- Supervisor Header -->
        <div class="supervisor-header">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-semibold text-gray-900">
                    {{ supervisor.name }}
                </h3>
                <UBadge size="lg" color="violet" variant="soft">
                    {{ t('age') }}: {{ supervisor.age }}
                </UBadge>
            </div>
            <div class="flex items-center gap-2 text-base font-semibold text-gray-700">
                <UIcon name="i-heroicons-envelope" class="w-4 h-4" />
                <span>{{ supervisor.email }}</span>
            </div>
        </div>

        <!-- Turnus Info -->
        <div class="turnus-section mb-4">
            <div v-if="supervisor.sessions.length > 0" class="space-y-1">
                <div v-for="sessionId in supervisor.sessions" :key="sessionId"
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
                <span>{{ supervisor.phone }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
                <span>{{ supervisor.address }}</span>
            </div>
            <!-- Allergies Badge -->
            <UBadge size="sm" :color="supervisor.allergens.length > 0 ? 'red' : 'green'" variant="soft" class="mt-2">
                {{ t("allergens") }}: {{ supervisor.allergens.length }}
            </UBadge>
        </div>

        <!-- Supervisor Actions -->
        <div class="supervisor-actions mt-6 pt-4 border-t border-gray-200">
            <div class="flex gap-2">
                <!-- Edit Supervisor Button only -->
                <div class="ml-auto">
                    <UButton size="sm" color="violet" variant="solid"
                        @click="onViewDetails(supervisor)" class="flex-1">
                        {{ t('view_details') }}
                    </UButton>
                </div>
                <UButton size="sm" color="red" variant="outline" @click="onRemove(supervisor)">
                    {{ t('delete') }}
                </UButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useHighlightStore } from '#imports'
import type { Supervisor } from '~/model/Supervisor'

interface Props {
    supervisor: Supervisor
    getSessionName: (sessionId: number) => string
    onViewDetails: (supervisor: Supervisor) => void
    onRemove: (supervisor: Supervisor) => void
}

defineProps<Props>()

const { t } = useI18n()
const highlightStore = useHighlightStore()
</script>

<style scoped>
.supervisor-card {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    border: 4px solid #8b5cf6;
    padding: 1.5rem;
}

.supervisor-header {
    border-bottom: 1px solid #f3f4f6;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
}

.turnus-section,
.contact-section {
    margin-bottom: 1.5rem;
}

.supervisor-actions {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .supervisor-card {
        padding: 1rem;
    }
}
</style>
