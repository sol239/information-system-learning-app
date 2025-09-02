<template>
    <div>
        <LocalNavbar :items="localItems" />

        <div class="container mx-auto px-4 py-8">
            <div class="flex items-center gap-4 mb-6">

                <!-- Session Select Menu-->
                <USelect class="highlightable" :id="'supervisors-session-menu'"
                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-session-menu', $event)"
                    v-model="value" :items="filterSessionsItems" />

                <!-- Session Capacity Pillow -->
                <div v-if="selectedSessionInfo" class="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <UIcon name="i-heroicons-user-group" class="w-4 h-4 text-gray-600" />

                    <!-- Session Capacity Count -->
                    <span class="text-sm font-medium text-gray-700 highlightable" :id="'supervisors-capacity-count'"
                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-capacity-count', $event)">
                        {{ t('supervisors') }}: {{ selectedSessionInfo.currentCount }}
                    </span>
                </div>

                <!-- Pagination -->
                <div v-if="totalPages > 1" class="flex justify-center items-center gap-4">
                    <UButton variant="outline" color="violet" icon="i-heroicons-chevron-left" :disabled="currentPage === 1"
                        @click="currentPage--">
                        {{ t('previous') }}
                    </UButton>

                    <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-600 highlightable" id="supervisors-page-count-1"
                            @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-page-count-1', $event)">
                            {{ t('page') }} {{ currentPage }} {{ t('of') }} {{ totalPages }}
                        </span>
                        <span class="text-xs text-gray-500 highlightable" id="supervisors-page-count-2"
                            @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-page-count-2', $event)">
                            ({{ filteredSupervisors.length }} {{ t('supervisors') }})
                        </span>
                    </div>

                    <UButton variant="outline" color="violet" icon="i-heroicons-chevron-right"
                        :disabled="currentPage === totalPages" @click="currentPage++">
                        {{ t('next') }}
                    </UButton>
                </div>

                <div class="ml-auto flex gap-4 items-start">
                    <!-- Filter Field and Reset Button (left) -->
                    <div class="flex gap-2 items-center">
                        <UButton class="highlightable" id="supervisors-filter-reset" variant="outline" color="violet"
                            size="sm" @click="resetFilter" icon="i-lucide-rotate-ccw"
                            @click.stop="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-filter-reset', $event)">
                        </UButton>
                        <div class="highlightable" id="supervisors-filter-input"
                            @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-filter-input', $event)">
                            <UInput v-model="filterText" color="violet" :placeholder="t('filter_supervisors')"
                                size="sm" />
                        </div>
                    </div>
                    <!-- Add Supervisor Drawer (right) -->
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
                                        <UInput color="violet" id="age" v-model="newSupervisor.age" type="number" min="1"
                                            max="100" placeholder="25" :disabled="highlightStore.isHighlightMode" />
                                    </div>
                                    <div class="highlightable" id="supervisors-add-session"
                                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-add-session', $event)">
                                        <label for="sessionId"
                                            class="block text-sm font-medium text-white mb-1">Turnus</label>

                                        <USelect color="violet" id="sessionId" v-model="newSupervisor.sessionId"
                                            :items="sessionOptions" placeholder="Vyberte turnus" multiple
                                            :disabled="highlightStore.isHighlightMode" />
                                    </div>
                                    <div class="highlightable" id="supervisors-add-allergens"
                                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-add-allergens', $event)">
                                        <label for="allergens"
                                            class="block text-sm font-medium text-white mb-1">Alergeny</label>
                                        <USelect color="violet" id="allergens" v-model="newSupervisor.allergens"
                                            :items="allergenOptions" multiple placeholder="Vyberte alergeny"
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

            <!-- Edit Supervisor Drawer outside v-for -->
            <UDrawer class="ml-auto" v-model:open="editModalOpen" direction="right">
                <template #content>
                    <UCard class="p-4 min-w-96">
                        <template #header>
                            <h3 class="text-lg font-semibold">{{ t('supervisor_details') }}</h3>
                        </template>

                        <UForm v-if="selectedSupervisor" :state="selectedSupervisor"
                            @submit="handleEditSupervisor(selectedSupervisor)" class="flex flex-col space-y-4">
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
                                    class="block text-sm font-medium text-white mb-1">Rodné
                                    číslo</label>
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
                                    min="1" max="100" placeholder="25" :disabled="highlightStore.isHighlightMode" />
                            </div>
                            <!-- Allergen Edit Field -->
                            <div class="highlightable" id="supervisors-edit-allergens"
                                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-edit-allergens', $event)">
                                <label for="edit-allergens"
                                    class="block text-sm font-medium text-white mb-1">Alergeny</label>
                                <USelect color="violet" id="edit-allergens" v-model="selectedSupervisor.allergens"
                                    :items="allergenOptions" multiple placeholder="Vyberte alergeny"
                                    :disabled="highlightStore.isHighlightMode" />
                            </div>
                            <div class="highlightable" id="supervisors-edit-sessions"
                                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-edit-sessions', $event)">
                                <label for="edit-sessions"
                                    class="block text-sm font-medium text-white mb-1">Turnus</label>

                                <USelect color="violet" id="edit-sessions" v-model="selectedSupervisor.sessions"
                                    :items="sessionOptions" placeholder="Vyberte turnus" multiple
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

            <!-- Empty State -->
            <div v-if="filteredSupervisors.length === 0" class="empty-state">
                <UIcon name="i-heroicons-user-group" class="empty-icon" />
                <h3 class="empty-title">{{ t('no_supervisors') }}</h3>
                <p class="empty-description">{{ t('no_supervisors_description') }}</p>
                <UButton color="violet" @click="createNewSupervisor" class="mt-4">
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
const selectedSession = ref('all')
const isSubmitting = ref(false)
const editModalOpen = ref(false);
const addModalOpen = ref(false);
useHighlightWatchers(highlightStore.highlightHandler, highlightStore);

