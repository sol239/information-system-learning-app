<template>
  <div class="max-w-md mx-auto mt-8">
    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold text-center">{{ t('tasks') }}</h2>
      </template>

      <!-- Green animation overlay -->
      <transition name="task-completed-fade">
        <div v-if="taskCompleted" class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div class="task-completed-animation"></div>
        </div>
      </transition>

      <!-- Red animation overlay for incorrect answers -->
      <transition name="task-incorrect-fade">
        <div v-if="taskIncorrect" class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div class="task-incorrect-animation"></div>
        </div>
      </transition>

      <!-- Task Details -->
      <div v-if="selectedTask">
        <div class="p-4">
          <div class="flex items-center mb-2">
            <UCheckbox :model-value="selectedTask.completed" disabled class="mr-2" />
            <h3 class="text-lg font-bold">{{ selectedTask.title }}</h3>
          </div>
          <p class="mb-2">{{ selectedTask.description }}</p>

          <!-- Custom Progress Steps -->
          <div class="flex items-center justify-between mb-6 mt-6">
            <!-- Step 1: Task Selected -->
            <div class="flex flex-col items-center">
              <div class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mb-2">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span class="text-xs text-center text-green-600 font-medium">{{ t('task_selected') }}</span>
            </div>

            <!-- Connector Line -->
            <div class="flex-1 h-0.5 mx-2" :class="selectedTask.componentsRepaired ? 'bg-green-500' : 'bg-gray-300'">
            </div>

            <!-- Step 2: Components Repaired -->
            <div class="flex flex-col items-center">
              <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2"
                :class="selectedTask.componentsRepaired ? 'bg-green-500' : 'bg-gray-300'">
                <svg v-if="selectedTask.componentsRepaired" class="w-4 h-4 text-white" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span v-else class="w-3 h-3 bg-white rounded-full"></span>
              </div>
              <span class="text-xs text-center font-medium"
                :class="selectedTask.componentsRepaired ? 'text-green-600' : 'text-gray-500'">
                {{ t('components_repaired') }}
              </span>
            </div>

            <!-- Connector Line -->
            <div class="flex-1 h-0.5 mx-2" :class="selectedTask.completed ? 'bg-green-500' : 'bg-gray-300'"></div>

            <!-- Step 3: Task Completed -->
            <div class="flex flex-col items-center">
              <div class="w-8 h-8 rounded-full flex items-center justify-center mb-2"
                :class="selectedTask.completed ? 'bg-green-500' : 'bg-gray-300'">
                <svg v-if="selectedTask.completed" class="w-4 h-4 text-white" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span v-else class="w-3 h-3 bg-white rounded-full"></span>
              </div>
              <span class="text-xs text-center font-medium"
                :class="selectedTask.completed ? 'text-green-600' : 'text-gray-500'">
                {{ t('task_completed') }}
              </span>
            </div>
          </div>

          <!--
          <span class="font-semibold">Kind of task: </span>
          <span>{{ selectedTask.kind }}</span><br>
-->
          <div>
            <!-- Kind of task: select -->
            <div v-if="selectedTask.kind === 'select'">
              <UButton variant="outline" style="margin-left: 5px;"
                :disabled="selectedTask.completed || selectedTask.componentsRepaired || !highlightStore.selectedIds || highlightStore.selectedIds.length === 0"
                @click="handleSubmit">
                {{ t('submit') }}
              </UButton>

              <UButton v-if="selectedTask.answer !== 'none'" variant="outline" style="margin-left: 5px;"
                :disabled="!selectedTask.componentsRepaired" @click="evaluate()">
                {{ t('check_repair_task') }}
              </UButton>
            </div>

            <!-- Kind of task: type-correct -->
            <div v-if="selectedTask.kind === 'type-correct'">
              <UInput v-model="form.answer" placeholder="Enter your answer" class="mt-2" />
              <UButton variant="outline" style="margin-left: 5px;" :disabled="selectedTask.completed"
                @click="handleSubmit">{{
                  t('submit') }}
              </UButton>
            </div>

            <!-- Kind of task: repair -->
            <div v-if="selectedTask.kind === 'repair'">
              <UButton
                :disabled="selectedTask.completed || selectedTask.componentsRepaired || !highlightStore.selectedIds || highlightStore.selectedIds.length === 0"
                variant="outline" style="margin-left: 5px;" @click="handleSubmit">
                {{ t('check_repair_task') }}
              </UButton>
            </div>

            <div v-if="selectedTask.componentsRepaired">
              <UForm :state="questionsForm" >
                <div v-for="(question, idx) in questions" :key="idx" class="mb-2 flex items-center gap-2">
                  <UCheckbox v-model="questionsForm[idx]" />
                  <label>{{ question }}</label>
                </div>
                <UButton
                  type="submit"
                  :disabled="selectedTask.completed || selectedTask.componentsRepaired || !highlightStore.selectedIds || highlightStore.selectedIds.length === 0"
                  variant="outline"
                  style="margin-left: 5px;"
                >
                  {{ t('check_repair_task') }}
                </UButton>
              </UForm>
            </div>

          </div>

          <UButton class="mt-4" @click="selectTask(selectedTask.id)">{{ t('back_to_tasks') }}</UButton>
          <div v-if="selectedTask.completed">
            <USeparator color="primary" class="mt-4 mb-2" />
            <h3 class="text-lg font-semibold ">{{ t('feedback') }}</h3>

            <p> {{ selectedTask.feedback }}</p>
          </div>
        </div>
      </div>

      <div v-else>
        <div v-if="tasks.length === 0" class="text-center text-gray-500 py-4">
          No tasks yet
        </div>
        <div v-else class="space-y-2">
          <div v-for="(task, index) in tasks" :key="index" class="flex items-center gap-3 p-3 rounded-lg">
            <UCheckbox :model-value="task.completed" disabled class="mr-2" />
            <UCard>
              {{ task.title }}
              <UButton style="margin-left: 5px;" @click="selectTask(task.id)">{{ t('select_task') }}</UButton>
            </UCard>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
