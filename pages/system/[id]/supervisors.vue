<template>
    <div>
        <LocalNavbar :items="localItems" />
        <div class="container mx-auto px-4 py-8">
            <div class="flex items-center gap-4 mb-6">
                <USelect color="violet" class="highlightable" :id="'supervisors-session-menu'"
                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-session-menu', $event)"
                    v-model="value" :items="filterSessionsItems" />

                <!-- Filter Field and Reset Button (left) -->
                <div class="flex gap-2 items-center ml-auto">
                    <UButton variant="outline" color="violet" size="sm" @click="resetFilter" icon="i-lucide-rotate-ccw" />
                    <UInput v-model="filterText" color="violet" :placeholder="t('filter_supervisors')" size="sm" />
                </div>

                <!-- Add Supervisor Drawer -->
                <UDrawer v-model:open="addModalOpen" direction="right">
                    <UButton color="violet" variant="outline" @click="createNewSupervisor" icon="i-heroicons-plus">
                        {{ t('add_supervisor') }}
                    </UButton>
                    <template #content>
                        <UCard class="p-4 min-w-96">
                            <template #header>
                                <h3 class="text-lg font-semibold">{{ t('add_supervisor') }}</h3>
                            </template>
                            <UForm :state="newSupervisor" @submit="handleAddSupervisor(newSupervisor)"
                                class="flex flex-col space-y-4">
                                <div class="highlightable" id="supervisors-add-name"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-add-name', $event)">
                                    <label for="name"
                                        class="block text-sm font-medium text-white mb-1">Jméno</label>
                                    <UInput color="violet" id="name" v-model="newSupervisor.name"
                                        placeholder="Zadejte jméno vedoucího"
                                        :disabled="highlightStore.isHighlightMode" />
                                </div>
                                <div class="highlightable" id="supervisors-add-email"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-add-email', $event)">
                                    <label for="email"
                                        class="block text-sm font-medium text-white mb-1">E-mail</label>
                                    <UInput color="violet" id="email" v-model="newSupervisor.email" type="email"
                                        placeholder="email@example.com"
                                        :disabled="highlightStore.isHighlightMode" />
                                </div>
                                <div class="highlightable" id="supervisors-add-personal_number"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-add-personal_number', $event)">
                                    <label for="personal_number"
                                        class="block text-sm font-medium text-white mb-1">Rodné číslo</label>
                                    <UInput color="violet" id="personal_number"
                                        v-model="newSupervisor.personal_number" placeholder="123456/7890"
                                        :disabled="highlightStore.isHighlightMode" />
                                </div>
                                <div class="highlightable" id="supervisors-add-phone"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-add-phone', $event)">
                                    <label for="phone"
                                        class="block text-sm font-medium text-white mb-1">Telefon</label>
                                    <UInput color="violet" id="phone" v-model="newSupervisor.phone"
                                        placeholder="+420 123 456 789" :disabled="highlightStore.isHighlightMode" />
                                </div>
                                <div class="highlightable" id="supervisors-add-address"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-add-address', $event)">
                                    <label for="address"
                                        class="block text-sm font-medium text-white mb-1">Adresa</label>
                                    <UTextarea color="violet" id="address" v-model="newSupervisor.address"
                                        placeholder="Ulice číslo, město, PSČ" :rows="2"
                                        :disabled="highlightStore.isHighlightMode" />
                                </div>
                                <div class="highlightable" id="supervisors-add-age"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-add-age', $event)">
                                    <label for="age" class="block text-sm font-medium text-white mb-1">Věk</label>
                                    <UInput color="violet" id="age" v-model="newSupervisor.age" type="number"
                                        min="18" max="100" placeholder="18"
                                        :disabled="highlightStore.isHighlightMode" />
                                </div>
                                <div class="highlightable" id="supervisors-add-session"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-add-session', $event)">
                                    <label for="sessionId"
                                        class="block text-sm font-medium text-white mb-1">Turnus</label>
                                    <USelectMenu id="sessionId" color="violet" v-model="newSupervisor.sessionId"
                                        :items="sessionOptions" placeholder="Vyberte turnus"
                                        :disabled="highlightStore.isHighlightMode" />
                                </div>
                                <div class="flex flex-col gap-3 pt-4">
                                    <UButton type="submit" color="violet" :loading="isSubmitting">
                                        {{ t('add') }}
                                    </UButton>
                                    <UButton variant="outline" color="violet" @click="resetForm">
                                        {{ t('cancel') }}
                                    </UButton>
                                </div>
                            </UForm>
                        </UCard>
                    </template>
                </UDrawer>
            </div>

            <!-- Supervisors Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="supervisor in paginatedSupervisors" :key="supervisor.id"
                    class="supervisor-card highlightable" :id="'supervisors-card-' + supervisor.id"
                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-card-' + supervisor.id, $event)">
                    <!-- Supervisor Header -->
                    <div class="supervisor-header">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-semibold text-gray-900">
                                {{ supervisor.name }}
                            </h3>
                            <UBadge color="violet" size="lg" variant="soft">
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
                        <span class="text-sm text-gray-600">
                            {{ getSessionName(supervisor.sessionId) }}
                        </span>
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
                    </div>
                    <!-- Supervisor Actions -->
                    <div class="supervisor-actions mt-6 pt-4 border-t border-gray-200">
                        <div class="flex gap-2">
                            <div class="ml-auto">
                                <UButton size="sm" color="violet" variant="solid"
                                    @click="viewSupervisorDetails(supervisor)" class="flex-1">
                                    {{ t('view_details') }}
                                </UButton>
                            </div>
                            <UButton size="sm" color="red" variant="outline" @click="removeSupervisor(supervisor)">
                                {{ t('delete') }}
                            </UButton>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Edit Supervisor Drawer -->
            <UDrawer class="ml-auto" v-model:open="editModalOpen" direction="right">
                <template #content>
                    <UCard class="p-4 min-w-96">
                        <template #header>
                            <h3 class="text-lg font-semibold">{{ t('supervisor_details') }}</h3>
                        </template>
                        <UForm :state="selectedSupervisor" @submit="handleEditSupervisor(selectedSupervisor)"
                            class="flex flex-col space-y-4">
                            <div class="highlightable" id="supervisors-edit-name"
                                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-edit-name', $event)">
                                <label for="edit-name" class="block text-sm font-medium text-white mb-1">Jméno</label>
                                <UInput color="violet" id="edit-name" v-model="selectedSupervisor.name"
                                    placeholder="Zadejte jméno vedoucího" :disabled="highlightStore.isHighlightMode" />
                            </div>
                            <div class="highlightable" id="supervisors-edit-email"
                                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-edit-email', $event)">
                                <label for="edit-email" class="block text-sm font-medium text-white mb-1">E-mail</label>
                                <UInput color="violet" id="edit-email" v-model="selectedSupervisor.email" type="email"
                                    placeholder="email@example.com" :disabled="highlightStore.isHighlightMode" />
                            </div>
                            <div class="highlightable" id="supervisors-edit-personal_number"
                                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-edit-personal_number', $event)">
                                <label for="edit-personal_number"
                                    class="block text-sm font-medium text-white mb-1">Rodné číslo</label>
                                <UInput color="violet" id="edit-personal_number"
                                    v-model="selectedSupervisor.personal_number" placeholder="123456/7890"
                                    :disabled="highlightStore.isHighlightMode" />
                            </div>
                            <div class="highlightable" id="supervisors-edit-phone"
                                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-edit-phone', $event)">
                                <label for="edit-phone"
                                    class="block text-sm font-medium text-white mb-1">Telefon</label>
                                <UInput color="violet" id="edit-phone" v-model="selectedSupervisor.phone"
                                    placeholder="+420 123 456 789" :disabled="highlightStore.isHighlightMode" />
                            </div>
                            <div class="highlightable" id="supervisors-edit-address"
                                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-edit-address', $event)">
                                <label for="edit-address"
                                    class="block text-sm font-medium text-white mb-1">Adresa</label>
                                <UTextarea color="violet" id="edit-address" v-model="selectedSupervisor.address"
                                    placeholder="Ulice číslo, město, PSČ" :rows="2"
                                    :disabled="highlightStore.isHighlightMode" />
                            </div>
                            <div class="highlightable" id="supervisors-edit-age"
                                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-edit-age', $event)">
                                <label for="edit-age" class="block text-sm font-medium text-white mb-1">Věk</label>
                                <UInput color="violet" id="edit-age" v-model="selectedSupervisor.age" type="number"
                                    min="18" max="100" placeholder="18" :disabled="highlightStore.isHighlightMode" />
                            </div>
                            <div class="highlightable" id="supervisors-edit-session"
                                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-edit-session', $event)">
                                <label for="edit-sessionId"
                                    class="block text-sm font-medium text-white mb-1">Turnus</label>
                                <USelectMenu color="violet" id="edit-sessionId" v-model="selectedSupervisor.sessionId"
                                    :items="sessionOptions" placeholder="Vyberte turnus"
                                    :disabled="highlightStore.isHighlightMode" />
                            </div>
                            <div class="flex flex-col gap-3 pt-4">
                                <UButton type="submit" color="violet" :loading="isSubmitting">
                                    {{ t('save_changes') }}
                                </UButton>
                                <UButton variant="outline" color="violet" @click="resetForm">
                                    {{ t('cancel') }}
                                </UButton>
                            </div>
                        </UForm>
                    </UCard>
                </template>
            </UDrawer>



            <!-- TODO: Empty State -->
            <div v-if="filteredSupervisors.length === 0" class="empty-state">
                <UIcon name="i-heroicons-user-x-mark" class="empty-icon" />
                <h3 class="empty-title">{{ t('no_supervisors') }}</h3>
                <p class="empty-description">{{ t('no_supervisors_description') }}</p>
                <UButton @click="createNewSupervisor" class="mt-4">
                    {{ t('create_supervisor') }}
                </UButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSelectedSystemStore } from '#imports'
