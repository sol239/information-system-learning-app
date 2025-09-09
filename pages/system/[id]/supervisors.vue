<template>
    <div>
        <LocalNavbar />
        <!-- TODO: move to components -->

        <div class="container mx-auto px-4 py-8">
            <div class="flex items-center gap-4 mb-6">

                <!-- Session Select Menu-->
                <div class="highlightable" :id="'supervisors-session-menu'"
                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-session-menu', $event)">
                    <div class="component-wrapper">
                        <USelect v-model="value" :items="filterSessionsItems"
                            :disabled="highlightStore.isEditModeActive" />
                        <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive"
                            :componentId="'sessions-list'" class="edit-button" />
                    </div>
                </div>

                <!-- Session Capacity Pillow -->
                <div v-if="selectedSessionInfo" class="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <UIcon name="i-heroicons-user-group" class="w-4 h-4 text-gray-600" />

                    <!-- Session Capacity Count -->
                    <div class="highlightable" :id="'supervisors-capacity-count'"
                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-capacity-count', $event)">
                        <div class="component-wrapper">
                            <span class="text-sm font-medium text-gray-700">
                                {{ t('supervisors') }}: {{ selectedSessionInfo.currentCount }}
                            </span>
                            <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive"
                                :componentId="'supervisors-capacity-count'" class="edit-button" />
                        </div>
                    </div>

                </div>

                <!-- Pagination -->
                <div v-if="totalPages > 1" class="flex justify-center items-center gap-4">
                    <UButton variant="outline" color="violet" icon="i-heroicons-chevron-left"
                        :disabled="currentPage === 1" @click="currentPage--">
                        {{ t('previous') }}
                    </UButton>

                    <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-600 highlightable" id="supervisors-page-count-1"
                            @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-page-count-1', $event)">
                            {{ t('page') }} {{ currentPage }} {{ t('of') }} {{ totalPages }}
                        </span>
                        <span class="text-xs text-gray-500 highlightable" id="supervisors-page-count-2"
                            @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-page-count-2', $event)">
                            ({{ filteredParticipants.length }} {{ t('supervisors') }})
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
                    <!-- Add Supervisor Button (right) -->
                    <UButton color="violet" variant="outline" @click="createNewParticipant" icon="i-heroicons-plus">
                        {{ t('add_supervisor') }}
                    </UButton>
                </div>
            </div>

            <!-- Custom Add Participant Drawer -->
            <div v-if="addModalOpen" class="custom-drawer-overlay" @click="resetForm" style="z-index: 5000;">
                <div class="custom-drawer" :class="{ 'open': addModalOpen }" @click.stop>
                    <div class="drawer-content">
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
                                        <input
                                            :class="['form-input', { 'border-red-500': !newParticipantNameComputed, 'border-sky-500': newParticipantNameComputed }]"
                                            id="name" v-model="newParticipant.name"
                                            placeholder="Zadejte jméno účastníka" type="text"
                                            :disabled="highlightStore.isHighlightMode" />
                                        <div v-if="newParticipantNameError" class="text-red-500 text-sm mt-1 font-bold">
                                            {{ newParticipantNameError }}
                                        </div>
                                        <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive"
                                            :componentId="'validation-name'" class="edit-button" />
                                    </div>
                                </div>
                                <div class="highlightable" id="participants-add-email"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-email', $event)">
                                    <div class="component-wrapper">
                                        <label for="email"
                                            class="block text-sm font-medium text-white mb-1">E-mail</label>
                                        <input
                                            :class="['form-input', { 'border-red-500': !newParticipantEmailComputed, 'border-sky-500': newParticipantEmailComputed }]"
                                            id="email" v-model="newParticipant.email" type="email"
                                            placeholder="email@example.com"
                                            :disabled="highlightStore.isHighlightMode" />
                                        <div v-if="newParticipantEmailError"
                                            class="text-red-500 text-sm mt-1 font-bold">
                                            {{ newParticipantEmailError }}
                                        </div>
                                        <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive"
                                            :componentId="'validation-email'" class="edit-button" />
                                    </div>
                                </div>
                                <div class="highlightable" id="participants-add-personal_number"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-personal_number', $event)">
                                    <div class="component-wrapper">
                                        <label for="personal_number"
                                            class="block text-sm font-medium text-white mb-1">Rodné číslo</label>
                                        <input
                                            :class="['form-input', { 'border-red-500': !newParticipantPersonalNumberComputed, 'border-sky-500': newParticipantPersonalNumberComputed }]"
                                            id="personal_number" v-model="newParticipant.personal_number"
                                            placeholder="123456/7890" type="text"
                                            :disabled="highlightStore.isHighlightMode" />
                                        <div v-if="newParticipantPersonalNumberError"
                                            class="text-red-500 text-sm mt-1 font-bold">
                                            {{ newParticipantPersonalNumberError }}
                                        </div>
                                        <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive"
                                            :componentId="'validation-personal-number'" class="edit-button" />
                                    </div>
                                </div>
                                <div class="highlightable" id="participants-add-phone"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-phone', $event)">
                                    <div class="component-wrapper">
                                        <label for="phone"
                                            class="block text-sm font-medium text-white mb-1">Telefon</label>
                                        <input
                                            :class="['form-input', { 'border-red-500': !newParticipantPhoneComputed, 'border-sky-500': newParticipantPhoneComputed }]"
                                            id="phone" v-model="newParticipant.phone" type="tel"
                                            placeholder="+420 123 456 789" :disabled="highlightStore.isHighlightMode" />
                                        <div v-if="newParticipantPhoneError"
                                            class="text-red-500 text-sm mt-1 font-bold">
                                            {{ newParticipantPhoneError }}
                                        </div>
                                        <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive"
                                            :componentId="'validation-phone'" class="edit-button" />
                                    </div>
                                </div>
                                <div class="highlightable" id="participants-add-address"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-address', $event)">
                                    <div class="component-wrapper">
                                        <label for="address"
                                            class="block text-sm font-medium text-white mb-1">Adresa</label>
                                        <textarea
                                            :class="['form-textarea', { 'border-red-500': !newParticipantAddressComputed, 'border-sky-500': newParticipantAddressComputed }]"
                                            id="address" v-model="newParticipant.address"
                                            placeholder="Ulice číslo, město, PSČ" rows="2"
                                            :disabled="highlightStore.isHighlightMode"></textarea>
                                        <div v-if="newParticipantAddressError"
                                            class="text-red-500 text-sm mt-1 font-bold">
                                            {{ newParticipantAddressError }}
                                        </div>
                                    </div>
                                </div>
                                <div class="highlightable" id="participants-add-age"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-age', $event)">
                                    <div class="component-wrapper">
                                        <label for="age" class="block text-sm font-medium text-white mb-1">Věk</label>
                                        <input
                                            :class="['form-input', { 'border-red-500': !newParticipantAgeComputed, 'border-sky-500': newParticipantAgeComputed }]"
                                            id="age" v-model="newParticipant.age" type="number" min="1" max="100"
                                            placeholder="18" :disabled="highlightStore.isHighlightMode" />
                                        <div v-if="newParticipantAgeError" class="text-red-500 text-sm mt-1 font-bold">
                                            {{ newParticipantAgeError }}
                                        </div>
                                    </div>
                                </div>
                                <div class="highlightable" id="participants-add-session"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-session', $event)">
                                    <div class="component-wrapper">
                                        <label for="sessionId"
                                            class="block text-sm font-medium text-white mb-1">Turnus</label>
                                        <USelect :color="newParticipantSessionIdComputed ? 'sky' : 'red'" id="sessionId"
                                            v-model="newParticipant.sessionId" :items="sessionOptions"
                                            placeholder="Vyberte turnus" multiple
                                            :disabled="highlightStore.isHighlightMode" />
                                        <div v-if="newParticipantSessionIdError"
                                            class="text-red-500 text-sm mt-1 font-bold">
                                            {{ newParticipantSessionIdError }}
                                        </div>
                                    </div>
                                </div>
                                <div class="highlightable" id="participants-add-allergens"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-allergens', $event)">
                                    <div class="component-wrapper">
                                        <label for="allergens"
                                            class="block text-sm font-medium text-white mb-1">Alergeny</label>
                                        <USelect :color="newParticipantAllergensComputed ? 'sky' : 'red'" id="allergens"
                                            v-model="newParticipant.allergens" :items="allergenOptions" multiple
                                            placeholder="Vyberte alergeny" :disabled="highlightStore.isHighlightMode" />
                                        <div v-if="newParticipantAllergensError"
                                            class="text-red-500 text-sm mt-1 font-bold">
                                            {{ newParticipantAllergensError }}
                                        </div>
                                    </div>
                                </div>
                                <div class="flex flex-col gap-3 pt-4">
                                    <UButton type="submit" color="sky" :loading="isSubmitting"
                                        :disabled="hasValidationErrors">
                                        {{ t('add') }}
                                    </UButton>
                                    <UButton variant="outline" color="sky" @click="resetForm">
                                        {{ t('cancel') }}
                                    </UButton>
                                </div>
                            </UForm>
                        </UCard>
                    </div>
                </div>
            </div>

            <!-- Supervisors Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="supervisor in paginatedParticipants" :key="supervisor.id" class="participant-card">
                    <div class="highlightable" :id="'supervisors-card-' + supervisor.id"
                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-card-' + supervisor.id, $event)">
                        <div class="component-wrapper">
                            <!-- Participant Header -->
                            <div class="participant-header">
                                <div class="flex items-center justify-between mb-4">
                                    <h3 class="text-xl font-semibold text-gray-900">
                                        {{ supervisor.name }}
                                    </h3>
                                    <UBadge size="lg" color="sky" variant="soft">
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

                            </div>
                            <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive"
                                :componentId="'supervisors-list'" class="edit-button" />
                        </div>
                    </div>

                    <div class="highlightable relative" :id="'supervisor-allergens'"
                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisor-allergens', $event)">
                        <!-- Allergies Badge -->
                        <UBadge size="lg" :color="getParticipantAllergenCount(supervisor.id) > 0 ? 'red' : 'green'"
                            variant="soft" class="mt-2">
                            {{ t("allergens") }}: {{ getParticipantAllergenCount(supervisor.id) }}
                        </UBadge>
                        <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive"
                            :componentId="'supervisor-allergen-count'" class="absolute -top-1 -right-1 z-10" />
                    </div>

                    <!-- Participant Actions -->
                    <div class="participant-actions mt-6 pt-4 border-t border-gray-200">
                        <div class="flex gap-2">
                            <!-- Edit Participant Button only -->
                            <div class="ml-auto">
                                <UButton size="sm" color="sky" variant="solid"
                                    @click="viewParticipantDetails(supervisor)" class="flex-1">
                                    {{ t('view_details') }}
                                </UButton>
                            </div>
                            <div class="highlightable" :id="'supervisors-delete-button-' + supervisor.id" @click="highlightStore.isHighlightMode || highlightStore.isEditModeActive
                                ? highlightStore.highlightHandler.selectElement('supervisors-delete-button-' + supervisor.id, $event)
                                : removeParticipant(supervisor)">
                                <div class="component-wrapper">
                                    <UButton size="sm" color="red" variant="outline">
                                        {{ t('delete') }}
                                    </UButton>
                                    <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive"
                                        :componentId="'supervisor-delete'" class="edit-button" />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>



            <!-- Empty State -->
            <div v-if="filteredParticipants.length === 0" class="empty-state">
                <UIcon name="i-heroicons-user-x-mark" class="empty-icon" />
                <h3 class="empty-title">{{ t('no_supervisors') }}</h3>
                <p class="empty-description">{{ t('no_participants_description') }}</p>
                <UButton color="sky" @click="createNewParticipant" class="mt-4">
                    {{ t('add_supervisor') }}
                </UButton>
            </div>

            <!-- Custom Add Participant Drawer -->
            <div v-if="addModalOpen" class="custom-drawer-overlay" @click="resetForm" style="z-index: 5000;">
                <div class="custom-drawer" :class="{ 'open': addModalOpen }" @click.stop>
                    <div class="drawer-content">
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
                                        <input
                                            :class="['form-input', { 'border-red-500': !newParticipantNameComputed, 'border-sky-500': newParticipantNameComputed }]"
                                            id="name" v-model="newParticipant.name"
                                            placeholder="Zadejte jméno účastníka" type="text"
                                            :disabled="highlightStore.isHighlightMode" />
                                        <div v-if="newParticipantNameError" class="text-red-500 text-sm mt-1 font-bold">
                                            {{ newParticipantNameError }}
                                        </div>
                                        <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive"
                                            :componentId="'validation-name'" class="edit-button" />
                                    </div>
                                </div>
                                <div class="highlightable" id="participants-add-email"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-email', $event)">
                                    <div class="component-wrapper">
                                        <label for="email"
                                            class="block text-sm font-medium text-white mb-1">E-mail</label>
                                        <input
                                            :class="['form-input', { 'border-red-500': !newParticipantEmailComputed, 'border-sky-500': newParticipantEmailComputed }]"
                                            id="email" v-model="newParticipant.email" type="email"
                                            placeholder="email@example.com"
                                            :disabled="highlightStore.isHighlightMode" />
                                        <div v-if="newParticipantEmailError"
                                            class="text-red-500 text-sm mt-1 font-bold">
                                            {{ newParticipantEmailError }}
                                        </div>
                                        <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive"
                                            :componentId="'validation-email'" class="edit-button" />
                                    </div>
                                </div>
                                <div class="highlightable" id="participants-add-personal_number"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-personal_number', $event)">
                                    <div class="component-wrapper">
                                        <label for="personal_number"
                                            class="block text-sm font-medium text-white mb-1">Rodné
                                            číslo</label>
                                        <input
                                            :class="['form-input', { 'border-red-500': !newParticipantPersonalNumberComputed, 'border-sky-500': newParticipantPersonalNumberComputed }]"
                                            id="personal_number" v-model="newParticipant.personal_number"
                                            placeholder="123456/7890" type="text"
                                            :disabled="highlightStore.isHighlightMode" />
                                        <div v-if="newParticipantPersonalNumberError"
                                            class="text-red-500 text-sm mt-1 font-bold">
                                            {{ newParticipantPersonalNumberError }}
                                        </div>
                                        <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive"
                                            :componentId="'validation-personal-number'" class="edit-button" />
                                    </div>
                                </div>
                                <div class="highlightable" id="participants-add-phone"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-phone', $event)">
                                    <div class="component-wrapper">
                                        <label for="phone"
                                            class="block text-sm font-medium text-white mb-1">Telefon</label>
                                        <input
                                            :class="['form-input', { 'border-red-500': !newParticipantPhoneComputed, 'border-sky-500': newParticipantPhoneComputed }]"
                                            id="phone" v-model="newParticipant.phone" type="tel"
                                            placeholder="+420 123 456 789" :disabled="highlightStore.isHighlightMode" />
                                        <div v-if="newParticipantPhoneError"
                                            class="text-red-500 text-sm mt-1 font-bold">
                                            {{ newParticipantPhoneError }}
                                        </div>
                                        <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive"
                                            :componentId="'validation-phone'" class="edit-button" />
                                    </div>
                                </div>
                                <div class="highlightable" id="participants-add-address"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-address', $event)">
                                    <div class="component-wrapper">
                                        <label for="address"
                                            class="block text-sm font-medium text-white mb-1">Adresa</label>
                                        <textarea
                                            :class="['form-textarea', { 'border-red-500': !newParticipantAddressComputed, 'border-sky-500': newParticipantAddressComputed }]"
                                            id="address" v-model="newParticipant.address"
                                            placeholder="Ulice číslo, město, PSČ" rows="2"
                                            :disabled="highlightStore.isHighlightMode"></textarea>
                                        <div v-if="newParticipantAddressError"
                                            class="text-red-500 text-sm mt-1 font-bold">
                                            {{ newParticipantAddressError }}
                                        </div>
                                        <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive"
                                            :componentId="'participants-add-address'" class="edit-button" />
                                    </div>
                                </div>
                                <div class="highlightable" id="participants-add-age"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-age', $event)">
                                    <div class="component-wrapper">
                                        <label for="age" class="block text-sm font-medium text-white mb-1">Věk</label>
                                        <input
                                            :class="['form-input', { 'border-red-500': !newParticipantAgeComputed, 'border-sky-500': newParticipantAgeComputed }]"
                                            id="age" v-model="newParticipant.age" type="number" min="1" max="100"
                                            placeholder="18" :disabled="highlightStore.isHighlightMode" />
                                        <div v-if="newParticipantAgeError" class="text-red-500 text-sm mt-1 font-bold">
                                            {{ newParticipantAgeError }}
                                        </div>
                                        <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive"
                                            :componentId="'participants-add-age'" class="edit-button" />
                                    </div>
                                </div>
                                <div class="highlightable" id="participants-add-session"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-session', $event)">
                                    <div class="component-wrapper">
                                        <label for="sessionId"
                                            class="block text-sm font-medium text-white mb-1">Turnus</label>
                                        <USelect :color="newParticipantSessionIdComputed ? 'sky' : 'red'" id="sessionId"
                                            v-model="newParticipant.sessionId" :items="sessionOptions"
                                            placeholder="Vyberte turnus" multiple
                                            :disabled="highlightStore.isHighlightMode" />
                                        <div v-if="newParticipantSessionIdError"
                                            class="text-red-500 text-sm mt-1 font-bold">
                                            {{ newParticipantSessionIdError }}
                                        </div>
                                        <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive"
                                            :componentId="'participants-add-session'" class="edit-button" />
                                    </div>
                                </div>
                                <div class="highlightable" id="participants-add-allergens"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-add-allergens', $event)">
                                    <div class="component-wrapper">
                                        <label for="allergens"
                                            class="block text-sm font-medium text-white mb-1">Alergeny</label>
                                        <USelect :color="newParticipantAllergensComputed ? 'sky' : 'red'" id="allergens"
                                            v-model="newParticipant.allergens" :items="allergenOptions" multiple
                                            placeholder="Vyberte alergeny" :disabled="highlightStore.isHighlightMode" />
                                        <div v-if="newParticipantAllergensError"
                                            class="text-red-500 text-sm mt-1 font-bold">
                                            {{ newParticipantAllergensError }}
                                        </div>
                                        <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive"
                                            :componentId="'participants-add-allergens'" class="edit-button" />
                                    </div>
                                </div>
                                <div class="flex flex-col gap-3 pt-4">
                                    <UButton type="submit" color="sky" :loading="isSubmitting"
                                        :disabled="hasValidationErrors">
                                        {{ t('add') }}
                                    </UButton>
                                    <UButton variant="outline" color="sky" @click="resetForm">
                                        {{ t('cancel') }}
                                    </UButton>
                                </div>
                            </UForm>
                        </UCard>
                    </div>
                </div>
            </div>

            <!-- Custom Edit Participant Drawer -->
            <div v-if="editModalOpen" class="custom-drawer-overlay" @click="resetForm" style="z-index: 5000;">
                <div class="custom-drawer" :class="{ 'open': editModalOpen }" @click.stop>
                    <div class="drawer-content">
                        <UCard class="p-4 min-w-96">
                            <template #header>
                                <h3 class="text-lg font-semibold">{{ t('participant_details') }}</h3>
                            </template>

                            <UForm v-if="selectedParticipant" :state="selectedParticipant"
                                @submit="handleEditParticipant(selectedParticipant)" class="flex flex-col space-y-4">
                                <div class="highlightable" id="participants-edit-name"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-edit-name', $event)">
                                    <div class="component-wrapper">
                                        <label for="edit-name"
                                            class="block text-sm font-medium text-white mb-1">Jméno</label>
                                        <input
                                            :class="['form-input', { 'border-red-500': !editParticipantNameComputed, 'border-sky-500': editParticipantNameComputed }]"
                                            id="edit-name" v-model="selectedParticipant.name"
                                            placeholder="Zadejte jméno účastníka" type="text"
                                            :disabled="highlightStore.isHighlightMode" />
                                        <div v-if="editParticipantNameError"
                                            class="text-red-500 text-sm mt-1 font-bold">
                                            {{ editParticipantNameError }}
                                        </div>
                                        <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive"
                                            :componentId="'validation-name'" class="edit-button" />
                                    </div>
                                </div>
                                <div class="highlightable" id="participants-edit-email"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-edit-email', $event)">
                                    <div class="component-wrapper">
                                        <label for="edit-email"
                                            class="block text-sm font-medium text-white mb-1">E-mail</label>
                                        <input
                                            :class="['form-input', { 'border-red-500': !editParticipantEmailComputed, 'border-sky-500': editParticipantEmailComputed }]"
                                            id="edit-email" v-model="selectedParticipant.email" type="email"
                                            placeholder="email@example.com"
                                            :disabled="highlightStore.isHighlightMode" />
                                        <div v-if="editParticipantEmailError"
                                            class="text-red-500 text-sm mt-1 font-bold">
                                            {{ editParticipantEmailError }}
                                        </div>
                                        <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive"
                                            :componentId="'validation-email'" class="edit-button" />
                                    </div>
                                </div>
                                <div class="highlightable" id="participants-edit-personal_number"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-edit-personal_number', $event)">
                                    <div class="component-wrapper">
                                        <label for="edit-personal_number"
                                            class="block text-sm font-medium text-white mb-1">Rodné
                                            číslo</label>
                                        <input
                                            :class="['form-input', { 'border-red-500': !editParticipantPersonalNumberComputed, 'border-sky-500': editParticipantPersonalNumberComputed }]"
                                            id="edit-personal_number" v-model="selectedParticipant.personal_number"
                                            placeholder="123456/7890" type="text"
                                            :disabled="highlightStore.isHighlightMode" />
                                        <div v-if="editParticipantPersonalNumberError"
                                            class="text-red-500 text-sm mt-1 font-bold">
                                            {{ editParticipantPersonalNumberError }}
                                        </div>
                                        <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive"
                                            :componentId="'validation-personal-number'" class="edit-button" />
                                    </div>
                                </div>
                                <div class="highlightable" id="participants-edit-phone"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-edit-phone', $event)">
                                    <div class="component-wrapper">
                                        <label for="edit-phone"
                                            class="block text-sm font-medium text-white mb-1">Telefon</label>
                                        <input
                                            :class="['form-input', { 'border-red-500': !editParticipantPhoneComputed, 'border-sky-500': editParticipantPhoneComputed }]"
                                            id="edit-phone" v-model="selectedParticipant.phone" type="tel"
                                            placeholder="+420 123 456 789" :disabled="highlightStore.isHighlightMode" />
                                        <div v-if="editParticipantPhoneError"
                                            class="text-red-500 text-sm mt-1 font-bold">
                                            {{ editParticipantPhoneError }}
                                        </div>
                                        <EditComponentModalOpenButton v-if="highlightStore.isEditModeActive"
                                            :componentId="'validation-phone'" class="edit-button" />
                                    </div>
                                </div>
                                <div class="highlightable" id="participants-edit-address"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-edit-address', $event)">
                                    <div class="component-wrapper">
                                        <label for="edit-address"
                                            class="block text-sm font-medium text-white mb-1">Adresa</label>
                                        <textarea
                                            :class="['form-textarea', { 'border-red-500': !editParticipantAddressComputed, 'border-sky-500': editParticipantAddressComputed }]"
                                            id="edit-address" v-model="selectedParticipant.address"
                                            placeholder="Ulice číslo, město, PSČ" rows="2"
                                            :disabled="highlightStore.isHighlightMode"></textarea>
                                        <div v-if="editParticipantAddressError"
                                            class="text-red-500 text-sm mt-1 font-bold">
                                            {{ editParticipantAddressError }}
                                        </div>
                                    </div>
                                </div>
                                <div class="highlightable" id="participants-edit-age"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-edit-age', $event)">
                                    <div class="component-wrapper">
                                        <label for="edit-age"
                                            class="block text-sm font-medium text-white mb-1">Věk</label>
                                        <input
                                            :class="['form-input', { 'border-red-500': !editParticipantAgeComputed, 'border-sky-500': editParticipantAgeComputed }]"
                                            id="edit-age" v-model="selectedParticipant.age" type="number" min="1"
                                            max="100" placeholder="18" :disabled="highlightStore.isHighlightMode" />
                                        <div v-if="editParticipantAgeError" class="text-red-500 text-sm mt-1 font-bold">
                                            {{ editParticipantAgeError }}
                                        </div>
                                    </div>
                                </div>
                                <!-- Allergen Edit Field -->
                                <div class="highlightable" id="participants-edit-allergens"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-edit-allergens', $event)">
                                    <div class="component-wrapper">
                                        <label for="edit-allergens"
                                            class="block text-sm font-medium text-white mb-1">Alergeny</label>
                                        <USelect :color="editParticipantAllergensComputed ? 'sky' : 'red'"
                                            id="edit-allergens" v-model="selectedParticipant.allergens"
                                            :items="allergenOptions" multiple placeholder="Vyberte alergeny"
                                            :disabled="highlightStore.isHighlightMode" />
                                    </div>
                                </div>
                                <div class="highlightable" id="participants-edit-sessions"
                                    @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('participants-edit-sessions', $event)">
                                    <div class="component-wrapper">
                                        <label for="edit-sessions"
                                            class="block text-sm font-medium text-white mb-1">Turnus</label>

                                        <USelect :color="editParticipantSessionsComputed ? 'sky' : 'red'"
                                            id="edit-sessions" v-model="selectedParticipant.sessions"
                                            :items="sessionOptions" placeholder="Vyberte turnus" multiple
                                            :disabled="highlightStore.isHighlightMode" />
                                    </div>
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
                    </div>
                </div>
            </div>

        </div>



    </div>


    <EditComponentModal v-if="highlightStore.isEditModeActive && highlightStore.selectedComponentId" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSelectedSystemStore } from '#imports'
