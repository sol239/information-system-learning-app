<template>
  <UModal v-model:open="isOpen" fullscreen :dismissible="true" :ui="modalUi">
    <template #title>
      <div class="flex items-center gap-2">
        <span>{{ t('edit_component') }}</span>
        <UBadge color="neutral" variant="subtle" size="sm" class="font-mono">
          {{ props.component.name || props.component.id }}
        </UBadge>
      </div>
    </template>

    <template #actions>
      <UButton id="save-code-changes-button" class="ml-auto me-10" color="sky"
        :variant="isFormEdited ? 'solid' : 'subtle'" :disabled="!isFormValid" size="sm" @click="handleSave">
        {{ t('save_changes') }}
      </UButton>
    </template>

    <template #body>
      <EditComponentBody v-if="isOpen" ref="bodyRef" :component="props.component" :variables="props.variables"
        :code-edit-permissions="props.codeEditPermissions"
        :ignore-task-code-edit-permissions="props.ignoreTaskCodeEditPermissions"
        @validation-change="isFormValid = $event" @edit-change="isFormEdited = $event" />
    </template>
  </UModal>
</template>


<script setup lang="ts">
/* eslint-disable no-unused-vars */
/* 1. Imports */
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Component as SystemComponent } from '~/model/Component'
import type { ComponentVariables } from '~/model/ComponentVariables'
import type { CodeEditPermissions } from '~/utils/codeEditPermissions'
import EditComponentBody from './EditComponentBody.vue'

/* 2. Stores */

/* 3. Context hooks */
const { t } = useI18n()

/* 4. Constants (non-reactive) */
const modalUi = {
  content: 'w-full h-full max-w-full m-0 rounded-none z-[10005]',
  overlay: 'z-[10004]',
}

/* 5. Props */
const props = defineProps<{
  open: boolean
  component: SystemComponent
  variables?: ComponentVariables
  codeEditPermissions?: Partial<CodeEditPermissions>
  ignoreTaskCodeEditPermissions?: boolean
}>()

/* 6. Emits */
const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'save', payload: { updatedComponent: SystemComponent; updatedVariables: ComponentVariables }): void
}>()

/* 7. Template refs */
const bodyRef = ref<InstanceType<typeof EditComponentBody> | null>(null)

/* 8. State (ref, reactive) */
const isFormValid = ref(true)
const isFormEdited = ref(false)

/* 9. Computed */
const isOpen = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val),
})

/* 10. Watchers */
watch(isOpen, (open) => {
  if (open) {
    isFormValid.value = true
    isFormEdited.value = false
  }
})

/* 11. Methods */
function handleSave() {
  if (!bodyRef.value) return

  const payload = bodyRef.value.getDraftData()
  emit('save', payload)
  isOpen.value = false
}

/* 12. Lifecycle */

/* 13. defineExpose */
defineExpose({
})

</script>
