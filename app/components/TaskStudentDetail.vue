<template>
  <UCard v-if="props.task" class="shadow-lg">
    <div class="space-y-6">
      <!-- Title & points -->
      <div class="flex flex-col gap-2">
        <div class="flex flex-wrap items-center gap-2">
          <UBadge color="green" variant="subtle" size="lg">
            {{ props.task.pointsReward }} {{ t('task_pts') }}
          </UBadge>
          <UBadge v-if="props.task.failPenalty" color="red" variant="subtle" size="lg">
            -{{ props.task.failPenalty }} {{ t('task_penalty') }}
          </UBadge>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 w-full">
          {{ props.title ?? props.task.title }}
        </h2>
        <p v-if="props.task.description" class="text-base text-gray-600 w-full">
          {{ props.task.description }}
        </p>
      </div>

      <!-- Activity section -->
      <div class="rounded-xl border border-gray-200 p-4 space-y-3">
        <div class="flex items-center justify-between gap-2">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">{{ t('task_activity') }}</p>
            <h3 class="text-base font-semibold text-gray-900">
              {{ activityLabel }}
            </h3>
          </div>
          <UBadge
            v-if="canEvaluateActivity"
            :color="props.task.activity?.isCompleted ? 'green' : 'neutral'"
            variant="subtle"
            size="md"
            class="flex items-center gap-1.5"
          >
            <div
              class="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0"
              :class="props.task.activity?.isCompleted
                ? 'border-green-500 bg-green-500'
                : 'border-gray-400'"
            >
              <UIcon v-if="props.task.activity?.isCompleted" name="i-lucide-check" class="text-white w-3 h-3" />
            </div>
            {{ t('completed') }}
          </UBadge>
        </div>

        <p v-if="activityDescription" class="text-sm text-gray-700">
          {{ activityDescription }}
        </p>

        <!-- SELECT_OPTIONS activity options - checkable -->
        <div v-if="activityOptions.length" class="space-y-2">
          <div
            v-for="(option, index) in activityOptions"
            :key="`act-opt-${index}`"
            class="flex items-center gap-3 rounded-lg border px-3 py-2 select-none transition-colors"
            :class="[
              isReadonly || props.task.activity?.isCompleted
                ? 'cursor-not-allowed opacity-60'
                : 'cursor-pointer',
              selectedActivityOptionIndices.includes(index)
                ? 'border-sky-400 bg-sky-50'
                : isReadonly
                  ? 'border-gray-200'
                  : 'border-gray-200 hover:border-gray-300'
            ]"
            @click="!isReadonly && !props.task.activity?.isCompleted && toggleActivityOption(index)"
          >
            <div
              class="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors"
              :class="selectedActivityOptionIndices.includes(index)
                ? 'border-sky-500 bg-sky-500'
                : 'border-gray-400'"
            >
              <UIcon v-if="selectedActivityOptionIndices.includes(index)" name="i-lucide-check" class="text-white w-3 h-3" />
            </div>
            <span class="text-sm text-gray-800">{{ option.text }}</span>
          </div>
        </div>

        <!-- substituteAfterActivity notice -->
        <div v-if="props.task.activity?.substituteAfterActivity" class="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
          <UIcon name="i-lucide-info" class="mt-0.5 shrink-0 text-blue-500" />
          <p class="text-sm text-blue-700">
            {{ t('task_substitute_notice') }}
          </p>
        </div>

        <!-- Selected components badges (SELECT activity) -->
        <div v-if="props.task.activityType === ActivityType.SELECT && selectedComponentNames.length" class="flex flex-wrap gap-2">
          <UBadge
            v-for="name in selectedComponentNames"
            :key="name"
            color="sky"
            variant="subtle"
            size="md"
          >
            {{ name }}
          </UBadge>
        </div>

        <div v-if="canEvaluateActivity" class="flex items-center gap-3 mt-2">
          <UButton
            color="primary"
            variant="solid"
            icon="i-lucide-check-circle"
            :disabled="isReadonly || props.task.activity?.isCompleted === true"
            @click="evaluateActivity"
          >
            {{ t('evaluate') }}
          </UButton>
          <UBadge
            v-if="activityEvaluationResult === true"
            color="green"
            variant="subtle"
            size="lg"
            class="flex items-center gap-1"
          >
            <UIcon name="i-lucide-circle-check" class="w-4 h-4" />
            {{ t('correct_answer') }}
          </UBadge>
          <UBadge
            v-else-if="activityEvaluationResult === false"
            color="red"
            variant="subtle"
            size="lg"
            class="flex items-center gap-1"
          >
            <UIcon name="i-lucide-circle-x" class="w-4 h-4" />
            {{ t('incorrect_answer') }}
          </UBadge>
        </div>
      </div>

      <!-- Finish section -->
      <UPopover
        v-if="shouldShowFinishLockPopover"
        :key="shouldShowFinishLockPopover ? 'finish-locked' : 'finish-unlocked'"
        mode="hover"
        arrow
      >
        <span class="app-popover-trigger-full">
          <div
            class="rounded-xl border border-gray-200 p-4 space-y-3 transition-opacity w-full"
            :class="isFinishLocked ? 'cursor-not-allowed opacity-50 pointer-events-none' : ''"
          >
        <div class="flex items-center justify-between gap-2">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">{{ t('task_finish') }}</p>
            <h3 class="text-base font-semibold text-gray-900">
              {{ finishLabel }}
            </h3>
          </div>
          <UBadge
            :color="props.task.finish?.isComplete ? 'green' : 'neutral'"
            variant="subtle"
            size="md"
            class="flex items-center gap-1.5"
          >
            <div
              class="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0"
              :class="props.task.finish?.isComplete
                ? 'border-green-500 bg-green-500'
                : 'border-gray-400'"
            >
              <UIcon v-if="props.task.finish?.isComplete" name="i-lucide-check" class="text-white w-3 h-3" />
            </div>
            {{ t('completed') }}
          </UBadge>
        </div>

        <p v-if="props.task.finish?.description" class="text-sm text-gray-700">
          {{ props.task.finish.description }}
        </p>

        <!-- SELECT_OPTIONS finish options - checkable -->
        <div v-if="finishOptions.length" class="space-y-2">
          <div
            v-for="(option, index) in finishOptions"
            :key="`fin-opt-${index}`"
            class="flex items-center gap-3 rounded-lg border px-3 py-2 select-none transition-colors"
            :class="[
              isReadonly || props.task.finish?.isComplete || isFinishLocked
                ? 'cursor-not-allowed opacity-60'
                : 'cursor-pointer',
              selectedFinishOptionIndices.includes(index)
                ? 'border-sky-400 bg-sky-50'
                : isReadonly
                  ? 'border-gray-200'
                  : 'border-gray-200 hover:border-gray-300'
            ]"
            @click="!isReadonly && !props.task.finish?.isComplete && !isFinishLocked && toggleFinishOption(index)"
          >
            <div
              class="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors"
              :class="selectedFinishOptionIndices.includes(index)
                ? 'border-sky-500 bg-sky-500'
                : 'border-gray-400'"
            >
              <UIcon v-if="selectedFinishOptionIndices.includes(index)" name="i-lucide-check" class="text-white w-3 h-3" />
            </div>
            <span class="text-sm text-gray-800">{{ option.text }}</span>
          </div>
        </div>

        <UInput
          v-if="props.task.finishType === FinishType.TYPE_CORRECT"
          v-model="typeCorrectAnswer"
          :placeholder="t('task_your_answer')"
          :disabled="isReadonly || props.task.finish?.isComplete || isFinishLocked"
          class="w-full"
        />

        <div v-if="canEvaluateFinish" class="flex items-center gap-3 mt-2">
          <UButton
            color="primary"
            variant="solid"
            icon="i-lucide-check-circle"
            :disabled="isReadonly || props.task.finish?.isComplete === true || isFinishLocked"
            @click="evaluateFinish"
          >
            {{ t('evaluate') }}
          </UButton>
          <UBadge
            v-if="finishEvaluationResult === true"
            color="green"
            variant="subtle"
            size="lg"
            class="flex items-center gap-1"
          >
            <UIcon name="i-lucide-circle-check" class="w-4 h-4" />
            {{ t('correct_answer') }}
          </UBadge>
          <UBadge
            v-else-if="finishEvaluationResult === false"
            color="red"
            variant="subtle"
            size="lg"
            class="flex items-center gap-1"
          >
            <UIcon name="i-lucide-circle-x" class="w-4 h-4" />
            {{ t('incorrect_answer') }}
          </UBadge>
        </div>
          </div>
        </span>
        <template #content>
          <div class="app-popover-content">
            <UIcon name="i-lucide-lock" class="app-popover-icon" />
            <div class="app-popover-text">
              <strong class="app-popover-title">{{ t('task_activity_not_completed_title') }}</strong>
              <span class="app-popover-description">{{ t('task_activity_not_completed_description') }}</span>
            </div>
          </div>
        </template>
      </UPopover>

      <div
        v-else
        class="rounded-xl border border-gray-200 p-4 space-y-3 transition-opacity w-full"
        :class="isFinishLocked ? 'cursor-not-allowed opacity-50 pointer-events-none' : ''"
      >
        <div class="flex items-center justify-between gap-2">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">{{ t('task_finish') }}</p>
            <h3 class="text-base font-semibold text-gray-900">
              {{ finishLabel }}
            </h3>
          </div>
          <UBadge
            :color="props.task.finish?.isComplete ? 'green' : 'neutral'"
            variant="subtle"
            size="md"
            class="flex items-center gap-1.5"
          >
            <div
              class="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0"
              :class="props.task.finish?.isComplete
                ? 'border-green-500 bg-green-500'
                : 'border-gray-400'"
            >
              <UIcon v-if="props.task.finish?.isComplete" name="i-lucide-check" class="text-white w-3 h-3" />
            </div>
            {{ t('completed') }}
          </UBadge>
        </div>

        <p v-if="props.task.finish?.description" class="text-sm text-gray-700">
          {{ props.task.finish.description }}
        </p>

        <!-- SELECT_OPTIONS finish options - checkable -->
        <div v-if="finishOptions.length" class="space-y-2">
          <div
            v-for="(option, index) in finishOptions"
            :key="`fin-opt-${index}`"
            class="flex items-center gap-3 rounded-lg border px-3 py-2 select-none transition-colors"
            :class="[
              isReadonly || props.task.finish?.isComplete || isFinishLocked
                ? 'cursor-not-allowed opacity-60'
                : 'cursor-pointer',
              selectedFinishOptionIndices.includes(index)
                ? 'border-sky-400 bg-sky-50'
                : isReadonly
                  ? 'border-gray-200'
                  : 'border-gray-200 hover:border-gray-300'
            ]"
            @click="!isReadonly && !props.task.finish?.isComplete && !isFinishLocked && toggleFinishOption(index)"
          >
            <div
              class="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors"
              :class="selectedFinishOptionIndices.includes(index)
                ? 'border-sky-500 bg-sky-500'
                : 'border-gray-400'"
            >
              <UIcon v-if="selectedFinishOptionIndices.includes(index)" name="i-lucide-check" class="text-white w-3 h-3" />
            </div>
            <span class="text-sm text-gray-800">{{ option.text }}</span>
          </div>
        </div>

        <UInput
          v-if="props.task.finishType === FinishType.TYPE_CORRECT"
          v-model="typeCorrectAnswer"
          :placeholder="t('task_your_answer')"
          :disabled="isReadonly || props.task.finish?.isComplete || isFinishLocked"
          class="w-full"
        />

        <div v-if="canEvaluateFinish" class="flex items-center gap-3 mt-2">
          <UButton
            color="primary"
            variant="solid"
            icon="i-lucide-check-circle"
            :disabled="isReadonly || props.task.finish?.isComplete === true || isFinishLocked"
            @click="evaluateFinish"
          >
            {{ t('evaluate') }}
          </UButton>
          <UBadge
            v-if="finishEvaluationResult === true"
            color="green"
            variant="subtle"
            size="lg"
            class="flex items-center gap-1"
          >
            <UIcon name="i-lucide-circle-check" class="w-4 h-4" />
            {{ t('correct_answer') }}
          </UBadge>
          <UBadge
            v-else-if="finishEvaluationResult === false"
            color="red"
            variant="subtle"
            size="lg"
            class="flex items-center gap-1"
          >
            <UIcon name="i-lucide-circle-x" class="w-4 h-4" />
            {{ t('incorrect_answer') }}
          </UBadge>
        </div>
      </div>

      <!-- Feedback -->
      <div v-if="props.task.completed && props.task.feedback" class="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p class="text-sm text-amber-800">{{ props.task.feedback }}</p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { type ComponentContainsConstraint, type ComponentDomSnapshot } from '~/model/Task/Activity/ComponentContainsCheck'
