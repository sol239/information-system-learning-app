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
/* 1. Imports */
import { computed } from 'vue'

/* 2. Stores */

/* 3. Context hooks */
const { t } = useI18n()

/* 4. Constants (non-reactive) */

/* 5. Props */
const props = defineProps<{
  modelValue: File | null
  systemPreview: { name: string; description: string } | null
}>()

/* 6. Emits */
const emit = defineEmits<{
  'update:modelValue': [value: File | null]
}>()

/* 7. Template refs */

/* 8. State (ref, reactive) */

/* 9. Computed */
const selectedFile = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

/* 10. Watchers */

/* 11. Methods */

/* 12. Lifecycle */

/* 13. defineExpose */
defineExpose({
})
</script>
