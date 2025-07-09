<template>
  <div class="max-w-md mx-auto mt-8">
    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold text-center">Tasks</h2>
      </template>

      <!-- Show selected task details if selected, otherwise show list -->
      <div v-if="selectedTask">
        <div class="p-4">
          <div class="flex items-center mb-2">
            <UCheckbox
              :model-value="selectedTask.completed"
              disabled
              class="mr-2"
            />
            <h3 class="text-lg font-bold">{{ selectedTask.title }}</h3>
          </div>
          <p class="mb-2">{{ selectedTask.description }}</p>
            <span class="font-semibold">Kind of task: </span>
            <span>{{ selectedTask.kind }}</span><br>
          <UButton class="mt-4" @click="selectTask(selectedTask.id)">Back to list</UButton>
          <!-- Send selected component button -->
          <UButton
          variant="outline"
            style="margin-left: 5px;"
            :disabled="!selectedComponentStore.selectedId || selectedTask.completed"
            @click="handleSubmit"
          >Submit</UButton>
        </div>
      </div>
      <div v-else>
        <div v-if="tasks.length === 0" class="text-center text-gray-500 py-4">
          No tasks yet
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="(task, index) in tasks"
            :key="index"
            class="flex items-center gap-3 p-3 rounded-lg"
          >
            <UCheckbox
              :model-value="task.completed"
              disabled
              class="mr-2"
            />
            <UCard>
              {{ task.title }}
              <UButton style="margin-left: 5px;" @click="selectTask(task.id)">Select</UButton>
            </UCard>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSelectedSystemStore } from '~/stores/selectedSystemId'
import { useInformationSystemStore } from '~/stores/informationSystems'
import { useSelectedTaskStore } from '~/stores/selectedTask'
import { useSelectedComponentStore } from '~/stores/selectedComponent'
import { Task } from '~/model/types/Task'

const selectedSystemStore = useSelectedSystemStore()
const systemId = selectedSystemStore.selectedId

const store = useInformationSystemStore()
const system = store.systems.find(sys => sys.id === systemId)

const newTaskText = ref('')

const tasks = computed(() => system?.tasks ?? [])

const selectedTaskStore = useSelectedTaskStore()
const selectedComponentStore = useSelectedComponentStore()

const addTask = () => {
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
  store.updateSystem(system)
}

function removeTask(index: number) {
  if (!system || !system.tasks) return
  system.tasks.splice(index, 1)
}

const updateTask = (index: number, task: Task) => {
  if (!system) return
  store.updateSystem(system)
}

const selectTask = (id: number) => {
  if (selectedTaskStore.selectedId === id) {
    selectedTaskStore.clear()
  } else {
    selectedTaskStore.select(id)
  }
}

const selectedTask = computed(() =>
  tasks.value.find((t: Task) => t.id === selectedTaskStore.selectedId) ?? null
)

const handleSubmit = () => {
  if (!selectedTask.value) return
  const selectedComponentId = selectedComponentStore.selectedId
  const taskElementClass = selectedTask.value.elementClass
  const isMatch = selectedComponentId === taskElementClass
  console.log('Selected component:', selectedComponentId)
  console.log('Task elementClass:', taskElementClass)
  console.log('Match:', isMatch)
  // If match, mark as completed and save
  if (isMatch && system && selectedTask.value) {
    const idx = system.tasks.findIndex(t => t.id === selectedTask.value!.id)
    if (idx !== -1) {
      system.tasks[idx].completed = true
      store.updateSystem(system)
    }
  }
}
</script>