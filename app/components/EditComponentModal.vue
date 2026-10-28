<template>
  <UModal
    v-model:open="isOpen"
    fullscreen
    :scrollable="false"
    :dismissible="true"
    :ui="modalUi"
  >
    <template #title>
      <div class="flex items-center gap-2">
        <span>{{ t("edit_component") }}</span>
        <UBadge color="neutral" variant="subtle" size="sm" class="font-mono">
          {{ props.component.name || props.component.id }}
        </UBadge>
      </div>
    </template>

    <template #actions>
      <div class="me-10 flex flex-1 items-center gap-6">
        <div class="flex flex-1 items-center justify-evenly gap-6">
          <USwitch
            v-model="highlightAvailableVariables"
            size="xs"
            color="neutral"
            :label="t('highlight_available_variables')"
            :ui="{ label: 'text-gray-500' }"
          />
          <div class="flex items-center gap-1">
            <span class="mr-1 text-xs font-medium text-gray-500">{{
              t("code_size")
            }}</span>
            <UTooltip :text="t('decrease_font')">
              <UButton
                icon="i-lucide-minus"
                color="neutral"
                variant="subtle"
                size="xs"
                @click="sizeMultiplier -= 0.05"
              />
            </UTooltip>
            <span class="w-10 text-center text-xs font-medium text-gray-500">
              {{ Math.round(sizeMultiplier * 100) }}%
            </span>
            <UTooltip :text="t('increase_font')">
              <UButton
                icon="i-lucide-plus"
                color="neutral"
                variant="subtle"
                size="xs"
                @click="sizeMultiplier += 0.05"
              />
            </UTooltip>
          </div>
        </div>
        <UButton
          id="save-code-changes-button"
          icon="i-lucide-save"
          color="neutral"
          variant="solid"
          class="bg-black text-white hover:bg-gray-800 active:bg-gray-900 dark:bg-black dark:text-white dark:hover:bg-gray-800 dark:active:bg-gray-900"
          :disabled="!isFormValid"
          size="sm"
          @click="handleSave"
        >
          {{ t("save_changes") }}
        </UButton>
      </div>
    </template>

    <template #body>
      <EditComponentBody
        v-if="isOpen"
        ref="bodyRef"
        v-model:size-multiplier="sizeMultiplier"
        :component="props.component"
        :variables="props.variables"
        :code-edit-permissions="props.codeEditPermissions"
        :ignore-task-code-edit-permissions="props.ignoreTaskCodeEditPermissions"
        :highlight-available-variables="highlightAvailableVariables"
        @validation-change="isFormValid = $event"
        @edit-change="isFormEdited = $event"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
/* eslint-disable no-unused-vars */
/* 1. Imports */
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { Component as SystemComponent } from "~/model/Component";
import type { ComponentVariables } from "~/model/ComponentVariables";
import type { CodeEditPermissions } from "~/utils/codeEditPermissions";
import EditComponentBody from "./EditComponentBody.vue";

/* 2. Stores */

/* 3. Context hooks */
const { t } = useI18n();

/* 4. Constants (non-reactive) */
const modalUi = {
  content:
    "w-full h-full max-w-full m-0 overflow-hidden rounded-none z-[10005]",
  header: "shrink-0",
  body: "min-h-0 overflow-y-auto overscroll-contain pt-2",
  overlay: "z-[10004]",
};

/* 5. Props */
const props = defineProps<{
  open: boolean;
  component: SystemComponent;
  variables?: ComponentVariables;
  codeEditPermissions?: Partial<CodeEditPermissions>;
  ignoreTaskCodeEditPermissions?: boolean;
}>();

/* 6. Emits */
const emit = defineEmits<{
  (e: "update:open", val: boolean): void;
  (
    e: "save",
    payload: {
      updatedComponent: SystemComponent;
      updatedVariables: ComponentVariables;
    },
  ): void;
}>();

/* 7. Template refs */
const bodyRef = ref<InstanceType<typeof EditComponentBody> | null>(null);

/* 8. State (ref, reactive) */
const isFormValid = ref(true);
const isFormEdited = ref(false);
const sizeMultiplier = ref(0.7);
const highlightAvailableVariables = ref(true);

/* 9. Computed */
const isOpen = computed({
  get: () => props.open,
  set: (val) => emit("update:open", val),
});

/* 10. Watchers */
watch(isOpen, (open) => {
  if (open) {
    isFormValid.value = true;
    isFormEdited.value = false;
    sizeMultiplier.value = 0.7;
  }
});

/* 11. Methods */
function handleSave() {
  if (!bodyRef.value) return;

  const payload = bodyRef.value.getDraftData();
  emit("save", payload);
  isOpen.value = false;
}

/* 12. Lifecycle */

/* 13. defineExpose */
defineExpose({});
</script>

<style scoped></style>