import { ActivityType } from '~/model/Task/Activity/ActivityType'
import { FinishType } from '~/model/Task/Finish/FinishType'
import type { Task } from '~/model/Task/Task'
import type { SelectActivity } from '~/model/Task/Activity/SelectActivity'
import type { SelectOptionsActivity } from '~/model/Task/Activity/SelectOptionsActivity'
import type { Option } from '~/model/Task/Option'
import { TaskStatus } from '~/model/Task/TaskStatus'
import { advanceCurrentRound } from '~/utils/taskLevels'

const { t } = useI18n()
const highlightStore = useHighlightStore()
const systemsStore = useSystemsStore()
const globalSettings = useGlobalSettingsStore()
const { systemInputVariables } = useSystemInputVariables()

const props = defineProps<{
  task: Task | null
  title?: string
  readonly?: boolean
}>()
const isReadonly = computed(() => props.readonly === true)

const selectedActivityOptionIndices = ref<number[]>([])
const selectedFinishOptionIndices = ref<number[]>([])
const typeCorrectAnswer = ref('')
const activityEvaluationResult = ref<boolean | null>(null)
const finishEvaluationResult = ref<boolean | null>(null)

watch(
  () => props.task?.id,
  () => {
    selectedActivityOptionIndices.value = []
    selectedFinishOptionIndices.value = []
    typeCorrectAnswer.value = ''
    activityEvaluationResult.value = null
    finishEvaluationResult.value = null
  }
)