import { Supervisor } from '~/model/Supervisor'
import { Session } from '~/model/Session'
import { useHighlightStore } from '#imports'
import { useComponentCodeStore } from '~/stores/useComponentCodeStore'
import { ComponentHandler } from '~/composables/ComponentHandler'
import { ComponentManager } from '~/composables/ComponentManager'
import { useHighlightWatchers } from '~/composables/highlightWatchers'
import { useToast } from '#imports'
import EditComponentModal from '~/components/EditComponentModal.vue'
import EditComponentModalOpenButton from '~/components/EditComponentModalOpenButton.vue'
import { Participant } from '~/model/Participant'

const selectedSystemStore = useSelectedSystemStore()
const { t } = useI18n()
const highlightStore = useHighlightStore()
const componentCodeStore = useComponentCodeStore()

// Component definitions
const participantsCapacityCountComponent = computed(() => componentCodeStore.getComponentById('supervisors-capacity-count') || componentCodeStore.getDefaultComponent('supervisors-capacity-count'))
const participantsCapacityPercentageComponent = computed(() => componentCodeStore.getComponentById('supervisors-capacity-percentage') || componentCodeStore.getDefaultComponent('supervisors-capacity-percentage'))
const participantsPageCount1Component = computed(() => componentCodeStore.getComponentById('supervisors-page-count-1') || componentCodeStore.getDefaultComponent('supervisors-page-count-1'))
const participantsPageCount2Component = computed(() => componentCodeStore.getComponentById('supervisors-page-count-2') || componentCodeStore.getDefaultComponent('supervisors-page-count-2'))
const participantsFilterResetComponent = computed(() => componentCodeStore.getComponentById('supervisors-filter-reset') || componentCodeStore.getDefaultComponent('supervisors-filter-reset'))
const participantsFilterInputComponent = computed(() => componentCodeStore.getComponentById('supervisors-filter-input') || componentCodeStore.getDefaultComponent('supervisors-filter-input'))
const participantsSessionMenuComponent = computed(() => componentCodeStore.getComponentById('supervisors-session-menu') || componentCodeStore.getDefaultComponent('supervisors-session-menu'))
const participantAllergenCountComponent = computed(() => componentCodeStore.getComponentById('supervisor-allergen-count') || componentCodeStore.getDefaultComponent('supervisor-allergen-count'))

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