// New supervisor form
const newSupervisor = ref({
    name: '',
    email: '',
    personal_number: '',
    phone: '',
    address: '',
    age: null as number | null,
    sessionId: [] as number[],
    allergens: [] as number[]
})

const supervisorSchema = {
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
const totalPages = computed(() => Math.ceil(filteredSupervisors.value.length / itemsPerPage.value))

const paginatedSupervisors = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredSupervisors.value.slice(start, end)
})

// Reset pagination when filter changes
watch(() => value.value, () => {
    currentPage.value = 1
})

const filterForm = ref({
    name: '',
    email: '',
    phone: '',
    address: '',
    sessionId: null as number | null
})

const filterText = ref('')

function resetFilter() {
    filterText.value = ''
}

const allergenOptions = computed(() => {
    const query: string =  `SELECT allergen_id, name from ${selectedSystemStore.selectedSystem?.db?.getTableName('allergens')}`;
    const result = selectedSystemStore.selectedSystem?.db?.query(query)?.results || [];
    return result.map(allergen => ({
        label: allergen.name,
        value: allergen.allergen_id
    }))
})

const filteredSupervisors = computed(() => {
    let arr = supervisors.value

    if (filterText.value) {
        const text = filterText.value.toLowerCase()
        arr = arr.filter(s =>
            (s.name && s.name.toLowerCase().includes(text)) ||
            (s.email && s.email.toLowerCase().includes(text)) ||
            (s.phone && s.phone.toLowerCase().includes(text)) ||
            (s.address && s.address.toLowerCase().includes(text)) ||
            (s.sessions && getSessionNames(s.sessions).toLowerCase().includes(text))
        )
    } else if (value.value !== 'all') {
        arr = arr.filter(s => s.sessions.includes(Number(value.value)))
    }

    return arr
});

const toast = useToast()

const selectedSessionInfo = computed(() => {
    if (value.value === 'all') {
        const currentCount = supervisors.value.length
        return {
            currentCount,
            totalCapacity: 0,
            fillPercentage: 0
        }
    }

    const session = sessions.value.find(s => s.id === Number(value.value))
    if (!session) return null

    const currentCount = supervisors.value.filter(s => s.sessions.includes(session.id)).length

    return {
        currentCount,
        totalCapacity: 0,
        fillPercentage: 0
    }
})