watch(
  () => [
    props.task?.id,
    props.task?.finishType,
    props.task?.activity?.isCompleted,
    props.task?.finish?.isComplete,
    props.task?.completed
  ],
  () => {
    const task = props.task
    if (
      isReadonly.value
      || !task
      || task.finishType !== FinishType.IMMEDIATE
      || task.completed
      || task.finish?.isComplete
      || task.activity?.isCompleted !== true
    ) return

    void evaluateFinish()
  },
  { immediate: true }
)

function toggleActivityOption(index: number) {
  if (isReadonly.value) return

  const idx = selectedActivityOptionIndices.value.indexOf(index)
  if (idx === -1) selectedActivityOptionIndices.value.push(index)
  else selectedActivityOptionIndices.value.splice(idx, 1)
}

function toggleFinishOption(index: number) {
  if (isReadonly.value) return

  const idx = selectedFinishOptionIndices.value.indexOf(index)
  if (idx === -1) selectedFinishOptionIndices.value.push(index)
  else selectedFinishOptionIndices.value.splice(idx, 1)
}

async function evaluateActivity() {
  if (isReadonly.value) return

  const task = props.task
  if (!task?.activity) return

  //console.log('[evaluateActivity] task.substituteAfterActivity:', (task as any).substituteAfterActivity, '| task.activity.substituteAfterActivity:', (task.activity as any).substituteAfterActivity)

  let isCorrect = false

  if (task.activityType === ActivityType.SELECT) {
    const activity = task.activity as SelectActivity
    const selectedIds = Array.from(highlightStore.selectedHighlightedComponentsIds)
    const correctIds = activity.activityComponents.map((c: any) => c.id)
    isCorrect = selectedIds.length === correctIds.length && selectedIds.every(id => correctIds.includes(id))
    //console.log('[SELECT] correct IDs:', correctIds, '| input:', selectedIds, isCorrect ? '🟢' : '🔴')
    activity.isCompleted = isCorrect
  } else if (task.activityType === ActivityType.SELECT_OPTIONS) {
    const activity = task.activity as SelectOptionsActivity
    const correctIndices = activity.options
      .map((o: any, i: number) => o.isCorrect ? i : -1)
      .filter((i: number) => i !== -1)
    const selectedIndices = [...selectedActivityOptionIndices.value]
    isCorrect = selectedIndices.length === correctIndices.length && selectedIndices.every(i => correctIndices.includes(i))
    //console.log('[SELECT_OPTIONS] correct indices:', correctIndices, '| selected indices:', selectedIndices, isCorrect ? '🟢' : '🔴')
    activity.isCompleted = isCorrect
  } else if (task.activityType === ActivityType.REPAIR) {
    isCorrect = isTaskActivityCompleted(task)
  }

  activityEvaluationResult.value = isCorrect
  task.status = isCorrect ? TaskStatus.IN_PROGRESS : task.status

  if (isCorrect) {
    const activity = task.activity as any
    //console.log('[evaluateActivity] full task.activity:', JSON.parse(JSON.stringify(activity)))
    //console.log('[evaluateActivity] full task keys:', Object.keys(task as any))
    const substitute = activity?.substituteAfterActivity || (task as any).substituteAfterActivity
    //console.log('[evaluateActivity] substitute resolved to:', substitute)
    if (substitute) {
      const ids: string[] = (activity.activityComponents ?? []).map((c: any) => c.id).filter(Boolean)
      //console.log('[evaluateActivity] adding to solvedComponentIds:', ids)
      addSolvedComponentIds(ids)
      //console.log('[evaluateActivity] solvedComponentIds after:', [...globalSettings.solvedComponentIds])
    }
  }

  if (isCorrect && task.finishType === FinishType.IMMEDIATE) {
    await evaluateFinish()
    return
  }

  if (!isCorrect) {
    applyIncorrectScore(task)
  }

  // Persist updated progress to IndexedDB
  const system = systemsStore.selectedSystem
  if (system) {
    systemsStore.updateSystem(system)
  }
}

