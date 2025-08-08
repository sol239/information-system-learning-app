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

          <UStepper ref="stepper" class="mt-6" :items="stepperItems" :disabled="true" :model-value="currentStepIndex" />

          <!--
          <span class="font-semibold">Kind of task: </span>
          <span>{{ selectedTask.kind }}</span><br>
-->
          <!-- Kind of task: select -->
          <div v-if="selectedTask.kind === 'select'">
            <UButton variant="outline" style="margin-left: 5px;"
              :disabled="selectedTask.completed || !highlightStore.selectedIds || highlightStore.selectedIds.length === 0"
              @click="handleSubmit">
              {{ t('submit') }}
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

          <UButton class="mt-4" @click="selectTask(selectedTask.id)">{{ t('back_to_tasks') }}</UButton>
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
import { ref, computed } from 'vue'
import { useSelectedSystemStore } from '~/stores/useSelectedSystemStore'
import { useInformationSystemStore } from '~/stores/useInformationSystemStore'
import { useSelectedTaskStore } from '~/stores/useSelectedTaskStore'
import { useSelectedComponentStore } from '~/stores/useSelectedComponentStore'
import { ComponentHandler, TaskQueue, useScoreStore } from '#imports'
import { useErrorComponentStore } from '#imports'
import { useHighlightStore } from '#imports'
import { Task } from '~/model/Task'
import { sys } from 'typescript'
import type { StepperItem } from '@nuxt/ui'


/* 2. Stores */
const selectedSystemStore = useSelectedSystemStore()
const store = useInformationSystemStore()
const selectedTaskStore = useSelectedTaskStore()
const selectedComponentStore = useSelectedComponentStore()
const scoreStore = useScoreStore()
const errorComponentStore = useErrorComponentStore()
const highlightStore = useHighlightStore()

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
let stepperIndex = 0;
const systemId = selectedSystemStore.selectedId
const system = store.systems.find(sys => sys.id === systemId)
const toast = useToast()
//TODO: locale
const stepperItems = ref<StepperItem[]>([
  {
    title: 'Zvolení úkolu',
    icon: 'i-lucide-house'
  },
  {
    title: 'Oprava komponent',
    icon: 'i-lucide-house'
  },
  {
    title: 'Dokončení úkolu',
    icon: 'i-lucide-truck'
  }
])

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
const stepper = ref()

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

/* 10. Watchers */
watch(() => selectedTaskStore.currentRound, (newRound) => {
  const newTasksCount = ComponentHandler.getComponentMap(newRound).length - selectedTaskStore.completedTasksCount;

  // někdy blbnou počty --> zobrazí se záporné číslo
  if (newTasksCount !== 0) {
    toast.add({
      title: t('new_tasks_added', { count: newTasksCount }),
      color: 'success',
      icon: 'i-lucide-circle-check'
    })

  } else {
    // TODO: trochu zabugované ještě, někdy se zobrazlo jen po dokončení roundu
    toast.add({
      title: t('all_tasks_completed'),
      color: 'secondary',
      icon: 'i-lucide-circle-check'
    })
  }

})

watch(selectedTask, (task) => {
  if (task?.completed) {
    currentStepIndex.value = 2
  }
})

/* 11. Methods */
function addTask() {
  if (!newTaskText.value.trim() || !system) return

  const newTask = new Task(
    Date.now(),
    newTaskText.value.trim(),
    '',
    false,
    'general',
    ''
  )

  system.tasks.push(newTask)
  newTaskText.value = ''
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

function handleSubmit() {
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
        for (const id of actual) {
          errorComponentStore.removeErrorComponent(id)
        }
      }

    }

    isMatch = match
  } else if (selectedTask.value.kind === 'type-correct') {
    const expected = selectedTask.value.answer.trim()
    const actual = form.value.answer.trim()
    isMatch = expected === actual
    console.log("Expected:", expected)
    console.log("Actual:", actual)
    console.log("Task kind: type-correct, isMatch:", isMatch)
  }

  // If the task matches the selected component or answer, mark it as completed
  if (isMatch && system && selectedTask.value) {
    const idx = system.tasks.findIndex(t => t.id === selectedTask.value!.id)
    if (idx !== -1) {

    console.log(selectedSystemStore.selectedSystem)


      system.tasks[idx].componentsRepaired = true

      highlightStore.isHighlightMode = false
      highlightStore.highlightHandler.clearSelection()
      stepper.value.next()
      stepperIndex += 1;

      if (selectedTaskStore.selectedTask?.answer === "none") {
        system.tasks[idx].completed = true
        taskCompleted.value = true
        setTimeout(() => {
          taskCompleted.value = false
        }, 1200)
        scoreStore.incrementCorrectAnswers()
        stepperIndex += 1;
        stepper.value.next()
        selectedTaskStore.completedTasksCount += 1;
        scoreStore.addUserRecord({
          taskId: selectedTask.value.id,
          answer: form.value.answer,
          isCorrect: true,
          timestamp: new Date()
        })


      }

      // TODO: increment row after all tasks with current row are finished
      if (TaskQueue.getTasks(selectedTaskStore.currentRound).every(t => t.completed)) {
        selectedTaskStore.currentRound += 1
      }
    }
  } else if (!isMatch) {
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