// Reactive database monitoring using computed hash
const supervisorsDataHash = computed(() => {
    if (!selectedSystemStore.selectedSystem?.db) return ''

    try {
        const supervisorsTable = selectedSystemStore.selectedSystem.db.getTableName('supervisors')
        const sessionsTable = selectedSystemStore.selectedSystem.db.getTableName('sessions')
        const supervisorsCountRes = selectedSystemStore.selectedSystem.db.query(`SELECT COUNT(*) as count FROM ${supervisorsTable}`)
        const supervisorsCount = supervisorsCountRes?.results?.[0]?.count || 0

        const sessionsCountRes = selectedSystemStore.selectedSystem.db.query(`SELECT COUNT(*) as count FROM ${sessionsTable}`)
        const sessionsCount = sessionsCountRes?.results?.[0]?.count || 0

        const supervisorsSample = selectedSystemStore.selectedSystem.db.query(`SELECT supervisor_id, name, email FROM ${supervisorsTable} ORDER BY supervisor_id DESC LIMIT 3`)
        const sampleData = JSON.stringify(supervisorsSample?.results || [])

        return `s${supervisorsCount}-sess${sessionsCount}-${sampleData.length}-${Date.now()}`
    } catch (error) {
        return `error-${Date.now()}`
    }
})

watch(supervisorsDataHash, (newHash, oldHash) => {
    if (oldHash && newHash !== oldHash && !newHash.startsWith('error')) {
        console.log('Database changes detected via hash, reloading data...')
        try {
            loadSupervisorsFromDatabase()
        } catch (error) {
            console.error('Error reloading supervisors data:', error)
        }
    }
})

const loadSupervisorsFromDatabase = () => {
    if (!selectedSystemStore.selectedSystem?.db) {
        console.error('Database not available')
        return
    }

    try {
        const getSupervisorsQuery: string = `
            SELECT supervisor_id, name, email, personal_number, phone, address, age
            FROM ${selectedSystemStore.selectedSystem.db.getTableName('supervisors')}
            ORDER BY supervisor_id
        `;

        const supervisorsResult = selectedSystemStore.selectedSystem.db.query(getSupervisorsQuery);

        const supervisorsMap = new Map<number, Supervisor>();
        for (const row of supervisorsResult?.results || []) {
            const supervisor = new Supervisor(
                row.supervisor_id,
                row.name,
                row.email,
                row.personal_number,
                row.phone,
                row.address,
                row.age,
                [],
                []
            );
            supervisorsMap.set(supervisor.id, supervisor);
        }

        // get supervisor's allergens
        const getSupervisorAllergensQuery: string = `
            SELECT sa.supervisor_id, a.allergen_id
            FROM ${selectedSystemStore.selectedSystem.db.getTableName('supervisors_allergens')} sa
            JOIN ${selectedSystemStore.selectedSystem.db.getTableName('allergens')} a ON sa.allergen_id = a.allergen_id
        `;

        const allergensResult = selectedSystemStore.selectedSystem.db.query(getSupervisorAllergensQuery);
        const allergenLabelMap: Record<string, string> = {};
        const allergenOpts = allergenOptions.value;
        for (const opt of allergenOpts) {
            allergenLabelMap[opt.value] = opt.label;
        }

        for (const row of allergensResult?.results || []) {
            const supervisor = supervisorsMap.get(row.supervisor_id);
            if (supervisor) {
                if (allergenLabelMap[row.allergen_id]) {
                    supervisor.allergens.push(allergenLabelMap[row.allergen_id]);
                }
            }
        }

        // get supervisor's sessions
        const getSupervisorSessionsQuery: string = `
            SELECT ss.supervisor_id, s.session_id
            FROM ${selectedSystemStore.selectedSystem.db.getTableName('sessions_supervisors')} ss
            JOIN ${selectedSystemStore.selectedSystem.db.getTableName('sessions')} s ON ss.session_id = s.session_id
        `;

        const sessionsResult = selectedSystemStore.selectedSystem.db.query(getSupervisorSessionsQuery);
        for (const row of sessionsResult?.results || []) {
            const supervisor = supervisorsMap.get(row.supervisor_id);
            if (supervisor) {
                supervisor.sessions.push(row.session_id);
            }
        }

        supervisors.value = Array.from(supervisorsMap.values());

        console.log('Supervisors loaded:', supervisors.value)

    } catch (error) {
        console.error('Error loading data from database:', error)
    }
}

