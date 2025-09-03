<template>
    <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600 highlightable" id="supervisors-page-count-1"
            @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-page-count-1', $event)">
            {{ t('page') }} {{ currentPage }} {{ t('of') }} {{ totalPages }}
        </span>
        <span class="text-xs text-gray-500 highlightable" id="supervisors-page-count-2"
            @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-page-count-2', $event)">
            ({{ totalItems }} {{ t('supervisors') }})
        </span>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useHighlightStore } from '#imports'

interface Props {
    currentPage: number
    totalPages: number
    totalItems: number
}

defineProps<Props>()

const { t } = useI18n()
const highlightStore = useHighlightStore()
</script>
