<template>
  <div class="max-w-md mx-auto mt-8">
    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold text-center">Tasks</h2>
      </template>

      <div v-if="tasks.length === 0" class="text-center text-gray-500 py-4">
        No tasks yet
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="(task, index) in tasks"
          :key="index"
          class="flex items-center gap-3 p-3 rounded-lg"
        >
          <UCard>
            {{ task.title }}
            <UButton style="margin-left: 5px;">Vybrat</UButton>
          </UCard>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSelectedSystemStore } from '~/stores/selectedSystemId'
import { useInformationSystemStore } from '~/stores/informationSystems'
import { Task } from '~/model/types/Task'

// Selected system id
const selectedSystemStore = useSelectedSystemStore()
const systemId = selectedSystemStore.selectedId

const store = useInformationSystemStore()
const system = store.systems.find(sys => sys.id === systemId)

// New task input
const newTaskText = ref('')

// Computed property for tasks from the system
const tasks = computed(() => system?.tasks ?? [])

// Add new task
const addTask = () => {
  if (!newTaskText.value.trim() || !system) return
  
  const newTask = new Task(
    Date.now(), // Simple ID generation
    newTaskText.value.trim(), // title
    '', // description (empty by default)
    false, // completed
    'general', // kind (set a default or adjust as needed)
    '' // elementClass (empty by default)
  )
  
  system.tasks.push(newTask)
  newTaskText.value = ''
  
  // Update store
  store.updateSystem(system)
}

function removeTask(index: number) {
  if (!system || !system.tasks) return
  system.tasks.splice(index, 1)
}

// Update task (when checkbox changes)
const updateTask = (index: number, task: Task) => {
  if (!system) return
  
  // Task is already updated by v-model, just need to update store
  store.updateSystem(system)
}
</script>