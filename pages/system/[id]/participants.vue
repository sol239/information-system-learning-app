<template>
    <div>
        <LocalNavbar :items="localItems" />

        <div class="container mx-auto px-4 py-8">
            <div class="flex items-center gap-4 mb-6">

                <!-- Session Select Menu-->
                <USelectMenu class="highlightable" :id="'participants-session-menu'"
                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-session-menu', $event)"
                    v-model="value" :items="filterSessionsItems" />

                <!-- Session Capacity Pillow -->
                <div v-if="selectedSessionInfo" class="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <UIcon name="i-heroicons-users" class="w-4 h-4 text-gray-600" />

                    <!-- Session Capacity Count -->
                    <span class="text-sm font-medium text-gray-700 highlightable" :id="'participants-capacity-count'"
                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-capacity-count', $event)">
                        {{ t('capacity') }}: {{ selectedSessionInfo.currentCount }}/{{ selectedSessionInfo.totalCapacity
                        }}
                    </span>

                    <!-- Session Capacity Percentage -->
                    <UBadge class="highlightable" :id="'participants-capacity-percentage'"
                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-capacity-percentage', $event)"
                        :color="getCapacityBadgeColor(selectedSessionInfo.fillPercentage)" variant="soft" size="sm">
                        {{ Math.round(selectedSessionInfo.fillPercentage) }}%
                    </UBadge>
                </div>
                <div class="ml-auto">
                    <!-- Add Participant Drawer -->
                    <UDrawer v-model:open="addModalOpen" direction="right">
                        <UButton color="sky" variant="outline" @click="createNewParticipant" icon="i-heroicons-plus">
                            {{ t('add_participant') }}
                        </UButton>

                        <template #content>
                            <UCard class="p-4 min-w-96">
                                <template #header>
                                    <h3 class="text-lg font-semibold">{{ t('add_participant') }}</h3>
                                </template>

                                <UForm :state="newParticipant" @submit="handleAddParticipant(newParticipant)"
                                    class="flex flex-col space-y-4">
                                    <div>
                                        <label for="name"
                                            class="block text-sm font-medium text-white mb-1">Jméno</label>
                                        <UInput color="sky" id="name" v-model="newParticipant.name"
                                            placeholder="Zadejte jméno účastníka" />
                                    </div>
                                    <div>
                                        <label for="email"
                                            class="block text-sm font-medium text-white mb-1">E-mail</label>
                                        <UInput color="sky" id="email" v-model="newParticipant.email" type="email"
                                            placeholder="email@example.com" />
                                    </div>
                                    <div>
                                        <label for="personal_number"
                                            class="block text-sm font-medium text-white mb-1">Rodné číslo</label>
                                        <UInput color="sky" id="personal_number"
                                            v-model="newParticipant.personal_number" placeholder="123456/7890" />
                                    </div>
                                    <div>
                                        <label for="phone"
                                            class="block text-sm font-medium text-white mb-1">Telefon</label>
                                        <UInput color="sky" id="phone" v-model="newParticipant.phone"
                                            placeholder="+420 123 456 789" />
                                    </div>
                                    <div>
                                        <label for="address"
                                            class="block text-sm font-medium text-white mb-1">Adresa</label>
                                        <UTextarea color="sky" id="address" v-model="newParticipant.address"
                                            placeholder="Ulice číslo, město, PSČ" :rows="2" />
                                    </div>
                                    <div>
                                        <label for="age" class="block text-sm font-medium text-white mb-1">Věk</label>
                                        <UInput color="sky" id="age" v-model="newParticipant.age" type="number" min="1"
                                            max="100" placeholder="18" />
                                    </div>
                                    <div>
                                        <label for="sessionId"
                                            class="block text-sm font-medium text-white mb-1">Turnus</label>
                                        <USelectMenu color="sky" id="sessionId" v-model="newParticipant.sessionId"
                                            :items="sessionOptions" placeholder="Vyberte turnus" />
                                    </div>
                                    <div>
                                        <label for="allergens"
                                            class="block text-sm font-medium text-white mb-1">Alergeny</label>
                                        <USelectMenu color="sky" id="allergens" v-model="newParticipant.allergens"
                                            :items="allergenOptions" :multiple="true" placeholder="Vyberte alergeny" />
                                        <small class="text-xs text-gray-400">Můžete vybrat více možností</small>
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

                </div>
            </div>

            <!-- Participants Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="participant in paginatedParticipants" :key="participant.id" class="participant-card highlightable" :id="'participants-card-' + participant.id"
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
                        <span class="text-sm text-gray-600">
                            {{ getSessionName(participant.sessionId) }}
                        </span>
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
                    </div>

                    <!-- Participant Actions -->

                    <div class="participant-actions mt-6 pt-4 border-t border-gray-200">
                        <div class="flex gap-2">
                            <!-- Edit Participant Button only -->
                            <div class="ml-auto">
                                <UButton size="sm" color="sky" variant="solid"
                                    @click="viewParticipantDetails(participant)" class="flex-1">
                                    {{ t('view_details') }}
                                </UButton>
                            </div>
                            <UButton size="sm" color="red" variant="outline" @click="removeParticipant(participant)">
                                {{ t('delete') }}
                            </UButton>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Edit Participant Drawer outside v-for -->
            <UDrawer class="ml-auto" v-model:open="editModalOpen" direction="right">
                <template #content>
                    <UCard class="p-4 min-w-96">
                        <template #header>
                            <h3 class="text-lg font-semibold">{{ t('participant_details') }}</h3>
                        </template>

                        <UForm :state="selectedParticipant" @submit="handleEditParticipant(selectedParticipant)"
                            class="flex flex-col space-y-4">
                            <div>
                                <label for="edit-name" class="block text-sm font-medium text-white mb-1">Jméno</label>
                                <UInput color="sky" id="edit-name" v-model="selectedParticipant.name"
                                    placeholder="Zadejte jméno účastníka" />
                            </div>
                            <div>
                                <label for="edit-email" class="block text-sm font-medium text-white mb-1">E-mail</label>
                                <UInput color="sky" id="edit-email" v-model="selectedParticipant.email" type="email"
                                    placeholder="email@example.com" />
                            </div>
                            <div>
                                <label for="edit-personal_number"
                                    class="block text-sm font-medium text-white mb-1">Rodné
                                    číslo</label>
                                <UInput color="sky" id="edit-personal_number"
                                    v-model="selectedParticipant.personal_number" placeholder="123456/7890" />
                            </div>
                            <div>
                                <label for="edit-phone"
                                    class="block text-sm font-medium text-white mb-1">Telefon</label>
                                <UInput color="sky" id="edit-phone" v-model="selectedParticipant.phone"
                                    placeholder="+420 123 456 789" />
                            </div>
                            <div>
                                <label for="edit-address"
                                    class="block text-sm font-medium text-white mb-1">Adresa</label>
                                <UTextarea color="sky" id="edit-address" v-model="selectedParticipant.address"
                                    placeholder="Ulice číslo, město, PSČ" :rows="2" />
                            </div>
                            <div>
                                <label for="edit-age" class="block text-sm font-medium text-white mb-1">Věk</label>
                                <UInput color="sky" id="edit-age" v-model="selectedParticipant.age" type="number"
                                    min="1" max="100" placeholder="18" />
                            </div>
                            <div>
                                <label for="edit-sessionId"
                                    class="block text-sm font-medium text-white mb-1">Turnus</label>
                                <USelectMenu color="sky" id="edit-sessionId" v-model="selectedParticipant.sessionId"
                                    :items="sessionOptions" placeholder="Vyberte turnus" />
                            </div>
                            <div>
                                <label for="edit-allergens"
                                    class="block text-sm font-medium text-white mb-1">Alergeny</label>
                                <USelectMenu color="sky" id="edit-allergens" v-model="selectedParticipant.allergens"
                                    :items="allergenOptions" :multiple="true" placeholder="Vyberte alergeny" />
                                <small class="text-xs text-gray-400">Můžete vybrat více možností</small>
                            </div>
                            <div class="flex flex-col gap-3 pt-4">
                                <UButton type="submit" color="sky" :loading="isSubmitting">
                                    {{ t('save_changes') }}
                                </UButton>
                                <UButton variant="outline" color="sky" @click="resetForm">
                                    {{ t('cancel') }}
                                </UButton>
                            </div>
                        </UForm>
                    </UCard>
                </template>
            </UDrawer>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="flex justify-center items-center gap-4 mt-8">
                <UButton variant="outline" color="sky" icon="i-heroicons-chevron-left" :disabled="currentPage === 1"
                    @click="currentPage--">
                    {{ t('previous') }}
                </UButton>

                <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-600 highlightable" id="participants-page-count-1"
                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-page-count-1', $event)">
                        {{ t('page') }} {{ currentPage }} {{ t('of') }} {{ totalPages }}
                    </span>
                    <span class="text-xs text-gray-500 highlightable" id="participants-page-count-2"
                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-page-count-2', $event)"   >
                        ({{ filteredParticipants.length }} {{ t('participants') }})
                    </span>
                </div>

                <UButton variant="outline" color="sky" icon="i-heroicons-chevron-right"
                    :disabled="currentPage === totalPages" @click="currentPage++">
                    {{ t('next') }}
                </UButton>
            </div>

            <!-- Empty State -->
            <div v-if="filteredParticipants.length === 0" class="empty-state">
                <UIcon name="i-heroicons-user-x-mark" class="empty-icon" />
                <h3 class="empty-title">{{ t('no_participants') }}</h3>
                <p class="empty-description">{{ t('no_participants_description') }}</p>
                <UButton @click="createNewParticipant" class="mt-4">
                    {{ t('create_participant') }}
                </UButton>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSelectedSystemStore } from '#imports'
