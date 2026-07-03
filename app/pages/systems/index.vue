<template>
  <div class="max-w-5xl mx-auto py-12 px-4 sm:px-6">
    <div class="grid grid-cols-1 gap-8">
      <!-- Header Section -->
      <UCard class="border-t-4 border-teacher-500 shadow-lg">
        <div class="flex flex-col md:flex-row items-start gap-6">
          <div class="flex-1">
            <span class="flex items-center gap-3 mb-4">
              <h1
                class="systems-page-title text-2xl font-bold text-gray-900 mb-2"
              >
                {{ t("information_systems") }}
              </h1>
            </span>

            <div class="flex flex-col gap-6">
              <p
                class="systems-page-description text-md text-gray-600 max-w-prose leading-relaxed flex-1"
              >
                {{ t("manage_your_systems_description") }}
              </p>

              <div class="flex flex-wrap gap-4 lg:justify-end">
                <UploadSystemZipModal v-if="globalSettingsStore.teacherMode" />
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
                    class="system-name text-lg font-semibold text-gray-900"
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
                  v-if="globalSettingsStore.teacherMode"
                  icon="i-lucide-trash-2"
                  color="red"
                  variant="ghost"
                  size="sm"
                  @click="deleteSystem(system.id)"
                />
              </div>
            </div>

            <!-- Description -->
            <p class="text-gray-600 text-md leading-relaxed">
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
import UploadSystemZipModal from "~/components/UploadSystemZipModal.vue";
import EditSystemModal from "~/components/EditSystemModal.vue";
import { AppLoader } from "~/core/AppLoader";
import { SystemHelper } from "~/core/systems/SystemHelper";
import { TaskHelper } from "~/core/systems/TaskHelper";
import { useGlobalSettingsStore } from "~/stores/globalSettingsStore";
import { useSystemsStore } from "~/stores/systemsStore";

/* 2. Stores */
const globalSettingsStore = useGlobalSettingsStore();
const systemsStore = useSystemsStore();

/* 3. Context hooks */
const { t } = useI18n();
const router = useRouter();


/* 5. Lifecycle */
onMounted(async () => {
  await new AppLoader().loadApp();
});

/* 5. Methods */
async function navigateToSystem(id: string) {
  //console.log("Navigating to system " + id);
  if (!(await SystemHelper.prepareSystem(id))) {
    return;
  }

  //console.log("Navigating to first available page...");
  await pushFirstAvailablePage();
}

async function pushFirstAvailablePage() {
  const system = systemsStore.selectedSystem;
  const systemId = systemsStore.selectedSystemId;
  const availableTasks = system?.availableTasks() ?? [];
  const availablePages = TaskHelper.getVisiblePages(availableTasks);
  const firstPage = availablePages[0]?.route ?? "";

  if (!systemId || !firstPage) {
    return;
  }

  await navigateTo(`/systems/${systemId}${firstPage}`);
}

async function navigateToDesigner(id: string) {
  if (!(await SystemHelper.prepareSystem(id))) {
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
</script>