/* 1. Imports */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSelectedSystemStore } from '~/stores/useSelectedSystemStore'
import { useInformationSystemStore } from '~/stores/useInformationSystemStore'
import { useSelectedTaskStore } from '~/stores/useSelectedTaskStore'
import { useSelectedComponentStore } from '~/stores/useSelectedComponentStore'
import { ComponentHandler, TaskAnswerEval, TaskQueue, useScoreStore } from '#imports'
import { useErrorComponentStore } from '#imports'
import { useHighlightStore } from '#imports'
import { Task } from '~/model/Task'
import { sys } from 'typescript'
import type { StepperItem } from '@nuxt/ui'
import { useComponentCodeStore } from '#imports'


/* 2. Stores */
const selectedSystemStore = useSelectedSystemStore()
const store = useInformationSystemStore()
const selectedTaskStore = useSelectedTaskStore()
const selectedComponentStore = useSelectedComponentStore()
const scoreStore = useScoreStore()
const errorComponentStore = useErrorComponentStore()
const highlightStore = useHighlightStore()
const componentCodeStore = useComponentCodeStore()

/* 3. Context hooks */
const { t } = useI18n()

const currentStepIndex = ref(0)

function onStepChange(newIndex: string | number | undefined) {
  if (typeof newIndex === 'number') {
    currentStepIndex.value = newIndex
    console.log('Current stepper item:', stepperItems.value[newIndex])
  }
}

/* 4. Constants (non-reactive) */
const systemId = selectedSystemStore.selectedId
const system = store.systems.find(sys => sys.id === systemId)
const toast = useToast()
//TODO: locale

/* 5. Props */
// none

/* 6. Emits */
// none

/* 7. Template refs */
// none

/* 8. Local state (ref, reactive) */
const newTaskText = ref('')
const form = ref({
  answer: ''
})
const taskCompleted = ref(false)
const taskIncorrect = ref(false)

/* 9. Computed */
const tasks = computed(() => {
  if (systemId == null) return [];
  ComponentHandler.getComponentMap(selectedTaskStore.currentRound)

  const _tasks = TaskQueue.getTasks(systemId);

  // look at completed:false tasks with isEditable:true are  and if there is some print 1
  const editableTasks = _tasks.filter(task => !task.completed && task.isEditable);
  if (editableTasks.length > 0) {
    highlightStore.isEditModeActive = true;
  } else {
    highlightStore.isEditModeActive = false;
  }


  return _tasks;
})

const selectedTask = computed(() =>
  tasks.value.find((t: Task) => t.id === selectedTaskStore.selectedId) ?? null
)

const questions = computed(() => {
  if (!selectedTask.value) return []
  return TaskAnswerEval.getQuestions(selectedTask.value.answer)
})

const questionsForm = ref<string[]>([])
// TODO: Finish

/* 10. Watchers */
watch(() => selectedTaskStore.currentRound, (newRound) => {
  const newTasksCount = ComponentHandler.getComponentMap(newRound).length - selectedTaskStore.completedTasksCount;

  // někdy blbnou počty --> zobrazí se záporné číslo
  if (newTasksCount !== 0) {
    toast.add({
      title: t('new_tasks_added', { count: newTasksCount }),
      color: 'primary',
      icon: 'i-lucide-circle-check'
    })

  } else {
    // TODO: trochu zabugované ještě, někdy se zobrazlo jen po dokončení roundu
    toast.add({
      title: t('all_tasks_completed'),
      color: 'sky',
      icon: 'i-lucide-circle-check'
    })
  }

})

