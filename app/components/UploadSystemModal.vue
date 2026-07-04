<template>
    <UModal :title="t('upload_task_set')">
        <UButton class="add-new-system-button" icon="i-lucide-plus-circle" size="sm" color="teacher">
            {{ t('add_task_set') }}
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
v-if="systemAlreadyExists" variant="subtle" color="red" icon="i-lucide-alert-triangle"
                    :title="t('system_already_exists')" class="mt-3" />
            </div>
        </template>

        <template #footer="{ close }">
            <UButton
color="teacher" icon="i-lucide-chevron-right" :disabled="(!selectedFile && !selectedPreloadedSystem) || systemAlreadyExists"
                :loading="loading" size="sm" @click="onUpload(close)">
                {{ t('add_task_set') }}
            </UButton>
            <UButton color="neutral" variant="outline" size="sm" @click="close">{{ t('cancel') }}</UButton>
        </template>
    </UModal>
</template>

<script setup lang="ts">
const { t } = useI18n()
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
</script>