import { Supervisor } from '~/model/Supervisor'
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
const value = ref('all')
const supervisors = ref<Supervisor[]>([])
const sessions = ref<Session[]>([])
const showDetailModal = ref(false)
const selectedSupervisor = ref<Supervisor | null>(null)
const isSubmitting = ref(false)
const editModalOpen = ref(false)
const addModalOpen = ref(false)
const filterText = ref('')
useHighlightWatchers(highlightStore.highlightHandler, highlightStore);

// New supervisor form
const newSupervisor = ref({
    name: '',
    email: '',
    personal_number: '',
    phone: '',
    address: '',
    age: null as number | null,
    sessionId: null as number | null
})

const sessionOptions = computed(() =>
    sessions.value.map(session => ({
        label: `${t('session')} ${session.id} (${formatDateRange(session.fromDate, session.toDate)})`,
        value: session.id
    }))
)

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(6)
const totalPages = computed(() => Math.ceil(filteredSupervisors.value.length / itemsPerPage.value))

const paginatedSupervisors = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredSupervisors.value.slice(start, end)
})

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

function resetFilter() {
    filterText.value = ''
}

const filteredSupervisors = computed(() => {
    if (!selectedSystemStore.selectedSystem?.db) return []

    const text = filterText.value?.trim()
    if (text) {
        const query = `
            SELECT * FROM vedoucí
            WHERE (
                id LIKE '%${text}%'
                OR jméno LIKE '%${text}%'
                OR email LIKE '%${text}%'
                OR rodné_číslo LIKE '%${text}%'
                OR telefon LIKE '%${text}%'
                OR adresa LIKE '%${text}%'
                OR věk LIKE '%${text}%'
                OR turnus_id LIKE '%${text}%'
            )
            ORDER BY id
        `
        const results = selectedSystemStore.selectedSystem.db.query(query).results || []
        return results.map((s: any) => new Supervisor(
            s.id,
            s.jméno,
            s.email,
            s.rodné_číslo,
            s.telefon,
            s.adresa,
            s.věk,
            s.turnus_id
        ))
    } else if (value.value !== 'all') {
        const query = `
            SELECT * FROM vedoucí
            WHERE turnus_id = '${value.value}'
            ORDER BY id
        `
        const results = selectedSystemStore.selectedSystem.db.query(query).results || []
        return results.map((s: any) => new Supervisor(
            s.id,
            s.jméno,
            s.email,
            s.rodné_číslo,
            s.telefon,
            s.adresa,
            s.věk,
            s.turnus_id
        ))
    } else {
        return supervisors.value
    }
})

