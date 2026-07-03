<template>
  <div>
    <p class="mb-2 font-medium">{{ t('upload_from_zip') }}</p>
    <UFileUpload
      v-model="selectedFile"
      accept=".zip"
      :label="t('upload_system_zip')"
      icon="i-lucide-upload"
      class="w-full"
    />
    <div v-if="systemPreview" class="mt-4 space-y-1">
      <p class="font-semibold text-lg">{{ systemPreview.name }}</p>
      <p class="text-sm text-muted">{{ systemPreview.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: File | null
  systemPreview: { name: string; description: string } | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: File | null]
}>()

const { t } = useI18n()

const selectedFile = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})
</script>
