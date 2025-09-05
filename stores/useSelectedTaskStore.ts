import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Task } from '~/model/Task'
import { ComponentHandler } from '~/composables/ComponentHandler'
import { useSelectedSystemStore } from './useSelectedSystemStore'

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
    // Automatically load error components when round changes
    loadErrorComponentsForCurrentRound()
  }

  function loadErrorComponentsForCurrentRound() {
    const selectedSystemStore = useSelectedSystemStore()
    if (selectedSystemStore.selectedId !== null) {
      ComponentHandler.getComponentMap(currentRound.value)
    }
  }

  function clearCurrentRound() {
    currentRound.value = 1
  }

  function setSelectedTaskComponentsToFind(components: string[]): void {
    if (selectedTask.value) {
      selectedTask.value.componentsIdsToFind = components
    }
  }

  function resetTasks() {
    clearSelectedTaskId()
    clearSelectedTask()
    clearCurrentRound()
    completedTasksCount.value = 0
  }

  const componentsToFind = computed(() => selectedTask.value?.componentsIdsToFind || [])

  // Watch for round changes and load error components automatically
  watch(currentRound, (newRound) => {
    loadErrorComponentsForCurrentRound()
  })


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
    componentsToFind,
    resetTasks,
    loadErrorComponentsForCurrentRound
  }
})
