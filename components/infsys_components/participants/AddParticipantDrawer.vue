<template>
    <UDrawer v-model:open="isOpen" direction="right">
        <UButton color="sky" variant="outline" @click="handleCreateNew" icon="i-heroicons-plus">
            {{ t('add_participant') }}
        </UButton>

        <template #content>
            <UCard class="p-4 min-w-96">
                <template #header>
                    <h3 class="text-lg font-semibold">{{ t('add_participant') }}</h3>
                </template>

                <UForm :state="newParticipant" @submit="handleSubmit"
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
    newParticipant: any
    sessionOptions: any[]
    allergenOptions: any[]
    isSubmitting: boolean
    onCreateNew: () => void
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

const handleCreateNew = () => {
    if (!highlightStore.isHighlightMode) {
        props.onCreateNew()
    }
}

const handleSubmit = (data: any) => {
    props.onSubmit(data)
}

const handleResetForm = () => {
    props.onResetForm()
}
</script>
