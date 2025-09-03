<template>
    <UDrawer class="ml-auto" :open="isOpen" @update:open="$emit('update:isOpen', $event)" direction="right">
        <template #content>
            <UCard class="p-4 min-w-96">
                <template #header>
                    <h3 class="text-lg font-semibold">{{ t('supervisor_details') }}</h3>
                </template>

                <UForm v-if="selectedSupervisor" :state="selectedSupervisor"
                    @submit="(event) => onSubmit(event.data)" class="flex flex-col space-y-4">
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
                        <UButton variant="outline" color="violet" @click="onCancel">
                            {{ t('cancel') }}
                        </UButton>
                    </div>
                </UForm>
            </UCard>
        </template>
    </UDrawer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useHighlightStore } from '#imports'
import type { Supervisor } from '~/model/Supervisor'

interface Props {
    isOpen: boolean
    selectedSupervisor: Supervisor | null
    sessionOptions: Array<{ label: string; value: number }>
    allergenOptions: Array<{ label: string; value: number }>
    isSubmitting: boolean
    onSubmit: (data: any) => void
    onCancel: () => void
}

interface Emits {
    (e: 'update:isOpen', value: boolean): void
}

defineProps<Props>()
defineEmits<Emits>()

const { t } = useI18n()
const highlightStore = useHighlightStore()
</script>
