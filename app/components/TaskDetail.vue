<template>
  <div v-if="props.selectedTask" class="space-y-6 pt-2">
    <div class="grid gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] xl:items-start">
      <div class="space-y-4 rounded-xl border border-gray-200 p-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 class="text-xl font-semibold text-gray-900">
              {{ t('task_detail_title') }}
            </h3>
            <p class="text-sm text-gray-500">
              {{ t('task_detail_description') }}
            </p>
          </div>
        </div>

        <UFormField :label="t('task_title_label')">
          <UInput v-model="taskForm.title" :placeholder="t('task_title_placeholder')" class="w-[24rem] max-w-full" />
        </UFormField>

        <UFormField>
          <template #label>
            <span>{{ t('task_description_label') }}</span>
            <span class="ml-1 font-normal text-gray-400">
              ({{ t('task_optional_suffix') }})
            </span>
          </template>
          <UTextarea
            v-model="taskForm.description"
            :placeholder="t('task_description_placeholder')"
            :rows="4"
            autoresize
            class="w-full"
          />
        </UFormField>

        <UFormField :label="t('task_visible_pages')">
          <UAlert
            v-if="inconsistentLevelVisiblePages.length"
            color="red"
            icon="i-lucide-alert-triangle"
            :title="t('task_level_visible_pages_mismatch_title')"
            :description="visiblePagesMismatchDescription"
            class="mb-3"
          />
          <div v-if="systemPages.length" class="flex flex-wrap gap-2">
            <UBadge
              v-for="page in systemPages"
              :key="page.route"
              role="checkbox"
              :aria-checked="isPageVisible(page)"
              color="neutral"
              :variant="isPageVisible(page) ? 'solid' : 'subtle'"
              class="flex cursor-pointer items-center gap-1.5 px-3 py-1 transition"
              @click="toggleVisiblePage(page)"
            >
              <UIcon
                :name="isPageVisible(page) ? 'i-lucide-eye' : 'i-lucide-eye-off'"
                class="h-3.5 w-3.5"
              />
              {{ page.name }}: {{ page.route }}
            </UBadge>
          </div>
          <p v-else class="text-sm text-gray-500">
            {{ t('task_no_pages') }}
          </p>
        </UFormField>

        <UCheckbox
          v-model="taskForm.canExecuteQuery"
          :label="t('task_can_execute_query')"
          :description="t('task_can_execute_query_description')"
        />

        <UFormField
          :label="t('task_possible_edits')"
          :description="t('task_possible_edits_description')"
        >
          <div class="flex flex-wrap gap-2">
            <template v-for="option in codeEditPermissionOptions" :key="option.key">
              <UPopover
                v-if="!option.envAllowed"
                mode="hover"
                arrow
              >
                <UBadge
                  color="neutral"
                  variant="subtle"
                  class="flex cursor-not-allowed items-center gap-1.5 px-3 py-1 opacity-55"
                >
                  <UIcon name="i-lucide-lock" class="h-3.5 w-3.5" />
                  {{ option.label }}
                </UBadge>
                <template #content>
                  <div class="app-popover-content">
                    <UIcon name="i-lucide-lock" class="app-popover-icon" />
                    <div class="app-popover-text">
                      <strong class="app-popover-title">{{ option.label }}</strong>
                      <span class="app-popover-description">{{ t('task_code_edit_env_disabled') }}</span>
                    </div>
                  </div>
                </template>
              </UPopover>
              <UBadge
                v-else
                as="button"
                role="checkbox"
                :aria-checked="option.enabled"
                color="neutral"
                :variant="option.enabled ? 'solid' : 'subtle'"
                class="flex cursor-pointer items-center gap-1.5 px-3 py-1 transition"
                @click="toggleCodeEditPermission(option.key)"
              >
                <UIcon
                  :name="option.enabled ? 'i-lucide-check' : 'i-lucide-x'"
                  class="h-3.5 w-3.5"
                />
                {{ option.label }}
              </UBadge>
            </template>
          </div>
        </UFormField>

      </div>

      <div class="space-y-4 rounded-xl border border-gray-200 p-4">
        <span class="text-sm font-semibold text-gray-900 md:col-span-2">
          {{ t('task_level') }}
        </span>

        <div class="grid gap-3">
          <UFormField>
            <template #label>
              <span>{{ t('task_level') }}</span>
              <span class="ml-1 font-normal text-gray-500">
                ({{ t('task_level_info') }})
              </span>
            </template>
            <USelect
              v-model="taskForm.level"
              :items="levelOptions"
              value-key="value"
              label-key="label"
              class="w-full"
            />
          </UFormField>

          <div class="space-y-2">
            <span class="text-sm font-medium text-gray-700">
              {{ t('task_level_tasks') }}
            </span>
            <div class="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-2">
              <div
                v-for="task in tasksInSelectedLevel"
                :key="task.id"
                class="rounded-md border border-gray-200 px-3 py-2 text-sm"
                :class="task.id === taskForm.id
                  ? 'bg-primary-50 text-primary-700'
                  : 'bg-white text-gray-700'"
              >
                <span class="font-medium">{{ task.title || t('task_untitled') }}</span>
              </div>
              <p v-if="!tasksInSelectedLevel.length" class="px-2 py-3 text-sm text-gray-500">
                {{ t('task_level_no_tasks') }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4 rounded-xl border border-gray-200 p-4">
        <span class="text-sm font-semibold text-gray-900 md:col-span-2">
          {{ t('task_scoring_label') }}
        </span>

        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <UFormField>
            <template #label>
              <span>{{ t('task_points_reward') }}</span>
              <span class="ml-1 font-normal text-gray-500">
                ({{ t('task_points_reward_info') }})
              </span>
            </template>
            <UInput v-model.number="taskForm.pointsReward" type="number" min="0" class="w-[8rem] max-w-full" />
          </UFormField>

          <UFormField>
            <template #label>
              <span>{{ t('task_fail_penalty') }}</span>
              <span class="ml-1 font-normal text-gray-500">
                ({{ t('task_fail_penalty_info') }})
              </span>
            </template>
            <UInput v-model.number="taskForm.failPenalty" type="number" min="0" class="w-[8rem] max-w-full" />
          </UFormField>
        </div>
      </div>
    </div>

    <USeparator />

    <UFormField>
      <template #label>
        <span class="inline-flex items-center gap-1.5">
          {{ t('task_selected_components') }}
          <UPopover mode="hover" arrow>
            <button
              type="button"
              class="inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-teacher-600 focus:outline-none"
              :aria-label="t('task_selected_components_info')"
            >
              <UIcon name="i-lucide-info" class="h-4 w-4" />
            </button>
            <template #content>
              <div class="app-popover-content">
                <UIcon name="i-lucide-info" class="app-popover-icon" />
                <div class="app-popover-text">
                  <strong class="app-popover-title">{{ t('task_selected_components') }}</strong>
                  <span class="app-popover-description">{{ t('task_selected_components_info') }}</span>
                </div>
              </div>
            </template>
          </UPopover>
        </span>
      </template>
      <div class="flex flex-wrap gap-2 items-center">
        <UBadge v-for="component in selectedComponents" :key="component.id" color="neutral" variant="subtle"
          class="flex items-center gap-1 font-mono pr-1">
          <span>{{ component.name }}</span>
          <UPopover mode="hover" arrow>
            <UButton icon="i-lucide-copy" color="neutral" variant="ghost" size="sm" class="shrink-0"
              @click.stop="exportSelectedComponent(component.id)" />
            <template #content>
              <div class="app-popover-content">
                <UIcon name="i-lucide-copy" class="app-popover-icon" />
                <div class="app-popover-text">
                  <strong class="app-popover-title">{{ t('task_export_component_title') }}</strong>
                  <span class="app-popover-description">{{ t('task_export_component_desc') }}</span>
                </div>
              </div>
            </template>
          </UPopover>
          <UPopover mode="hover" arrow>
            <UButton icon="i-lucide-pencil" color="neutral" variant="ghost" size="sm" class="shrink-0"
              @click.stop="startEditingComponent(component.id)" />
            <template #content>
              <div class="app-popover-content">
                <UIcon name="i-lucide-pencil" class="app-popover-icon" />
                <div class="app-popover-text">
                  <strong class="app-popover-title">{{ t('task_edit_component_title') }}</strong>
                  <span class="app-popover-description">{{ t('task_edit_component_desc') }}</span>
                </div>
              </div>
            </template>
          </UPopover>
          <UPopover mode="hover" arrow>
            <UButton icon="i-lucide-trash-2" color="red" variant="ghost" size="sm" class="shrink-0"
              @click.stop="removeSelectedComponent(component.id)" />
            <template #content>
              <div class="app-popover-content">
                <UIcon name="i-lucide-trash-2" class="app-popover-icon" />
                <div class="app-popover-text">
                  <strong class="app-popover-title">{{ t('task_remove_component_title') }}</strong>
                  <span class="app-popover-description">{{ t('task_remove_component_desc') }}</span>
                </div>
              </div>
            </template>
          </UPopover>
        </UBadge>
        <p v-if="!selectedComponents.length" class="text-sm text-gray-500 mr-2">
          {{ t('task_no_components') }}
        </p>
        <UBadge
          as="button"
          color="neutral"
          variant="outline"
          class="flex items-center gap-1 font-mono cursor-pointer border-dashed hover:bg-gray-50"
          @click="showPasteComponentModal = true"
        >
          <UIcon name="i-lucide-plus" class="w-3 h-3" />
          {{ t('task_add_component_json') }}
        </UBadge>
      </div>
    </UFormField>

    <div v-if="editingComponent" class="space-y-4 rounded-xl border border-gray-200 p-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 class="text-base font-semibold text-gray-900">
            {{ t('task_edit_component_title') }}
          </h3>
          <p class="text-sm text-gray-500">
            {{ editingComponent.name || editingComponent.id }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <UButton color="neutral" variant="ghost" @click="stopEditingComponent" size="sm">
            {{ t('task_close') }}
          </UButton>
          <UButton color="sky" :disabled="!isEditingComponentValid" @click="saveEditedComponent" size="sm">
            {{ t('task_save_changes') }}
          </UButton>
        </div>
      </div>

      <EditComponentBody :key="editingComponent.id" ref="editComponentBodyRef" :component="editingComponent"
        :ignore-task-code-edit-permissions="true"
        @validation-change="isEditingComponentValid = $event" />
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
        <div class="space-y-4 rounded-xl border border-gray-200 p-4">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ t('task_activity') }}
          </h3>

          <div class="grid gap-4">
            <UFormField>
              <template #label>
                <span>{{ t('task_activity_label_opt') }}</span>
                <span class="ml-1 font-normal text-gray-400">
                  ({{ t('task_optional_suffix') }})
                </span>
              </template>
              <UInput v-model="taskForm.activityLabel" :placeholder="t('task_activity_label_placeholder')" class="w-[24rem] max-w-full" />
            </UFormField>

            <UFormField>
              <template #label>
                <span class="inline-flex items-center gap-1.5">
                  {{ t('task_activity_type') }}
                  <UPopover mode="hover" arrow>
                    <button
                      type="button"
                      class="inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-teacher-600 focus:outline-none"
                      :aria-label="t('task_activity_type_info')"
                    >
                      <UIcon name="i-lucide-info" class="h-4 w-4" />
                    </button>
                    <template #content>
                      <div class="app-popover-content">
                        <UIcon name="i-lucide-info" class="app-popover-icon" />
                        <div class="app-popover-text">
                          <strong class="app-popover-title">{{ t('task_activity_type') }}</strong>
                          <div class="app-popover-description space-y-1.5 text-left font-normal">
                            <p><span class="font-semibold">{{ t('task_activity_repair') }}</span>: {{ t('task_activity_repair_info') }}</p>
                            <p><span class="font-semibold">{{ t('task_activity_select') }}</span>: {{ t('task_activity_select_info') }}</p>
                            <p><span class="font-semibold">{{ t('task_activity_select_options') }}</span>: {{ t('task_activity_select_options_info') }}</p>
                          </div>
                        </div>
                      </div>
                    </template>
                  </UPopover>
                </span>
              </template>
              <USelect v-model="taskForm.activityType" :items="activityTypeOptions" value-key="value" label-key="label"
                :placeholder="t('task_select_activity_type')" class="w-full" />
            </UFormField>

            <UFormField v-if="taskForm.activityType === ActivityType.SELECT_OPTIONS">
              <template #label>
                <span class="inline-flex items-center gap-1.5">
                  {{ t('task_activity_options') }}
                  <UPopover mode="hover" arrow>
                    <button
                      type="button"
                      class="inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-teacher-600 focus:outline-none"
                      :aria-label="t('task_options_info')"
                    >
                      <UIcon name="i-lucide-info" class="h-4 w-4" />
                    </button>
                    <template #content>
                      <div class="app-popover-content">
                        <UIcon name="i-lucide-info" class="app-popover-icon" />
                        <div class="app-popover-text">
                          <strong class="app-popover-title">{{ t('task_activity_options') }}</strong>
                          <span class="app-popover-description">{{ t('task_options_info') }}</span>
                        </div>
                      </div>
                    </template>
                  </UPopover>
                </span>
              </template>
              <div class="space-y-3">
                <div v-for="(option, index) in taskForm.activityOptions" :key="`activity-option-${index}`"
                  class="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 p-3">
                  <span class="w-6 text-sm font-medium text-gray-500">
                    {{ index + 1 }}.
                  </span>
                  <UInput v-model="option.text" :placeholder="t('task_option_text_placeholder')" class="w-[20rem] max-w-full" />
                  <UButton :icon="option.isCorrect ? 'i-lucide-check' : 'i-lucide-x'"
                    :color="option.isCorrect ? 'green' : 'red'" variant="soft" size="sm" class="shrink-0"
                    @click="toggleActivityOptionCorrect(index)" />
                  <UButton icon="i-lucide-trash-2" color="red" variant="ghost" size="sm" class="shrink-0"
                    @click="removeActivityOption(index)" />
                </div>

                <UButton icon="i-lucide-plus" color="neutral" variant="soft" @click="addActivityOption" size="sm">
                  {{ t('task_add_option') }}
                </UButton>
              </div>
            </UFormField>

            <UFormField>
              <template #label>
                <span>{{ t('task_activity_description') }}</span>
                <span class="ml-1 font-normal text-gray-400">
                  ({{ t('task_optional_suffix') }})
                </span>
              </template>
              <UTextarea
                v-model="taskForm.activityDescription"
                :placeholder="t('task_activity_description_placeholder')"
                :rows="4"
                autoresize
                class="w-full"
              />
            </UFormField>

            <div class="flex items-start gap-2">
              <UCheckbox
                v-model="taskForm.substituteAfterActivity"
                :label="t('task_substitute_checkbox')"
                :disabled="isRepairActivity"
              />
              <UPopover mode="hover" arrow>
                <button
                  type="button"
                  class="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-teacher-600 focus:outline-none"
                  :aria-label="substituteAfterActivityHint"
                >
                  <UIcon name="i-lucide-info" class="h-4 w-4" />
                </button>
                <template #content>
                  <div class="app-popover-content">
                    <UIcon name="i-lucide-info" class="app-popover-icon" />
                    <div class="app-popover-text">
                      <strong class="app-popover-title">{{ t('task_substitute_checkbox') }}</strong>
                      <span class="app-popover-description">{{ substituteAfterActivityHint }}</span>
                    </div>
                  </div>
                </template>
              </UPopover>
            </div>

            <UCheckbox
              v-if="isRepairActivity"
              v-model="taskForm.activityCheckRepair"
              :label="t('task_activity_check_repair')"
            />

            <UFormField v-if="isRepairActivity && taskForm.activityCheckRepair">
              <template #label>
                <span>{{ t('task_activity_repair_checks') }}</span>
              </template>

              <div class="space-y-3">
                <div
                  v-for="(constraint, index) in taskForm.activityRepairChecks"
                  :key="constraint.id"
                  class="grid gap-2 rounded-lg border border-gray-200 p-3 md:grid-cols-[minmax(0,1.5fr)_160px_minmax(0,1fr)_auto]"
                >
                  <USelect
                    v-model="constraint.componentId"
                    :items="componentContainsComponentOptions"
                    value-key="value"
                    label-key="label"
                    :placeholder="t('task_component_contains_component')"
                    class="w-full"
                    @update:model-value="value => updateActivityRepairCheckSelection(index, value)"
                  />
                  <USelect
                    v-model="constraint.operator"
                    :items="componentContainsOperatorOptions"
                    value-key="value"
                    label-key="label"
                    class="w-full"
                  />
                  <UInput
                    v-model="constraint.text"
                    :placeholder="t('task_component_contains_text_placeholder')"
                    class="w-[16rem] max-w-full"
                  />
                  <UButton
                    icon="i-lucide-trash-2"
                    color="red"
                    variant="ghost"
                    size="sm"
                    class="justify-self-start md:justify-self-end"
                    @click="removeActivityRepairCheck(index)"
                  />
                </div>

                <p v-if="!componentContainsComponentOptions.length" class="text-sm text-gray-500">
                  {{ t('task_no_component_options') }}
                </p>

                <UButton
                  icon="i-lucide-plus"
                  color="neutral"
                  variant="soft"
                  :disabled="!componentContainsComponentOptions.length"
                  @click="addActivityRepairCheck"
                 size="sm">
                  {{ t('task_add_component_contains_constraint') }}
                </UButton>
              </div>
            </UFormField>
          </div>
        </div>

        <div class="space-y-4 rounded-xl border border-gray-200 p-4">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ t('task_finish') }}
          </h3>

          <div class="grid gap-4">
            <UFormField>
              <template #label>
                <span>{{ t('task_finish_label_opt') }}</span>
                <span class="ml-1 font-normal text-gray-400">
                  ({{ t('task_optional_suffix') }})
                </span>
              </template>
              <UInput v-model="taskForm.finishLabel" :placeholder="t('task_finish_label_placeholder')" class="w-[24rem] max-w-full" />
            </UFormField>

            <UFormField>
              <template #label>
                <span>{{ t('task_finish_description_label') }}</span>
                <span class="ml-1 font-normal text-gray-400">
                  ({{ t('task_optional_suffix') }})
                </span>
              </template>
              <UTextarea
                v-model="taskForm.finishDescription"
                :placeholder="t('task_finish_description_placeholder')"
                :rows="4"
                autoresize
                class="w-full"
              />
            </UFormField>

            <UFormField :label="t('task_finish_type')">
              <USelect v-model="taskForm.finishType" :items="finishTypeOptions" value-key="value" label-key="label"
                :placeholder="t('task_select_finish_type')" class="w-full" />
            </UFormField>

            <UFormField v-if="taskForm.finishType === FinishType.SELECT_OPTIONS">
              <template #label>
                <span class="inline-flex items-center gap-1.5">
                  {{ t('task_finish_options') }}
                  <UPopover mode="hover" arrow>
                    <button
                      type="button"
                      class="inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-teacher-600 focus:outline-none"
                      :aria-label="t('task_options_info')"
                    >
                      <UIcon name="i-lucide-info" class="h-4 w-4" />
                    </button>
                    <template #content>
                      <div class="app-popover-content">
                        <UIcon name="i-lucide-info" class="app-popover-icon" />
                        <div class="app-popover-text">
                          <strong class="app-popover-title">{{ t('task_finish_options') }}</strong>
                          <span class="app-popover-description">{{ t('task_options_info') }}</span>
                        </div>
                      </div>
                    </template>
                  </UPopover>
                </span>
              </template>
              <div class="space-y-3">
                <div v-for="(option, index) in taskForm.finishOptions" :key="`finish-option-${index}`"
                  class="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 p-3">
                  <span class="w-6 text-sm font-medium text-gray-500">
                    {{ index + 1 }}.
                  </span>
                  <UInput v-model="option.text" :placeholder="t('task_option_text_placeholder')" class="w-[20rem] max-w-full" />
                  <UButton :icon="option.isCorrect ? 'i-lucide-check' : 'i-lucide-x'"
                    :color="option.isCorrect ? 'green' : 'red'" variant="soft" size="sm" class="shrink-0"
                    @click="toggleFinishOptionCorrect(index)" />
                  <UButton icon="i-lucide-trash-2" color="red" variant="ghost" size="sm" class="shrink-0"
                    @click="removeFinishOption(index)" />
                </div>

                <UButton icon="i-lucide-plus" color="neutral" variant="soft" @click="addFinishOption" size="sm">
                  {{ t('task_add_option') }}
                </UButton>
              </div>
            </UFormField>

            <UFormField v-if="taskForm.finishType === FinishType.TYPE_CORRECT" :label="t('task_finish_correct_answer')">
              <UInput v-model="taskForm.finishCorrectAnswer" :placeholder="t('task_correct_answer_placeholder')" class="w-[24rem] max-w-full" />
            </UFormField>

            <UFormField v-if="taskForm.finishType === FinishType.AFTER_DATABASE_UPDATE" :label="t('task_finish_check_query')">
              <UTextarea
                v-model="taskForm.finishCheckQuery"
                :placeholder="t('task_finish_check_query_placeholder')"
                :rows="4"
                autoresize
                class="font-mono w-full"
              />
            </UFormField>

            <UFormField v-if="taskForm.finishType === FinishType.VARIABLE_CONSTRAINT">
              <template #label>
                <span>{{ t('task_finish_variable_constraints') }}</span>
              </template>

              <div class="space-y-3">
                <div
                  v-for="(constraint, index) in taskForm.finishVariableConstraints"
                  :key="constraint.id"
                  class="grid gap-2 rounded-lg border border-gray-200 p-3 md:grid-cols-[minmax(0,1.6fr)_120px_minmax(0,1fr)_auto]"
                >
                  <USelect
                    v-model="constraint.variableKey"
                    :items="variableConstraintOptions"
                    value-key="value"
                    label-key="label"
                    :placeholder="t('task_variable_constraint_variable')"
                    class="w-full"
                    @update:model-value="value => updateVariableConstraintSelection(index, value)"
                  />
                  <USelect
                    v-model="constraint.operator"
                    :items="variableConstraintOperatorOptions"
                    value-key="value"
                    label-key="label"
                    class="w-full"
                  />
                  <UInput
                    v-model="constraint.value"
                    :placeholder="t('task_variable_constraint_value_placeholder')"
                    class="w-[16rem] max-w-full"
                  />
                  <UButton
                    icon="i-lucide-trash-2"
                    color="red"
                    variant="ghost"
                    size="sm"
                    class="justify-self-start md:justify-self-end"
                    @click="removeVariableConstraint(index)"
                  />
                </div>

                <p v-if="!variableConstraintOptions.length" class="text-sm text-gray-500">
                  {{ t('task_no_variable_options') }}
                </p>

                <UButton
                  icon="i-lucide-plus"
                  color="neutral"
                  variant="soft"
                  :disabled="!variableConstraintOptions.length"
                  @click="addVariableConstraint"
                 size="sm">
                  {{ t('task_add_variable_constraint') }}
                </UButton>
              </div>
            </UFormField>

          </div>
        </div>
      </div>

      <div class="grid gap-4">
        <UFormField class="md:col-span-2">
          <template #label>
            <span class="inline-flex items-center gap-1.5">
              {{ t('task_feedback_label') }}
              <UPopover mode="hover" arrow>
                <button
                  type="button"
                  class="inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-teacher-600 focus:outline-none"
                  :aria-label="t('task_feedback_info')"
                >
                  <UIcon name="i-lucide-info" class="h-4 w-4" />
                </button>
                <template #content>
                  <div class="app-popover-content">
                    <UIcon name="i-lucide-info" class="app-popover-icon" />
                    <div class="app-popover-text">
                      <strong class="app-popover-title">{{ t('task_feedback_label') }}</strong>
                      <span class="app-popover-description">{{ t('task_feedback_info') }}</span>
                    </div>
                  </div>
                </template>
              </UPopover>
            </span>
          </template>
          <UTextarea
            v-model="taskForm.feedback"
            :placeholder="t('task_feedback_placeholder')"
            :rows="4"
            autoresize
            class="w-full"
          />
        </UFormField>
    </div>
  </div>

  <UModal v-model:open="showPasteComponentModal" :title="t('task_add_component_json')" :ui="{ content: 'w-[560px]' }">
    <template #body>
      <div class="flex flex-col gap-4">
        <p class="text-sm text-gray-500">
          {{ t('task_add_component_json_desc') }}
        </p>
        <UTextarea
          v-model="pasteComponentJsonText"
          :placeholder="`{ &quot;id&quot;: &quot;...&quot;, &quot;name&quot;: &quot;...&quot;, &quot;html&quot;: &quot;...&quot; }`"
          :rows="10"
          class="font-mono w-full"
        />
        <p v-if="pasteComponentError" class="text-sm text-red-500">
          {{ pasteComponentError }}
        </p>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          @click="showPasteComponentModal = false"
         size="sm">
          {{ t('cancel') }}
        </UButton>
        <UButton
          color="primary"
          :disabled="!pasteComponentJsonText.trim()"
          @click="handlePasteComponent"
         size="sm">
          {{ t('task_paste_json') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import EditComponentBody from '~/components/EditComponentBody.vue'
import { Component as SystemComponent } from '~/model/Component'
import type { ComponentVariables } from '~/model/ComponentVariables'
import type { Page } from '~/model/Page'
import type { ComponentContainsConstraint, ComponentContainsOperator } from '~/model/Task/Activity/ComponentContainsCheck'
import { ActivityType } from '~/model/Task/Activity/ActivityType'
import { FinishType } from '~/model/Task/Finish/FinishType'
import type { VariableConstraint, VariableConstraintOperator, VariableConstraintScope } from '~/model/Task/Finish/VariableConstraintFinish'
import { Task } from '~/model/Task/Task'
import { useSystemsStore } from '~/stores/systemsStore'
import {
  CODE_EDIT_PERMISSION_KEYS,
  CODE_EDIT_PERMISSION_LABELS,
  codeEditEnvironmentFromRuntimeConfig,
  effectiveCodeEditPermissions,
  type CodeEditPermissionKey,
  type CodeEditPermissions
} from '~/utils/codeEditPermissions'
import { inconsistentVisiblePageLevels } from '~/utils/taskLevels'
import { systemVisiblePages } from '~/utils/taskPageVisibility'

type TaskDetailForm = {
  id: string
  title: string
  description: string
  finishDescription: string
  finishType: FinishType
  finishLabel: string
  level: number
  feedback: string
  pointsReward: number
  failPenalty: number
  canExecuteQuery: boolean
  activityType: ActivityType
  activityLabel: string
  activityDescription: string
  activityCheckRepair: boolean
  activityRepairChecks: ComponentContainsConstraintForm[]
  activityOptions: ActivityOption[]
  finishOptions: ActivityOption[]
  finishCorrectAnswer: string
  finishCheckQuery: string
  finishVariableConstraints: VariableConstraintForm[]
  substituteAfterActivity: boolean
  visiblePages: Page[]
  codeEditPermissions: CodeEditPermissions
}

type ActivityOption = {
  id?: string
  text: string
  isCorrect: boolean
}

type VariableConstraintForm = {
  id: string
  variableKey: string
  componentId?: string
  componentName?: string
  variableName: string
  variableScope: VariableConstraintScope
  operator: VariableConstraintOperator
  value: string
}

type VariableConstraintOption = {
  label: string
  value: string
  componentId?: string
  componentName?: string
  variableName: string
  variableScope: VariableConstraintScope
}

type ComponentContainsConstraintForm = {
  id: string
  componentId: string
  componentName?: string
  operator: ComponentContainsOperator
  text: string
}

type ComponentContainsComponentOption = {
  label: string
  value: string
}

const props = defineProps<{
  selectedTask: Task | null
}>()
const globalSettings = useGlobalSettingsStore()
const systemsStore = useSystemsStore()
const runtimeConfig = useRuntimeConfig()
const codeEditEnvironment = computed(() =>
  codeEditEnvironmentFromRuntimeConfig(runtimeConfig.public as Record<string, unknown>)
)
const codeEditPermissionOptions = computed(() =>
  CODE_EDIT_PERMISSION_KEYS.map(key => ({
    key,
    label: CODE_EDIT_PERMISSION_LABELS[key],
    envAllowed: codeEditEnvironment.value[key],
    enabled: taskForm.codeEditPermissions[key]
  }))
)
const selectedTaskFromSettings = computed<Task | null>(() => {
  if (!globalSettings.selectedTaskId) {
    return null
  }

  return systemsStore.selectedSystem?.tasks?.find(task => task.id === globalSettings.selectedTaskId) ?? props.selectedTask
})
const selectedComponentIds = computed(() =>
  selectedTaskFromSettings.value?.errorComponents?.map(component => component.id) ?? []
)
const selectedComponents = computed(() =>
  selectedTaskFromSettings.value?.errorComponents?.map(component => ({
    id: component.id,
    name: component.name || component.id
  })) ?? []
)
const systemPages = computed(() => {
  const system = systemsStore.selectedSystem
  return system ? systemVisiblePages(system, t('database')) : []
})
const systemTasks = computed(() => systemsStore.selectedSystem?.tasks ?? [])
const inconsistentLevelVisiblePages = computed(() => {
  const system = systemsStore.selectedSystem
  return system ? inconsistentVisiblePageLevels(system.tasks, systemVisiblePages(system)) : []
})
const visiblePagesMismatchDescription = computed(() => {
  const levels = inconsistentLevelVisiblePages.value.join(', ')
  return levels
    ? `${t('task_level_visible_pages_mismatch_description')} ${t('task_levels')}: ${levels}`
    : t('task_level_visible_pages_mismatch_description')
})
const systemLevelCount = ref(1)
const levelOptions = computed(() =>
  Array.from({ length: normalizeLevelCount(systemLevelCount.value) }, (_, index) => {
    const level = index + 1
    return {
      label: String(level),
      value: level
    }
  })
)
const tasksInSelectedLevel = computed(() =>
  systemTasks.value.filter(task => task.level === taskForm.level)
)
const taskSelectedComponents = computed(() =>
  selectedTaskFromSettings.value?.errorComponents ?? []
)
const availableFinishComponents = computed(() => {
  const uniqueComponents = new Map<string, { id: string, name: string }>()
  const allComponents = taskSelectedComponents.value

  for (const component of allComponents) {
    uniqueComponents.set(String(component.id), {
      id: String(component.id),
      name: component.name || String(component.id)
    })
  }

  return Array.from(uniqueComponents.values())
})
const variableConstraintOperatorOptions: Array<{ label: VariableConstraintOperator; value: VariableConstraintOperator }> = [
  { label: '<', value: '<' },
  { label: '>', value: '>' },
  { label: '>=', value: '>=' },
  { label: '<=', value: '<=' },
  { label: '==', value: '==' }
]
const componentContainsOperatorOptions = computed<Array<{ label: string; value: ComponentContainsOperator }>>(() => [
  { label: t('task_component_contains_operator_contains'), value: 'contains' },
  { label: t('task_component_contains_operator_not_contains'), value: 'not-contains' }
])
const componentContainsComponentOptions = computed<ComponentContainsComponentOption[]>(() =>
  availableFinishComponents.value.map(component => ({
    label: component.name,
    value: component.id
  }))
)
const variableConstraintOptions = computed<VariableConstraintOption[]>(() => {
  void t('task_variable_group_general')
  const seen = new Set<string>()
  const options: VariableConstraintOption[] = []
  const components = taskSelectedComponents.value

  for (const component of components) {
    const componentName = component.name || component.id
    addComponentVariableOptions(options, seen, component.id, componentName, 'general', component.variables?.generalVariables)
    addComponentVariableOptions(options, seen, component.id, componentName, 'sql', component.variables?.sqlVariables)
    addComponentVariableOptions(options, seen, component.id, componentName, 'js', component.variables?.jsVariables)
    addSystemInputVariableOptions(options, seen, component.id, componentName, component.html)
  }

  return options
})
const editingComponentId = ref<string | null>(null)
const isEditingComponentValid = ref(true)
const editComponentBodyRef = ref<InstanceType<typeof EditComponentBody> | null>(null)
const editingComponent = ref<SystemComponent | null>(null)

const showPasteComponentModal = ref(false)
const pasteComponentJsonText = ref('')
const pasteComponentError = ref('')

function handlePasteComponent() {
  pasteComponentError.value = ''
  try {
    const data = JSON.parse(pasteComponentJsonText.value)
    const newComponents = Array.isArray(data) ? data : [data]

    for (const c of newComponents) {
      if (!c || !c.id) {
        throw new Error(t('task_invalid_component_json'))
      }
    }
    const validComponents = newComponents.map(c => SystemComponent.fromJSON(c))

    const selectedTask = selectedTaskFromSettings.value
    if (selectedTask) {
      const updatedErrorComponents = [...(selectedTask.errorComponents || [])]
      const updatedActivityComponents = [...((selectedTask.activity?.activityComponents ?? selectedTask.errorComponents) || [])]

      for (const comp of validComponents) {
        if (!updatedErrorComponents.some(existing => existing.id === comp.id)) {
          updatedErrorComponents.push(comp)
        }
        if (!updatedActivityComponents.some(existing => existing.id === comp.id)) {
          updatedActivityComponents.push(comp)
        }
      }

      emit('update:selectedTask', {
        ...selectedTask,
        errorComponents: updatedErrorComponents,
        activity: {
          ...(selectedTask.activity ?? {}),
          activityComponents: updatedActivityComponents
        }
      })
    }

    showPasteComponentModal.value = false
    pasteComponentJsonText.value = ''
  } catch (err: any) {
    pasteComponentError.value = err.message || t('task_invalid_component_json')
  }
}

defineModel<string>({ default: '' })

const emit = defineEmits<{
  (e: 'submit' | 'evaluate'): void
  (e: 'update:selectedTask', value: Task): void
}>()

const createDefaultForm = (): TaskDetailForm => ({
  id: '',
  title: '',
  description: '',
  finishDescription: '',
  finishType: FinishType.IMMEDIATE,
  finishLabel: '',
  level: 1,
  feedback: '',
  pointsReward: 0,
  failPenalty: 1,
  canExecuteQuery: false,
  activityType: ActivityType.REPAIR,
  activityLabel: '',
  activityDescription: '',
  activityCheckRepair: false,
  activityRepairChecks: [],
  activityOptions: [],
  finishOptions: [],
  finishCorrectAnswer: '',
  finishCheckQuery: '',
  finishVariableConstraints: [],
  substituteAfterActivity: false,
  visiblePages: [],
  codeEditPermissions: effectiveCodeEditPermissions(undefined, codeEditEnvironment.value)
})

const taskForm = reactive<TaskDetailForm>(createDefaultForm())
const TASK_UPDATE_DEBOUNCE_MS = 1000
let taskUpdateTimeout: ReturnType<typeof setTimeout> | null = null
let queuedTaskUpdate: Task | null = null
let isSyncingTaskForm = false

const { t } = useI18n()

watch(
  () => systemsStore.selectedSystem?.levelCount,
  (levelCount) => {
    const normalizedLevelCount = normalizeLevelCount(levelCount)
    systemLevelCount.value = normalizedLevelCount
    taskForm.level = Math.min(normalizeTaskLevel(taskForm.level), normalizedLevelCount)
  },
  { immediate: true }
)

const finishTypeOptions = computed(() => [
  { label: t('task_finish_type_after_activity'), value: FinishType.IMMEDIATE },
  { label: t('task_finish_type_after_db_label'), value: FinishType.AFTER_DATABASE_UPDATE },
  { label: t('task_finish_type_select_options_label'), value: FinishType.SELECT_OPTIONS },
  { label: t('task_finish_type_correct_label'), value: FinishType.TYPE_CORRECT },
  // Variable constraints are still supported for existing tasks, but hidden from the finish type menu for now.
  // { label: t('task_finish_type_variable_constraint_label'), value: FinishType.VARIABLE_CONSTRAINT }
])

const activityTypeOptions = computed(() => [
  { label: t('task_activity_repair'), value: ActivityType.REPAIR },
  { label: t('task_activity_select'), value: ActivityType.SELECT },
  { label: t('task_activity_select_options'), value: ActivityType.SELECT_OPTIONS }
])
const isRepairActivity = computed(() => taskForm.activityType === ActivityType.REPAIR)
const substituteAfterActivityHint = computed(() =>
  isRepairActivity.value
    ? `${t('task_substitute_after_activity_hint')} ${t('task_substitute_after_activity_repair_disabled_hint')}`
    : t('task_substitute_after_activity_hint')
)

watch(
  () => props.selectedTask,
  (task) => {
    flushQueuedTaskUpdate()
    isSyncingTaskForm = true
    Object.assign(taskForm, createDefaultForm())

    if (!task) {
      nextTick(() => {
        isSyncingTaskForm = false
      })
      return
    }

    Object.assign(taskForm, {
      id: task.id,
      title: task.title,
      description: task.description,
      finishDescription: task.finish?.description ?? '',
      finishType: task.finishType,
      finishLabel: task.finish?.label ?? '',
      level: task.level,
      feedback: task.feedback,
      pointsReward: task.pointsReward,
      failPenalty: task.failPenalty,
      canExecuteQuery: Boolean(task.canExecuteQuery),
      activityType: task.activityType,
      activityLabel: task.activity?.label ?? '',
      activityDescription: task.activity?.description ?? '',
      activityCheckRepair: Boolean((task.activity as { checkRepair?: boolean } | undefined)?.checkRepair),
      activityRepairChecks: Array.isArray((task.activity as { repairChecks?: ComponentContainsConstraint[] } | undefined)?.repairChecks)
        ? ((task.activity as { repairChecks?: ComponentContainsConstraint[] }).repairChecks ?? []).map(toComponentContainsConstraintForm)
        : [],
      activityOptions: Array.isArray((task.activity as { options?: ActivityOption[] } | undefined)?.options)
        ? (task.activity as { options?: ActivityOption[] }).options.map(option => ({
          id: option.id,
          text: option.text ?? '',
          isCorrect: Boolean(option.isCorrect)
        }))
        : [],
      finishOptions: Array.isArray((task.finish as { options?: ActivityOption[] } | undefined)?.options)
        ? ((task.finish as { options?: ActivityOption[] }).options ?? []).map(option => ({
          id: option.id,
          text: option.text ?? '',
          isCorrect: Boolean(option.isCorrect)
        }))
        : [],
      finishCorrectAnswer: (task.finish as { correctAnswer?: string } | undefined)?.correctAnswer ?? '',
      finishCheckQuery: (task.finish as { checkQuery?: string } | undefined)?.checkQuery ?? '',
      finishVariableConstraints: task.finishType === FinishType.VARIABLE_CONSTRAINT
        && Array.isArray((task.finish as { constraints?: VariableConstraint[] } | undefined)?.constraints)
        ? ((task.finish as { constraints?: VariableConstraint[] }).constraints ?? []).map(toVariableConstraintForm)
        : [],
      substituteAfterActivity: (task.activity as any)?.substituteAfterActivity ?? false,
      visiblePages: (Array.isArray(task.visiblePages)
        ? task.visiblePages
        : systemPages.value).map(toTaskPage),
      codeEditPermissions: effectiveCodeEditPermissions(task.codeEditPermissions, codeEditEnvironment.value)
    })

    nextTick(() => {
      isSyncingTaskForm = false
    })
  },
  { immediate: true }
)

watch(
  taskForm,
  () => {
    if (isSyncingTaskForm || !props.selectedTask) {
      return
    }

    queueTaskUpdate(buildTaskUpdate(props.selectedTask))
  },
  { deep: true }
)

function buildTaskUpdate(selectedTask: Task): Task {
  const finish = Task.createFinish(
    taskForm.finishType,
    {
      ...selectedTask.finish,
      label: taskForm.finishLabel || undefined,
      description: taskForm.finishDescription || undefined,
      isComplete: selectedTask.finish?.isComplete ?? false,
      options: taskForm.finishOptions.map(option => ({
        id: option.id ?? createOptionId(),
        text: option.text,
        isCorrect: option.isCorrect
      })),
      correctAnswer: taskForm.finishCorrectAnswer,
      checkQuery: taskForm.finishCheckQuery,
      constraints: taskForm.finishVariableConstraints.map(toVariableConstraint)
    },
    taskForm.finishDescription || undefined
  )

  return {
    ...selectedTask,
    ...taskForm,
    canExecuteQuery: taskForm.canExecuteQuery,
    finishType: taskForm.finishType,
    finish,
    activityType: taskForm.activityType,
    activity: {
      ...(selectedTask.activity ?? {}),
      label: taskForm.activityLabel || undefined,
      description: taskForm.activityDescription || undefined,
      activityComponents: selectedTask.activity?.activityComponents ?? selectedTask.errorComponents ?? [],
      checkRepair: taskForm.activityType === ActivityType.REPAIR ? taskForm.activityCheckRepair : false,
      repairChecks: taskForm.activityType === ActivityType.REPAIR && taskForm.activityCheckRepair
        ? taskForm.activityRepairChecks.map(toComponentContainsConstraint)
        : [],
      substituteAfterActivity: taskForm.activityType === ActivityType.REPAIR ? false : taskForm.substituteAfterActivity,
      options: taskForm.activityType === ActivityType.SELECT_OPTIONS
        ? taskForm.activityOptions.map(option => ({
          id: option.id ?? createOptionId(),
          text: option.text,
          isCorrect: option.isCorrect
        }))
        : undefined
    },
    visiblePages: taskForm.visiblePages.map(toTaskPage),
    codeEditPermissions: effectiveCodeEditPermissions(taskForm.codeEditPermissions, codeEditEnvironment.value)
  }
}

function normalizeLevelCount(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1
}

function normalizeTaskLevel(value: unknown): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return 1
  }

  return Math.max(1, Math.min(Math.floor(parsed), normalizeLevelCount(systemLevelCount.value)))
}

