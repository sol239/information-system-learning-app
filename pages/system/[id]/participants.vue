<template>
    <div>
        <LocalNavbar />

        <div class="container mx-auto px-4 py-8">
            <div class="flex items-center gap-4 mb-6">

                <!-- Session Select Menu-->
                <div class="highlightable" :id="'participants-session-menu'"
                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-session-menu', $event)">
                    <div class="component-wrapper">
                        <USelect v-model="value" :items="filterSessionsItems" :disabled="highlightStore.isEditModeActive" />
                        <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" :componentId="'participants-session-menu'"
                            class="edit-button" />
                    </div>
                </div>

                <!-- Session Capacity Pillow -->
                <div v-if="selectedSessionInfo" class="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <UIcon name="i-heroicons-users" class="w-4 h-4 text-gray-600" />

                    <!-- Session Capacity Count -->
                    <div class="highlightable" :id="'participants-capacity-count'"
                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-capacity-count', $event)">
                        <div class="component-wrapper">
                            <span class="text-sm font-medium text-gray-700">
                                {{ t('capacity') }}: {{ selectedSessionInfo.currentCount }}/{{
                                    selectedSessionInfo.totalCapacity }}
                            </span>
                            <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" :componentId="'participants-capacity-count'"
                                class="edit-button" />
                        </div>
                    </div>

                    <!-- Session Capacity Percentage -->
                    <div class="highlightable" :id="'participants-capacity-percentage'"
                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-capacity-percentage', $event)">
                        <div class="component-wrapper">
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
                            <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" :componentId="'participants-capacity-percentage'"
                                class="edit-button" />
                        </div>
                    </div>


                </div>

                <!-- Pagination -->
                <div v-if="totalPages > 1" class="flex justify-center items-center gap-4">
                    <UButton variant="outline" color="sky" icon="i-heroicons-chevron-left" :disabled="currentPage === 1 || highlightStore.isEditModeActive"
                        @click="currentPage--">
                        {{ t('previous') }}
                    </UButton>

                    <div class="flex items-center gap-2">
                        <div class="highlightable" id="participants-page-count-1"
                            @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-page-count-1', $event)">
                            <div class="component-wrapper">
                                <span class="text-sm text-gray-600">
                                    {{ t('page') }} {{ currentPage }} {{ t('of') }} {{ totalPages }}
                                </span>
                                <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" :componentId="'participants-page-count-1'"
                                    class="edit-button" />
                            </div>
                        </div>
                        <!--
                        <div class="highlightable" id="participants-page-count-2"
                            @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-page-count-2', $event)">
                            <div class="component-wrapper">
                                <span class="text-xs text-gray-500">
                                    ({{ filteredParticipants.length }} {{ t('participants') }})
                                </span>
                                <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" :componentId="'participants-page-count-2'"
                                    class="edit-button" />
                            </div>
                        </div>
                        -->
                    </div>

                    <UButton variant="outline" color="sky" icon="i-heroicons-chevron-right"
                        :disabled="currentPage === totalPages || highlightStore.isEditModeActive" @click="currentPage++">
                        {{ t('next') }}
                    </UButton>
                </div>

                <div class="ml-auto flex gap-4 items-start">
                    <!-- Filter Field and Reset Button (left) -->
                    <div class="flex gap-2 items-center">
                        <div class="highlightable" id="participants-filter-reset" @click="highlightStore.isHighlightMode ? highlightStore.highlightHandler.selectElement('participants-filter-reset', $event) : resetFilter()">
                            <div class="component-wrapper">
                                <UButton variant="outline" color="sky"
                                    size="sm"
                                    icon="i-lucide-rotate-ccw" :disabled="highlightStore.isEditModeActive">
                                </UButton>
                            </div>
                        </div>
                        <div class="highlightable" id="participants-filter-input"
                            @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-filter-input', $event)">
                            <div class="component-wrapper">
                                <UInput v-model="filterText" color="sky" :placeholder="t('filter_participants')"
                                    size="sm" :disabled="highlightStore.isEditModeActive" />
                                <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" :componentId="'participants-filter-input'"
                                    class="edit-button" />
                            </div>
                        </div>

                    </div>
                    <!-- Add Participant Drawer (right) -->
                    <UDrawer v-model:open="addModalOpen" direction="right">
                        <UButton color="sky" variant="outline" @click="createNewParticipant" icon="i-heroicons-plus" :disabled="highlightStore.isEditModeActive">
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
                                        <div class="component-wrapper">
                                            <label for="name"
                                                class="block text-sm font-medium text-white mb-1">Jméno</label>
                                            <UInput color="sky" id="name" v-model="newParticipant.name"
                                                placeholder="Zadejte jméno účastníka"
                                                :disabled="highlightStore.isHighlightMode" />
                                            <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" :componentId="'participants-add-name'"
                                                class="edit-button" />
                                        </div>
                                    </div>
                                    <div class="highlightable" id="participants-add-email"
                                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-email', $event)">
                                        <div class="component-wrapper">
                                            <label for="email"
                                                class="block text-sm font-medium text-white mb-1">E-mail</label>
                                            <UInput color="sky" id="email" v-model="newParticipant.email" type="email"
                                                placeholder="email@example.com"
                                                :disabled="highlightStore.isHighlightMode" />
                                            <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" :componentId="'participants-add-email'"
                                                class="edit-button" />
                                        </div>
                                    </div>
                                    <div class="highlightable" id="participants-add-personal_number"
                                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-personal_number', $event)">
                                        <div class="component-wrapper">
                                            <label for="personal_number"
                                                class="block text-sm font-medium text-white mb-1">Rodné číslo</label>
                                            <UInput color="sky" id="personal_number"
                                                v-model="newParticipant.personal_number" placeholder="123456/7890"
                                                :disabled="highlightStore.isHighlightMode" />
                                            <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" :componentId="'participants-add-personal_number'"
                                                class="edit-button" />
                                        </div>
                                    </div>
                                    <div class="highlightable" id="participants-add-phone"
                                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-phone', $event)">
                                        <div class="component-wrapper">
                                            <label for="phone"
                                                class="block text-sm font-medium text-white mb-1">Telefon</label>
                                            <UInput color="sky" id="phone" v-model="newParticipant.phone"
                                                placeholder="+420 123 456 789" :disabled="highlightStore.isHighlightMode" />
                                            <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" :componentId="'participants-add-phone'"
                                                class="edit-button" />
                                        </div>
                                    </div>
                                    <div class="highlightable" id="participants-add-address"
                                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-address', $event)">
                                        <div class="component-wrapper">
                                            <label for="address"
                                                class="block text-sm font-medium text-white mb-1">Adresa</label>
                                            <UTextarea color="sky" id="address" v-model="newParticipant.address"
                                                placeholder="Ulice číslo, město, PSČ" :rows="2"
                                                :disabled="highlightStore.isHighlightMode" />
                                            <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" :componentId="'participants-add-address'"
                                                class="edit-button" />
                                        </div>
                                    </div>
                                    <div class="highlightable" id="participants-add-age"
                                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-age', $event)">
                                        <div class="component-wrapper">
                                            <label for="age" class="block text-sm font-medium text-white mb-1">Věk</label>
                                            <UInput color="sky" id="age" v-model="newParticipant.age" type="number" min="1"
                                                max="100" placeholder="18" :disabled="highlightStore.isHighlightMode" />
                                            <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" :componentId="'participants-add-age'"
                                                class="edit-button" />
                                        </div>
                                    </div>
                                    <div class="highlightable" id="participants-add-session"
                                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-session', $event)">
                                        <div class="component-wrapper">
                                            <label for="sessionId"
                                                class="block text-sm font-medium text-white mb-1">Turnus</label>

                                            <USelect color="sky" id="sessionId" v-model="newParticipant.sessionId"
                                                :items="sessionOptions" placeholder="Vyberte turnus" multiple
                                                :disabled="highlightStore.isHighlightMode" />
                                            <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" :componentId="'participants-add-session'"
                                                class="edit-button" />
                                        </div>
                                    </div>
                                    <div class="highlightable" id="participants-add-allergens"
                                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-allergens', $event)">
                                        <div class="component-wrapper">
                                            <label for="allergens"
                                                class="block text-sm font-medium text-white mb-1">Alergeny</label>
                                            <USelect color="sky" id="allergens" v-model="newParticipant.allergens"
                                                :items="allergenOptions" multiple placeholder="Vyberte alergeny"
                                                :disabled="highlightStore.isHighlightMode" />
                                            <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" :componentId="'participants-add-allergens'"
                                                class="edit-button" />
                                        </div>
                                    </div>
                                    <div class="flex flex-col gap-3 pt-4">
                                        <UButton type="submit" color="sky" :loading="isSubmitting" :disabled="highlightStore.isEditModeActive">
                                            {{ t('add') }}
                                        </UButton>
                                        <UButton variant="outline" color="sky" @click="resetForm" :disabled="highlightStore.isEditModeActive">
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
                    <div class="highlightable" :id="'participants-card-' + participant.id" @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-card-' + participant.id, $event)">
                        <div class="component-wrapper">
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
                                <UBadge size="sm" :color="participant.allergens.length > 0 ? 'red' : 'green'" variant="soft"
                                    class="mt-2">
                                    {{ t("allergens") }}: {{ participant.allergens.length }}
                                </UBadge>
                            </div>
                            <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" :componentId="'participants-list'"
                                class="edit-button" />
                        </div>
                    </div>

                    <!-- Participant Actions -->
                    <div class="participant-actions mt-6 pt-4 border-t border-gray-200">
                        <div class="flex gap-2">
                            <!-- Edit Participant Button only -->
                            <div class="ml-auto">
                                <UButton size="sm" color="sky" variant="solid"
                                    @click="viewParticipantDetails(participant)" class="flex-1" :disabled="highlightStore.isEditModeActive">
                                    {{ t('view_details') }}
                                </UButton>
                            </div>
                            <div class="highlightable" :id="'participants-delete-button-' + participant.id" @click="highlightStore.isHighlightMode || highlightStore.isEditModeActive
                                ? highlightStore.highlightHandler.selectElement('participants-delete-button-' + participant.id, $event)
                                : removeParticipant(participant)">
                                <div class="component-wrapper">
                                    <UButton size="sm" color="red" variant="outline">
                                        {{ t('delete') }}
                                    </UButton>
                                    <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" :componentId="'participant-delete'"
                                        class="edit-button" />
                                </div>
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
                                <div class="component-wrapper">
                                    <label for="edit-name" class="block text-sm font-medium text-white mb-1">Jméno</label>
                                    <UInput color="sky" id="edit-name" v-model="selectedParticipant.name"
                                        placeholder="Zadejte jméno účastníka" :disabled="highlightStore.isHighlightMode" />
                                    <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" :componentId="'participants-edit-name'"
                                        class="edit-button" />
                                </div>
                            </div>
                            <div class="highlightable" id="participants-edit-email"
                                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-edit-email', $event)">
                                <div class="component-wrapper">
                                    <label for="edit-email" class="block text-sm font-medium text-white mb-1">E-mail</label>
                                    <UInput color="sky" id="edit-email" v-model="selectedParticipant.email" type="email"
                                        placeholder="email@example.com" :disabled="highlightStore.isHighlightMode" />
                                    <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" :componentId="'participants-edit-email'"
                                        class="edit-button" />
                                </div>
                            </div>
                            <div class="highlightable" id="participants-edit-personal_number"
                                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-edit-personal_number', $event)">
                                <div class="component-wrapper">
                                    <label for="edit-personal_number"
                                        class="block text-sm font-medium text-white mb-1">Rodné číslo</label>
                                    <UInput color="sky" id="edit-personal_number"
                                        v-model="selectedParticipant.personal_number" placeholder="123456/7890"
                                        :disabled="highlightStore.isHighlightMode" />
                                    <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" :componentId="'participants-edit-personal_number'"
                                        class="edit-button" />
                                </div>
                            </div>
                            <div class="highlightable" id="participants-edit-phone"
                                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-edit-phone', $event)">
                                <div class="component-wrapper">
                                    <label for="edit-phone"
                                        class="block text-sm font-medium text-white mb-1">Telefon</label>
                                    <UInput color="sky" id="edit-phone" v-model="selectedParticipant.phone"
                                        placeholder="+420 123 456 789" :disabled="highlightStore.isHighlightMode" />
                                    <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" :componentId="'participants-edit-phone'"
                                        class="edit-button" />
                                </div>
                            </div>
                            <div class="highlightable" id="participants-edit-address"
                                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-edit-address', $event)">
                                <div class="component-wrapper">
                                    <label for="edit-address"
                                        class="block text-sm font-medium text-white mb-1">Adresa</label>
                                    <UTextarea color="sky" id="edit-address" v-model="selectedParticipant.address"
                                        placeholder="Ulice číslo, město, PSČ" :rows="2"
                                        :disabled="highlightStore.isHighlightMode" />
                                    <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" :componentId="'participants-edit-address'"
                                        class="edit-button" />
                                </div>
                            </div>
                            <div class="highlightable" id="participants-edit-age"
                                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-edit-age', $event)">
                                <div class="component-wrapper">
                                    <label for="edit-age" class="block text-sm font-medium text-white mb-1">Věk</label>
                                    <UInput color="sky" id="edit-age" v-model="selectedParticipant.age" type="number"
                                        min="1" max="100" placeholder="18" :disabled="highlightStore.isHighlightMode" />
                                    <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" :componentId="'participants-edit-age'"
                                        class="edit-button" />
                                </div>
                            </div>
                            <!-- Allergen Edit Field -->
                            <div class="highlightable" id="participants-edit-allergens"
                                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-edit-allergens', $event)">
                                <div class="component-wrapper">
                                    <label for="edit-allergens"
                                        class="block text-sm font-medium text-white mb-1">Alergeny</label>
                                    <USelect color="sky" id="edit-allergens" v-model="selectedParticipant.allergens"
                                        :items="allergenOptions" multiple placeholder="Vyberte alergeny"
                                        :disabled="highlightStore.isHighlightMode" />
                                    <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" :componentId="'participants-edit-allergens'"
                                        class="edit-button" />
                                </div>
                            </div>
                            <div class="highlightable" id="participants-edit-sessions"
                                @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-edit-sessions', $event)">
                                <div class="component-wrapper">
                                    <label for="edit-sessions"
                                        class="block text-sm font-medium text-white mb-1">Turnus</label>

                                    <USelect color="sky" id="edit-sessions" v-model="selectedParticipant.sessions"
                                        :items="sessionOptions" placeholder="Vyberte turnus" multiple
                                        :disabled="highlightStore.isHighlightMode" />
                                    <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive" :componentId="'participants-edit-sessions'"
                                        class="edit-button" />
                                </div>
                            </div>
                            <div class="flex flex-col gap-3 pt-4">
                                <UButton type="submit" color="sky" :loading="isSubmitting" :disabled="highlightStore.isEditModeActive">
                                    {{ t('save_changes') }}
                                </UButton>
                                <UButton variant="outline" color="sky" @click="resetForm" :disabled="highlightStore.isEditModeActive">
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
    <EditComponentModal v-if="highlightStore.isEditModeActive && highlightStore.selectedComponentId" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSelectedSystemStore } from '#imports'
