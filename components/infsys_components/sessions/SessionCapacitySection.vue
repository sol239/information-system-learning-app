<template>
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
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useHighlightStore } from '#imports'

interface Props {
    session: any
    getCapacityPercentage: (session: any) => number
    getCapacityColor: (session: any) => string
}

const props = defineProps<Props>()
const { t } = useI18n()
const highlightStore = useHighlightStore()
</script>

<style scoped>
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
</style>