// Load sessions from database
const loadSessionsFromDatabase = () => {
    if (!selectedSystemStore.selectedSystem?.db) {
        console.error('Database not available')
        return
    }
    try {
        const sessionsTable = selectedSystemStore.selectedSystem.db.getTableName('sessions')
        const _sessions = selectedSystemStore.selectedSystem.db.query(`
            SELECT session_id, from_date, to_date, capacity
            FROM ${sessionsTable}
            ORDER BY session_id
        `).results || []
        sessions.value = _sessions.map(s => ({
            id: s.session_id,
            fromDate: new Date(s.from_date),
            toDate: new Date(s.to_date),
            capacity: s.capacity,
            participants: [],
            ifFull: function () { return this.participants.length >= this.capacity; }
        }))
    } catch (error) {
        console.error('Error loading sessions from database:', error)
    }
}

// Watch for changes in the selected system
watch(() => selectedSystemStore.selectedSystem, (newSystem) => {
    if (newSystem) {
        loadSessionsFromDatabase()
        loadSupervisorsFromDatabase()
    }
}, { immediate: true })

onMounted(() => {
    loadSessionsFromDatabase()
    loadSupervisorsFromDatabase()
})

// Session select menu items now use sessions loaded from DB
const filterSessionsItems = computed(() => [
    { label: t('all_sessions'), value: 'all' },
    ...sessions.value.map(session => ({
        label: formatDateRange(session.fromDate, session.toDate),
        value: session.id
    }))
])

const sessionOptions = computed(() =>
    sessions.value.map(session => ({
        label: `${t('session')} ${session.id} (${formatDateRange(session.fromDate, session.toDate)})`,
        value: session.id
    }))
)

// Helper functions
const getSessionName = (sessionId: number): string => {
    const session = sessions.value.find(s => s.id === sessionId)
    if (!session) return t('unknown_session')
    return `${t('session')} ${session.id} (${formatDateRange(session.fromDate, session.toDate)})`
}

const getSessionNames = (sessionIds: number[]): string => {
    if (!sessionIds || sessionIds.length === 0) return t('no_sessions')
    return sessionIds.map(id => getSessionName(id)).join(', ')
}

const formatDateRange = (fromDate: Date, toDate: Date): string => {
    const from = fromDate.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })
    const to = toDate.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric' })
    return `${from} - ${to}`
}