import { Participant } from '~/model/Participant'
import { Session } from '~/model/Session'
import { useHighlightStore } from '#imports'
import { useComponentCodeStore } from '~/stores/useComponentCodeStore'
import { ComponentHandler } from '~/composables/ComponentHandler'
import { ComponentManager } from '~/composables/ComponentManager'
import { useHighlightWatchers } from '~/composables/highlightWatchers'
import { useToast } from '#imports'
import EditComponentModal from '~/components/EditComponentModal.vue'
import EditComponentModalOpenButton from '~/components/EditComponentModalOpenButton.vue'

const selectedSystemStore = useSelectedSystemStore()
const { t } = useI18n()
const highlightStore = useHighlightStore()
const componentCodeStore = useComponentCodeStore()

// Component definitions
const participantsCapacityCountComponent = computed(() => componentCodeStore.getComponentById('participants-capacity-count') || componentCodeStore.getDefaultComponent('participants-capacity-count'))
const participantsCapacityPercentageComponent = computed(() => componentCodeStore.getComponentById('participants-capacity-percentage') || componentCodeStore.getDefaultComponent('participants-capacity-percentage'))
const participantsPageCount1Component = computed(() => componentCodeStore.getComponentById('participants-page-count-1') || componentCodeStore.getDefaultComponent('participants-page-count-1'))
const participantsPageCount2Component = computed(() => componentCodeStore.getComponentById('participants-page-count-2') || componentCodeStore.getDefaultComponent('participants-page-count-2'))
const participantsFilterResetComponent = computed(() => componentCodeStore.getComponentById('participants-filter-reset') || componentCodeStore.getDefaultComponent('participants-filter-reset'))
const participantsFilterInputComponent = computed(() => componentCodeStore.getComponentById('participants-filter-input') || componentCodeStore.getDefaultComponent('participants-filter-input'))
const participantsSessionMenuComponent = computed(() => componentCodeStore.getComponentById('participants-session-menu') || componentCodeStore.getDefaultComponent('participants-session-menu'))