function queueTaskUpdate(updatedTask: Task) {
  queuedTaskUpdate = updatedTask

  if (taskUpdateTimeout) {
    clearTimeout(taskUpdateTimeout)
  }

  taskUpdateTimeout = setTimeout(() => {
    flushQueuedTaskUpdate()
  }, TASK_UPDATE_DEBOUNCE_MS)
}

function flushQueuedTaskUpdate() {
  if (taskUpdateTimeout) {
    clearTimeout(taskUpdateTimeout)
    taskUpdateTimeout = null
  }

  if (!queuedTaskUpdate) {
    return
  }

  emit('update:selectedTask', queuedTaskUpdate)
  queuedTaskUpdate = null
}

onBeforeUnmount(() => {
  flushQueuedTaskUpdate()
})

watch(selectedComponentIds, (componentIds) => {
  if (editingComponentId.value && !componentIds.includes(editingComponentId.value)) {
    stopEditingComponent()
  }
})

watch(
  () => taskForm.finishType,
  (newType) => {
    if (newType === FinishType.IMMEDIATE && !taskForm.finishDescription) {
      taskForm.finishDescription = t('task_finish_immediate_default_description')
    }
  },
  { immediate: true }
)

watch(
  () => taskForm.activityType,
  (activityType) => {
    if (activityType === ActivityType.REPAIR) {
      taskForm.substituteAfterActivity = false
      return
    }

    taskForm.activityCheckRepair = false
    taskForm.activityRepairChecks = []
  },
  { immediate: true }
)

