<template>
    <UModal :title="t('edit_system')">
        <!-- Trigger button -->
        <UButton
            icon="i-lucide-pencil"
            color="blue"
            variant="ghost"
            size="sm"
        />

        <template #body>
            <div class="space-y-4">
                <UFormField :label="t('system_name')" name="name">
                    <UInput v-model="editForm.name" class="w-full" />
                </UFormField>

                <UFormField :label="t('system_description')" name="description">
                    <UTextarea v-model="editForm.description" :rows="4" class="w-full" />
                </UFormField>
            </div>
        </template>

        <template #footer="{ close }">
            <UButton color="teacher" icon="i-lucide-check" :loading="saving" @click="save(close)" size="sm">
                {{ t('save') }}
            </UButton>
            <UButton color="neutral" variant="outline" @click="close" size="sm">
                {{ t('cancel') }}
            </UButton>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { InformationSystem } from '~/model/InformationSystem'
import { useSystemsStore } from '~/stores/systemsStore'

/* Props */
const props = defineProps<{
    system: InformationSystem
}>()

/* Context */
const { t } = useI18n()
const systemsStore = useSystemsStore()

/* Local state */
const saving = ref(false)
const editForm = reactive({
    oldId: props.system.id,
    id: props.system.id,
    name: props.system.name,
    description: props.system.description,
})

/* Sync form when the prop changes (e.g. parent re-renders) */
watch(
    () => props.system,
    (sys) => {
        editForm.oldId = sys.id
        editForm.id = sys.id
        editForm.name = sys.name
        editForm.description = sys.description
    },
    { immediate: false }
)

/* Save handler */
async function save(close: () => void) {
    saving.value = true
    try {
        const system = systemsStore.getSystemById(editForm.oldId)
        if (!system) return

        if (editForm.oldId !== editForm.id) {
            // ID changed: delete old, re-save with new id
            system.id = editForm.id
            system.name = editForm.name
            system.description = editForm.description
            await systemsStore.deleteSystemById(editForm.oldId)
            await systemsStore.addSystem(system)
        } else {
            // Only name/description changed – update in place
            system.name = editForm.name
            system.description = editForm.description
            await systemsStore.updateSystem(system)
        }

        close()
    } finally {
        saving.value = false
    }
}
</script>