// Component values - Default values from component store
const correctParticipantsCapacityCountSqlTotalAll = computed(() => participantsCapacityCountComponent.value?.sql?.['sql-total-all'] || '')
const correctParticipantsCapacityCountSqlTotalSession = computed(() => participantsCapacityCountComponent.value?.sql?.['sql-total-session'] || '')
const correctParticipantsCapacityCountSqlCurrentAll = computed(() => participantsCapacityCountComponent.value?.sql?.['sql-current-all'] || '')
const correctParticipantsCapacityCountSqlCurrentSession = computed(() => participantsCapacityCountComponent.value?.sql?.['sql-current-session'] || '')
const correctParticipantsCapacityPercentageJs = computed(() => participantsCapacityPercentageComponent.value?.js?.['js'] || 'Math.round(currentCount / totalCapacity * 100)')

const correctParticipantsPageCount1Sql = computed(() => participantsPageCount1Component.value?.sql?.['sql'] || '')
const correctParticipantsPageCount1Js = computed(() => participantsPageCount1Component.value?.js?.['js'] || '')
const correctParticipantsPageCount1Html = computed(() => participantsPageCount1Component.value?.html?.['html'] || '')
const correctParticipantsPageCount1Css = computed(() => participantsPageCount1Component.value?.css?.['css'] || '')