async function viewSupervisorDetails(supervisor: Supervisor) {
    console.log("Supervisor: ", supervisor);
    
    // Convert allergen labels back to IDs for the edit form
    const allergenLabelToIdMap: Record<string, number> = {};
    const allergenOpts = allergenOptions.value;
    for (const opt of allergenOpts) {
        allergenLabelToIdMap[opt.label] = opt.value;
    }
    
    const allergenIds = supervisor.allergens.map(label => allergenLabelToIdMap[label]).filter(id => id !== undefined);
    
    selectedSupervisor.value = new Supervisor(
        supervisor.id,
        supervisor.name,
        supervisor.email,
        supervisor.personal_number,
        supervisor.phone,
        supervisor.address,
        supervisor.age,
        [...supervisor.sessions],
        allergenIds
    )
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
        const query = `
            INSERT INTO ${selectedSystemStore.selectedSystem.db.getTableName('supervisors')} (name, email, personal_number, phone, address, age)
            VALUES ('${data.name}', '${data.email}', '${data.personal_number}', '${data.phone}', '${data.address}', ${data.age})
        `
        const result = selectedSystemStore.selectedSystem.db.query(query)

        if (result.success) {
            const supervisorId = selectedSystemStore.selectedSystem.db.query(`
                SELECT supervisor_id FROM ${selectedSystemStore.selectedSystem.db.getTableName('supervisors')} 
                WHERE name = '${data.name}' AND email = '${data.email}' 
                ORDER BY supervisor_id DESC LIMIT 1
            `).results[0]?.supervisor_id

            if (supervisorId) {
                if (data.sessionId && data.sessionId.length > 0) {
                    await addSupervisorToSessions(supervisorId, data.sessionId)
                }

                if (data.allergens && data.allergens.length > 0) {
                    await addSupervisorAllergens(supervisorId, data.allergens)
                }
            }

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
        sessionId: [],
        allergens: []
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
        const originalSupervisor = supervisors.value.find(s => s.id === selectedSupervisor.value?.id)
        const oldSessionIds = originalSupervisor?.sessions || []
        const oldAllergenIds = await getSupervisorAllergenIds(selectedSupervisor.value.id)

        const query = `
            UPDATE ${selectedSystemStore.selectedSystem.db.getTableName('supervisors')} 
            SET name = '${data.name}', email = '${data.email}', personal_number = '${data.personal_number}', 
                phone = '${data.phone}', address = '${data.address}', age = ${data.age}
            WHERE supervisor_id = '${selectedSupervisor.value.id}'
        `
        const result = selectedSystemStore.selectedSystem.db.query(query)

        if (result.success) {
            if (data.sessions && Array.isArray(data.sessions)) {
                await updateSupervisorSessions(selectedSupervisor.value.id, oldSessionIds, data.sessions)
            }

            if (data.allergens && Array.isArray(data.allergens)) {
                await updateSupervisorAllergens(selectedSupervisor.value.id, oldAllergenIds, data.allergens)
            }

            toast.add({
                title: t('supervisor_updated_success', { name: data.name }),
                color: 'primary',
                icon: 'i-heroicons-check'
            })
            loadSupervisorsFromDatabase()
            editModalOpen.value = false
            selectedSupervisor.value = null
        } else {
            toast.add({
                title: t('supervisor_update_error'),
                color: 'red',
                icon: 'i-heroicons-exclamation-triangle'
            })
            editModalOpen.value = false
            selectedSupervisor.value = null
        }
    } catch (error) {
        console.error('Error updating supervisor:', error)
        toast.add({
            title: t('supervisor_update_error'),
            color: 'red',
            icon: 'i-heroicons-exclamation-triangle'
        })
        editModalOpen.value = false
        selectedSupervisor.value = null
    } finally {
        isSubmitting.value = false
    }
}

