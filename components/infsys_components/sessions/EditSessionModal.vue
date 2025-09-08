<template>
    <UDrawer v-model:open="isOpen" direction="right">
        <template #content>
            <UCard class="p-4 min-w-96">
                <template #header>
                    <h3 class="text-lg font-semibold">{{ t('edit_session') }}</h3>
                </template>

                <UForm :state="editSession" @submit="handleEditSession(editSession)" class="flex flex-col space-y-4">
                    <div class="highlightable" id="sessions-edit-from_date"
                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-edit-from_date', $event)">
                        <label for="from_date" class="block text-sm font-medium text-white mb-1">{{ t('from_date')
                            }}</label>
                        <UInput color="sky" id="from_date" v-model="editSession.from_date" type="date"
                            :disabled="highlightStore.isHighlightMode" />
                    </div>
                    <div class="highlightable" id="sessions-edit-to_date"
                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-edit-to_date', $event)">
                        <label for="to_date" class="block text-sm font-medium text-white mb-1">{{ t('to_date')
                            }}</label>
                        <UInput color="sky" id="to_date" v-model="editSession.to_date" type="date"
                            :disabled="highlightStore.isHighlightMode" />
                    </div>
                    <div class="highlightable" id="sessions-edit-capacity"
                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-edit-capacity', $event)">
                        <label for="capacity" class="block text-sm font-medium text-white mb-1">{{ t('capacity')
                            }}</label>
                        <UInput color="sky" id="capacity" v-model="editSession.capacity" type="number" min="1"
                            placeholder="50" :disabled="highlightStore.isHighlightMode" />
                    </div>
                    <div class="flex flex-col gap-3 pt-4">
                        <UButton type="submit" color="sky" :loading="isSubmitting">
                            {{ t('update') }}
                        </UButton>
                        <UButton variant="outline" color="sky" @click="closeModal">
                            {{ t('cancel') }}
                        </UButton>
                    </div>
                </UForm>
            </UCard>
        </template>
    </UDrawer>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSelectedSystemStore, useToast } from '#imports'
import { useHighlightStore } from '#imports'
import { Session } from '~/model/Session'

const props = defineProps<{
    session: Session | null
    modelValue: boolean
}>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
}>()

const { t } = useI18n()
const selectedSystemStore = useSelectedSystemStore()
const toast = useToast()
const highlightStore = useHighlightStore()
const isSubmitting = ref(false)

// Edit session form
const editSession = ref({
    from_date: '',
    to_date: '',
    capacity: null as number | null
})

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

// Watch for session changes to load session data
watch(() => props.session, (newSession) => {
    if (newSession) {
        editSession.value = {
            from_date: newSession.fromDate.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD
            to_date: newSession.toDate.toISOString().split('T')[0],
            capacity: newSession.capacity
        }
    }
}, { immediate: true })

// Watch for modal open to reset if no session
watch(() => props.modelValue, (open) => {
    if (!open) {
        editSession.value = {
            from_date: '',
            to_date: '',
            capacity: null
        }
    }
})

const closeModal = () => {
    isOpen.value = false
}

const handleEditSession = async (data: any) => {
    if (!selectedSystemStore.selectedSystem?.db) {
        console.error('Database not available')
        return
    }

    isSubmitting.value = true
    try {
        const query = `
            UPDATE ${selectedSystemStore.selectedSystem.db.getTableName('sessions')}
            SET from_date = '${data.from_date}', to_date = '${data.to_date}', capacity = ${data.capacity}
            WHERE session_id = ${props.session?.id}
        `
        const result = selectedSystemStore.selectedSystem.db.query(query)

        if (result.success) {
            selectedSystemStore.loadSessions()
            toast.add({
                title: t('session_updated_success'),
                color: 'primary',
                icon: 'i-heroicons-check'
            })
            closeModal()
        } else {
            throw new Error('Database update failed')
        }
    } catch (error) {
        console.error('Error updating session:', error)
        toast.add({
            title: t('error_updating_session'),
            color: 'red',
            icon: 'i-heroicons-exclamation-triangle'
        })
    } finally {
        isSubmitting.value = false
    }
}
</script>
