<template>
    <div>
        <LocalNavbar />

        <div class="container mx-auto px-4 py-8">
            <div class="flex items-center gap-4 mb-6">

                <!-- Session Select Menu-->
                <USelect class="highlightable" :id="'participants-session-menu'"
                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-session-menu', $event)"
                    v-model="value" :items="filterSessionsItems" />

                <!-- Session Capacity Pillow -->
                <div v-if="selectedSessionInfo" class="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <UIcon name="i-heroicons-users" class="w-4 h-4 text-gray-600" />

                    <!-- Session Capacity Count -->
                    <span class="text-sm font-medium text-gray-700 highlightable" :id="'participants-capacity-count'"
                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-capacity-count', $event)">
                        {{ t('capacity') }}: {{ selectedSessionInfo.currentCount }}/{{
                            selectedSessionInfo.totalCapacity }}
                    </span>

                    <!-- Session Capacity Percentage -->
                    <div class="highlightable" :id="'participants-capacity-percentage'"
                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-capacity-percentage', $event)">
                        <span :style="{
                            color: darkenColor(getCapacityBadgeColor(selectedSessionInfo.fillPercentage), 0.3),
                            backgroundColor: lightenColor(getCapacityBadgeColor(selectedSessionInfo.fillPercentage), 0.8),
                            fontWeight: 'bold',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(0, 0, 0, 0.1)'
                        }">
                            {{ selectedSessionInfo.fillPercentage }}%
                        </span>
                    </div>


                </div>

                <!-- Pagination -->
                <div v-if="totalPages > 1" class="flex justify-center items-center gap-4">
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
                            @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-page-count-2', $event)">
                            ({{ filteredParticipants.length }} {{ t('participants') }})
                        </span>
                    </div>

                    <UButton variant="outline" color="sky" icon="i-heroicons-chevron-right"
                        :disabled="currentPage === totalPages" @click="currentPage++">
                        {{ t('next') }}
                    </UButton>
                </div>

                <div class="ml-auto flex gap-4 items-start">
                    <!-- Filter Field and Reset Button (left) -->
                    <div class="flex gap-2 items-center">
                        <UButton class="highlightable" id="participants-filter-reset" variant="outline" color="sky"
                            size="sm" @click="highlightStore.isHighlightMode ? highlightStore.highlightHandler.selectElement('participants-filter-reset', $event) : resetFilter()" icon="i-lucide-rotate-ccw">
                        </UButton>
                        <div class="highlightable" id="participants-filter-input"
                            @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-filter-input', $event)">
                            <UInput v-model="filterText" color="sky" :placeholder="t('filter_participants')"
                                size="sm" />
                        </div>

                    </div>
                    <!-- Add Participant Drawer (right) -->
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
                                    <div class="highlightable" id="participants-add-name"
                                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-name', $event)">
                                        <label for="name"
                                            class="block text-sm font-medium text-white mb-1">Jméno</label>
                                        <UInput color="sky" id="name" v-model="newParticipant.name"
                                            placeholder="Zadejte jméno účastníka"
                                            :disabled="highlightStore.isHighlightMode" />
                                    </div>
                                    <div class="highlightable" id="participants-add-email"
                                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-email', $event)">
                                        <label for="email"
                                            class="block text-sm font-medium text-white mb-1">E-mail</label>
                                        <UInput color="sky" id="email" v-model="newParticipant.email" type="email"
                                            placeholder="email@example.com"
                                            :disabled="highlightStore.isHighlightMode" />
                                    </div>
                                    <div class="highlightable" id="participants-add-personal_number"
                                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-personal_number', $event)">
                                        <label for="personal_number"
                                            class="block text-sm font-medium text-white mb-1">Rodné číslo</label>
                                        <UInput color="sky" id="personal_number"
                                            v-model="newParticipant.personal_number" placeholder="123456/7890"
                                            :disabled="highlightStore.isHighlightMode" />
                                    </div>
                                    <div class="highlightable" id="participants-add-phone"
                                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-phone', $event)">
                                        <label for="phone"
                                            class="block text-sm font-medium text-white mb-1">Telefon</label>
                                        <UInput color="sky" id="phone" v-model="newParticipant.phone"
                                            placeholder="+420 123 456 789" :disabled="highlightStore.isHighlightMode" />
                                    </div>
                                    <div class="highlightable" id="participants-add-address"
                                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-address', $event)">
                                        <label for="address"
                                            class="block text-sm font-medium text-white mb-1">Adresa</label>
                                        <UTextarea color="sky" id="address" v-model="newParticipant.address"
                                            placeholder="Ulice číslo, město, PSČ" :rows="2"
                                            :disabled="highlightStore.isHighlightMode" />
                                    </div>
                                    <div class="highlightable" id="participants-add-age"
                                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-age', $event)">
                                        <label for="age" class="block text-sm font-medium text-white mb-1">Věk</label>
                                        <UInput color="sky" id="age" v-model="newParticipant.age" type="number" min="1"
                                            max="100" placeholder="18" :disabled="highlightStore.isHighlightMode" />
                                    </div>
                                    <div class="highlightable" id="participants-add-session"
                                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-session', $event)">
                                        <label for="sessionId"
                                            class="block text-sm font-medium text-white mb-1">Turnus</label>

                                        <USelect color="sky" id="sessionId" v-model="newParticipant.sessionId"
                                            :items="sessionOptions" placeholder="Vyberte turnus" multiple
                                            :disabled="highlightStore.isHighlightMode" />
                                    </div>
                                    <div class="highlightable" id="participants-add-allergens"
                                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-allergens', $event)">
                                        <label for="allergens"
                                            class="block text-sm font-medium text-white mb-1">Alergeny</label>
                                        <USelect color="sky" id="allergens" v-model="newParticipant.allergens"
                                            :items="allergenOptions" multiple placeholder="Vyberte alergeny"
                                            :disabled="highlightStore.isHighlightMode" />
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
                <div v-for="participant in paginatedParticipants" :key="participant.id" class="participant-card">
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
                        <div v-if="participant.sessions.length > 0" class="space-y-1">
                            <div v-for="sessionId in participant.sessions" :key="sessionId"
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
                            <span>{{ participant.phone }}</span>
                        </div>
                        <div class="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
                            <span>{{ participant.address }}</span>
                        </div>
                        <!-- Allergies Badge -->
                        <div class="highlightable" :id="'participants-allergens-badge-' + participant.id"
                            @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-allergens-badge-' + participant.id, $event)">
                            <UBadge size="sm" :color="participant.allergens.length > 0 ? 'red' : 'green'" variant="soft"
                                class="mt-2">
                                {{ t("allergens") }}: {{ participant.allergens.length }}
                            </UBadge>
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
                            <div class="highlightable" :id="'participants-delete-button-' + participant.id" @click="highlightStore.isHighlightMode
                                ? highlightStore.highlightHandler.selectElement('participants-delete-button-' + participant.id, $event)
                                : removeParticipant(participant)">
                                <UButton size="sm" color="red" variant="outline">
                                    {{ t('delete') }}
                                </UButton>
                            </div>

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

                        <UForm v-if="selectedParticipant" :state="selectedParticipant"
                            @submit="handleEditParticipant(selectedParticipant)" class="flex flex-col space-y-4">
                            <div class="highlightable" id="participants-edit-name"
                                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-edit-name', $event)">
                                <label for="edit-name" class="block text-sm font-medium text-white mb-1">Jméno</label>
                                <UInput color="sky" id="edit-name" v-model="selectedParticipant.name"
                                    placeholder="Zadejte jméno účastníka" :disabled="highlightStore.isHighlightMode" />
                            </div>
                            <div class="highlightable" id="participants-edit-email"
                                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-edit-email', $event)">
                                <label for="edit-email" class="block text-sm font-medium text-white mb-1">E-mail</label>
                                <UInput color="sky" id="edit-email" v-model="selectedParticipant.email" type="email"
                                    placeholder="email@example.com" :disabled="highlightStore.isHighlightMode" />
                            </div>
                            <div class="highlightable" id="participants-edit-personal_number"
                                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-edit-personal_number', $event)">
                                <label for="edit-personal_number"
                                    class="block text-sm font-medium text-white mb-1">Rodné číslo</label>
                                <UInput color="sky" id="edit-personal_number"
                                    v-model="selectedParticipant.personal_number" placeholder="123456/7890"
                                    :disabled="highlightStore.isHighlightMode" />
                            </div>
                            <div class="highlightable" id="participants-edit-phone"
                                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-edit-phone', $event)">
                                <label for="edit-phone"
                                    class="block text-sm font-medium text-white mb-1">Telefon</label>
                                <UInput color="sky" id="edit-phone" v-model="selectedParticipant.phone"
                                    placeholder="+420 123 456 789" :disabled="highlightStore.isHighlightMode" />
                            </div>
                            <div class="highlightable" id="participants-edit-address"
                                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-edit-address', $event)">
                                <label for="edit-address"
                                    class="block text-sm font-medium text-white mb-1">Adresa</label>
                                <UTextarea color="sky" id="edit-address" v-model="selectedParticipant.address"
                                    placeholder="Ulice číslo, město, PSČ" :rows="2"
                                    :disabled="highlightStore.isHighlightMode" />
                            </div>
                            <div class="highlightable" id="participants-edit-age"
                                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-edit-age', $event)">
                                <label for="edit-age" class="block text-sm font-medium text-white mb-1">Věk</label>
                                <UInput color="sky" id="edit-age" v-model="selectedParticipant.age" type="number"
                                    min="1" max="100" placeholder="18" :disabled="highlightStore.isHighlightMode" />
                            </div>
                            <!-- Allergen Edit Field -->
                            <div class="highlightable" id="participants-edit-allergens"
                                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-edit-allergens', $event)">
                                <label for="edit-allergens"
                                    class="block text-sm font-medium text-white mb-1">Alergeny</label>
                                <USelect color="sky" id="edit-allergens" v-model="selectedParticipant.allergens"
                                    :items="allergenOptions" multiple placeholder="Vyberte alergeny"
                                    :disabled="highlightStore.isHighlightMode" />
                            </div>
                            <div class="highlightable" id="participants-edit-sessions"
                                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-edit-sessions', $event)">
                                <label for="edit-sessions"
                                    class="block text-sm font-medium text-white mb-1">Turnus</label>

                                <USelect color="sky" id="edit-sessions" v-model="selectedParticipant.sessions"
                                    :items="sessionOptions" placeholder="Vyberte turnus" multiple
                                    :disabled="highlightStore.isHighlightMode" />
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

            <!-- Empty State -->
            <div v-if="filteredParticipants.length === 0" class="empty-state">
                <UIcon name="i-heroicons-user-x-mark" class="empty-icon" />
                <h3 class="empty-title">{{ t('no_participants') }}</h3>
                <p class="empty-description">{{ t('no_participants_description') }}</p>
                <UButton color="sky" @click="createNewParticipant" class="mt-4">
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
const value = ref('all')
const participants = ref<Participant[]>([])
const sessions = ref<Session[]>([])
const showDetailModal = ref(false)
const selectedParticipant = ref<Participant | null>(null)
const selectedSession = ref('all')
const isSubmitting = ref(false)
const editModalOpen = ref(false);
const addModalOpen = ref(false);
useHighlightWatchers(highlightStore.highlightHandler, highlightStore);
function lightenColor(color: string, percent: number): string {
    const colorMap: Record<string, string> = {
        'red': '#ff0000',
        'yellow': '#ffff00',
        'green': '#00ff00'
    };
    if (colorMap[color]) {
        color = colorMap[color];
    }
    // convert hex to RGB
    let r: number, g: number, b: number;

    if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    } else {
        // fallback if color is not hex
        return color;
    }

    // lighten each channel
    r = Math.min(255, Math.floor(r + (255 - r) * percent));
    g = Math.min(255, Math.floor(g + (255 - g) * percent));
    b = Math.min(255, Math.floor(b + (255 - b) * percent));

    return `rgb(${r}, ${g}, ${b})`;
}