const toast = useToast()

function exportSelectedComponent(componentId: string) {
  const selectedTask = selectedTaskFromSettings.value
  const component = selectedTask?.errorComponents?.find(c => c.id === componentId)
  if (component) {
    // create clean instance to avoid serializing vue proxies directly if any
    const cleanComponent = SystemComponent.fromJSON(JSON.parse(JSON.stringify(component)))
    navigator.clipboard.writeText(JSON.stringify(cleanComponent.toJSON(), null, 2))
    toast.add({
      title: t('copy_id_toast_success'),
      color: 'green',
      icon: 'i-lucide-check-circle'
    })
  }
}

function removeSelectedComponent(componentId: string) {
  const selectedTask = selectedTaskFromSettings.value

  if (!selectedTask?.errorComponents?.some(component => component.id === componentId)) {
    return
  }

  emit('update:selectedTask', {
    ...selectedTask,
    errorComponents: selectedTask.errorComponents.filter(component => component.id !== componentId),
    activity: {
      ...(selectedTask.activity ?? {}),
      activityComponents: (selectedTask.activity?.activityComponents ?? selectedTask.errorComponents).filter(
        component => component.id !== componentId
      )
    }
  })

  if (editingComponentId.value === componentId) {
    stopEditingComponent()
  }
}

