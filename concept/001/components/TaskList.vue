<template>
  <div class="max-w-md mx-auto mt-8">
    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold text-center">Todo List</h2>
      </template>


      <div v-if="tasks.length === 0" class="text-center text-gray-500 py-4">
        No tasks yet
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="(task, index) in tasks"
          :key="index"
          class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
        >
          <UCheckbox
            v-model="task.completed"
            :ui="{ wrapper: 'flex-shrink-0' }"
          />
          <span
            class="flex-1 text-sm"
            :class="{ 'line-through text-gray-400': task.completed }"
          >
            {{ task.text }}
          </span>
          <UButton
            @click="removeTask(index)"
            color="red"
            variant="soft"
            size="xs"
            icon="i-heroicons-trash"
          />
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface Task {
  text: string
  completed: boolean
}

const tasks = ref<Task[]>([])

const form = reactive({
  newTask: ''
})

function addTask() {
  if (form.newTask.trim() !== '') {
    tasks.value.push({ text: form.newTask, completed: false })
    form.newTask = ''
  }
}

function removeTask(index: number) {
  tasks.value.splice(index, 1)
}
</script>