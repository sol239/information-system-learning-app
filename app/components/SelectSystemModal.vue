<template>
  <UModal :title="t('student_welcome_change_system_button')">
    <UButton color="neutral" variant="soft" size="xs">
      {{ t('student_welcome_change_system_button') }}
    </UButton>

    <template #body>
      <div class="space-y-4">
        <SystemZipUploadSection v-model="selectedFile" :system-preview="systemPreview" />
        <UDivider :label="t('or')" />
        <PreloadedSystemSuggestions
          :systems-to-preload="systemsToPreload"
          :selected-system-id="selectedPreloadedSystem?.id ?? null"
          :loading="loadingPreloaded"
          @select="selectPreloadedSystem"
        />
        <UAlert
          v-if="systemAlreadyExists"
          variant="subtle"
          color="red"
          icon="i-lucide-alert-triangle"
          :title="t('system_already_exists')"
          class="mt-3"
        />
      </div>
    </template>

    <template #footer="{ close }">
      <UButton
        color="teacher"
        icon="i-lucide-chevron-right"
        :disabled="(!selectedFile && !selectedPreloadedSystem) || systemAlreadyExists"
        :loading="loading"
        size="sm"
        @click="onUpload(close)"
      >
        {{ t('student_welcome_change_system_button') }}
      </UButton>
      <UButton color="neutral" variant="outline" size="sm" @click="close">
        {{ t('cancel') }}
      </UButton>
    </template>
  </UModal>
</template>


<script setup lang="ts">
/* 1. Imports */

/* 2. Stores */

/* 3. Context hooks */
const { t } = useI18n()

/* 4. Constants (non-reactive) */

/* 5. Props */

/* 6. Emits */

/* 7. Template refs */

/* 8. State (ref, reactive) */
const {
  selectedFile,
  loading,
  loadingPreloaded,
  systemPreview,
  systemAlreadyExists,
  systemsToPreload,
  selectedPreloadedSystem,
  selectPreloadedSystem,
  onUpload,
} = useSystemUploadModal()

/* 9. Computed */

/* 10. Watchers */

/* 11. Methods */

/* 12. Lifecycle */

/* 13. defineExpose */
defineExpose({
})
</script>