function startEditingComponent(componentId: string) {
  editingComponentId.value = componentId
  const source = selectedTaskFromSettings.value?.errorComponents?.find(c => c.id === componentId)
  editingComponent.value = source ? SystemComponent.fromJSON(JSON.parse(JSON.stringify(source))) : null
}

function stopEditingComponent() {
  editingComponentId.value = null
  editingComponent.value = null
  isEditingComponentValid.value = true
}

async function saveEditedComponent() {
  if (!editComponentBodyRef.value || !editingComponent.value) {
    return
  }

  const payload = editComponentBodyRef.value.getDraftData() as {
    updatedComponent: SystemComponent
    updatedVariables: ComponentVariables
  }

  const updatedClone = SystemComponent.fromJSON(JSON.parse(JSON.stringify(editingComponent.value)))
  Object.assign(updatedClone, payload.updatedComponent)
  updatedClone.variables = payload.updatedVariables

  const task = selectedTaskFromSettings.value
  if (task?.errorComponents) {
    const idx = task.errorComponents.findIndex(c => c.id === editingComponentId.value)
    if (idx !== -1) {
      task.errorComponents[idx] = updatedClone
    }
    emit('update:selectedTask', { ...task, errorComponents: [...task.errorComponents] })
  }

  stopEditingComponent()
}