const correctParticipantsPageCount2Sql = computed(() => participantsPageCount2Component.value?.sql?.['sql'] || '')
const correctParticipantsPageCount2Js = computed(() => participantsPageCount2Component.value?.js?.['js'] || '')
const correctParticipantsPageCount2Html = computed(() => participantsPageCount2Component.value?.html?.['html'] || '')
const correctParticipantsPageCount2Css = computed(() => participantsPageCount2Component.value?.css?.['css'] || '')

const correctParticipantsFilterResetSql = computed(() => participantsFilterResetComponent.value?.sql?.['sql'] || '')
const correctParticipantsFilterResetJs = computed(() => participantsFilterResetComponent.value?.js?.['js'] || '')
const correctParticipantsFilterResetHtml = computed(() => participantsFilterResetComponent.value?.html?.['html'] || '')
const correctParticipantsFilterResetCss = computed(() => participantsFilterResetComponent.value?.css?.['css'] || '')

const correctParticipantsFilterInputSql = computed(() => participantsFilterInputComponent.value?.sql?.['sql'] || '')
const correctParticipantsFilterInputJs = computed(() => participantsFilterInputComponent.value?.js?.['js'] || `(p.name && p.name.toLowerCase().includes(text)) ||
(p.email && p.email.toLowerCase().includes(text)) ||
(p.phone && p.phone.toLowerCase().includes(text)) ||
(p.address && p.address.toLowerCase().includes(text)) ||
(p.sessions && getSessionNames(p.sessions).toLowerCase().includes(text))`)
const correctParticipantsFilterInputHtml = computed(() => participantsFilterInputComponent.value?.html?.['html'] || '')
const correctParticipantsFilterInputCss = computed(() => participantsFilterInputComponent.value?.css?.['css'] || '')