async function evaluateFinish() {
  if (isReadonly.value) return

  const task = props.task
  if (!task?.finish) return

  let isCorrect = false

  if (task.finishType === FinishType.IMMEDIATE) {
    isCorrect = await task.finish.evaluate(undefined, {
      activityCompleted: isTaskActivityCompleted(task)
    })
  } else if (task.finishType === FinishType.SELECT_OPTIONS) {
    const selectedIds = selectedFinishOptionIndices.value
      .map(index => finishOptions.value[index]?.id ?? index)
    isCorrect = await task.finish.evaluate(selectedIds)
  } else if (task.finishType === FinishType.TYPE_CORRECT) {
    isCorrect = await task.finish.evaluate(typeCorrectAnswer.value)
  } else if (task.finishType === FinishType.AFTER_DATABASE_UPDATE) {
    isCorrect = await task.finish.evaluate(systemsStore.selectedSystem?.database)
  } else if (task.finishType === FinishType.VARIABLE_CONSTRAINT) {
    isCorrect = await task.finish.evaluate({
      components: [
        ...(task.errorComponents ?? []),
        ...(systemsStore.selectedSystem?.actualComponents ?? [])
      ],
      systemInputVariables: systemInputVariables.value
    })
  }

  finishEvaluationResult.value = isCorrect

  if (isCorrect) {
    completeTask(task)
  } else {
    task.status = TaskStatus.IN_PROGRESS
    applyIncorrectScore(task)
  }

  const system = systemsStore.selectedSystem
  if (system) {
    systemsStore.updateSystem(system)
  }
}