function darkenColor(color: string, percent: number): string {
    const colorMap: Record<string, string> = {
        'red': '#ff0000',
        'yellow': '#ffff00',
        'green': '#00ff00'
    };
    if (colorMap[color]) {
        color = colorMap[color];
    }
    let r: number, g: number, b: number;

    if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    } else {
        return color;
    }

    // darken each channel
    r = Math.max(0, Math.floor(r * (1 - percent)));
    g = Math.max(0, Math.floor(g * (1 - percent)));
    b = Math.max(0, Math.floor(b * (1 - percent)));

    return `rgb(${r}, ${g}, ${b})`;
}

// New participant form
const newParticipant = ref({
    name: '',
    email: '',
    personal_number: '',
    phone: '',
    address: '',
    age: null as number | null,
    sessionId: [] as number[],
    allergens: [] as number[]
})



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
    const query: string = `SELECT allergen_id, name from ${selectedSystemStore.selectedSystem?.db?.getTableName('allergens')}`;
    const result = selectedSystemStore.selectedSystem?.db?.query(query)?.results || [];
    return result.map(allergen => ({
        label: allergen.name,
        value: allergen.allergen_id
    }))
})


const filteredParticipants = computed(() => {
    let arr = participants.value

    if (filterText.value) {
        const text = filterText.value.toLowerCase()
        arr = arr.filter(p =>
            (p.name && p.name.toLowerCase().includes(text)) ||
            (p.email && p.email.toLowerCase().includes(text)) ||
            (p.phone && p.phone.toLowerCase().includes(text)) ||
            (p.address && p.address.toLowerCase().includes(text)) ||
            (p.sessions && getSessionNames(p.sessions).toLowerCase().includes(text))
        )
    } else if (value.value !== 'all') {
        arr = arr.filter(p => p.sessions.includes(Number(value.value)))
    }

    console.log("Filtered:", arr);

    return arr
});