function addActivityOption() {
  taskForm.activityOptions.push({
    id: createOptionId(),
    text: '',
    isCorrect: false
  })
}

function removeActivityOption(index: number) {
  taskForm.activityOptions.splice(index, 1)
}

function toggleActivityOptionCorrect(index: number) {
  const option = taskForm.activityOptions[index]

  if (!option) {
    return
  }

  option.isCorrect = !option.isCorrect
}

function addFinishOption() {
  taskForm.finishOptions.push({
    id: createOptionId(),
    text: '',
    isCorrect: false
  })
}

function removeFinishOption(index: number) {
  taskForm.finishOptions.splice(index, 1)
}

function toggleFinishOptionCorrect(index: number) {
  const option = taskForm.finishOptions[index]

  if (!option) {
    return
  }

  option.isCorrect = !option.isCorrect
}

function addVariableConstraint() {
  const firstOption = variableConstraintOptions.value[0]
  const constraint: VariableConstraintForm = {
    id: createOptionId(),
    variableKey: firstOption?.value ?? '',
    componentId: firstOption?.componentId,
    componentName: firstOption?.componentName,
    variableName: firstOption?.variableName ?? '',
    variableScope: firstOption?.variableScope ?? 'general',
    operator: '==',
    value: ''
  }

  taskForm.finishVariableConstraints.push(constraint)
}