const correctParticipantsSessionMenuSql = computed(() => participantsSessionMenuComponent.value?.sql?.['sql'] || '')
const correctParticipantsSessionMenuJs = computed(() => participantsSessionMenuComponent.value?.js?.['js'] || '')
const correctParticipantsSessionMenuHtml = computed(() => participantsSessionMenuComponent.value?.html?.['html'] || '')
const correctParticipantsSessionMenuCss = computed(() => participantsSessionMenuComponent.value?.css?.['css'] || '')

// Component values - Final getters using ComponentHandler
const participantsCapacityCountSqlTotal = computed(() => {
  if (value.value === 'all') {
    return ComponentHandler.getComponentValue('participants-capacity-count', 'sql-total-all', correctParticipantsCapacityCountSqlTotalAll.value)
  } else {
    return ComponentHandler.getComponentValue('participants-capacity-count', 'sql-total-session', correctParticipantsCapacityCountSqlTotalSession.value)
  }
})
const participantsCapacityCountSqlCurrent = computed(() => {
  if (value.value === 'all') {
    return ComponentHandler.getComponentValue('participants-capacity-count', 'sql-current-all', correctParticipantsCapacityCountSqlCurrentAll.value)
  } else {
    return ComponentHandler.getComponentValue('participants-capacity-count', 'sql-current-session', correctParticipantsCapacityCountSqlCurrentSession.value)
  }
})