const toast = useToast()

const selectedSessionInfo = computed(() => {
    if (value.value === 'all') {

        const totalCapacityQuery: string = `SELECT SUM(capacity) as count FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions')}`;
        const result = selectedSystemStore.selectedSystem?.db?.query(totalCapacityQuery)?.results || [];
        const totalCapacity = result[0]?.count || 0;

        const currentCountQuery: string = `
            SELECT COUNT(*) as count
            FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('participants')} p
            JOIN ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions_participants')} sp ON p.participant_id = sp.participant_id
        `;

        const currentCountResult = selectedSystemStore.selectedSystem?.db?.query(currentCountQuery)?.results || [];
        const currentCount = currentCountResult[0]?.count || 0;

        console.log("Capacity:", totalCapacity)
        console.log("Current:", currentCount)

        const fillPercentageJs: string = `Math.round(currentCount / totalCapacity * 100)`;

        let fillPercentage: number = 0;

        try {
            fillPercentage = eval(fillPercentageJs);
            console.log("Fill percentage:", fillPercentage);
        } catch (error) {
            console.error("Error evaluating fillPercentageJs:", error);
            fillPercentage = 0;
        }

        return {
            currentCount,
            totalCapacity,
            fillPercentage,
            isFull: currentCount >= totalCapacity,
            isNearFull: fillPercentage >= 80
        }
    } else {
        const sessionId = Number(value.value)

        const totalCapacityQuery: string = `SELECT capacity as count FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions')} WHERE session_id = ${sessionId}`;
        const capacityResult = selectedSystemStore.selectedSystem?.db?.query(totalCapacityQuery)?.results || [];
        const totalCapacity = capacityResult[0]?.count || 0;

        const currentCountQuery: string = `
            SELECT COUNT(*) as count
            FROM ${selectedSystemStore.selectedSystem?.db?.getTableName('participants')} p
            JOIN ${selectedSystemStore.selectedSystem?.db?.getTableName('sessions_participants')} sp ON p.participant_id = sp.participant_id
            WHERE sp.session_id = ${sessionId}
        `;

        const currentCountResult = selectedSystemStore.selectedSystem?.db?.query(currentCountQuery)?.results || [];
        const currentCount = currentCountResult[0]?.count || 0;

        console.log("Session Capacity:", totalCapacity)
        console.log("Session Current:", currentCount)

        const fillPercentageJs: string = `Math.round(currentCount / totalCapacity * 100)`;

        let fillPercentage: number = 0;

        try {
            fillPercentage = eval(fillPercentageJs);
            console.log("Session Fill percentage:", fillPercentage);
        } catch (error) {
            console.error("Error evaluating fillPercentageJs:", error);
            fillPercentage = 0;
        }

        return {
            currentCount,
            totalCapacity,
            fillPercentage,
            isFull: currentCount >= totalCapacity,
            isNearFull: fillPercentage >= 80
        }
    }

})