watch(selectedTask, (task) => {
  if (task?.completed) {
    currentStepIndex.value = 2
  }
})

// Keyboard shortcut for submit button
onMounted(() => {
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 's' && selectedTask.value && !selectedTask.value.completed) {
      handleSubmit()
    }
  }

  document.addEventListener('keydown', handleKeydown)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
})

/* 11. Methods */

async function handleRepair(event: MouseEvent) {
  // print selected task answer
  const evalResult: boolean = await TaskAnswerEval.evaluateTaskAnswer(selectedTask.value?.answer || '')
  console.log("Task answer evaluation result:", evalResult)
}

function removeTask(index: number) {
  if (!system || !system.tasks) return
  system.tasks.splice(index, 1)
}

function updateTask(index: number, task: Task) {
  if (!system) return
}

function selectTask(id: number) {
  if (selectedTaskStore.selectedId === id) {
    selectedTaskStore.clear()
    selectedTaskStore.clearSelectedTask()
  } else {
    selectedTaskStore.select(id)

    // set selected Task using filter
    const currentTask: Task | undefined = tasks.value.find(t => t.id === id)
    console.log("CURRENT TASK:", currentTask)

    selectedTaskStore.setSelectedTask(currentTask || null)
    console.log("Selected task:", selectedTaskStore.selectedTask)
    const selectedTaskId = selectedTaskStore.selectedId;
    const systemId = selectedSystemStore.selectedId;
    const componentsToFind: string[] = TaskQueue.getSelectedTaskErrorComponentFilenames(selectedTaskId, systemId);
    selectedTaskStore.setSelectedTaskComponentsToFind(componentsToFind);
    console.log("Selected task:", selectedTaskStore.selectedTask)
  }
}

async function handleSubmit() {
  if (!selectedTask.value) return

  const selectedComponentId = selectedComponentStore.selectedId
  const taskElementClass: Set<string> = selectedTask.value.elementClass
  let isMatch: boolean = false

  if (selectedTask.value.kind === 'select') {
    const actual: Set<string> = highlightStore.selectedIds
    const expected = new Set(taskElementClass) // TODO: this is not a good way to do it!!! :(
    let match: boolean = false;
    console.log("EXPECTED:", expected)
    console.log("ACTUAL:", actual)

    if ((actual.size === 0 && expected.size === 0) || (actual.size !== expected.size)) {
      match = false;
      console.log("Mismatch in size or empty selection")
    } else {
      match = true;
      for (const id of actual) {
        if (!expected.has(id)) {
          match = false;
          break;
        }
      }

      if (match) {
        for (let id of actual) {
          errorComponentStore.removeErrorComponent(id)

          const toRepair: string[] = ["sql", "html", "js"]

          for (const section of toRepair) {
            componentCodeStore.resetComponentCode(id + "-" + section + ".vue")
          }
        }
      }

    }

    isMatch = match
    if (isMatch) {
      await evaluate();
    }
  } else if (selectedTask.value.kind === 'type-correct') {
    const expected = selectedTask.value.answer.trim()
    const actual = form.value.answer.trim()
    isMatch = expected === actual
    console.log("Expected:", expected)
    console.log("Actual:", actual)
    console.log("Task kind: type-correct, isMatch:", isMatch)
  } else if (selectedTask.value.kind === 'repair') {
    isMatch = await TaskAnswerEval.evaluateTaskAnswer(selectedTask.value?.answer || '')
    const idx = system.tasks.findIndex(t => t.id === selectedTask.value!.id)
    system.tasks[idx].completed = isMatch
    if (isMatch) {
      await evaluate();
    }
  } else if (selectedTask.value.kind === 'select-options') {
    if (isMatch) {
      await evaluate();
    }
  }


  if (!isMatch) {
    taskIncorrect.value = true
    setTimeout(() => {
      taskIncorrect.value = false
    }, 1200)
    scoreStore.incrementWrongAnswers()
    console.log("Wrong answers count:", scoreStore.wrongAnswers)
    scoreStore.addUserRecord({
      taskId: selectedTask.value.id,
      answer: form.value.answer,
      isCorrect: false,
      timestamp: new Date()
    })
  }

  scoreStore.updateScore()
  console.log("Current score:", scoreStore.score)
  console.log("User records:", scoreStore.getUserRecords())
}

