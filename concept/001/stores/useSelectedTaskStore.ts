import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Task } from '~/model/Task'

export const useSelectedTaskStore = defineStore('selectedTask', () => {
  // State
  const selectedId = ref<number | null>(null)
  const selectedTask = ref<Task | null>(null)
  const currentRound = ref<number>(1)
  const completedTasksCount = ref<number>(0)

  // Actions
  function setSelectedTaskId(id: number) {
    selectedId.value = id
  }

  function clearSelectedTaskId() {
    selectedId.value = null
  }

  function setSelectedTask(task: Task | null) {
    selectedTask.value = task
  }

  function clearSelectedTask() {
    selectedTask.value = null
  }

  function setCurrentRound(round: number) {
    currentRound.value = round
  }

  function clearCurrentRound() {
    currentRound.value = 1
  }

  function setSelectedTaskComponentsToFind(components: string[]): void {
    if (selectedTask.value) {
      selectedTask.value.componentsIdsToFind = components
    }
  }

  const componentsToFind = computed(() => selectedTask.value?.componentsIdsToFind || [])


  return {
    selectedId,
    select: setSelectedTaskId,
    clear: clearSelectedTaskId,
    currentRound,
    setCurrentRound,
    clearCurrentRound,
    completedTasksCount,
    selectedTask,
    setSelectedTask,
    clearSelectedTask,
    setSelectedTaskComponentsToFind,
    componentsToFind
  }
})
