import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSelectedTaskStore = defineStore('selectedTask', () => {
  // State
  const selectedId = ref<number | null>(null)

  // Actions
  function select(id: number) {
    selectedId.value = id
  }

  function clear() {
    selectedId.value = null
  }

  return {
    selectedId,
    select,
    clear
  }
})