// Reactive database monitoring using computed hash
const participantsDataHash = computed(() => {
    if (!selectedSystemStore.selectedSystem?.db) return ''

    try {
        // Get participants count
        const participantsTable = selectedSystemStore.selectedSystem.db.getTableName('participants')
        const sessionsTable = selectedSystemStore.selectedSystem.db.getTableName('sessions')
        const participantsCountRes = selectedSystemStore.selectedSystem.db.query(`SELECT COUNT(*) as count FROM ${participantsTable}`)
        const participantsCount = participantsCountRes?.results?.[0]?.count || 0

        // Get sessions count  
        const sessionsCountRes = selectedSystemStore.selectedSystem.db.query(`SELECT COUNT(*) as count FROM ${sessionsTable}`)
        const sessionsCount = sessionsCountRes?.results?.[0]?.count || 0

        // Get sample of recent data to detect content changes - removed the trailing comma after email
        const participantsSample = selectedSystemStore.selectedSystem.db.query(`SELECT participant_id, name, email FROM ${participantsTable} ORDER BY participant_id DESC LIMIT 3`)
        const sampleData = JSON.stringify(participantsSample?.results || [])

        return `p${participantsCount}-s${sessionsCount}-${sampleData.length}-${Date.now()}`
    } catch (error) {
        return `error-${Date.now()}`
    }
})

