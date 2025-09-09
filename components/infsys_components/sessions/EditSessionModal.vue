<template>
    <!-- Custom Drawer Implementation -->
    <div v-if="isOpen" class="custom-drawer-overlay" @click="closeModal" style="z-index: 5000;">
        <div class="custom-drawer" :class="{ 'open': isOpen }" @click.stop>
            <div class="drawer-content">
                <UCard class="p-4 min-w-96">
                    <template #header>
                        <h3 class="text-lg font-semibold">{{ t('edit_session') }}</h3>
                    </template>

                    <UForm :state="editSession" @submit="handleEditSession(editSession)" class="flex flex-col space-y-4">
                        <div class="highlightable" id="sessions-edit-from_date"
                            @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-edit-from_date', $event)">
                            <div class="component-wrapper">
                                <label for="from_date" class="block text-sm font-medium text-white mb-1">{{ t('from_date')
                                    }}</label>
                                <input
                                    :class="['form-input', { 'border-red-500': !editSessionFromDateComputed, 'border-sky-500': editSessionFromDateComputed }]"
                                    id="from_date" v-model="editSession.from_date" type="date"
                                    :disabled="highlightStore.isHighlightMode" />
                                <div v-if="editSessionFromDateError" class="text-red-500 text-sm mt-1 font-bold">
                                    {{ editSessionFromDateError }}
                                </div>

                            </div>
                        </div>
                        <div class="highlightable" id="sessions-edit-to_date"
                            @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-edit-to_date', $event)">
                            <div class="component-wrapper">
                                <label for="to_date" class="block text-sm font-medium text-white mb-1">{{ t('to_date')
                                    }}</label>
                                <input
                                    :class="['form-input', { 
                                        'border-red-500': !editSessionToDateComputed || !editSessionDateRangeComputed, 
                                        'border-sky-500': editSessionToDateComputed && editSessionDateRangeComputed 
                                    }]"
                                    id="to_date" v-model="editSession.to_date" type="date"
                                    :disabled="highlightStore.isHighlightMode" />
                                <div v-if="editSessionToDateError" class="text-red-500 text-sm mt-1 font-bold">
                                    {{ editSessionToDateError }}
                                </div>
                                <div v-if="highlightStore.isEditModeActive">
                                    <EditComponentModalOpenButton 
                                        :componentId="'validation-date-range'" 
                                        class="edit-button" 
                                        @click.stop />
                                </div>
                            </div>
                        </div>
                        <div class="highlightable" id="sessions-edit-capacity"
                            @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-edit-capacity', $event)">
                            <div class="component-wrapper">
                                <label for="capacity" class="block text-sm font-medium text-white mb-1">{{ t('capacity')
                                    }}</label>
                                <input
                                    :class="['form-input', { 'border-red-500': !editSessionCapacityComputed, 'border-sky-500': editSessionCapacityComputed }]"
                                    id="capacity" v-model="editSession.capacity" type="number" min="1"
                                    placeholder="50" :disabled="highlightStore.isHighlightMode" />
                                <div v-if="editSessionCapacityError" class="text-red-500 text-sm mt-1 font-bold">
                                    {{ editSessionCapacityError }}
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col gap-3 pt-4">
                            <UButton type="submit" color="sky" :loading="isSubmitting" :disabled="hasValidationErrors">
                                {{ t('update') }}
                            </UButton>
                            <UButton variant="outline" color="sky" @click="closeModal">
                                {{ t('cancel') }}
                            </UButton>
                        </div>
                    </UForm>
                </UCard>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSelectedSystemStore, useToast } from '#imports'
import { useHighlightStore } from '#imports'
import EditComponentModalOpenButton from '~/components/EditComponentModalOpenButton.vue'
import { useComponentCodeStore } from '~/stores/useComponentCodeStore'
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
const componentCodeStore = useComponentCodeStore()
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

// Validation functions for date comparison
const isValidDateRange = (fromDate: string, toDate: string): boolean => {
    if (!fromDate || !toDate) return true
    const from = new Date(fromDate)
    const to = new Date(toDate)
    return to >= from
}

