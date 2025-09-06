<template>
  <UDrawer v-model:open="isOpen" direction="right" class="ml-auto">
    <template #content>
      <UCard class="p-4 min-w-96">
        <template #header>
          <h3 class="text-lg font-semibold">{{ t('edit_session') }}</h3>
        </template>

        <!-- Always show form for debugging -->
        <UForm
          :state="sessionData || { id: 0, fromDate: '', toDate: '', capacity: 0 }"
          @submit="handleEditSession"
          class="flex flex-col space-y-4"
        >
          <!-- Debug info -->
          <div class="text-xs text-gray-500 mb-2">
            Debug: Session ID: {{ sessionId }}, Has Data: {{ !!sessionData }}, From Date: {{ sessionData?.fromDate }}
          </div>
          :state="sessionData"
          @submit="handleEditSession"
          class="flex flex-col space-y-4"
        >
          <!-- Debug info -->
          <div class="text-xs text-gray-500 mb-2">
            Debug: Session ID: {{ sessionId }}, Has Data: {{ !!sessionData }}, From Date: {{ sessionData?.fromDate }}
          </div>

          <div class="highlightable" :id="'sessions-edit-from-date-' + sessionId"
               @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-edit-from-date-' + sessionId, $event)">
            <label for="from-date" class="block text-sm font-medium text-gray-700 mb-1">{{ t('from_date') }}</label>
            <UInput
              color="sky"
              id="from-date"
              v-model="(sessionData || { fromDate: '' }).fromDate"
              type="date"
              :disabled="highlightStore.isHighlightMode"
            />
          </div>

          <div class="highlightable" :id="'sessions-edit-to-date-' + sessionId"
               @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-edit-to-date-' + sessionId, $event)">
            <label for="to-date" class="block text-sm font-medium text-gray-700 mb-1">{{ t('to_date') }}</label>
            <UInput
              color="sky"
              id="to-date"
              v-model="(sessionData || { toDate: '' }).toDate"
              type="date"
              :disabled="highlightStore.isHighlightMode"
            />
          </div>

          <div class="highlightable" :id="'sessions-edit-capacity-' + sessionId"
               @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('sessions-edit-capacity-' + sessionId, $event)">
            <label for="capacity" class="block text-sm font-medium text-gray-700 mb-1">{{ t('capacity') }}</label>
            <UInput
              color="sky"
              id="capacity"
              v-model="(sessionData || { capacity: 0 }).capacity"
              type="number"
              min="1"
              :disabled="highlightStore.isHighlightMode"
            />
          </div>

          <div class="flex gap-2 pt-4">
            <UButton
              type="submit"
              color="primary"
              :loading="isSubmitting"
              :disabled="highlightStore.isHighlightMode"
              class="flex-1"
            >
              {{ t('save_changes') }}
            </UButton>
            <UButton
              variant="outline"
              color="neutral"
              @click="closeModal"
              :disabled="isSubmitting"
            >
              {{ t('cancel') }}
            </UButton>
          </div>
        </UForm>

        <!-- Loading message -->
        <div v-if="!sessionData" class="text-center py-4">
          <p class="text-gray-500">{{ t('loading_session_data') }}</p>
        </div>
      </UCard>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
/* 1. Imports */
import { ref, computed, watch, nextTick } from 'vue'
import { useSelectedSystemStore } from '#imports'
import { useHighlightStore } from '#imports'
import { useToast } from '#imports'
import { Session } from '~/model/Session'

/* 2. Context hooks */
const { t } = useI18n()
const selectedSystemStore = useSelectedSystemStore()
const highlightStore = useHighlightStore()
const toast = useToast()

/* 3. Props */
const props = defineProps<{
  sessionId: number
  modelValue?: boolean
}>()

/* 4. Emits */
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

/* 5. State */
const isOpen = computed({
  get: () => props.modelValue || false,
  set: (value) => emit('update:modelValue', value)
})

const sessionData = ref<{
  id: number
  fromDate: string
  toDate: string
  capacity: number
} | null>(null)
const isSubmitting = ref(false)

