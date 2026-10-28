<template>
  <UModal v-model:open="modalOpen" :title="t('change_task_set')">
    <button
      type="button"
      class="flex w-full items-center gap-[0.675rem] rounded-lg border border-indigo-200 bg-white/80 p-[0.675rem] text-left text-gray-700 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50"
    >
      <span
        class="flex h-[1.8rem] w-[1.8rem] shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-600"
      >
        <UIcon name="i-lucide-layers-3" class="h-[0.95rem] w-[0.95rem]" />
      </span>
      <span class="min-w-0 text-[0.8125rem] font-medium leading-snug">{{
        t("change_task_set")
      }}</span>
      <UIcon
        name="i-lucide-chevron-down"
        class="ml-auto size-4 shrink-0 text-gray-500"
      />
    </button>

    <template #body>
      <div v-if="system?.taskSets.length" class="space-y-2">
        <UButton
          v-for="taskSet in system.taskSets"
          :key="taskSet.id"
          block
          color="teacher"
          :variant="
            taskSet.id === system.selectedTaskSetId ? 'subtle' : 'outline'
          "
          :icon="
            taskSet.id === system.selectedTaskSetId
              ? 'i-lucide-check'
              : 'i-lucide-layers-3'
          "
          class="justify-start"
          :disabled="loading"
          @click="selectTaskSet(taskSet.id)"
        >
          {{ taskSet.name }}
        </UButton>
      </div>
      <UAlert
        v-else
        color="neutral"
        variant="subtle"
        :title="t('no_task_sets_in_system')"
      />
      <UAlert
        v-if="error"
        class="mt-3"
        color="rose"
        variant="subtle"
        icon="i-lucide-alert-triangle"
        :title="error"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { OperationResultType } from "~/utils/Operation/OperationResultType";

const { t } = useI18n();
const systemsStore = useSystemsStore();
const system = computed(() => systemsStore.selectedSystem);
const modalOpen = ref(false);
const loading = ref(false);
const error = ref("");

watch(modalOpen, (open) => {
  if (!open) error.value = "";
});

async function selectTaskSet(id: string) {
  const currentSystem = system.value;
  if (!currentSystem) return;
  if (id === currentSystem.selectedTaskSetId) {
    modalOpen.value = false;
    return;
  }

  loading.value = true;
  error.value = "";
  try {
    if (!currentSystem.selectTaskSet(id)) return;
    const result = await systemsStore.updateSystem(currentSystem);
    if (result.result !== OperationResultType.SUCCESS) {
      error.value = result.message;
      return;
    }
    modalOpen.value = false;
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    loading.value = false;
  }
}
</script>