const participantsCapacityPercentageJs = computed(() => ComponentHandler.getComponentValue('participants-capacity-percentage', 'js', correctParticipantsCapacityPercentageJs.value))

const participantsPageCount1Sql = computed(() => ComponentHandler.getComponentValue('participants-page-count-1', 'sql', correctParticipantsPageCount1Sql.value))
const participantsPageCount1Js = computed(() => ComponentHandler.getComponentValue('participants-page-count-1', 'js', correctParticipantsPageCount1Js.value))
const participantsPageCount1Html = computed(() => ComponentHandler.getComponentValue('participants-page-count-1', 'html', correctParticipantsPageCount1Html.value))
const participantsPageCount1Css = computed(() => ComponentHandler.getComponentValue('participants-page-count-1', 'css', correctParticipantsPageCount1Css.value))

const participantsPageCount2Sql = computed(() => ComponentHandler.getComponentValue('participants-page-count-2', 'sql', correctParticipantsPageCount2Sql.value))
const participantsPageCount2Js = computed(() => ComponentHandler.getComponentValue('participants-page-count-2', 'js', correctParticipantsPageCount2Js.value))
const participantsPageCount2Html = computed(() => ComponentHandler.getComponentValue('participants-page-count-2', 'html', correctParticipantsPageCount2Html.value))
const participantsPageCount2Css = computed(() => ComponentHandler.getComponentValue('participants-page-count-2', 'css', correctParticipantsPageCount2Css.value))

const participantsFilterResetSql = computed(() => ComponentHandler.getComponentValue('participants-filter-reset', 'sql', correctParticipantsFilterResetSql.value))
const participantsFilterResetJs = computed(() => ComponentHandler.getComponentValue('participants-filter-reset', 'js', correctParticipantsFilterResetJs.value))
const participantsFilterResetHtml = computed(() => ComponentHandler.getComponentValue('participants-filter-reset', 'html', correctParticipantsFilterResetHtml.value))
const participantsFilterResetCss = computed(() => ComponentHandler.getComponentValue('participants-filter-reset', 'css', correctParticipantsFilterResetCss.value))