const removeSupervisor = (supervisor: Supervisor) => {
    try {
        if (supervisor.sessions.length > 0) {
            removeSupervisorFromSessions(supervisor.id, supervisor.sessions)
        }

        const supervisorAllergenIds = getSupervisorAllergenIds(supervisor.id)
        supervisorAllergenIds.then(allergenIds => {
            if (allergenIds.length > 0) {
                removeSupervisorAllergens(supervisor.id, allergenIds)
            }
        })

        selectedSystemStore.selectedSystem?.db.query(`DELETE FROM ${selectedSystemStore.selectedSystem.db.getTableName('supervisors')} WHERE supervisor_id = ${supervisor.id}`)
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

// Session management helper functions
const addSupervisorToSessions = async (supervisorId: number, sessionIds: number[]): Promise<void> => {
    if (!selectedSystemStore.selectedSystem?.db) return

    const sessionsTable = selectedSystemStore.selectedSystem.db.getTableName('sessions_supervisors')

    for (const sessionId of sessionIds) {
        try {
            const query = `
                INSERT INTO ${sessionsTable} (session_id, supervisor_id)
                VALUES (${sessionId}, ${supervisorId})
            `
            selectedSystemStore.selectedSystem.db.query(query)
        } catch (error) {
            console.error(`Error adding supervisor ${supervisorId} to session ${sessionId}:`, error)
        }
    }
}

const removeSupervisorFromSessions = async (supervisorId: number, sessionIds: number[]): Promise<void> => {
    if (!selectedSystemStore.selectedSystem?.db) return

    const sessionsTable = selectedSystemStore.selectedSystem.db.getTableName('sessions_supervisors')

    for (const sessionId of sessionIds) {
        try {
            const query = `
                DELETE FROM ${sessionsTable} 
                WHERE session_id = ${sessionId} AND supervisor_id = ${supervisorId}
            `
            selectedSystemStore.selectedSystem.db.query(query)
        } catch (error) {
            console.error(`Error removing supervisor ${supervisorId} from session ${sessionId}:`, error)
        }
    }
}

const updateSupervisorSessions = async (supervisorId: number, oldSessionIds: number[], newSessionIds: number[]): Promise<void> => {
    const sessionsToAdd = newSessionIds.filter(id => !oldSessionIds.includes(id))
    const sessionsToRemove = oldSessionIds.filter(id => !newSessionIds.includes(id))

    if (sessionsToRemove.length > 0) {
        await removeSupervisorFromSessions(supervisorId, sessionsToRemove)
    }

    if (sessionsToAdd.length > 0) {
        await addSupervisorToSessions(supervisorId, sessionsToAdd)
    }
}

// Allergen management helper functions
const getSupervisorAllergenIds = async (supervisorId: number): Promise<number[]> => {
    if (!selectedSystemStore.selectedSystem?.db) return []

    const allergensTable = selectedSystemStore.selectedSystem.db.getTableName('supervisors_allergens')

    try {
        const query = `
            SELECT allergen_id 
            FROM ${allergensTable} 
            WHERE supervisor_id = ${supervisorId}
        `
        const result = selectedSystemStore.selectedSystem.db.query(query)
        return result.results?.map(row => row.allergen_id) || []
    } catch (error) {
        console.error(`Error getting allergen IDs for supervisor ${supervisorId}:`, error)
        return []
    }
}

const addSupervisorAllergens = async (supervisorId: number, allergenIds: number[]): Promise<void> => {
    if (!selectedSystemStore.selectedSystem?.db) return

    const allergensTable = selectedSystemStore.selectedSystem.db.getTableName('supervisors_allergens')

    for (const allergenId of allergenIds) {
        try {
            const query = `
                INSERT INTO ${allergensTable} (supervisor_id, allergen_id)
                VALUES (${supervisorId}, ${allergenId})
            `
            selectedSystemStore.selectedSystem.db.query(query)
        } catch (error) {
            console.error(`Error adding allergen ${allergenId} to supervisor ${supervisorId}:`, error)
        }
    }
}

const removeSupervisorAllergens = async (supervisorId: number, allergenIds: number[]): Promise<void> => {
    if (!selectedSystemStore.selectedSystem?.db) return

    const allergensTable = selectedSystemStore.selectedSystem.db.getTableName('supervisors_allergens')

    for (const allergenId of allergenIds) {
        try {
            const query = `
                DELETE FROM ${allergensTable} 
                WHERE supervisor_id = ${supervisorId} AND allergen_id = ${allergenId}
            `
            selectedSystemStore.selectedSystem.db.query(query)
        } catch (error) {
            console.error(`Error removing allergen ${allergenId} from supervisor ${supervisorId}:`, error)
        }
    }
}

const updateSupervisorAllergens = async (supervisorId: number, oldAllergenIds: number[], newAllergenIds: number[]): Promise<void> => {
    const allergensToAdd = newAllergenIds.filter(id => !oldAllergenIds.includes(id))
    const allergensToRemove = oldAllergenIds.filter(id => !newAllergenIds.includes(id))

    if (allergensToRemove.length > 0) {
        await removeSupervisorAllergens(supervisorId, allergensToRemove)
    }

    if (allergensToAdd.length > 0) {
        await addSupervisorAllergens(supervisorId, allergensToAdd)
    }
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
    .supervisor-card {
        padding: 1rem;
    }
}
</style>