const correctParticipantAllergenCountSql = computed(() => participantAllergenCountComponent.value?.sql?.['sql'] || '')
const participantsCapacityCountSqlTotal = computed(() => {
    if (value.value === 'all') {
        return ComponentHandler.getComponentValue('supervisors-capacity-count', 'sql-total-all', correctParticipantsCapacityCountSqlTotalAll.value)
    } else {
        return ComponentHandler.getComponentValue('supervisors-capacity-count', 'sql-total-session', correctParticipantsCapacityCountSqlTotalSession.value)
    }
})
const participantsCapacityCountSqlCurrent = computed(() => {
    if (value.value === 'all') {
        return ComponentHandler.getComponentValue('supervisors-capacity-count', 'sql-current-all', correctParticipantsCapacityCountSqlCurrentAll.value)
    } else {
        return ComponentHandler.getComponentValue('supervisors-capacity-count', 'sql-current-session', correctParticipantsCapacityCountSqlCurrentSession.value)
    }
})

const participantsCapacityPercentageJs = computed(() => ComponentHandler.getComponentValue('supervisors-capacity-percentage', 'js', correctParticipantsCapacityPercentageJs.value))

const participantsPageCount1Sql = computed(() => ComponentHandler.getComponentValue('supervisors-page-count-1', 'sql', correctParticipantsPageCount1Sql.value))
const participantsPageCount1Js = computed(() => ComponentHandler.getComponentValue('supervisors-page-count-1', 'js', correctParticipantsPageCount1Js.value))
const participantsPageCount1Html = computed(() => ComponentHandler.getComponentValue('supervisors-page-count-1', 'html', correctParticipantsPageCount1Html.value))
const participantsPageCount1Css = computed(() => ComponentHandler.getComponentValue('supervisors-page-count-1', 'css', correctParticipantsPageCount1Css.value))