function completeTask(task: Task) {
  const wasCompleted = task.completed || task.status === TaskStatus.COMPLETED
  task.completed = true
  task.status = TaskStatus.COMPLETED

  if (task.finish) {
    task.finish.isComplete = true
  }

  if (task.activityType === ActivityType.REPAIR) {
    addSolvedComponentIds(getActivityComponentIds(task))
  }

  if (!wasCompleted) {
    systemsStore.selectedSystem?.score?.increaseScore(task.pointsReward)
  }

  const system = systemsStore.selectedSystem
  if (system) {
    advanceCurrentRound(system)
  }
}

function applyIncorrectScore(task: Task) {
  const system = systemsStore.selectedSystem
  const score = system?.score
  if (!system || !score || task.completed) return

  const penalty = Number(task.failPenalty || 0)
  score.decreaseScore(penalty)
  score.addMistake(penalty)
  system.mistakes.push(penalty)
}

function isTaskActivityCompleted(task: Task): boolean {
  if (task.activity?.isCompleted === true) {
    return true
  }

  if (task.activityType !== ActivityType.REPAIR) {
    return false
  }

  const components = task.activity?.activityComponents?.length
    ? task.activity.activityComponents
    : task.errorComponents

  if (!task.activity) {
    return false
  }

  task.activity.check({
    components,
    defaultComponents: systemsStore.selectedSystem?.defaultComponents ?? [],
    domSnapshots: collectComponentDomSnapshots(
      ((task.activity as { repairChecks?: ComponentContainsConstraint[] } | undefined)?.repairChecks ?? [])
    ),
    componentsRepaired: task.componentsRepaired
  })

  task.componentsRepaired = Boolean(task.activity.isCompleted)
  return Boolean(task.activity.isCompleted)
}

