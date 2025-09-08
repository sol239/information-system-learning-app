<template>
    <div class="highlightable" :id="'sessions-add-button'">
        <UButton color="sky" variant="outline" @click="handleButtonClick($event)" icon="i-heroicons-plus"
            :id="'sessions-add-button'">
            {{ t('add_session') }}
        </UButton>
    </div>

    <AddSessionModal v-model:addModalOpen="addModalOpen" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHighlightStore } from '#imports'
import AddSessionModal from './AddSessionModal.vue'

const { t } = useI18n()
const highlightStore = useHighlightStore()
const addModalOpen = ref(false)

const createNewSession = () => {
    if (!highlightStore.isHighlightMode) {
        addModalOpen.value = true
    }
}

const handleButtonClick = (event: Event) => {
    event.stopPropagation()
    if (highlightStore.isHighlightMode) {
        highlightStore.highlightHandler.selectElement('sessions-add-button', event)
    } else {
        createNewSession()
    }
}

// Expose modal state for parent component
defineExpose({
    addModalOpen
})
</script>