import { Participant } from '~/model/Participant'
import { Session } from '~/model/Session'
import { useHighlightStore } from '#imports'

const selectedSystemStore = useSelectedSystemStore()
const { t } = useI18n()
const highlightStore = useHighlightStore()
const localItems = ref([
    {
        label: t('dashboard'),
        icon: 'i-heroicons-chart-bar-20-solid',
        to: `/system/${selectedSystemStore.selectedId}/dashboard`,
        data_target: 'system-dashboard',
    },
    {
        label: t('sessions'),
        icon: 'i-heroicons-calendar-date-range',
        to: `/system/${selectedSystemStore.selectedId}/sessions`,
        data_target: 'system-sessions',
    },
    {
        label: t('participants'),
        to: `/system/${selectedSystemStore.selectedId}/participants`,
        data_target: 'system-participants',
    },
    {
        label: t('supervisors'),
        to: `/system/${selectedSystemStore.selectedId}/supervisors`,
        data_target: 'system-supervisors',
    },
    {
        label: t('database'),
        icon: 'i-heroicons-table-cells',
        to: `/system/${selectedSystemStore.selectedId}/database`,
        data_target: 'system-table',
    }
])
const value = ref({
    label: t('all_sessions'),
    value: 'all'
})
const participants = ref<Participant[]>([])
const sessions = ref<Session[]>([])
const showDetailModal = ref(false)
const selectedParticipant = ref<Participant | null>(null)
const selectedSession = ref('all')
const isSubmitting = ref(false)
const editModalOpen = ref(false);
const addModalOpen = ref(false);
useHighlightWatchers(highlightStore.highlightHandler, highlightStore);

