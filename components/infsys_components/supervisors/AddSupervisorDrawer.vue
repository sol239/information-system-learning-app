<template>
    <UDrawer :open="isOpen" @update:open="$emit('update:isOpen', $event)" direction="right">
        <UButton color="violet" variant="outline" @click="onCreateNew" icon="i-heroicons-plus">
            {{ t('add_supervisor') }}
        </UButton>
        <template #content>
            <UCard class="p-4 min-w-96">
                <template #header>
                    <h3 class="text-lg font-semibold">{{ t('add_supervisor') }}</h3>
                </template>

                <UForm :state="formData" @submit="(event) => onSubmit(event.data)"
                    class="flex flex-col space-y-4">
                    <div class="highlightable" id="supervisors-add-name"
                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-add-name', $event)">
                        <label for="name"
                            class="block text-sm font-medium text-white mb-1">Jméno</label>
                        <UInput color="violet" id="name" v-model="formData.name"
                            placeholder="Zadejte jméno vedoucího"
                            :disabled="highlightStore.isHighlightMode" />
                    </div>
                    <div class="highlightable" id="supervisors-add-email"
                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-add-email', $event)">
                        <label for="email"
                            class="block text-sm font-medium text-white mb-1">E-mail</label>
                        <UInput color="violet" id="email" v-model="formData.email" type="email"
                            placeholder="email@example.com"
                            :disabled="highlightStore.isHighlightMode" />
                    </div>
                    <div class="highlightable" id="supervisors-add-personal_number"
                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-add-personal_number', $event)">
                        <label for="personal_number"
                            class="block text-sm font-medium text-white mb-1">Rodné číslo</label>
                        <UInput color="violet" id="personal_number"
                            v-model="formData.personal_number" placeholder="123456/7890"
                            :disabled="highlightStore.isHighlightMode" />
                    </div>
                    <div class="highlightable" id="supervisors-add-phone"
                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-add-phone', $event)">
                        <label for="phone"
                            class="block text-sm font-medium text-white mb-1">Telefon</label>
                        <UInput color="violet" id="phone" v-model="formData.phone"
                            placeholder="+420 123 456 789" :disabled="highlightStore.isHighlightMode" />
                    </div>
                    <div class="highlightable" id="supervisors-add-address"
                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-add-address', $event)">
                        <label for="address"
                            class="block text-sm font-medium text-white mb-1">Adresa</label>
                        <UTextarea color="violet" id="address" v-model="formData.address"
                            placeholder="Ulice číslo, město, PSČ" :rows="2"
                            :disabled="highlightStore.isHighlightMode" />
                    </div>
                    <div class="highlightable" id="supervisors-add-age"
                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-add-age', $event)">
                        <label for="age" class="block text-sm font-medium text-white mb-1">Věk</label>
                        <UInput color="violet" id="age" v-model="formData.age" type="number" min="1"
                            max="100" placeholder="25" :disabled="highlightStore.isHighlightMode" />
                    </div>
                    <div class="highlightable" id="supervisors-add-session"
                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-add-session', $event)">
                        <label for="sessionId"
                            class="block text-sm font-medium text-white mb-1">Turnus</label>

                        <USelect color="violet" id="sessionId" v-model="formData.sessionId"
                            :items="sessionOptions" placeholder="Vyberte turnus" multiple
                            :disabled="highlightStore.isHighlightMode" />
                    </div>
                    <div class="highlightable" id="supervisors-add-allergens"
                        @click="highlightStore.isHighlightMode && highlightStore.highlightHandler.selectElement('supervisors-add-allergens', $event)">
                        <label for="allergens"
                            class="block text-sm font-medium text-white mb-1">Alergeny</label>
                        <USelect color="violet" id="allergens" v-model="formData.allergens"
                            :items="allergenOptions" multiple placeholder="Vyberte alergeny"
                            :disabled="highlightStore.isHighlightMode" />
                    </div>
                    <div class="flex flex-col gap-3 pt-4">
                        <UButton type="submit" color="violet" :loading="isSubmitting">
                            {{ t('add') }}
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

interface FormData {
    name: string
    email: string
    personal_number: string
    phone: string
    address: string
    age: number | null
    sessionId: number[]
    allergens: number[]
}

interface Props {
    isOpen: boolean
    formData: FormData
    sessionOptions: Array<{ label: string; value: number }>
    allergenOptions: Array<{ label: string; value: number }>
    isSubmitting: boolean
    onCreateNew: () => void
    onSubmit: (data: FormData) => void
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