async function evaluate() {
  const idx = system.tasks.findIndex(t => t.id === selectedTask.value!.id)
  if (idx !== -1) {
    console.log(selectedSystemStore.selectedSystem)

    system.tasks[idx].componentsRepaired = true

    highlightStore.isHighlightMode = false
    highlightStore.highlightHandler.clearSelection()

    if (selectedTaskStore.selectedTask?.answer === "none" || system.tasks[idx].completed) {
      system.tasks[idx].completed = true
      taskCompleted.value = true
      setTimeout(() => {
        taskCompleted.value = false
      }, 1200)
      scoreStore.incrementCorrectAnswers()
      selectedTaskStore.completedTasksCount += 1;
      scoreStore.addUserRecord({
        taskId: selectedTask.value.id,
        answer: form.value.answer,
        isCorrect: true,
        timestamp: new Date()
      })
    } else {
      console.log("Evaluating task answer:", selectedTask.value.answer)
      const response = await TaskAnswerEval.evaluateTaskAnswer(selectedTask.value?.answer || '')
      console.log("Task answer evaluation result:", response)
      if (response) {
        system.tasks[idx].completed = true
        taskCompleted.value = true
        setTimeout(() => {
          taskCompleted.value = false
        }, 1200)
        scoreStore.incrementCorrectAnswers()
        selectedTaskStore.completedTasksCount += 1;
        scoreStore.addUserRecord({
          taskId: selectedTask.value.id,
          answer: form.value.answer,
          isCorrect: true,
          timestamp: new Date()
        })
      }
    }

    // TODO: increment row after all tasks with current row are finished
    if (TaskQueue.getTasks(selectedTaskStore.currentRound).every(t => t.completed)) {
      selectedTaskStore.currentRound += 1
    }
  }

}

/* 12. Lifecycle */
// none

/* 13. defineExpose */
// none
</script>

<style scoped>
.task-completed-animation {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pop-fade 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  box-shadow: 0 0 40px 10px rgba(34, 197, 94, 0.5);
  position: relative;
}

.task-completed-animation::before {
  content: '';
  position: absolute;
  width: 60px;
  height: 30px;
  border: 6px solid white;
  border-top: none;
  border-right: none;
  transform: rotate(-45deg);
  animation: draw-checkmark 0.4s ease-out 0.3s forwards;
  opacity: 0;
}

.task-completed-animation::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.3);
  animation: ripple-effect 1.2s ease-out forwards;
  z-index: -1;
}

.task-incorrect-animation {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pop-fade 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  box-shadow: 0 0 40px 10px rgba(239, 68, 68, 0.5);
  position: relative;
}

.task-incorrect-animation::before {
  content: '';
  position: absolute;
  width: 60px;
  height: 6px;
  background: white;
  border-radius: 3px;
  transform: rotate(45deg);
  animation: draw-cross-line1 0.4s ease-out 0.3s forwards;
  opacity: 0;
}

.task-incorrect-animation::after {
  content: '';
  position: absolute;
  width: 60px;
  height: 6px;
  background: white;
  border-radius: 3px;
  transform: rotate(-45deg);
  animation: draw-cross-line2 0.4s ease-out 0.3s forwards;
  opacity: 0;
}

@keyframes pop-fade {
  0% {
    transform: scale(0.5);
    opacity: 0.7;
  }

  60% {
    transform: scale(1.2);
    opacity: 1;
  }

  100% {
    transform: scale(1);
    opacity: 0;
  }
}

@keyframes draw-checkmark {
  0% {
    opacity: 0;
    transform: rotate(-45deg) scale(0.5);
  }

  100% {
    opacity: 1;
    transform: rotate(-45deg) scale(1);
  }
}

@keyframes ripple-effect {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }

  100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes draw-cross-line1 {
  0% {
    opacity: 0;
    transform: rotate(45deg) scale(0.5);
  }

  100% {
    opacity: 1;
    transform: rotate(45deg) scale(1);
  }
}

@keyframes draw-cross-line2 {
  0% {
    opacity: 0;
    transform: rotate(-45deg) scale(0.5);
  }

  100% {
    opacity: 1;
    transform: rotate(-45deg) scale(1);
  }
}

.task-completed-fade-enter-active,
.task-completed-fade-leave-active {
  transition: opacity 0.3s;
}

.task-completed-fade-enter-from,
.task-completed-fade-leave-to {
  opacity: 0;
}

.task-completed-fade-enter-to,
.task-completed-fade-leave-from {
  opacity: 1;
}

.task-incorrect-fade-enter-active,
.task-incorrect-fade-leave-active {
  transition: opacity 0.3s;
}

.task-incorrect-fade-enter-from,
.task-incorrect-fade-leave-to {
  opacity: 0;
}

.task-incorrect-fade-enter-to,
.task-incorrect-fade-leave-from {
  opacity: 1;
}
</style>