function createComponentContainsConstraint() {
  const firstComponent = componentContainsComponentOptions.value[0]
  return {
    id: createOptionId(),
    componentId: firstComponent?.value ?? '',
    componentName: firstComponent?.label,
    operator: 'contains',
    text: ''
  } satisfies ComponentContainsConstraintForm
}

function addActivityRepairCheck() {
  taskForm.activityRepairChecks.push(createComponentContainsConstraint())
}

function removeActivityRepairCheck(index: number) {
  taskForm.activityRepairChecks.splice(index, 1)
}

function updateActivityRepairCheckSelection(index: number, value: unknown) {
  const constraint = taskForm.activityRepairChecks[index]
  if (!constraint) {
    return
  }

  constraint.componentId = String(value ?? '')
  const selectedOption = componentContainsComponentOptions.value.find(option => option.value === constraint.componentId)
  constraint.componentName = selectedOption?.label
}

function removeVariableConstraint(index: number) {
  taskForm.finishVariableConstraints.splice(index, 1)
}

function updateVariableConstraintSelection(index: number, value: unknown) {
  const constraint = taskForm.finishVariableConstraints[index]
  if (!constraint) {
    return
  }

  constraint.variableKey = String(value ?? '')

  const selectedOption = variableConstraintOptions.value.find(option => option.value === constraint.variableKey)
  if (!selectedOption) {
    return
  }

  constraint.componentId = selectedOption.componentId
  constraint.componentName = selectedOption.componentName
  constraint.variableName = selectedOption.variableName
  constraint.variableScope = selectedOption.variableScope
}