function getActivityComponentIds(task: Task): string[] {
  return (task.activity?.activityComponents?.length ? task.activity.activityComponents : task.errorComponents)
    .map(component => component.id)
    .filter(Boolean)
}

function addSolvedComponentIds(componentIds: string[]) {
  const newlySolvedIds: string[] = []

  for (const id of componentIds) {
    if (!globalSettings.solvedComponentIds.includes(id)) {
      globalSettings.solvedComponentIds.push(id)
      newlySolvedIds.push(id)
    }
  }

  if (newlySolvedIds.length && import.meta.client) {
    if (highlightStore.isHighlightActive) {
      highlightStore.toggleHighlight()
    } else {
      highlightStore.clearHighlights()
    }

    window.dispatchEvent(new CustomEvent('components-repaired', {
      detail: { componentIds: newlySolvedIds }
    }))
  }
}

function collectComponentDomSnapshots(constraints: ComponentContainsConstraint[]): ComponentDomSnapshot[] {
  if (!import.meta.client) {
    return []
  }

  const componentIds = new Set(
    constraints
      .map(constraint => String(constraint.componentId ?? ''))
      .filter(Boolean)
  )

  if (!componentIds.size) {
    return []
  }

  const wrappers = Array.from(document.querySelectorAll<HTMLElement>('[data-component-id]'))

  return wrappers
    .map((wrapper) => {
      const componentId = wrapper.dataset.componentId ?? ''
      if (!componentIds.has(componentId)) {
        return null
      }

      const content = wrapper.querySelector<HTMLElement>('.component-html') ?? wrapper
      return {
        componentId,
        html: content.innerHTML,
        text: normalizeDomText(content.textContent ?? '')
      } satisfies ComponentDomSnapshot
    })
    .filter((snapshot): snapshot is ComponentDomSnapshot => snapshot !== null)
}