// New participant form
const newParticipant = ref({
    name: '',
    email: '',
    personal_number: '',
    phone: '',
    address: '',
    age: null as number | null,
    sessionId: null as number | null,
    allergens: [] as string[]
})

const allergenOptions = [
    { label: 'Mléko', value: 'Mléko' },
    { label: 'Skořápkové plody', value: 'Skořápkové plody' },
    { label: 'Lepek', value: 'Lepek' },
    { label: 'Vejce', value: 'Vejce' },
    { label: 'Ryby', value: 'Ryby' },
    { label: 'Sója', value: 'Sója' },
    { label: 'Arašídy', value: 'Arašídy' },
    { label: 'Celer', value: 'Celer' },
    { label: 'Hořčice', value: 'Hořčice' },
    { label: 'Sezam', value: 'Sezam' },
    { label: 'Oxid siřičitý', value: 'Oxid siřičitý' },
    { label: 'Lupina', value: 'Lupina' },
    { label: 'Měkkýši', value: 'Měkkýši' }
]

const sessionOptions = computed(() =>
    sessions.value.map(session => ({
        label: `${t('session')} ${session.id} (${formatDateRange(session.fromDate, session.toDate)})`,
        value: session.id
    }))
)

const participantSchema = {
    type: 'object',
    properties: {
        name: { type: 'string', minLength: 1 },
        email: { type: 'string', format: 'email' },
        personal_number: { type: 'string', minLength: 1 },
        phone: { type: 'string', minLength: 1 },
        address: { type: 'string', minLength: 1 },
        age: { type: 'number', minimum: 1, maximum: 100 },
        sessionId: { type: 'number' }
    },
    required: ['name', 'email', 'personal_number', 'phone', 'address', 'age', 'sessionId']
}

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(6) // 3x3 grid
const totalPages = computed(() => Math.ceil(filteredParticipants.value.length / itemsPerPage.value))