const toast = useToast()

const selectedSessionInfo = computed(() => {
    return null
})

// Reactive database monitoring using computed hash
const supervisorsDataHash = computed(() => {
    if (!selectedSystemStore.selectedSystem?.db) return ''
    try {
        const supervisorsCountRes = selectedSystemStore.selectedSystem.db.query('SELECT COUNT(*) as count FROM vedoucí')
        const supervisorsCount = supervisorsCountRes?.results?.[0]?.count || 0
        const sessionsCountRes = selectedSystemStore.selectedSystem.db.query('SELECT COUNT(*) as count FROM turnusy')
        const sessionsCount = sessionsCountRes?.results?.[0]?.count || 0
        const supervisorsSample = selectedSystemStore.selectedSystem.db.query('SELECT id, jméno, email FROM vedoucí ORDER BY id DESC LIMIT 3')
        const sampleData = JSON.stringify(supervisorsSample?.results || [])
        return `v${supervisorsCount}-s${sessionsCount}-${sampleData.length}-${Date.now()}`
    } catch (error) {
        return `error-${Date.now()}`
    }
})

watch(supervisorsDataHash, (newHash, oldHash) => {
    if (oldHash && newHash !== oldHash && !newHash.startsWith('error')) {
        loadSupervisorsFromDatabase()
    }
})