const participantsPageCount2Sql = computed(() => ComponentHandler.getComponentValue('supervisors-page-count-2', 'sql', correctParticipantsPageCount2Sql.value))
const participantsPageCount2Js = computed(() => ComponentHandler.getComponentValue('supervisors-page-count-2', 'js', correctParticipantsPageCount2Js.value))
const participantsPageCount2Html = computed(() => ComponentHandler.getComponentValue('supervisors-page-count-2', 'html', correctParticipantsPageCount2Html.value))
const participantsPageCount2Css = computed(() => ComponentHandler.getComponentValue('supervisors-page-count-2', 'css', correctParticipantsPageCount2Css.value))

const participantsFilterResetSql = computed(() => ComponentHandler.getComponentValue('supervisors-filter-reset', 'sql', correctParticipantsFilterResetSql.value))
const participantsFilterResetJs = computed(() => ComponentHandler.getComponentValue('supervisors-filter-reset', 'js', correctParticipantsFilterResetJs.value))
const participantsFilterResetHtml = computed(() => ComponentHandler.getComponentValue('supervisors-filter-reset', 'html', correctParticipantsFilterResetHtml.value))
const participantsFilterResetCss = computed(() => ComponentHandler.getComponentValue('supervisors-filter-reset', 'css', correctParticipantsFilterResetCss.value))

