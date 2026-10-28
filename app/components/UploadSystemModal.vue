<template>
  <UModal v-model:open="modalOpen" :title="t('upload_task_set')">
    <UButton
      class="add-new-system-button"
      icon="i-lucide-plus-circle"
      size="sm"
      color="teacher"
    >
      {{ t("add_task_set") }}
    </UButton>

    <template #body>
      <div class="space-y-4">
        <SystemZipUploadSection
          v-model="selectedFile"
          :system-preview="systemPreview"
        />
        <UDivider :label="t('or')" />
        <PreloadedSystemSuggestions
          :systems-to-preload="systemsToPreload"
          :selected-system-id="selectedPreloadedSystem?.id ?? null"
          :loading="loadingPreloaded"
          @select="selectPreloadedSystem"
        />
        <UAlert
          v-if="uploadError || systemAlreadyExists"
          variant="subtle"
          color="rose"
          icon="i-lucide-alert-triangle"
          :title="uploadError || t('task_set_already_exists')"
          class="mt-3"
        />
      </div>
    </template>

    <template #footer="{ close }">
      <UButton
        color="teacher"
        icon="i-lucide-chevron-right"
        :disabled="
          (!selectedFile && !selectedPreloadedSystem) ||
          systemAlreadyExists ||
          !!uploadError
        "
        :loading="loading"
        size="sm"
        @click="onUpload(close)"
      >
        {{ t("add_task_set") }}
      </UButton>
      <UButton color="neutral" variant="outline" size="sm" @click="close">{{
        t("cancel")
      }}</UButton>
    </template>
  </UModal>
</template>

<script setup lang="ts">
/* 1. Imports */
import { ref, watch } from "vue";

/* 2. Stores */

/* 3. Context hooks */
const { t } = useI18n();

/* 4. Constants (non-reactive) */
const props = defineProps<{ systemId: string }>();
const {
  selectedFile,
  loading,
  loadingPreloaded,
  systemPreview,
  systemAlreadyExists,
  uploadError,
  systemsToPreload,
  selectedPreloadedSystem,
  selectPreloadedSystem,
  resetSelection,
  onUpload,
} = useSystemUploadModal(props.systemId);

/* 5. Props */

/* 6. Emits */

/* 7. Template refs */

/* 8. State (ref, reactive) */
const modalOpen = ref(false);

/* 9. Computed */

/* 10. Watchers */
watch(modalOpen, (open) => {
  if (!open) resetSelection();
});

/* 11. Methods */

/* 12. Lifecycle */

/* 13. defineExpose */
</script>

<style scoped></style>
