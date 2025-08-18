import { defineStore } from 'pinia'
import type { InformationSystem } from '~/model/InformationSystem'

export const useSelectedSystemStore = defineStore('selectedSystem', () => {
  // State
  const selectedId = ref<number | null>(null)
  const selectedSystem = ref<InformationSystem | null>(null)

  // Actions
  function select(id: number) {
    selectedId.value = id
  }

  function clear() {
    selectedId.value = null
  }

  function setSelectedSystem(system: InformationSystem) {
    selectedSystem.value = system
  }

  return {
    selectedId,
    select,
    clear,
    setSelectedSystem,
    selectedSystem
  }
})