const paginatedParticipants = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredParticipants.value.slice(start, end)
})

// Reset pagination when filter changes
watch(() => value.value.value, () => {
    currentPage.value = 1
})

const filterSessionsItems = computed(() => [
    {
        label: t('all_sessions'),
        value: 'all'
    },
    ...sessions.value.map(session => ({
        label: formatDateRange(session.fromDate, session.toDate),
        value: session.id
    }))
])

const filteredParticipants = computed(() => {
    if (value.value.value === 'all') {
        return participants.value
    }
    return participants.value.filter(p => p.sessionId === value.value.value)
})

const toast = useToast()

const selectedSessionInfo = computed(() => {
    if (value.value.value === 'all') {
        // Calculate total capacity for all sessions
        const totalCapacity = sessions.value.reduce((sum, session) => sum + session.capacity, 0)
        const currentCount = participants.value.length
        const fillPercentage = totalCapacity > 0 ? (currentCount / totalCapacity) * 100 : 0

        return {
            currentCount,
            totalCapacity,
            fillPercentage,
            isFull: currentCount >= totalCapacity,
            isNearFull: fillPercentage >= 80
        }
    }

    const session = sessions.value.find(s => s.id === value.value.value)
    if (!session) return null

    const currentCount = participants.value.filter(p => p.sessionId === session.id).length
    const fillPercentage = (currentCount / session.capacity) * 100

    return {
        currentCount,
        totalCapacity: session.capacity,
        fillPercentage,
        isFull: currentCount >= session.capacity,
        isNearFull: fillPercentage >= 80
    }
})

// Reactive database monitoring using computed hash
const participantsDataHash = computed(() => {
    if (!selectedSystemStore.selectedSystem?.db) return ''

    try {
        // Get participants count
        const participantsCountRes = selectedSystemStore.selectedSystem.db.query('SELECT COUNT(*) as count FROM účastníci')
        const participantsCount = participantsCountRes?.results?.[0]?.count || 0

        // Get sessions count  
        const sessionsCountRes = selectedSystemStore.selectedSystem.db.query('SELECT COUNT(*) as count FROM turnusy')
        const sessionsCount = sessionsCountRes?.results?.[0]?.count || 0

        // Get sample of recent data to detect content changes
        const participantsSample = selectedSystemStore.selectedSystem.db.query('SELECT id, jméno, email FROM účastníci ORDER BY id DESC LIMIT 3')
        const sampleData = JSON.stringify(participantsSample?.results || [])

        return `p${participantsCount}-s${sessionsCount}-${sampleData.length}-${Date.now()}`
    } catch (error) {
        return `error-${Date.now()}`
    }
})