watch(participantsDataHash, (newHash, oldHash) => {
    if (oldHash && newHash !== oldHash && !newHash.startsWith('error')) {
        console.log('Database changes detected via hash, reloading data...')
        try {
            loadParticipantsFromDatabase()
        } catch (error) {
            console.error('Error reloading participants data:', error)
        }
    }
})

const loadParticipantsFromDatabase = () => {
    if (!selectedSystemStore.selectedSystem?.db) {
        console.error('Database not available')
        return
    }

    try {







        const getParticipantsQuery: string = `
            SELECT participant_id, name, email, personal_number, phone, address, age
            FROM ${selectedSystemStore.selectedSystem.db.getTableName('participants')}
            ORDER BY participant_id
        `;

        const participantsResult = selectedSystemStore.selectedSystem.db.query(getParticipantsQuery);

        const participantsMap = new Map<number, Participant>();
        for (const row of participantsResult?.results || []) {
            const participant = new Participant(
                row.participant_id,
                row.name,
                row.email,
                row.personal_number,
                row.phone,
                row.address,
                row.age,
                [], // session IDs not used
                []  // allergens not used
            );
            participantsMap.set(participant.id, participant);
        }

        // get participant's allergens
        const getParticipantAllergensQuery: string = `
            SELECT pa.participant_id, a.allergen_id
            FROM ${selectedSystemStore.selectedSystem.db.getTableName('participants_allergens')} pa
            JOIN ${selectedSystemStore.selectedSystem.db.getTableName('allergens')} a ON pa.allergen_id = a.allergen_id
        `;

        const allergensResult = selectedSystemStore.selectedSystem.db.query(getParticipantAllergensQuery);
        // Build a map of allergen_id to label for easy lookup
        const allergenLabelMap: Record<string, string> = {};
        const allergenOpts = allergenOptions.value;
        for (const opt of allergenOpts) {
            allergenLabelMap[opt.value] = opt.label;
        }

        for (const row of allergensResult?.results || []) {
            const participant = participantsMap.get(row.participant_id);
            if (participant) {
                // Push the label instead of the ID
                if (allergenLabelMap[row.allergen_id]) {
                    participant.allergens.push(allergenLabelMap[row.allergen_id]);
                }
            }
        }

        // get participant's sessions
        const getParticipantSessionsQuery: string = `
            SELECT ps.participant_id, s.session_id
            FROM ${selectedSystemStore.selectedSystem.db.getTableName('sessions_participants')} ps
            JOIN ${selectedSystemStore.selectedSystem.db.getTableName('sessions')} s ON ps.session_id = s.session_id
        `;

        const sessionsResult = selectedSystemStore.selectedSystem.db.query(getParticipantSessionsQuery);
        for (const row of sessionsResult?.results || []) {
            const participant = participantsMap.get(row.participant_id);
            if (participant) {
                participant.sessions.push(row.session_id);
            }
        }

        participants.value = Array.from(participantsMap.values());

        console.log('Participants loaded:', participants.value)

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
        loadParticipantsFromDatabase()
    }
}, { immediate: true })