const participantsFilterInputSql = computed(() => ComponentHandler.getComponentValue('participants-filter-input', 'sql', correctParticipantsFilterInputSql.value))
const participantsFilterInputJs = computed(() => ComponentHandler.getComponentValue('participants-filter-input', 'js', correctParticipantsFilterInputJs.value))
const participantsFilterInputHtml = computed(() => ComponentHandler.getComponentValue('participants-filter-input', 'html', correctParticipantsFilterInputHtml.value))
const participantsFilterInputCss = computed(() => ComponentHandler.getComponentValue('participants-filter-input', 'css', correctParticipantsFilterInputCss.value))

const participantsSessionMenuSql = computed(() => ComponentHandler.getComponentValue('participants-session-menu', 'sql', correctParticipantsSessionMenuSql.value))
const participantsSessionMenuJs = computed(() => ComponentHandler.getComponentValue('participants-session-menu', 'js', correctParticipantsSessionMenuJs.value))
const participantsSessionMenuHtml = computed(() => ComponentHandler.getComponentValue('participants-session-menu', 'html', correctParticipantsSessionMenuHtml.value))
const participantsSessionMenuCss = computed(() => ComponentHandler.getComponentValue('participants-session-menu', 'css', correctParticipantsSessionMenuCss.value))
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
    const query: string = componentCodeStore.getComponentCodeByType('participants-allergen-options', 'sql', 'sql') || ``;
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

        // Use component-managed filtering logic
        const filterJs = participantsFilterInputJs.value
        console.log("Applying filter JS:", filterJs)
        if (filterJs) {
            arr = arr.filter(p => {
                    // Create a function that can access the current context
                    const filterFunction = new Function('p', 'text', 'getSessionNames', `return ${filterJs}`)
                    console.log("FILTER CODE:", filterJs)
                    return filterFunction(p, text, getSessionNames)
                    
                })
        }
    } else if (value.value !== 'all') {
        arr = arr.filter(p => p.sessions.includes(Number(value.value)))
    }

    console.log("Filtered:", arr);

    return arr
});

const toast = useToast()

