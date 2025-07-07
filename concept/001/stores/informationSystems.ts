import { defineStore } from 'pinia'
import type { InformationSystem } from '~/model/types/InformationSystem'


export const useInformationSystemStore = defineStore('informationSystem', {
  state: () => ({
    systems: [] as InformationSystem[]
  }),
  actions: {
    addSystem(system: InformationSystem) {
      this.systems.push(system)
    },
    clearSystems() {
      this.systems = []
    }
  }
})