// Load data from database
const loadSupervisorsFromDatabase = () => {
    if (!selectedSystemStore.selectedSystem?.db) {
        console.error('Database not available')
        return
    }
    try {
        const _supervisors = selectedSystemStore.selectedSystem.db.query('SELECT * FROM vedoucí ORDER BY id').results || []
        const _supervisorsArray: Supervisor[] = []
        for (const s of _supervisors) {
            _supervisorsArray.push(
                new Supervisor(
                    s.id,
                    s.jméno,
                    s.email,
                    s.rodné_číslo,
                    s.telefon,
                    s.adresa,
                    s.věk,
                    s.turnus_id
                )
            )
        }
        supervisors.value = _supervisorsArray
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

watch(() => selectedSystemStore.selectedSystem, (newSystem) => {
    if (newSystem) {
        loadSupervisorsFromDatabase()
    }
}, { immediate: true })

const refreshData = () => {
    loadSupervisorsFromDatabase()
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

async function viewSupervisorDetails(supervisor: Supervisor) {
    selectedSupervisor.value = { ...supervisor }
    editModalOpen.value = true
}

const createNewSupervisor = () => {
    if (!highlightStore.isHighlightMode) {
        resetForm()
        addModalOpen.value = true
    }
}

const handleAddSupervisor = async (data: any) => {
    if (!selectedSystemStore.selectedSystem?.db) {
        console.error('Database not available')
        return
    }
    isSubmitting.value = true
    try {
        const sessionIdValue = typeof data.sessionId === 'object' ? data.sessionId.value : data.sessionId
        const query = `
            INSERT INTO vedoucí (jméno, email, rodné_číslo, telefon, adresa, věk, turnus_id)
            VALUES ('${data.name}', '${data.email}', '${data.personal_number}', '${data.phone}', '${data.address}', ${data.age}, ${sessionIdValue})
        `
        const result = selectedSystemStore.selectedSystem.db.query(query)
        if (result.success) {
            toast.add({
                title: t('supervisor_added_success', { name: data.name }),
                color: 'primary',
                icon: 'i-heroicons-check'
            })
            resetForm()
            loadSupervisorsFromDatabase()
        } else {
            throw new Error('Database insert failed')
        }
    } catch (error) {
        console.error('Error adding supervisor:', error)
        toast.add({
            title: t('supervisor_added_error'),
            color: 'red',
            icon: 'i-heroicons-exclamation-triangle'
        })
    } finally {
        isSubmitting.value = false
    }
}

const resetForm = () => {
    newSupervisor.value = {
        name: '',
        email: '',
        personal_number: '',
        phone: '',
        address: '',
        age: null,
        sessionId: null
    }
    addModalOpen.value = false
    editModalOpen.value = false
}

const handleEditSupervisor = async (data: any) => {
    if (!selectedSystemStore.selectedSystem?.db || !selectedSupervisor.value) {
        console.error('Database not available or no supervisor selected')
        return
    }
    isSubmitting.value = true
    try {
        const sessionIdValue = typeof data.sessionId === 'object' ? data.sessionId.value : data.sessionId
        const query = `
            UPDATE vedoucí 
            SET jméno = '${data.name}', email = '${data.email}', rodné_číslo = '${data.personal_number}', 
                telefon = '${data.phone}', adresa = '${data.address}', věk = ${data.age}, turnus_id = ${sessionIdValue}
            WHERE id = '${selectedSupervisor.value.id}'
        `
        const result = selectedSystemStore.selectedSystem.db.query(query)
        if (result.success) {
            toast.add({
                title: t('supervisor_updated_success', { name: data.name }),
                color: 'primary',
                icon: 'i-heroicons-check'
            })
            loadSupervisorsFromDatabase()
            editModalOpen.value = false
        } else {
            toast.add({
                title: t('supervisor_updated_error'),
                color: 'red',
                icon: 'i-heroicons-exclamation-triangle'
            })
            editModalOpen.value = false
        }
    } catch (error) {
        toast.add({
            title: t('supervisor_updated_error'),
            color: 'red',
            icon: 'i-heroicons-exclamation-triangle'
        })
        editModalOpen.value = false
    } finally {
        isSubmitting.value = false
    }
}

const removeSupervisor = (supervisor: Supervisor) => {
    try {
        selectedSystemStore.selectedSystem?.db.query(`DELETE FROM vedoucí WHERE id = ${supervisor.id}`)
        loadSupervisorsFromDatabase()
        toast.add({
            title: t('supervisor_deleted_success', { name: supervisor.name }),
            color: 'primary',
            icon: 'i-lucide-trash-2'
        })
    } catch {
        toast.add({
            title: t('supervisor_delete_error', { name: supervisor.name }),
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
    loadSupervisorsFromDatabase()
})
</script>

<style scoped>
.supervisor-card {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    border: 4px solid #a684ff;
    padding: 1.5rem;
    transition: box-shadow 0.3s ease;
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

.emty-title {
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
    .supervisor-card {
        padding: 1rem;
    }
}
</style>