import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSelectedTaskStore = defineStore('selectedTask', () => {
  // State
  const selectedId = ref<number | null>(null)
  const currentRound = ref<number>(1)

  // Actions
  function setSelectedTaskId(id: number) {
    selectedId.value = id
  }

  function clearSelectedTaskId() {
    selectedId.value = null
  }

  function setCurrentRound(round: number) {
    currentRound.value = round
  }

  function clearCurrentRound() {
    currentRound.value = 1
  }

  return {
    selectedId,
    select: setSelectedTaskId,
    clear: clearSelectedTaskId,
    currentRound,
    setCurrentRound,
    clearCurrentRound
  }
})