// Get validation components
const validationDateRangeComponent = computed(() => componentCodeStore.getComponentById('validation-date-range') || componentCodeStore.getDefaultComponent('validation-date-range'))

// Component-based validation function using loaded JS
const isValidDateRangeFromComponent = (fromDate: string, toDate: string): boolean => {
    // First try to use component-based validation
    try {
        const jsCode = validationDateRangeComponent.value?.js?.['isValidDateRange'] || ''
        if (jsCode) {
            const func = new Function(`${jsCode}; return isValidDateRange;`)
            const validatorFn = func()
            return validatorFn(fromDate, toDate)
        }
    } catch (error) {
        console.error('Error loading isValidDateRange function:', error)
    }

    // Fallback to built-in validation
    return isValidDateRange(fromDate, toDate)
}

// Computed properties for validated fields
const editSessionFromDateComputed = computed(() => {
    const value = editSession.value.from_date
    return value && value.trim().length > 0
})

const editSessionToDateComputed = computed(() => {
    const value = editSession.value.to_date
    return value && value.trim().length > 0
})

const editSessionDateRangeComputed = computed(() => {
    const fromDate = editSession.value.from_date
    const toDate = editSession.value.to_date
    return isValidDateRangeFromComponent(fromDate, toDate)
})

// Error message computed properties for edit session form
const editSessionFromDateError = computed(() => {
    const value = editSession.value.from_date
    if (!value) {
        return 'Datum začátku je povinné'
    }
    return ''
})

const editSessionToDateError = computed(() => {
    const value = editSession.value.to_date
    if (!value) {
        return 'Datum konce je povinné'
    } else if (!isValidDateRangeFromComponent(editSession.value.from_date, value)) {
        return 'Datum konce musí být stejné nebo pozdější než datum začátku'
    }
    return ''
})

const editSessionCapacityComputed = computed(() => {
    const value = editSession.value.capacity
    return value && value > 0
})

const editSessionCapacityError = computed(() => {
    const value = editSession.value.capacity
    if (!value || value <= 0) {
        return 'Kapacita musí být větší než 0'
    }
    return ''
})

// Computed property to check if there are any validation errors
const hasValidationErrors = computed(() => {
    return !!(
        editSessionFromDateError.value ||
        editSessionToDateError.value ||
        editSessionCapacityError.value
    )
})

const closeModal = () => {
    isOpen.value = false
}

const handleEditSession = async (data: any) => {
    // Check for validation errors before submitting
    if (editSessionFromDateError.value || editSessionToDateError.value || editSessionCapacityError.value) {
        toast.add({
            title: 'Opravte chyby ve formuláři',
            color: 'red',
            icon: 'i-heroicons-exclamation-triangle'
        })
        return
    }

    if (!selectedSystemStore.selectedSystem?.db) {
        console.error('Database not available')
        return
    }

    isSubmitting.value = true
    selectedSystemStore.incrementDbNumber()
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

<style scoped>
/* Form styles */
.form-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    background-color: #ffffff;
    color: #111827;
    font-size: 0.875rem;
    line-height: 1.25rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
    background-color: #f9fafb;
    color: #6b7280;
    cursor: not-allowed;
}

/* Validation colors */
.border-red-500 {
    border-color: #ef4444 !important;
    border-width: 3px !important;
}

.border-sky-500 {
    border-color: #0ea5e9 !important;
    border-width: 3px !important;
}

.component-wrapper {
    position: relative;
    display: inline-block;
    width: 100%;
}

.edit-button {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    z-index: 10;
}

/* Custom Drawer Styles */
.custom-drawer-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 5000;
    display: flex;
    align-items: stretch;
    justify-content: flex-end;
    transition: opacity 0.3s ease;
}

.custom-drawer {
    width: 400px;
    max-width: 90vw;
    background: #1e293b;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    overflow-y: auto;
    border-left: 1px solid #334155;
    z-index: 5001;
}

.custom-drawer.open {
    transform: translateX(0);
}

.drawer-content {
    padding: 1rem;
    height: 100%;
}
</style>
