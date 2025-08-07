import { defineStore } from 'pinia'

export const useSelectedSystemStore = defineStore('selectedSystem', () => {
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