const participantsFilterInputSql = computed(() => ComponentHandler.getComponentValue('supervisors-filter-input', 'sql', correctParticipantsFilterInputSql.value))
const participantsFilterInputJs = computed(() => ComponentHandler.getComponentValue('supervisors-filter-input', 'js', correctParticipantsFilterInputJs.value))
const participantsFilterInputHtml = computed(() => ComponentHandler.getComponentValue('supervisors-filter-input', 'html', correctParticipantsFilterInputHtml.value))
const participantsFilterInputCss = computed(() => ComponentHandler.getComponentValue('supervisors-filter-input', 'css', correctParticipantsFilterInputCss.value))

const participantsSessionMenuSql = computed(() => ComponentHandler.getComponentValue('supervisors-session-menu', 'sql', correctParticipantsSessionMenuSql.value))
const participantsSessionMenuJs = computed(() => ComponentHandler.getComponentValue('supervisors-session-menu', 'js', correctParticipantsSessionMenuJs.value))
const participantsSessionMenuHtml = computed(() => ComponentHandler.getComponentValue('supervisors-session-menu', 'html', correctParticipantsSessionMenuHtml.value))
const participantsSessionMenuCss = computed(() => ComponentHandler.getComponentValue('supervisors-session-menu', 'css', correctParticipantsSessionMenuCss.value))

const participantAllergenCountSql = computed(() => ComponentHandler.getComponentValue('supervisor-allergen-count', 'sql', correctParticipantAllergenCountSql.value))

// sessions-list component wiring via ComponentManager/ComponentHandler
const sessionsListComponent = computed(() => componentCodeStore.getComponentById('sessions-list') || componentCodeStore.getDefaultComponent('sessions-list'))
const correctSessionsListSql = computed(() => sessionsListComponent.value?.sql?.['sql'] || '')
const sessionsListSql = computed(() => ComponentHandler.getComponentValue('sessions-list', 'sql', correctSessionsListSql.value))
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
// Holds Participant records (name kept for compatibility with existing computed chains)
const supervisors = ref<Participant[]>([])
const sessions = ref<Session[]>([])
const showDetailModal = ref(false)
const selectedSupervisor = ref<Supervisor | null>(null)
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



// Validation functions are now handled by computed properties for color-based validation


// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(6) // 3x3 grid
const totalPages = computed(() => {
    const pageCount = pageCountFunction.value(filteredParticipants.value.length, itemsPerPage.value)
    console.log("Total pages:", pageCount, "for", filteredParticipants.value.length, "items with", itemsPerPage.value, "per page")
    console.log("JS: ", correctParticipantsPageCount1Js.value)
    return pageCount;
})

const pageCountFunction = computed(() => new Function('totalItems', 'itemsPerPage', `return ${correctParticipantsPageCount1Js.value}`))


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
    const _ = selectedSystemStore.dbNumber
    const query: string = componentCodeStore.getComponentCodeByType('supervisors-allergen-options', 'sql', 'sql') || ``
    if (!query) return []
    const result = selectedSystemStore.selectedSystem?.db?.query(query)?.results || []
    return result.map((allergen: any) => ({
        label: allergen.name,
        value: allergen.allergen_id
    }))
})


