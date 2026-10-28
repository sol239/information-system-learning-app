<template>
  <div class="min-h-screen bg-white">
    <header class="border-b border-gray-200 bg-white">
      <div
        class="flex min-h-[57px] flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6"
      >
        <div class="min-w-0">
          <h1
            class="flex items-center gap-2 text-[1.05rem] font-bold tracking-tight text-gray-900 sm:text-[1.575rem]"
          >
            <UIcon
              name="i-lucide-pencil-ruler"
              class="size-5 shrink-0 sm:size-6"
            />
            <span>{{ t("task_designer") }}</span>
          </h1>
        </div>

        <div class="flex flex-wrap items-center gap-2 sm:justify-end">
          <div
            v-if="taskSetOptions.length > 0"
            class="flex flex-wrap items-center gap-2"
          >
            <label
              for="designer-task-set"
              class="text-sm font-medium text-gray-700"
            >
              {{ t("selected_task_set") }}
            </label>
            <USelect
              id="designer-task-set"
              :model-value="selectedTaskSetId"
              :items="taskSetOptions"
              value-key="value"
              label-key="label"
              :disabled="taskSetSwitching"
              class="min-w-48"
              @update:model-value="changeTaskSet"
            />
          </div>
          <UModal
            v-model:open="downloadModalOpen"
            :title="t('download_task_set')"
          >
            <UButton
              size="sm"
              icon="i-lucide-download"
              color="teacher"
              variant="solid"
            >
              {{ t("download_task_set") }}
            </UButton>

            <template #body>
              <p class="text-sm text-gray-600">
                {{
                  t("download_task_set_description", {
                    filename: downloadTaskSetFileName,
                  })
                }}
              </p>
              <p v-if="downloadError" class="mt-3 text-sm text-red-500">
                {{ downloadError }}
              </p>
            </template>

            <template #footer>
              <div class="flex justify-end gap-2">
                <UButton
                  size="sm"
                  color="neutral"
                  variant="ghost"
                  @click="downloadModalOpen = false"
                >
                  {{ t("cancel") }}
                </UButton>
                <UButton
                  size="sm"
                  icon="i-lucide-download"
                  color="teacher"
                  variant="solid"
                  :loading="downloadLoading"
                  @click="downloadTaskSet"
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
    </header>

    <main class="mx-auto w-full max-w-none p-4 sm:p-6">
      <p v-if="taskSetSwitchError" class="mb-4 text-sm text-red-600">
        {{ taskSetSwitchError }}
      </p>

      <div>
        <TasksDesignerPanel ref="tasksDesignerPanel" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
/* 1. Imports */
import { computed, ref } from "vue";
import TasksDesignerPanel from "~/components/TasksDesignerPanel.vue";
import { useSystemsStore } from "~/stores/systemsStore";
import { resetTaskProgressJson } from "~/utils/taskProgress";
import { OperationResultType } from "~/utils/Operation/OperationResultType";

defineOptions({
  name: "SystemDesignerPage",
});

/* 2. Stores */
const systemsStore = useSystemsStore();

/* 3. Context hooks */
definePageMeta({
  middleware: ["teacher-designer"],
  fullscreenSystemPage: true,
});

const router = useRouter();
const { t, locale } = useI18n();
const { route, systemId } = useSyncSystemId();

/* 4. Constants (non-reactive) */

/* 5. Props */

/* 6. Emits */

/* 7. Template refs */

/* 8. State (ref, reactive) */
const downloadModalOpen = ref(false);
const downloadLoading = ref(false);
const downloadError = ref("");
const taskSetSwitching = ref(false);
const taskSetSwitchError = ref("");
const tasksDesignerPanel = ref<InstanceType<typeof TasksDesignerPanel> | null>(
  null,
);

/* 9. Computed */
const firstSystemRoute = computed(() => {
  const firstPageRoute = systemsStore.selectedSystem?.pages?.[0]?.route;
  return firstPageRoute
    ? `/systems/${systemId}${firstPageRoute}`
    : `/systems/${systemId}/dashboard`;
});

const backToRoute = computed(() => {
  const backTo = route.query.backTo;
  return typeof backTo === "string" && backTo.length > 0
    ? backTo
    : firstSystemRoute.value;
});

const taskSetOptions = computed(() =>
  (systemsStore.selectedSystem?.taskSets ?? []).map((set) => ({
    label: set.name,
    value: set.id,
  })),
);
const selectedTaskSetId = computed(
  () => systemsStore.selectedSystem?.selectedTaskSetId ?? "",
);
const downloadTaskSetFileName = computed(() =>
  locale.value === "cs"
    ? `tasks_${systemsStore.selectedSystem?.taskSet.id ?? "sada_ukolu"}.json`
    : "tasks.json",
);

/* 10. Watchers */

/* 11. Methods */
function goBackToSystem() {
  router.push(backToRoute.value);
}

async function changeTaskSet(id: string) {
  const system = systemsStore.selectedSystem;
  if (!system || id === system.selectedTaskSetId || taskSetSwitching.value)
    return;
  taskSetSwitching.value = true;
  taskSetSwitchError.value = "";
  try {
    await tasksDesignerPanel.value?.flushPendingChanges();
    if (!system.selectTaskSet(id)) return;
    const result = await systemsStore.updateSystem(system);
    if (result.result !== OperationResultType.SUCCESS) {
      taskSetSwitchError.value = result.message;
    }
  } catch (error) {
    taskSetSwitchError.value =
      error instanceof Error ? error.message : String(error);
  } finally {
    taskSetSwitching.value = false;
  }
}

async function downloadTaskSet() {
  const system = systemsStore.selectedSystem;
  if (!system) {
    downloadError.value = t("download_system_missing");
    return;
  }

  downloadLoading.value = true;
  downloadError.value = "";

  try {
    const blob = new Blob([JSON.stringify(createTaskSetExport(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = downloadTaskSetFileName.value;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    downloadModalOpen.value = false;
  } catch (error) {
    downloadError.value =
      error instanceof Error ? error.message : String(error);
  } finally {
    downloadLoading.value = false;
  }
}

function createTaskSetExport() {
  const system = systemsStore.selectedSystem!;
  return {
    id: system.taskSet.id,
    system_id: system.taskSet.systemId,
    name: system.taskSet.name,
    description: system.taskSet.description,
    levelCount: system.taskSet.levelCount,
    tasks: JSON.parse(JSON.stringify(system.tasks ?? [])).map(
      resetTaskProgressJson,
    ),
  };
}

/* 12. Lifecycle */

/* 13. defineExpose */
</script>

<style scoped></style>