/* 6. Computed */
const session = computed(() => {
  const foundSession = selectedSystemStore.sessions.find(s => s.id === props.sessionId)
  console.log('Looking for session with ID:', props.sessionId, 'Found:', foundSession)
  return foundSession || null
})

/* 7. Watchers */
watch(() => isOpen.value, async (newValue) => {
  console.log('Modal open state changed:', newValue, 'Session ID:', props.sessionId)
  if (newValue) {
    console.log('Modal opened for session ID:', props.sessionId)
    console.log('Current sessions in store:', selectedSystemStore.sessions)
    
    // Ensure sessions are loaded
    selectedSystemStore.loadSessions()

    // Wait a bit for sessions to load
    await nextTick()

    const foundSession = selectedSystemStore.sessions.find(s => s.id === props.sessionId)
    console.log('Found session after loading:', foundSession)

    if (foundSession) {
      sessionData.value = {
        id: foundSession.id,
        fromDate: foundSession.fromDate.toISOString().split('T')[0],
        toDate: foundSession.toDate.toISOString().split('T')[0],
        capacity: foundSession.capacity
      }
      console.log('Session data set:', sessionData.value)
    } else {
      console.error('Session not found for ID:', props.sessionId)
      console.log('Available sessions:', selectedSystemStore.sessions.map(s => ({ id: s.id, fromDate: s.fromDate })))
      
      // Try creating empty form data to test if that's the issue
      sessionData.value = {
        id: props.sessionId,
        fromDate: '2024-01-01',
        toDate: '2024-01-07',
        capacity: 10
      }
      console.log('Created test session data:', sessionData.value)
    }
  } else {
    sessionData.value = null
  }
}, { immediate: true })

watch(() => props.sessionId, (newId) => {
  console.log('SessionId prop changed:', newId)
  if (newId && isOpen.value) {
    const foundSession = selectedSystemStore.sessions.find(s => s.id === newId)
    if (foundSession) {
      console.log('Session found for ID:', newId, foundSession)
      sessionData.value = {
        id: foundSession.id,
        fromDate: foundSession.fromDate.toISOString().split('T')[0],
        toDate: foundSession.toDate.toISOString().split('T')[0],
        capacity: foundSession.capacity
      }
    } else {
      console.error('Session not found for ID:', newId)
      // Create test data if session not found
      sessionData.value = {
        id: newId,
        fromDate: '2024-01-01',
        toDate: '2024-01-07',
        capacity: 10
      }
    }
  }
}, { immediate: true })

/* 8. Methods */
const closeModal = () => {
  isOpen.value = false
  sessionData.value = null
}

const handleEditSession = async (data: any) => {
  if (!selectedSystemStore.selectedSystem?.db || !sessionData.value) {
    console.error('Database not available or no session selected')
    return
  }

  isSubmitting.value = true
  try {
    // Format dates for SQL
    const fromDateStr = new Date(data.fromDate).toISOString().split('T')[0]
    const toDateStr = new Date(data.toDate).toISOString().split('T')[0]

    const query = `
      UPDATE ${selectedSystemStore.selectedSystem.db.getTableName('sessions')}
      SET from_date = '${fromDateStr}', to_date = '${toDateStr}', capacity = ${data.capacity}
      WHERE session_id = ${sessionData.value.id}
    `

    const result = selectedSystemStore.selectedSystem.db.query(query)

    if (result.success) {
      toast.add({
        title: t('session_updated_success'),
        color: 'primary',
        icon: 'i-heroicons-check'
      })

      // Reload sessions from database
      selectedSystemStore.loadSessions()
      closeModal()
    } else {
      toast.add({
        title: t('session_update_error'),
        color: 'red',
        icon: 'i-heroicons-exclamation-triangle'
      })
    }
  } catch (error) {
    console.error('Error updating session:', error)
    toast.add({
      title: t('session_update_error'),
      color: 'red',
      icon: 'i-heroicons-exclamation-triangle'
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>
