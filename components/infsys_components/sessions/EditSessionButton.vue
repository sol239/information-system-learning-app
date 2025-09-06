<template>
  <UButton
    size="sm"
    color="sky"
    variant="solid"
    @click="openEditModal"
    class="flex-1"
    :id="'sessions-edit-button-' + sessionId"
  >
    <UIcon name="i-heroicons-pencil" class="w-4 h-4 mr-1" />
    {{ t('edit') }}
  </UButton>
</template>

<script setup lang="ts">
/* 1. Imports */
import { useToast } from '#imports'

/* 2. Context hooks */
const { t } = useI18n()
const toast = useToast()

/* 3. Props */
const props = defineProps<{
  sessionId: number
}>()

/* 4. Emits */
const emit = defineEmits<{
  edit: [sessionId: number]
}>()

/* 5. Methods */
const openEditModal = () => {
  emit('edit', props.sessionId)
}
</script>