onMounted(() => {
    loadSessionsFromDatabase()
    loadParticipantsFromDatabase()
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

async function viewParticipantDetails(participant: Participant) {
    console.log("Participant: ", participant);

    // Convert allergen labels back to IDs for the edit form
    const allergenLabelToIdMap: Record<string, number> = {};
    const allergenOpts = allergenOptions.value;
    for (const opt of allergenOpts) {
        allergenLabelToIdMap[opt.label] = opt.value;
    }

    const allergenIds = participant.allergens.map(label => allergenLabelToIdMap[label]).filter(id => id !== undefined);

    selectedParticipant.value = new Participant(
        participant.id,
        participant.name,
        participant.email,
        participant.personal_number,
        participant.phone,
        participant.address,
        participant.age,
        [...participant.sessions], // Create a copy of the array
        allergenIds // Use IDs for the edit form
    )
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
        // Insert participant first
        const query = `
            INSERT INTO ${selectedSystemStore.selectedSystem.db.getTableName('participants')} (name, email, personal_number, phone, address, age)
            VALUES ('${data.name}', '${data.email}', '${data.personal_number}', '${data.phone}', '${data.address}', ${data.age})
        `
        const result = selectedSystemStore.selectedSystem.db.query(query)

        if (result.success) {
            // Get the inserted participant ID
            const participantId = selectedSystemStore.selectedSystem.db.query(`
                SELECT participant_id FROM ${selectedSystemStore.selectedSystem.db.getTableName('participants')} 
                WHERE name = '${data.name}' AND email = '${data.email}' 
                ORDER BY participant_id DESC LIMIT 1
            `).results[0]?.participant_id

            if (participantId) {
                // Add session associations
                if (data.sessionId && data.sessionId.length > 0) {
                    await addParticipantToSessions(participantId, data.sessionId)
                }

                // Add allergen associations
                if (data.allergens && data.allergens.length > 0) {
                    await addParticipantAllergens(participantId, data.allergens)
                }
            }

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
            title: t('participant_added_error'),
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
        sessionId: [],
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
        // Store original session IDs and allergen IDs before update
        const originalParticipant = participants.value.find(p => p.id === selectedParticipant.value?.id)
        const oldSessionIds = originalParticipant?.sessions || []
        const oldAllergenIds = await getParticipantAllergenIds(selectedParticipant.value.id)

        console.log("EDIT DATA:", data)

        // Update participant basic info
        const query = `
            UPDATE ${selectedSystemStore.selectedSystem.db.getTableName('participants')} 
            SET name = '${data.name}', email = '${data.email}', personal_number = '${data.personal_number}', 
                phone = '${data.phone}', address = '${data.address}', age = ${data.age}
            WHERE participant_id = '${selectedParticipant.value.id}'
        `
        const result = selectedSystemStore.selectedSystem.db.query(query)

        if (result.success) {
            // Update session associations
            if (data.sessions && Array.isArray(data.sessions)) {
                await updateParticipantSessions(selectedParticipant.value.id, oldSessionIds, data.sessions)
            }

            // Update allergen associations
            if (data.allergens && Array.isArray(data.allergens)) {
                await updateParticipantAllergens(selectedParticipant.value.id, oldAllergenIds, data.allergens)
            }

            toast.add({
                title: t('participant_updated_success', { name: data.name }),
                color: 'primary',
                icon: 'i-heroicons-check'
            })
            loadParticipantsFromDatabase()
            editModalOpen.value = false
            selectedParticipant.value = null
        } else {
            toast.add({
                title: t('participant_update_error'),
                color: 'red',
                icon: 'i-heroicons-exclamation-triangle'
            })
            editModalOpen.value = false
            selectedParticipant.value = null
        }
    } catch (error) {
        console.error('Error updating participant:', error)
        toast.add({
            title: t('participant_update_error'),
            color: 'red',
            icon: 'i-heroicons-exclamation-triangle'
        })
        editModalOpen.value = false
        selectedParticipant.value = null
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
    try {
        // First remove all session associations
        if (participant.sessions.length > 0) {
            removeParticipantFromSessions(participant.id, participant.sessions)
        }

        // Remove all allergen associations
        const participantAllergenIds = getParticipantAllergenIds(participant.id)
        participantAllergenIds.then(allergenIds => {
            if (allergenIds.length > 0) {
                removeParticipantAllergens(participant.id, allergenIds)
            }
        })

        // Then remove the participant
        selectedSystemStore.selectedSystem?.db.query(`DELETE FROM ${selectedSystemStore.selectedSystem.db.getTableName('participants')} WHERE participant_id = ${participant.id}`)
        loadParticipantsFromDatabase()
        toast.add({
            title: t('participant_deleted_success', { name: participant.name }),
            color: 'primary',
            icon: 'i-lucide-trash-2'
        })
    } catch {
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

// Session toggle functions for forms
const toggleSessionForNewParticipant = (sessionId: number) => {
    const index = newParticipant.value.sessionId.indexOf(sessionId)
    if (index > -1) {
        newParticipant.value.sessionId.splice(index, 1)
    } else {
        newParticipant.value.sessionId.push(sessionId)
    }
}

const toggleSessionForEditParticipant = (sessionId: number) => {
    if (!selectedParticipant.value) return

    const index = selectedParticipant.value.sessions.indexOf(sessionId)
    if (index > -1) {
        selectedParticipant.value.sessions.splice(index, 1)
    } else {
        selectedParticipant.value.sessions.push(sessionId)
    }
}

// Session management helper functions
const addParticipantToSessions = async (participantId: number, sessionIds: number[]): Promise<void> => {
    if (!selectedSystemStore.selectedSystem?.db) return

    const sessionsParticipantsTable = selectedSystemStore.selectedSystem.db.getTableName('sessions_participants')

    for (const sessionId of sessionIds) {
        try {
            const query = `
                INSERT INTO ${sessionsParticipantsTable} (session_id, participant_id)
                VALUES (${sessionId}, ${participantId})
            `
            selectedSystemStore.selectedSystem.db.query(query)
        } catch (error) {
            console.error(`Error adding participant ${participantId} to session ${sessionId}:`, error)
        }
    }
}

const removeParticipantFromSessions = async (participantId: number, sessionIds: number[]): Promise<void> => {
    if (!selectedSystemStore.selectedSystem?.db) return

    const sessionsParticipantsTable = selectedSystemStore.selectedSystem.db.getTableName('sessions_participants')

    for (const sessionId of sessionIds) {
        try {
            const query = `
                DELETE FROM ${sessionsParticipantsTable} 
                WHERE session_id = ${sessionId} AND participant_id = ${participantId}
            `
            selectedSystemStore.selectedSystem.db.query(query)
        } catch (error) {
            console.error(`Error removing participant ${participantId} from session ${sessionId}:`, error)
        }
    }
}

const updateParticipantSessions = async (participantId: number, oldSessionIds: number[], newSessionIds: number[]): Promise<void> => {
    // Find sessions to add and remove
    const sessionsToAdd = newSessionIds.filter(id => !oldSessionIds.includes(id))
    const sessionsToRemove = oldSessionIds.filter(id => !newSessionIds.includes(id))

    if (sessionsToRemove.length > 0) {
        await removeParticipantFromSessions(participantId, sessionsToRemove)
    }

    if (sessionsToAdd.length > 0) {
        await addParticipantToSessions(participantId, sessionsToAdd)
    }
}

// Allergen management helper functions
const getParticipantAllergenIds = async (participantId: number): Promise<number[]> => {
    if (!selectedSystemStore.selectedSystem?.db) return []

    const participantsAllergensTable = selectedSystemStore.selectedSystem.db.getTableName('participants_allergens')

    try {
        const query = `
            SELECT allergen_id 
            FROM ${participantsAllergensTable} 
            WHERE participant_id = ${participantId}
        `
        const result = selectedSystemStore.selectedSystem.db.query(query)
        return result.results?.map(row => row.allergen_id) || []
    } catch (error) {
        console.error(`Error getting allergen IDs for participant ${participantId}:`, error)
        return []
    }
}

const addParticipantAllergens = async (participantId: number, allergenIds: number[]): Promise<void> => {
    if (!selectedSystemStore.selectedSystem?.db) return

    const participantsAllergensTable = selectedSystemStore.selectedSystem.db.getTableName('participants_allergens')

    for (const allergenId of allergenIds) {
        try {
            const query = `
                INSERT INTO ${participantsAllergensTable} (participant_id, allergen_id)
                VALUES (${participantId}, ${allergenId})
            `
            selectedSystemStore.selectedSystem.db.query(query)
        } catch (error) {
            console.error(`Error adding allergen ${allergenId} to participant ${participantId}:`, error)
        }
    }
}

const removeParticipantAllergens = async (participantId: number, allergenIds: number[]): Promise<void> => {
    if (!selectedSystemStore.selectedSystem?.db) return

    const participantsAllergensTable = selectedSystemStore.selectedSystem.db.getTableName('participants_allergens')

    for (const allergenId of allergenIds) {
        try {
            const query = `
                DELETE FROM ${participantsAllergensTable} 
                WHERE participant_id = ${participantId} AND allergen_id = ${allergenId}
            `
            selectedSystemStore.selectedSystem.db.query(query)
        } catch (error) {
            console.error(`Error removing allergen ${allergenId} from participant ${participantId}:`, error)
        }
    }
}

const updateParticipantAllergens = async (participantId: number, oldAllergenIds: number[], newAllergenIds: number[]): Promise<void> => {
    // Find allergens to add and remove
    const allergensToAdd = newAllergenIds.filter(id => !oldAllergenIds.includes(id))
    const allergensToRemove = oldAllergenIds.filter(id => !newAllergenIds.includes(id))

    if (allergensToRemove.length > 0) {
        await removeParticipantAllergens(participantId, allergensToRemove)
    }

    if (allergensToAdd.length > 0) {
        await addParticipantAllergens(participantId, allergensToAdd)
    }
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