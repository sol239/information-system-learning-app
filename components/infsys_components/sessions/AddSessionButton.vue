<template>
    <UDrawer v-model:open="addModalOpen" direction="right">
        <div class="highlightable" :id="'sessions-add-button'">
            <UButton color="sky" variant="outline" @click="handleButtonClick($event)" icon="i-heroicons-plus"
                :id="'sessions-add-button'">
                {{ t('add_session') }}
            </UButton>
        </div>

        <template #content>
            <UCard class="p-4 min-w-96">
                <template #header>
                    <h3 class="text-lg font-semibold">{{ t('add_session') }}</h3>
                </template>

                <UForm :state="newSession" @submit="handleAddSession(newSession)" class="flex flex-col space-y-4">
                    <div class="highlightable" id="sessions-add-from_date"
                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-add-from_date', $event)">
                        <label for="from_date" class="block text-sm font-medium text-white mb-1">{{ t('from_date')
                            }}</label>
                        <UInput color="sky" id="from_date" v-model="newSession.from_date" type="date"
                            :disabled="highlightStore.isHighlightMode" />
                    </div>
                    <div class="highlightable" id="sessions-add-to_date"
                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-add-to_date', $event)">
                        <label for="to_date" class="block text-sm font-medium text-white mb-1">{{ t('to_date')
                            }}</label>
                        <UInput color="sky" id="to_date" v-model="newSession.to_date" type="date"
                            :disabled="highlightStore.isHighlightMode" />
                    </div>
                    <div class="highlightable" id="sessions-add-capacity"
                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-add-capacity', $event)">
                        <label for="capacity" class="block text-sm font-medium text-white mb-1">{{ t('capacity')
                            }}</label>
                        <UInput color="sky" id="capacity" v-model="newSession.capacity" type="number" min="1"
                            placeholder="50" :disabled="highlightStore.isHighlightMode" />
                    </div>
                    <div class="flex flex-col gap-3 pt-4">
                        <UButton type="submit" color="sky" :loading="isSubmitting">
                            {{ t('add') }}
                        </UButton>
                        <UButton variant="outline" color="sky" @click="resetForm">
                            {{ t('cancel') }}
                        </UButton>
                    </div>
                </UForm>
            </UCard>
        </template>
    </UDrawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSelectedSystemStore, useToast } from '#imports'
import { useHighlightStore } from '#imports'

const { t } = useI18n()
const selectedSystemStore = useSelectedSystemStore()
const toast = useToast()
const highlightStore = useHighlightStore()
const addModalOpen = ref(false)
const isSubmitting = ref(false)

// New session form
const newSession = ref({
    from_date: '',
    to_date: '',
    capacity: null as number | null
})

const createNewSession = () => {
    if (!highlightStore.isHighlightMode) {
        resetForm()
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

const resetForm = () => {
    newSession.value = {
        from_date: '',
        to_date: '',
        capacity: null
    }
    addModalOpen.value = false
}

const handleAddSession = async (data: any) => {
    if (!selectedSystemStore.selectedSystem?.db) {
        console.error('Database not available')
        return
    }

    isSubmitting.value = true
    try {
        const query = `
            INSERT INTO ${selectedSystemStore.selectedSystem.db.getTableName('sessions')} (from_date, to_date, capacity)
            VALUES ('${data.from_date}', '${data.to_date}', ${data.capacity})
        `
        const result = selectedSystemStore.selectedSystem.db.query(query)

        if (result.success) {
            toast.add({
                title: t('session_added_success'),
                color: 'primary',
                icon: 'i-heroicons-check'
            })
            resetForm()
            selectedSystemStore.loadSessions()
        } else {
            throw new Error('Database insert failed')
        }
    } catch (error) {
        console.error('Error adding session:', error)
        toast.add({
            title: t('error_adding_session'),
            color: 'red',
            icon: 'i-heroicons-exclamation-triangle'
        })
    } finally {
        isSubmitting.value = false
    }
}

// Expose modal state for parent component
defineExpose({
    addModalOpen
})
</script>