const filteredParticipants = computed(() => {
    const _ = selectedSystemStore.dbNumber
    let arr = supervisors.value

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

// Individual computed properties for capacity pillow
const totalCapacity = computed(() => {
    const _ = selectedSystemStore.dbNumber  // Dependency tracking
    if (!selectedSystemStore.selectedSystem?.db || typeof selectedSystemStore.selectedSystem?.db?.query !== "function") {
        return 0
    }

    const totalCapacityQuery = participantsCapacityCountSqlTotal.value;
    if (!totalCapacityQuery) return 0;

    try {
        if (value.value === 'all') {
            const result = selectedSystemStore.selectedSystem.db.query(totalCapacityQuery)?.results || [];
            return result[0]?.count || 0;
        } else {
            const sessionId = Number(value.value);
            const result = selectedSystemStore.selectedSystem.db.query(totalCapacityQuery, [sessionId])?.results || [];
            return result[0]?.count || 0;
        }
    } catch (error) {
        console.error('Error querying total capacity:', error);
        return 0;
    }
})

const currentCount = computed(() => {
    const _ = selectedSystemStore.dbNumber
    if (!selectedSystemStore.selectedSystem?.db || typeof selectedSystemStore.selectedSystem?.db?.query !== "function") {
        return 0
    }

    const currentCountQuery = participantsCapacityCountSqlCurrent.value;
    if (!currentCountQuery) return 0;

    try {
        if (value.value === 'all') {
            const result = selectedSystemStore.selectedSystem.db.query(currentCountQuery)?.results || [];
            return result[0]?.count || 0;
        } else {
            const sessionId = Number(value.value);
            const result = selectedSystemStore.selectedSystem.db.query(currentCountQuery, [sessionId])?.results || [];
            return result[0]?.count || 0;
        }
    } catch (error) {
        console.error('Error querying current count:', error);
        return 0;
    }
})

const fillPercentage = computed(() => {
    const _ = selectedSystemStore.dbNumber
    if (totalCapacity.value === 0) {
        return 0;
    }

    const fillPercentageJs = participantsCapacityPercentageJs.value;
    if (!fillPercentageJs) return 0;

    try {
        const fillPercentageFunction = new Function('currentCount', 'totalCapacity', `return ${fillPercentageJs}`);
        return fillPercentageFunction(currentCount.value, totalCapacity.value);
    } catch (error) {
        console.error('Error evaluating fillPercentageJs:', error);
        return 0;
    }
})

const selectedSessionInfo = computed(() => ({
    currentCount: currentCount.value,
    totalCapacity: totalCapacity.value,
    fillPercentage: fillPercentage.value,
    isFull: currentCount.value >= totalCapacity.value,
    isNearFull: fillPercentage.value >= 80
}))

// Reactive database monitoring using computed hash
const participantsDataHash = computed(() => {
    const _ = selectedSystemStore.dbNumber
    if (!selectedSystemStore.selectedSystem?.db) return ''

    try {
        // Get supervisors count
        const participantsCountQuery = componentCodeStore.getComponentCodeByType('supervisors-count', 'sql', 'sql') || ``
        const participantsCount = participantsCountQuery
            ? (selectedSystemStore.selectedSystem.db.query(participantsCountQuery)?.results?.[0]?.count || 0)
            : 0

        // Get sessions count
        const sessionsCountQuery = componentCodeStore.getComponentCodeByType('sessions-count', 'sql', 'sql') || ``
        const sessionsCount = sessionsCountQuery
            ? (selectedSystemStore.selectedSystem.db.query(sessionsCountQuery)?.results?.[0]?.count || 0)
            : 0

        // Get sample of recent data to detect content changes
        const participantsSampleQuery = componentCodeStore.getComponentCodeByType('supervisors-sample', 'sql', 'sql') || ``
        const participantsSample = participantsSampleQuery
            ? selectedSystemStore.selectedSystem.db.query(participantsSampleQuery)
            : { results: [] }
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
        const getParticipantsQuery: string = componentCodeStore.getComponentCodeByType('supervisors-list', 'sql', 'sql') || ``
        if (!getParticipantsQuery) {
            supervisors.value = []
            return
        }

        const participantsResult = selectedSystemStore.selectedSystem.db.query(getParticipantsQuery)

        const participantsMap = new Map<number, Participant>()
        for (const row of participantsResult?.results || []) {
            const participant = new Participant(
                row.supervisor_id,
                row.name,
                row.email,
                row.personal_number,
                row.phone,
                row.address,
                row.age,
                [], // session IDs will be loaded below
                []  // allergens will be loaded below
            )
            participantsMap.set(participant.id, participant)
        }

        // get participant's allergens
        const getParticipantAllergensQuery: string = componentCodeStore.getComponentCodeByType('supervisors-allergens', 'sql', 'sql') || ``
        if (getParticipantAllergensQuery) {
            const allergensResult = selectedSystemStore.selectedSystem.db.query(getParticipantAllergensQuery)
            // Build a map of allergen_id to label for easy lookup
            const allergenLabelMap: Record<string, string> = {}
            const allergenOpts = allergenOptions.value
            for (const opt of allergenOpts) {
                allergenLabelMap[opt.value] = opt.label
            }

            for (const row of allergensResult?.results || []) {
                const participant = participantsMap.get(row.supervisor_id)
                if (participant) {
                    // Push the label instead of the ID
                    if (allergenLabelMap[row.allergen_id]) {
                        participant.allergens.push(allergenLabelMap[row.allergen_id])
                    }
                }
            }
        }

        // get participant's sessions
        const getParticipantSessionsQuery: string = componentCodeStore.getComponentCodeByType('supervisors-sessions', 'sql', 'sql') || ``
        if (getParticipantSessionsQuery) {
            const sessionsResult = selectedSystemStore.selectedSystem.db.query(getParticipantSessionsQuery)
            for (const row of sessionsResult?.results || []) {
                const participant = participantsMap.get(row.supervisor_id)
                if (participant) {
                    participant.sessions.push(row.session_id)
                }
            }
        }

        supervisors.value = Array.from(participantsMap.values())

        console.log('Participants loaded:', supervisors.value)

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
        const sessionsQuery = sessionsListSql.value
        if (!sessionsQuery) {
            sessions.value = []
            return
        }
        const _sessions = selectedSystemStore.selectedSystem.db.query(sessionsQuery).results || []
        sessions.value = _sessions.map((s: any) => ({
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

const getParticipantAllergenCount = (participantId: number): number => {
    if (!participantId) return 0;

    const _ = selectedSystemStore.dbNumber

    if (!selectedSystemStore.selectedSystem?.db || typeof selectedSystemStore.selectedSystem?.db?.query !== "function") {
        console.log("RETURNING ZERO")
        return 0
    }

    const allergenCountQuery = participantAllergenCountSql.value;
    console.log("QUERY: ", allergenCountQuery)
    if (!allergenCountQuery) return 0;

    try {
        const result = selectedSystemStore.selectedSystem.db.query(allergenCountQuery, [participantId])?.results || [];
        console.log("RESULT: ", result)
        return result[0]?.count || 0;
    } catch (error) {
        console.error('Error querying allergen count:', error);
        return 0;
    }
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
    // Check for validation errors before submitting
    if (hasValidationErrors.value) {
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
    try {
        // Insert participant first
        const insertQuery = componentCodeStore.getComponentCodeByType('supervisor-insert', 'sql', 'sql') || ``;
        const result = selectedSystemStore.selectedSystem.db.query(insertQuery, [data.name, data.email, data.personal_number, data.phone, data.address, data.age])

        if (result.success) {
            // Get the inserted participant ID
            const getIdQuery = componentCodeStore.getComponentCodeByType('supervisor-get-id', 'sql', 'sql') || ``;
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
    // Reset colors to default
    Object.keys(newParticipantColors.value).forEach(key => {
        newParticipantColors.value[key] = 'sky'
    })
    Object.keys(editParticipantColors.value).forEach(key => {
        editParticipantColors.value[key] = 'sky'
    })
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
        const originalParticipant = supervisors.value.find(p => p.id === selectedParticipant.value?.id)
        const oldSessionIds = originalParticipant?.sessions || []
        const oldAllergenIds = await getParticipantAllergenIds(selectedParticipant.value.id)

        console.log("EDIT DATA:", data)

        // Update participant basic info
        const updateQuery = componentCodeStore.getComponentCodeByType('supervisor-update', 'sql', 'sql') || ``;
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

const removeParticipant = async (participant: Participant) => {
    try {
        // Remove session associations
        if (participant.sessions?.length > 0) {
            await removeParticipantFromSessions(participant.id, participant.sessions)
        }

        // Remove allergen associations
        const allergenIds = await getParticipantAllergenIds(participant.id)
        if (allergenIds.length > 0) {
            await removeParticipantAllergens(participant.id, allergenIds)
        }

        // Delete participant
        const deleteQuery = componentCodeStore.getComponentCodeByType('supervisor-delete', 'sql', 'sql') || ``
        if (deleteQuery) {
            selectedSystemStore.selectedSystem?.db?.query(deleteQuery, [participant.id])
        }

        loadParticipantsFromDatabase()
        selectedSystemStore.incrementDbNumber() // Trigger DB change detection
        toast.add({
            title: t('participant_deleted_success', { name: participant.name }),
            color: 'primary',
            icon: 'i-lucide-trash-2'
        })
    } catch (e) {
        console.error('Error deleting participant:', e)
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

    for (const sessionId of sessionIds) {
        try {
            const insertQuery = componentCodeStore.getComponentCodeByType('session-supervisor-insert', 'sql', 'sql') || ``;
            if (insertQuery) {
                selectedSystemStore.selectedSystem.db.query(insertQuery, [sessionId, participantId])
            }
        } catch (error) {
            console.error(`Error adding participant ${participantId} to session ${sessionId}:`, error)
        }
    }
}

const removeParticipantFromSessions = async (participantId: number, sessionIds: number[]): Promise<void> => {
    if (!selectedSystemStore.selectedSystem?.db) return

    for (const sessionId of sessionIds) {
        try {
            const deleteQuery = componentCodeStore.getComponentCodeByType('session-supervisor-delete', 'sql', 'sql') || ``;
            if (deleteQuery) {
                selectedSystemStore.selectedSystem.db.query(deleteQuery, [sessionId, participantId])
            }
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
    try {
        const query = componentCodeStore.getComponentCodeByType('supervisor-allergen-ids', 'sql', 'sql') || ``
        if (!query) return []
        const result = selectedSystemStore.selectedSystem.db.query(query, [participantId])
        return result.results?.map((row: any) => row.allergen_id) || []
    } catch (error) {
        console.error(`Error getting allergen IDs for participant ${participantId}:`, error)
        return []
    }
}

const addParticipantAllergens = async (participantId: number, allergenIds: number[]): Promise<void> => {
    if (!selectedSystemStore.selectedSystem?.db) return

    for (const allergenId of allergenIds) {
        try {
            const insertQuery = componentCodeStore.getComponentCodeByType('supervisor-allergen-insert', 'sql', 'sql') || ``;
            if (insertQuery) {
                selectedSystemStore.selectedSystem.db.query(insertQuery, [participantId, allergenId])
            }
        } catch (error) {
            console.error(`Error adding allergen ${allergenId} to participant ${participantId}:`, error)
        }
    }
}

const removeParticipantAllergens = async (participantId: number, allergenIds: number[]): Promise<void> => {
    if (!selectedSystemStore.selectedSystem?.db) return

    for (const allergenId of allergenIds) {
        try {
            const deleteQuery = componentCodeStore.getComponentCodeByType('supervisor-allergen-delete', 'sql', 'sql') || ``;
            if (deleteQuery) {
                selectedSystemStore.selectedSystem.db.query(deleteQuery, [participantId, allergenId])
            }
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

// Reactive colors for form fields
const newParticipantColors = ref<Record<string, string>>({
    name: 'sky',
    email: 'sky',
    personal_number: 'sky',
    phone: 'sky',
    address: 'sky',
    age: 'sky',
    sessionId: 'sky',
    allergens: 'sky'
})

const editParticipantColors = ref<Record<string, string>>({
    name: 'sky',
    email: 'sky',
    personal_number: 'sky',
    phone: 'sky',
    address: 'sky',
    age: 'sky',
    sessions: 'sky',
    allergens: 'sky'
})

// Get validation components
const validationNameComponent = computed(() => componentCodeStore.getComponentById('validation-name') || componentCodeStore.getDefaultComponent('validation-name'))
const validationEmailComponent = computed(() => componentCodeStore.getComponentById('validation-email') || componentCodeStore.getDefaultComponent('validation-email'))
const validationPersonalNumberComponent = computed(() => componentCodeStore.getComponentById('validation-personal-number') || componentCodeStore.getDefaultComponent('validation-personal-number'))
const validationPhoneComponent = computed(() => componentCodeStore.getComponentById('validation-phone') || componentCodeStore.getDefaultComponent('validation-phone'))

// Validation functions using component validation logic
const isValidName = (name: string): boolean => {
    try {
        const jsCode = validationNameComponent.value?.js?.['isValidName'] || ''
        if (jsCode) {
            // Create a function that returns the isValidName function
            const func = new Function(`${jsCode}; return isValidName;`)
            const validatorFn = func()
            return validatorFn(name)
        }
    } catch (error) {
        console.error('Error loading isValidName function:', error)
    }
    return false
}

const isValidEmail = (email: string): boolean => {
    try {
        const jsCode = validationEmailComponent.value?.js?.['isValidEmail'] || ''
        if (jsCode) {
            const func = new Function(`${jsCode}; return isValidEmail;`)
            const validatorFn = func()
            return validatorFn(email)
        }
    } catch (error) {
        console.error('Error loading isValidEmail function:', error)
    }
    return false
}


const isValidPersonalNumber = (personalNumber: string): boolean => {
    try {
        const jsCode = validationPersonalNumberComponent.value?.js?.['isValidPersonalNumber'] || ''
        if (jsCode) {
            const func = new Function(`${jsCode}; return isValidPersonalNumber;`)
            const validatorFn = func()
            return validatorFn(personalNumber)
        }
    } catch (error) {
        console.error('Error loading isValidPersonalNumber function:', error)
    }
    return false
}

const isValidPhone = (phone: string): boolean => {
    try {
        const jsCode = validationPhoneComponent.value?.js?.['isValidPhone'] || ''
        if (jsCode) {
            const func = new Function(`${jsCode}; return isValidPhone;`)
            const validatorFn = func()
            return validatorFn(phone)
        }
    } catch (error) {
        console.error('Error loading isValidPhone function:', error)
    }
    return false
}

// Computed properties for validated fields using component validation functions
const newParticipantNameComputed = computed(() => {
    const value = newParticipant.value.name
    return isValidName(value)
})

const newParticipantEmailComputed = computed(() => {
    const value = newParticipant.value.email
    return isValidEmail(value)
})

const newParticipantPersonalNumberComputed = computed(() => {
    const value = newParticipant.value.personal_number
    console.log("JS code: ", validationPersonalNumberComponent.value?.js?.['isValidPersonalNumber'])
    console.log("Personal number: ", value, " is valid:", isValidPersonalNumber(value))
    return isValidPersonalNumber(value)
})

const newParticipantPhoneComputed = computed(() => {
    const value = newParticipant.value.phone
    return isValidPhone(value)
})

const newParticipantAddressComputed = computed(() => {
    // TODO: Add computed logic for address field
    const value = newParticipant.value.address
    return value && value.trim().length > 0
})

const newParticipantAgeComputed = computed(() => {
    // TODO: Add computed logic for age field
    const value = newParticipant.value.age
    return value && value >= 1 && value <= 100
})

const newParticipantSessionIdComputed = computed(() => {
    // Sessions are optional - always return true
    return true
})

const newParticipantAllergensComputed = computed(() => {
    // Allergens are optional - always return true
    return true
})

// Error message computed properties for new participant form
const newParticipantNameError = computed(() => {
    const value = newParticipant.value.name
    if (!value) {
        return 'Jméno je povinné'
    } else if (!isValidName(value)) {
        return 'Jméno musí obsahovat křestní jméno a příjmení (alespoň jedna mezera)'
    }
    return ''
})

const newParticipantEmailError = computed(() => {
    const value = newParticipant.value.email
    if (!value) {
        return 'E-mail je povinný'
    } else if (!isValidEmail(value)) {
        return 'Zadejte platnou e-mailovou adresu'
    }
    return ''
})

const newParticipantPersonalNumberError = computed(() => {
    const value = newParticipant.value.personal_number
    if (!value) {
        return 'Rodné číslo je povinné'
    } else if (!isValidPersonalNumber(value)) {
        return 'Rodné číslo musí být ve formátu xxxxxx/xxxx (např. 123456/7890)'
    }
    return ''
})

const newParticipantPhoneError = computed(() => {
    const value = newParticipant.value.phone
    if (!value) {
        return 'Telefon je povinný'
    } else if (!isValidPhone(value)) {
        return 'Zadejte platné telefonní číslo (např. +420 123 456 789 nebo 123456789)'
    }
    return ''
})

const newParticipantAddressError = computed(() => {
    const value = newParticipant.value.address
    if (!value) {
        return 'Adresa je povinná'
    }
    return ''
})

const newParticipantAgeError = computed(() => {
    const value = newParticipant.value.age
    if (!value) {
        return 'Věk je povinný'
    } else if (value < 1 || value > 100) {
        return 'Věk musí být mezi 1 a 100'
    }
    return ''
})

const newParticipantSessionIdError = computed(() => {
    // Sessions are optional - no error for empty selection
    return ''
})

const newParticipantAllergensError = computed(() => {
    // Allergens are optional - no error for empty selection
    return ''
})

// Computed property to check if there are any validation errors
const hasValidationErrors = computed(() => {
    return !!(
        newParticipantNameError.value ||
        newParticipantEmailError.value ||
        newParticipantPersonalNumberError.value ||
        newParticipantPhoneError.value ||
        newParticipantAddressError.value ||
        newParticipantAgeError.value ||
        newParticipantSessionIdError.value ||
        newParticipantAllergensError.value
    )
})

// Empty computed properties for edit form validated fields
const editParticipantNameComputed = computed(() => {
    // TODO: Add computed logic for edit name field
    const value = selectedParticipant.value?.name
    return value ? isValidName(value) : false
})

const editParticipantEmailComputed = computed(() => {
    // TODO: Add computed logic for edit email field
    const value = selectedParticipant.value?.email
    return value ? isValidEmail(value) : false
})

const editParticipantPersonalNumberComputed = computed(() => {
    // TODO: Add computed logic for edit personal number field
    const value = selectedParticipant.value?.personal_number
    return value ? isValidPersonalNumber(value) : false
})

const editParticipantPhoneComputed = computed(() => {
    // TODO: Add computed logic for edit phone field
    const value = selectedParticipant.value?.phone
    return value ? isValidPhone(value) : false
})

const editParticipantAddressComputed = computed(() => {
    // TODO: Add computed logic for edit address field
    const value = selectedParticipant.value?.address
    return value && value.trim().length > 0
})

const editParticipantAgeComputed = computed(() => {
    // TODO: Add computed logic for edit age field
    const value = selectedParticipant.value?.age
    return value && value >= 1 && value <= 100
})

const editParticipantSessionsComputed = computed(() => {
    // Sessions are optional - always return true
    return true
})

const editParticipantAllergensComputed = computed(() => {
    // Allergens are optional - always return true
    return true
})

// Error message computed properties for edit participant form
const editParticipantNameError = computed(() => {
    const value = selectedParticipant.value?.name
    if (!value) {
        return 'Jméno je povinné'
    } else if (!isValidName(value)) {
        return 'Jméno musí obsahovat křestní jméno a příjmení (alespoň jedna mezera)'
    }
    return ''
})

const editParticipantEmailError = computed(() => {
    const value = selectedParticipant.value?.email
    if (!value) {
        return 'E-mail je povinný'
    } else if (!isValidEmail(value)) {
        return 'Zadejte platnou e-mailovou adresu'
    }
    return ''
})

const editParticipantPersonalNumberError = computed(() => {
    const value = selectedParticipant.value?.personal_number
    if (!value) {
        return 'Rodné číslo je povinné'
    } else if (!isValidPersonalNumber(value)) {
        return 'Rodné číslo musí být ve formátu xxxxxx/xxxx (např. 123456/7890)'
    }
    return ''
})

const editParticipantPhoneError = computed(() => {
    const value = selectedParticipant.value?.phone
    if (!value) {
        return 'Telefon je povinný'
    } else if (!isValidPhone(value)) {
        return 'Zadejte platné telefonní číslo (např. +420 123 456 789 nebo 123456789)'
    }
    return ''
})

const editParticipantAddressError = computed(() => {
    const value = selectedParticipant.value?.address
    if (!value || value.trim().length === 0) {
        return 'Adresa je povinná'
    }
    return ''
})

const editParticipantAgeError = computed(() => {
    const value = selectedParticipant.value?.age
    if (!value) {
        return 'Věk je povinný'
    } else if (value < 1 || value > 100) {
        return 'Věk musí být mezi 1 a 100'
    }
    return ''
})

const editParticipantSessionsError = computed(() => {
    // Sessions are optional - no error for empty selection
    return ''
})

const editParticipantAllergensError = computed(() => {
    // Allergens are optional - no error for empty selection
    return ''
})

// Computed properties to check if forms have any validation errors
const hasNewParticipantErrors = computed(() => {
    return !!(
        newParticipantNameError.value ||
        newParticipantEmailError.value ||
        newParticipantPersonalNumberError.value ||
        newParticipantPhoneError.value ||
        newParticipantAddressError.value ||
        newParticipantAgeError.value ||
        newParticipantSessionIdError.value ||
        newParticipantAllergensError.value
    )
})

const hasEditParticipantErrors = computed(() => {
    return !!(
        editParticipantNameError.value ||
        editParticipantEmailError.value ||
        editParticipantPersonalNumberError.value ||
        editParticipantPhoneError.value ||
        editParticipantAddressError.value ||
        editParticipantAgeError.value ||
        editParticipantSessionsError.value ||
        editParticipantAllergensError.value
    )
})


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
    border: 4px solid #7c3aed;
    /* violet-600 */
    padding: 1.5rem;
    display: block;
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

.form-textarea {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    background-color: #ffffff;
    color: #111827;
    font-size: 0.875rem;
    line-height: 1.25rem;
    resize: vertical;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea:disabled {
    background-color: #f9fafb;
    color: #6b7280;
    cursor: not-allowed;
}

.form-select {
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

.form-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-select:disabled {
    background-color: #f9fafb;
    color: #6b7280;
    cursor: not-allowed;
}

.form-select option {
    padding: 0.5rem;
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

/* Ensure navbar area remains clickable */
.navbar-area {
    z-index: 20 !important;
    position: relative !important;
}
</style>