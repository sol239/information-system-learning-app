<template>
    <UDrawer class="ml-auto" v-model:open="isOpen" direction="right">
        <template #content>
            <UCard class="p-4 min-w-96">
                <template #header>
                    <h3 class="text-lg font-semibold">{{ t('participant_details') }}</h3>
                </template>

                <UForm v-if="selectedParticipant" :state="selectedParticipant"
                    @submit="handleSubmit" class="flex flex-col space-y-4">
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
                        <UButton variant="outline" color="sky" @click="handleResetForm">
                            {{ t('cancel') }}
                        </UButton>
                    </div>
                </UForm>
            </UCard>
        </template>
    </UDrawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHighlightStore } from '#imports'

interface Props {
    isOpen: boolean
    selectedParticipant: any
    sessionOptions: any[]
    allergenOptions: any[]
    isSubmitting: boolean
    onSubmit: (data: any) => void
    onResetForm: () => void
}

const props = defineProps<Props>()
const emit = defineEmits<{
    'update:isOpen': [value: boolean]
}>()

const { t } = useI18n()
const highlightStore = useHighlightStore()

const isOpen = computed({
    get: () => props.isOpen,
    set: (value) => emit('update:isOpen', value)
})

const handleSubmit = (data: any) => {
    props.onSubmit(data)
}

const handleResetForm = () => {
    props.onResetForm()
}
</script>
