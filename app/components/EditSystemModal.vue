<template>
  <UModal :title="t('edit_system')">
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
      <UButton
        color="teacher"
        icon="i-lucide-check"
        :loading="saving"
        size="sm"
        @click="save(close)"
      >
        {{ t('save') }}
      </UButton>
      <UButton color="neutral" variant="outline" size="sm" @click="close">
        {{ t('cancel') }}
      </UButton>
    </template>
  </UModal>
</template>


<script setup lang="ts">
/* 1. Imports */
import { reactive, ref, watch } from 'vue'
import type { InformationSystem } from '~/model/InformationSystem'
import { useSystemsStore } from '~/stores/systemsStore'

/* 2. Stores */
const systemsStore = useSystemsStore()

/* 3. Context hooks */
const { t } = useI18n()

/* 4. Constants (non-reactive) */

/* 5. Props */
const props = defineProps<{
  system: InformationSystem
}>()

/* 6. Emits */

/* 7. Template refs */

/* 8. State (ref, reactive) */
const saving = ref(false)
const editForm = reactive({
  oldId: props.system.id,
  id: props.system.id,
  name: props.system.name,
  description: props.system.description,
})

/* 9. Computed */

/* 10. Watchers */
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

/* 11. Methods */
async function save(close: () => void) {
  saving.value = true

  try {
    const system = systemsStore.getSystemById(editForm.oldId)
    if (!system) return

    if (editForm.oldId !== editForm.id) {
      system.id = editForm.id
      system.name = editForm.name
      system.description = editForm.description
      await systemsStore.deleteSystemById(editForm.oldId)
      await systemsStore.addSystem(system)
    } else {
      system.name = editForm.name
      system.description = editForm.description
      await systemsStore.updateSystem(system)
    }

    close()
  } finally {
    saving.value = false
  }
}

/* 12. Lifecycle */

/* 13. defineExpose */
defineExpose({
})
</script>
