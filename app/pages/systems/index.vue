<template>
  <div class="max-w-5xl mx-auto py-12 px-4 sm:px-6">
    <div class="grid grid-cols-1 gap-8">
      <!-- Header Section -->
      <UCard class="border-t-4 border-teacher-500 shadow-lg">
        <div class="flex flex-col md:flex-row items-start gap-6">
          <div class="flex-1">
            <span class="flex items-center gap-3 mb-4">
              <h1
                class="systems-page-title text-3xl font-bold text-gray-900 mb-2"
              >
                {{ t("information_systems") }}
              </h1>

              <UBadge size="lg" color="teacher" variant="subtle" icon="i-heroicons-academic-cap">
                {{ t("teacher") }}
              </UBadge>
            </span>

            <div class="flex flex-col gap-6">
              <p
                class="systems-page-description text-lg text-gray-600 max-w-prose leading-relaxed flex-1"
              >
                {{ t("manage_your_systems_description") }}
              </p>

              <!--
              <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div class="flex items-center justify-between gap-4 rounded-xl border border-gray-200 px-4 py-3 lg:min-w-[420px] lg:max-w-[620px] lg:flex-1">
                  <div class="flex flex-col">
                    <span class="text-sm font-medium text-gray-900">
                      {{ t("load_systems_from_public_folder") }}
                    </span>
                    <span class="text-sm text-gray-500">
                      {{ t("load_systems_from_public_folder_description") }}
                    </span>
                  </div>
                  <USwitch
                    color="teacher"
                    :model-value="globalSettingsStore.loadSystemsFromPublicFolder"
                    @update:model-value="onTogglePublicSystems"
                  />
                </div>

                <div class="flex flex-wrap gap-4 lg:justify-end">
                  <UploadSystemZipModal />
                </div>
              </div>
              -->
              <div class="flex flex-wrap gap-4 lg:justify-end">
                <UploadSystemZipModal />
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Systems List -->
      <div v-if="systemsStore.systems.length > 0" class="space-y-6">
        <UCard
          v-for="(system, index) in systemsStore.systems"
          :key="system.id"
          class="shadow-lg bg-gradient-to-br from-teacher-50/50 to-white border-none ring-1 ring-teacher-100 hover:ring-teacher-300 transition-all duration-300"
        >
          <div class="space-y-4">
            <!-- System Header with Icon, Title, and Delete Button -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div>
                  <h3
                    class="system-name text-xl font-semibold text-gray-900"
                  >
                    {{ system.name }}
                  </h3>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <EditSystemModal
                  v-if="globalSettingsStore.teacherMode"
                  :system="system"
                />
                <UButton
                  icon="i-lucide-trash-2"
                  color="red"
                  variant="ghost"
                  size="sm"
                  @click="deleteSystem(system.id)"
                />
              </div>
            </div>

            <!-- Description -->
            <p class="text-gray-600 leading-relaxed">
              {{ system.description }}
            </p>

            <!-- Actions -->
            <div class="pt-2 flex flex-col sm:flex-row gap-3">
              <UButton
                icon="i-lucide-arrow-right"
                color="teacher"
                variant="outline"
                @click="navigateToSystem(system.id)"
               size="sm">
                {{ t("enter_system") }}
              </UButton>
            </div>
          </div>
        </UCard>
      </div>

    </div>


  </div>
</template>

<script setup lang="ts">
/* 1. Imports */
import { DatabaseWrapper } from "~/utils/DatabaseWrapper";
import { TaskStatus } from "~/model/Task/TaskStatus";
import type { InformationSystem } from "~/model/InformationSystem";
import UploadSystemZipModal from "~/components/UploadSystemZipModal.vue";
import EditSystemModal from "~/components/EditSystemModal.vue";
import { usePreloadedSystems } from "~/composables/usePreloadedSystems";
import { useGlobalSettingsStore } from "~/stores/globalSettingsStore";
import { useSystemsStore } from "~/stores/systemsStore";
import { IndexedDbStorage } from "~/utils/IndexedDbStorage";
import { OperationResultType } from "~/utils/Operation/OperationResultType";

/* 2. Stores */
const globalSettingsStore = useGlobalSettingsStore();
const systemsStore = useSystemsStore();
const { prepareSystem } = usePrepareSystem();
const { pushFirstAvailablePage } = useAvailableSystemPages();

/* 3. Context hooks */
const { t } = useI18n();
const toast = useToast();
const router = useRouter();

/* 4. State */
const dbReadyMap = reactive<Record<string, boolean>>({});
const {
  systems: preloadedSystems,
  loading: preloadLoading,
  errors: preloadErrors,
  load: loadPreloaded,
} = usePreloadedSystems();



/* 5. Lifecycle */
onMounted(async () => {
  await loadSystemsPageData();
});

watch(
  () => globalSettingsStore.loadSystemsFromPublicFolder,
  async (enabled, previousValue) => {
    if (previousValue === undefined || enabled === previousValue) {
      return;
    }

    await loadSystemsPageData();
  },
);

/* 5. Methods */
async function loadSystemsPageData() {
  await loadStoredSystems();

  if (globalSettingsStore.loadSystemsFromPublicFolder) {
    await loadPreloadedSystemsIntoStore();
  }
}

async function loadStoredSystems() {
  const result = await IndexedDbStorage.GetStoredInformationSystems();
  if (result.result === OperationResultType.SUCCESS && result.data) {
    systemsStore.systems.splice(0, systemsStore.systems.length, ...result.data);
    for (const sys of result.data) {
      dbReadyMap[sys.id] = await DatabaseWrapper.isDatabaseInitialized(sys.database);
    }
  }
}

async function loadPreloadedSystemsIntoStore() {
  await loadPreloaded();

  const deletedIds = new Set(globalSettingsStore.deletedPreloadedSystemIds.map(String))

  for (const sys of preloadedSystems.value) {
    if (deletedIds.has(String(sys.id))) {
      continue;
    }

    if (systemsStore.systems.some((existingSystem) => String(existingSystem.id) === String(sys.id))) {
      continue;
    }

    await systemsStore.addSystem(sys);
    dbReadyMap[sys.id] = await DatabaseWrapper.isDatabaseInitialized(sys.database);
  }

  if (preloadErrors.value.length) {
    console.warn("Preloaded systems errors:", preloadErrors.value);
  }
}

async function onTogglePublicSystems(value: boolean) {
  globalSettingsStore.loadSystemsFromPublicFolder = value;
}

async function navigateToSystem(id: string) {
  //console.log("Navigating to system " + id);
  if (!(await prepareSystem(id))) {
    return;
  }

  //console.log("Navigating to first available page...");
  await pushFirstAvailablePage(null);
}

async function navigateToDesigner(id: string) {
  if (!(await prepareSystem(id))) {
    return;
  }

  const system = systemsStore.getSystemById(id);
  const firstSystemRoute = system?.pages?.[0]?.route
    ? `/systems/${id}${system.pages[0].route}`
    : `/systems/${id}/dashboard`;

  router.push({
    path: `/systems/${id}/designer`,
    query: {
      backTo: firstSystemRoute,
    },
  });
}

async function deleteSystem(id: string) {
  globalSettingsStore.markPreloadedSystemAsDeleted(id);
  await systemsStore.deleteSystemById(id);
}

function completedTasksCount(system: InformationSystem): number {
  return system.tasks?.filter((t) => t.status === TaskStatus.COMPLETED).length ?? 0;
}
</script>