const selectedSessionInfo = computed(() => {
    if (value.value === 'all') {

        const totalCapacityQuery: string = participantsCapacityCountSqlTotal.value;
        const result = selectedSystemStore.selectedSystem?.db?.query(totalCapacityQuery)?.results || [];
        const totalCapacity = result[0]?.count || 0;

        const currentCountQuery: string = participantsCapacityCountSqlCurrent.value;

        const currentCountResult = selectedSystemStore.selectedSystem?.db?.query(currentCountQuery)?.results || [];
        const currentCount = currentCountResult[0]?.count || 0;

        console.log("Capacity:", totalCapacity)
        console.log("Current:", currentCount)

        const fillPercentageJs: string = `(function(currentCount, totalCapacity) { return ${participantsCapacityPercentageJs.value}; })(${currentCount}, ${totalCapacity})`;

        let fillPercentage: number = 0;

        try {
            // Handle division by zero case
            if (totalCapacity === 0) {
                fillPercentage = 0;
            } else {
                fillPercentage = eval(fillPercentageJs);
            }
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

        const totalCapacityQuery: string = participantsCapacityCountSqlTotal.value;
        const capacityResult = selectedSystemStore.selectedSystem?.db?.query(totalCapacityQuery, [sessionId])?.results || [];
        const totalCapacity = capacityResult[0]?.count || 0;

        const currentCountQuery: string = participantsCapacityCountSqlCurrent.value;

        const currentCountResult = selectedSystemStore.selectedSystem?.db?.query(currentCountQuery, [sessionId])?.results || [];
        const currentCount = currentCountResult[0]?.count || 0;

        console.log("Session Capacity:", totalCapacity)
        console.log("Session Current:", currentCount)

        const fillPercentageJs: string = `(function(currentCount, totalCapacity) { return ${participantsCapacityPercentageJs.value}; })(${currentCount}, ${totalCapacity})`;

        let fillPercentage: number = 0;

        try {
            // Handle division by zero case
            if (totalCapacity === 0) {
                fillPercentage = 0;
            } else {
                fillPercentage = eval(fillPercentageJs);
            }
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
        const participantsCountQuery = componentCodeStore.getComponentCodeByType('participants-count', 'sql', 'sql') || ``;
        const participantsCountRes = selectedSystemStore.selectedSystem.db.query(participantsCountQuery)
        const participantsCount = participantsCountRes?.results?.[0]?.count || 0

        // Get sessions count  
        const sessionsCountQuery = componentCodeStore.getComponentCodeByType('sessions-count', 'sql', 'sql') || ``;
        const sessionsCountRes = selectedSystemStore.selectedSystem.db.query(sessionsCountQuery)
        const sessionsCount = sessionsCountRes?.results?.[0]?.count || 0

        // Get sample of recent data to detect content changes - removed the trailing comma after email
        const participantsSampleQuery = componentCodeStore.getComponentCodeByType('participants-sample', 'sql', 'sql') || ``;
        const participantsSample = selectedSystemStore.selectedSystem.db.query(participantsSampleQuery)
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

        const getParticipantsQuery: string = componentCodeStore.getComponentCodeByType('participants-list', 'sql', 'sql') || ``;

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
        const getParticipantAllergensQuery: string = componentCodeStore.getComponentCodeByType('participants-allergens', 'sql', 'sql') || ``;

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
        const getParticipantSessionsQuery: string = componentCodeStore.getComponentCodeByType('participants-sessions', 'sql', 'sql') || ``;

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
        const sessionsQuery = componentCodeStore.getComponentCodeByType('sessions-list', 'sql', 'sql') || ``;
        const _sessions = selectedSystemStore.selectedSystem.db.query(sessionsQuery).results || []
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
        const insertQuery = componentCodeStore.getComponentCodeByType('participant-insert', 'sql', 'sql') || ``;
        const result = selectedSystemStore.selectedSystem.db.query(insertQuery, [data.name, data.email, data.personal_number, data.phone, data.address, data.age])

        if (result.success) {
            // Get the inserted participant ID
            const getIdQuery = componentCodeStore.getComponentCodeByType('participant-get-id', 'sql', 'sql') || ``;
            const participantId = selectedSystemStore.selectedSystem.db.query(getIdQuery, [data.name, data.email]).results[0]?.participant_id

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
        const updateQuery = componentCodeStore.getComponentCodeByType('participant-update', 'sql', 'sql') || ``;
        const result = selectedSystemStore.selectedSystem.db.query(updateQuery, [data.name, data.email, data.personal_number, data.phone, data.address, data.age, selectedParticipant.value.id])

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
        const deleteQuery = componentCodeStore.getComponentCodeByType('participant-delete', 'sql', 'sql') || ``;
        selectedSystemStore.selectedSystem?.db?.query(deleteQuery, [participant.id])
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
            const insertQuery = componentCodeStore.getComponentCodeByType('session-participant-insert', 'sql', 'sql') || ``;
            selectedSystemStore.selectedSystem.db.query(insertQuery, [sessionId, participantId])
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
            const deleteQuery = componentCodeStore.getComponentCodeByType('session-participant-delete', 'sql', 'sql') || ``;
            selectedSystemStore.selectedSystem.db.query(deleteQuery, [sessionId, participantId])
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
        const query = componentCodeStore.getComponentCodeByType('participant-allergen-ids', 'sql', 'sql') || ``;
        const result = selectedSystemStore.selectedSystem.db.query(query, [participantId])
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
            const insertQuery = componentCodeStore.getComponentCodeByType('participant-allergen-insert', 'sql', 'sql') || ``;
            selectedSystemStore.selectedSystem.db.query(insertQuery, [participantId, allergenId])
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
            const deleteQuery = componentCodeStore.getComponentCodeByType('participant-allergen-delete', 'sql', 'sql') || ``;
            selectedSystemStore.selectedSystem.db.query(deleteQuery, [participantId, allergenId])
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
    if (!ComponentManager.areComponentsInitialized()) {
        ComponentManager.initializeComponents()
    }
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
</style>