function addComponentVariableOptions(
  options: VariableConstraintOption[],
  seen: Set<string>,
  componentId: string,
  componentName: string,
  scope: VariableConstraintScope,
  variables: Array<{ name: string }> | undefined
) {
  for (const variable of variables ?? []) {
    addVariableConstraintOption(options, seen, {
      label: `${componentName} / ${variableGroupLabel(scope)} / ${variable.name}`,
      value: variableConstraintKey(componentId, scope, variable.name),
      componentId,
      componentName,
      variableName: variable.name,
      variableScope: scope
    })
  }
}

function addSystemInputVariableOptions(
  options: VariableConstraintOption[],
  seen: Set<string>,
  componentId: string,
  componentName: string,
  html: string
) {
  const matches = html.matchAll(/\b(?:name|id)=["']system-([^"']+)["']/g)
  for (const match of matches) {
    const variableName = match[1]
    if (!variableName) {
      continue
    }

    addVariableConstraintOption(options, seen, {
      label: `${componentName} / ${variableGroupLabel('system')} / ${variableName}`,
      value: variableConstraintKey(componentId, 'system', variableName),
      componentId,
      componentName,
      variableName,
      variableScope: 'system'
    })
  }
}

function addVariableConstraintOption(
  options: VariableConstraintOption[],
  seen: Set<string>,
  option: VariableConstraintOption
) {
  if (seen.has(option.value)) {
    return
  }

  seen.add(option.value)
  options.push(option)
}

