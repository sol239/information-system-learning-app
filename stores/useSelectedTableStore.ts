import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSelectedTableStore = defineStore('selectedTable', () => {
  // State
  const selectedTableName = ref<string | null>(null)

  // Actions
  function select(name: string) {
    selectedTableName.value = name
  }

  function clear() {
    selectedTableName.value = null
  }

  return {
    selectedTableName,
    select,
    clear
  }
})