watch(participantsDataHash, (newHash, oldHash) => {
    if (oldHash && newHash !== oldHash && !newHash.startsWith('error')) {
        console.log('Database changes detected via hash, reloading data...')
        loadParticipantsFromDatabase()
    }
})

// Load data from database
const loadParticipantsFromDatabase = () => {
    if (!selectedSystemStore.selectedSystem?.db) {
        console.error('Database not available')
        return
    }

    try {
        // Load participants
        const _participants = selectedSystemStore.selectedSystem.db.query('SELECT * FROM účastníci ORDER BY id').results || []
        const _participantsArray: Participant[] = []
        for (const p of _participants) {
            _participantsArray.push(
                Participant.fromDbRow(p)
            )
        }
        participants.value = _participantsArray

        // Load sessions for mapping
        const sessionsQuery = selectedSystemStore.selectedSystem.db.query('SELECT * FROM turnusy ORDER BY id')
        if (sessionsQuery.success) {
            sessions.value = sessionsQuery.results.map((row: any) => new Session(
                row.id,
                new Date(row.od),
                new Date(row.do),
                row.kapacita,
                []
            ))
        }
    } catch (error) {
        console.error('Error loading data from database:', error)
    }
}

// Watch for changes in the selected system
watch(() => selectedSystemStore.selectedSystem, (newSystem) => {
    if (newSystem) {
        loadParticipantsFromDatabase()
    }
}, { immediate: true })

// Force refresh function for manual updates
const refreshData = () => {
    loadParticipantsFromDatabase()
}

// Helper functions
const getSessionName = (sessionId: number): string => {
    const session = sessions.value.find(s => s.id === sessionId)
    if (!session) return t('unknown_session')
    return `${t('session')} ${session.id} (${formatDateRange(session.fromDate, session.toDate)})`
}

const formatDateRange = (fromDate: Date, toDate: Date): string => {
    const from = fromDate.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })
    const to = toDate.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric' })
    return `${from} - ${to}`
}

async function viewParticipantDetails(participant: Participant) {
    console.log("Participant: ", participant);
    selectedParticipant.value = participant
    editModalOpen.value = true
    console.log("FINISHED")
}

const manageParticipant = (participant: Participant) => {
    // Implementation for managing participant
    console.log('Managing participant:', participant.id)
}

const createNewParticipant = () => {
    if (!highlightStore.isHighlightMode) {
        resetForm()
        addModalOpen.value = true
    }
}

const handleAddParticipant = async (data: any) => {
    if (!selectedSystemStore.selectedSystem?.db) {
        console.error('Database not available')
        return
    }

    isSubmitting.value = true
    try {
        // Extract value from sessionId if it's an object
        const sessionIdValue = typeof data.sessionId === 'object' ? data.sessionId.value : data.sessionId

        // Ulož celý array objektů (label, value) do DB
        const alergenyArr = Array.isArray(data.allergens) ? data.allergens : [];
        const alergenyJson = JSON.stringify(alergenyArr);

        const query = `
            INSERT INTO účastníci (jméno, email, rodné_číslo, telefon, adresa, věk, turnus_id, alergeny)
            VALUES ('${data.name}', '${data.email}', '${data.personal_number}', '${data.phone}', '${data.address}', ${data.age}, ${sessionIdValue}, '${alergenyJson}')
        `

        const result = selectedSystemStore.selectedSystem.db.query(query)

        if (result.success) {
            toast.add({
                title: t('participant_added_success', { name: data.name }),
                color: 'primary',
                icon: 'i-heroicons-check'
            })
            resetForm()
            loadParticipantsFromDatabase()
        } else {
            throw new Error('Database insert failed')
        }
    } catch (error) {
        console.error('Error adding participant:', error)
        toast.add({
            title: t('participant_add_error'),
            color: 'red',
            icon: 'i-heroicons-exclamation-triangle'
        })
    } finally {
        isSubmitting.value = false
    }
}

