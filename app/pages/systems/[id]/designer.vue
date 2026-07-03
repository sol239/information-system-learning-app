<template>
  <div class="min-h-screen bg-white">
    <div class="mx-auto w-full max-w-none p-6">
      <div class="mb-6 mt-5 flex items-center justify-between gap-4">
        <div class="min-w-0">
          <h1
            class="flex items-center gap-3 text-2xl font-bold tracking-tight text-teacher-600 sm:text-4xl"
          >
            <span>{{ t("task_designer") }}</span>
          </h1>
        </div>

        <div class="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <UModal v-model:open="downloadModalOpen" :title="t('download_system')">
            <UButton
              size="sm"
              icon="i-lucide-download"
              color="teacher"
              variant="solid"
            >
              {{ t("download_system") }}
            </UButton>

            <template #body>
              <p class="text-sm text-gray-600">
                {{ t("download_system_description") }}
              </p>
              <p v-if="downloadError" class="mt-3 text-sm text-red-500">
                {{ downloadError }}
              </p>
            </template>

            <template #footer>
              <div class="flex justify-end gap-2">
                <UButton size="sm" color="neutral" variant="ghost" @click="downloadModalOpen = false">
                  {{ t("cancel") }}
                </UButton>
                <UButton
                  size="sm"
                  icon="i-lucide-download"
                  color="teacher"
                  variant="solid"
                  :loading="downloadLoading"
                  @click="downloadSystem"
                >
                  {{ t("download") }}
                </UButton>
              </div>
            </template>
          </UModal>

          <UButton
            size="sm"
            icon="i-lucide-arrow-left"
            color="teacher"
            variant="outline"
            @click="goBackToSystem"
          >
            {{ t("go_back_to_system") }}
          </UButton>
        </div>
      </div>

      <div class="mt-10 border-t border-gray-200 pt-8">
        <TasksDesignerPanel />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/* 1. Imports */
import { computed, ref } from 'vue'
import TasksDesignerPanel from '~/components/TasksDesignerPanel.vue'
import { useSystemsStore } from '~/stores/systemsStore'
import { SystemZipExporter } from '~/utils/SystemZipExporter'

defineOptions({
  name: 'SystemDesignerPage',
})

/* 2. Stores */
const systemsStore = useSystemsStore()

/* 3. Context hooks */
definePageMeta({
  middleware: ['teacher-designer'],
  fullscreenSystemPage: true,
})

const router = useRouter()
const { t } = useI18n()
const { route, systemId } = useSyncSystemId()

/* 4. Constants (non-reactive) */

/* 5. Props */

/* 6. Emits */

/* 7. Template refs */

/* 8. State (ref, reactive) */
const downloadModalOpen = ref(false)
const downloadLoading = ref(false)
const downloadError = ref('')

/* 9. Computed */
const firstSystemRoute = computed(() => {
  const firstPageRoute = systemsStore.selectedSystem?.pages?.[0]?.route
  return firstPageRoute
    ? `/systems/${systemId}${firstPageRoute}`
    : `/systems/${systemId}/dashboard`
})

const backToRoute = computed(() => {
  const backTo = route.query.backTo
  return typeof backTo === 'string' && backTo.length > 0
    ? backTo
    : firstSystemRoute.value
})

/* 10. Watchers */

/* 11. Methods */
function goBackToSystem() {
  router.push(backToRoute.value)
}

async function downloadSystem() {
  if (!systemsStore.selectedSystem) {
    downloadError.value = t('download_system_missing')
    return
  }

  downloadLoading.value = true
  downloadError.value = ''

  try {
    const blob = await SystemZipExporter.export(systemsStore.selectedSystem)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${createDownloadName(systemsStore.selectedSystem.name)}.zip`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    downloadModalOpen.value = false
  } catch (error) {
    downloadError.value = error instanceof Error ? error.message : String(error)
  } finally {
    downloadLoading.value = false
  }
}

function createDownloadName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `system-${systemId}`
}

/* 12. Lifecycle */

/* 13. defineExpose */
</script>
