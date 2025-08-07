import { defineStore } from 'pinia'

export const useSelectedComponentStore = defineStore('selectedComponent', () => {
  // State
  const selectedId = ref<string | null>(null)

  // Actions
  function select(id: string) {
    selectedId.value = id
  }

  function clear() {
    selectedId.value = null
  }

  // Return
  return {
    selectedId,
    select,
    clear
  }
})