const resetForm = () => {
    // Reset new participant form
    newParticipant.value = {
        name: '',
        email: '',
        personal_number: '',
        phone: '',
        address: '',
        age: null,
        sessionId: null,
        allergens: []
    }
    // Hide drawers
    addModalOpen.value = false
    editModalOpen.value = false
}

const handleEditParticipant = async (data: any) => {
    if (!selectedSystemStore.selectedSystem?.db || !selectedParticipant.value) {
        console.error('Database not available or no participant selected')
        return
    }

    isSubmitting.value = true
    try {
        // Extract value from sessionId if it's an object
        const sessionIdValue = typeof data.sessionId === 'object' ? data.sessionId.value : data.sessionId

        // Convert allergens array of objects to array of values
        const alergenyArr = Array.isArray(data.allergens)
            ? data.allergens.map((item: any) => item.value || item)
            : [];
        const alergenyJson = JSON.stringify(alergenyArr);

        console.log('Updating participant:', selectedParticipant.value.id)

        // Use SQL style with spaces around '=' and correct order
        const query = `
            UPDATE účastníci 
            SET jméno = '${data.name}', email = '${data.email}', rodné_číslo = '${data.personal_number}', 
                telefon = '${data.phone}', adresa = '${data.address}', věk = ${data.age}, alergeny = '${alergenyJson}', turnus_id = ${sessionIdValue}
            WHERE id = '${selectedParticipant.value.id}'
        `

        console.log("QUERY: ", query)

        const result = selectedSystemStore.selectedSystem.db.query(query)

        if (result.success) {
            toast.add({
                title: t('participant_updated_success', { name: data.name }),
                color: 'primary',
                icon: 'i-heroicons-check'
            })
            loadParticipantsFromDatabase()
            // Hide drawer after successful update
            editModalOpen.value = false
        } else {
            toast.add({
                title: t('participant_update_error'),
                color: 'red',
                icon: 'i-heroicons-exclamation-triangle'
            })
            editModalOpen.value = false
        }
    } catch (error) {
        console.log('Error updating participant:', error)
        toast.add({
            title: t('participant_update_error'),
            color: 'red',
            icon: 'i-heroicons-exclamation-triangle'
        })
        editModalOpen.value = false
    } finally {
        isSubmitting.value = false
    }
}

function closeModal() {
    editModalOpen.value = false;
    addModalOpen.value = false;
}

const closeParticipantDetails = () => {
    selectedParticipant.value = null
    showDetailModal.value = false
    editModalOpen.value = false
}

const removeParticipant = (participant: Participant) => {
    // Implementation for removing participant
    console.log('Removing participant:', participant.id)
    try {
        selectedSystemStore.selectedSystem?.db.query(`DELETE FROM účastníci WHERE id = ${participant.id}`)
        // Refresh the participants list after deletion
        loadParticipantsFromDatabase()
        toast.add({
            title: t('participant_deleted_success', { name: participant.name }),
            color: 'primary',
            icon: 'i-lucide-trash-2'
        })
    } catch {
        console.error('Error deleting participant:', participant.id)
        toast.add({
            title: t('participant_delete_error', { name: participant.name }),
            color: 'red',
            icon: 'i-lucide-alert-triangle'
        })

    }
}

const getCapacityBadgeColor = (percentage: number): 'red' | 'yellow' | 'green' => {
    if (percentage >= 90) return 'red'
    if (percentage >= 70) return 'yellow'
    return 'green'
}

onMounted(() => {
    loadParticipantsFromDatabase()
})
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

.empty-state {
    text-align: center;
    padding: 3rem 0;
}

.empty-icon {
    width: 4rem;
    height: 4rem;
    margin: 0 auto 1rem;
    color: #9ca3af;
}

.empty-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.5rem;
}

.empty-description {
    color: #4b5563;
    max-width: 28rem;
    margin: 0 auto;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .participant-card {
        padding: 1rem;
    }
}
</style>
