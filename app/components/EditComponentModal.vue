<template>
  <UModal
    v-model:open="isOpen"
    fullscreen
    :dismissible="true"
    :ui="{
      content: 'w-full h-full max-w-full m-0 rounded-none z-[10005]',
      overlay: 'z-[10004]',
    }"
  >
    <template #title>
      <div class="flex items-center gap-2">
        <span>{{ t("edit_component") }}</span>
        <UBadge color="neutral" variant="subtle" size="sm" class="font-mono">{{
          props.component.name || props.component.id
        }}</UBadge>
      </div>
    </template>

    <template #actions>
      <UButton
        class="ml-auto me-10"
        @click="handleSave"
        color="sky"
        :variant="isFormEdited ? 'solid' : 'subtle'"
        :disabled="!isFormValid"
       size="sm">
        {{ t("save_changes") }}
      </UButton>
    </template>

    <template #body>
      <EditComponentBody
        v-if="isOpen"
        ref="bodyRef"
        :component="props.component"
        :variables="props.variables"
        :code-edit-permissions="props.codeEditPermissions"
        :ignore-task-code-edit-permissions="props.ignoreTaskCodeEditPermissions"
        @validation-change="isFormValid = $event"
        @edit-change="isFormEdited = $event"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Component as SystemComponent } from "~/model/Component";
import { ComponentVariables } from "~/model/ComponentVariables";
import EditComponentBody from "./EditComponentBody.vue";
import { useI18n } from "vue-i18n";
import type { CodeEditPermissions } from "~/utils/codeEditPermissions";

const { t } = useI18n();

const props = defineProps<{
  open: boolean;
  component: SystemComponent;
  variables?: ComponentVariables;
  codeEditPermissions?: Partial<CodeEditPermissions>;
  ignoreTaskCodeEditPermissions?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:open", val: boolean): void;
  (
    e: "save",
    payload: { updatedComponent: SystemComponent; updatedVariables: ComponentVariables }
  ): void;
}>();

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit("update:open", val),
});

// A reference to the child body component so we can call its exposed method
const bodyRef = ref<InstanceType<typeof EditComponentBody> | null>(null);

// Controls whether the save button is disabled
const isFormValid = ref(true);
const isFormEdited = ref(false);

watch(isOpen, (open) => {
  if (open) {
    isFormValid.value = true;
    isFormEdited.value = false;
  }
});

function handleSave() {
  if (!bodyRef.value) return;

  // Grab the heavily processed payload directly from the child
  const payload = bodyRef.value.getDraftData();

  // Pass it up to the main renderer file
  emit("save", payload);

  // Close the modal
  isOpen.value = false;
}
</script>
