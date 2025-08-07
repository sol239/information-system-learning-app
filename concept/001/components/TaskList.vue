
<template>
  <div class="max-w-md mx-auto mt-8">
    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold text-center">{{ t('tasks') }}</h2>
      </template>

      <!-- Green animation overlay -->
      <transition name="task-completed-fade">
        <div
          v-if="taskCompleted"
          class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <div class="task-completed-animation"></div>
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
          <span class="font-semibold">Kind of task: </span>

          <!-- Kind of task: select, type-correct, ... -->
          <span>{{ selectedTask.kind }}</span><br>

          <!-- Kind of task: select -->
          <div v-if="selectedTask.kind === 'select'">
            <UButton variant="outline" style="margin-left: 5px;" :disabled="selectedTask.completed"
              @click="handleSubmit">{{
                t('submit') }}
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
import { useScoreStore } from '#imports'
import { Task } from '~/model/Task'

/* 2. Stores */
const selectedSystemStore = useSelectedSystemStore()
const store = useInformationSystemStore()
const selectedTaskStore = useSelectedTaskStore()
const selectedComponentStore = useSelectedComponentStore()
const scoreStore = useScoreStore()

/* 3. Context hooks */
const { t } = useI18n()

/* 4. Constants (non-reactive) */
const systemId = selectedSystemStore.selectedId
const system = store.systems.find(sys => sys.id === systemId)

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

/* 9. Computed */
const tasks = computed(() => system?.tasks ?? [])

const selectedTask = computed(() =>
  tasks.value.find((t: Task) => t.id === selectedTaskStore.selectedId) ?? null
)

/* 10. Watchers */
// none

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
  } else {
    selectedTaskStore.select(id)
    console.log('Selected task:', selectedTaskStore.selectedId)
  }
}

function handleSubmit() {
  if (!selectedTask.value) return
  
  const selectedComponentId = selectedComponentStore.selectedId
  const taskElementClass = selectedTask.value.elementClass
  let isMatch: boolean = false

  // Task completion logic
  if (selectedTask.value.kind === 'select') {
    isMatch = selectedComponentId === taskElementClass
    console.log("Task kind: select, isMatch:", isMatch)
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
      system.tasks[idx].completed = true
      console.log('Task completed:', selectedTask.value)
      taskCompleted.value = true
      setTimeout(() => {
        taskCompleted.value = false
      }, 1200) 
      scoreStore.incrementCorrectAnswers()
      console.log("Correct answers count:", scoreStore.correctAnswers)
      
      scoreStore.addUserRecord({
        taskId: selectedTask.value.id,
        answer: form.value.answer,
        isCorrect: true,
        timestamp: new Date()
      })
    }
  } else if (!isMatch) {
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
</style>