function variableGroupLabel(scope: VariableConstraintScope): string {
  switch (scope) {
    case 'sql':
      return t('task_variable_group_sql')
    case 'js':
      return t('task_variable_group_js')
    case 'system':
      return t('task_variable_group_system')
    case 'general':
    default:
      return t('task_variable_group_general')
  }
}

function variableConstraintKey(componentId: string | undefined, scope: VariableConstraintScope, variableName: string): string {
  return `${componentId ?? 'system'}::${scope}::${variableName}`
}

function toVariableConstraintForm(constraint: VariableConstraint): VariableConstraintForm {
  const variableScope = constraint.variableScope ?? 'general'
  return {
    id: constraint.id ?? createOptionId(),
    variableKey: variableConstraintKey(constraint.componentId, variableScope, constraint.variableName),
    componentId: constraint.componentId,
    componentName: constraint.componentName,
    variableName: constraint.variableName,
    variableScope,
    operator: constraint.operator ?? '==',
    value: String(constraint.value ?? '')
  }
}

function toVariableConstraint(constraint: VariableConstraintForm): VariableConstraint {
  const selectedOption = variableConstraintOptions.value.find(option => option.value === constraint.variableKey)
  const variableScope = selectedOption?.variableScope ?? constraint.variableScope

  return {
    id: constraint.id,
    componentId: selectedOption?.componentId ?? constraint.componentId,
    componentName: selectedOption?.componentName ?? constraint.componentName,
    variableName: selectedOption?.variableName ?? constraint.variableName,
    variableScope,
    operator: constraint.operator,
    value: parseConstraintValue(constraint.value)
  }
}

function parseConstraintValue(value: string): string | number {
  const trimmedValue = value.trim()
  if (trimmedValue === '') {
    return ''
  }

  const parsed = Number(trimmedValue)
  return Number.isFinite(parsed) ? parsed : value
}

function toComponentContainsConstraintForm(constraint: ComponentContainsConstraint): ComponentContainsConstraintForm {
  return {
    id: constraint.id ?? createOptionId(),
    componentId: String(constraint.componentId ?? ''),
    componentName: constraint.componentName,
    operator: constraint.operator ?? 'contains',
    text: constraint.text ?? ''
  }
}

function toComponentContainsConstraint(constraint: ComponentContainsConstraintForm): ComponentContainsConstraint {
  const selectedOption = componentContainsComponentOptions.value.find(option => option.value === constraint.componentId)

  return {
    id: constraint.id,
    componentId: constraint.componentId,
    componentName: selectedOption?.label ?? constraint.componentName,
    operator: constraint.operator,
    text: constraint.text
  }
}

function isPageVisible(page: Page): boolean {
  return taskForm.visiblePages.some(visiblePage => visiblePage.route === page.route)
}

function toggleVisiblePage(page: Page) {
  const pageIndex = taskForm.visiblePages.findIndex(visiblePage => visiblePage.route === page.route)

  if (pageIndex === -1) {
    taskForm.visiblePages.push(toTaskPage(page))
    return
  }

  taskForm.visiblePages.splice(pageIndex, 1)
}

function toggleCodeEditPermission(key: CodeEditPermissionKey) {
  if (!codeEditEnvironment.value[key]) {
    return
  }

  taskForm.codeEditPermissions[key] = !taskForm.codeEditPermissions[key]
}

function toTaskPage(page: Page): Page {
  return {
    name: page.name,
    route: page.route,
    description: page.description
  }
}

function createOptionId(): string {
  return crypto.randomUUID()
}
</script>
