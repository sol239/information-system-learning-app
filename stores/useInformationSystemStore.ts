import { defineStore } from 'pinia'
import type { InformationSystem } from '~/model/InformationSystem'

export const useInformationSystemStore = defineStore('informationSystem', () => {
  // State
  const systems = ref<InformationSystem[]>([])

  // Actions
  function addSystem(system: InformationSystem) {
    systems.value.push(system)
  }

  function clearSystems() {
    systems.value = []
  }

  // Return
  return {
    systems,
    addSystem,
    clearSystems
  }
})