function normalizeDomText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

const selectedComponentNames = computed(() => {
  if (props.task?.activityType !== ActivityType.SELECT) return []
  const components = systemsStore.selectedSystem?.actualComponents ?? []
  return Array.from(highlightStore.selectedHighlightedComponentsIds)
    .map(id => components.find(c => c.id === id)?.name ?? id)
})

const activityLabel = computed(() => {
  const label = props.task?.activity?.label
  if (label) return label
  switch (props.task?.activityType) {
    case ActivityType.REPAIR: return t('task_activity_repair')
    case ActivityType.SELECT: return t('task_activity_select')
    case ActivityType.SELECT_OPTIONS: return t('task_activity_select_options')
    default: return t('task_activity')
  }
})

const activityDescription = computed(() => props.task?.activity?.description ?? '')

const activityOptions = computed<Option[]>(() => {
  const activity = props.task?.activity as ({ options?: Option[] } | undefined)
  return activity?.options ?? []
})

const canEvaluateActivity = computed(() => {
  if (!props.task) {
    return false
  }

  if (props.task.activityType === ActivityType.SELECT || props.task.activityType === ActivityType.SELECT_OPTIONS) {
    return true
  }

  return props.task.activityType === ActivityType.REPAIR
    && Boolean((props.task.activity as { checkRepair?: boolean } | undefined)?.checkRepair)
})

const isFinishUnlocked = computed(() => {
  if (!props.task) {
    return false
  }

  if (props.task.finish?.isComplete || props.task.completed) {
    return true
  }

  const isUncheckedRepair = props.task.activityType === ActivityType.REPAIR
    && !Boolean((props.task.activity as { checkRepair?: boolean } | undefined)?.checkRepair)

  if (isUncheckedRepair) {
    return true
  }

  return Boolean(props.task.activity?.isCompleted)
})

const isFinishLocked = computed(() => !isFinishUnlocked.value)

const isTaskFinished = computed(() =>
  Boolean(props.task?.finish?.isComplete || props.task?.completed || props.task?.status === TaskStatus.COMPLETED)
)

const shouldShowFinishLockPopover = computed(() =>
  !globalSettings.teacherMode
  && !isReadonly.value
  && isFinishLocked.value
  && !isTaskFinished.value
)

const canEvaluateFinish = computed(() =>
  props.task?.finishType === FinishType.IMMEDIATE
  || props.task?.finishType === FinishType.AFTER_DATABASE_UPDATE
  || props.task?.finishType === FinishType.SELECT_OPTIONS
  || props.task?.finishType === FinishType.TYPE_CORRECT
  || props.task?.finishType === FinishType.VARIABLE_CONSTRAINT
)

const finishLabel = computed(() => {
  if (props.task?.finish?.label) return props.task.finish.label
  switch (props.task?.finishType) {
    case FinishType.IMMEDIATE: return t('task_finish_immediate')
    case FinishType.AFTER_DATABASE_UPDATE: return t('task_finish_after_db')
    case FinishType.SELECT_OPTIONS: return t('task_finish_select_options')
    case FinishType.TYPE_CORRECT: return t('task_finish_type_correct')
    case FinishType.VARIABLE_CONSTRAINT: return t('task_finish_variable_constraint')
    default: return t('task_finish')
  }
})

const finishOptions = computed<Option[]>(() => {
  const task = props.task as (Task & { finish?: { options?: Option[] } }) | null
  return task?.finish?.options ?? []
})
</script>
