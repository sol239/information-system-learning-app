import { defineStore } from 'pinia'

export const useSelectedSystemStore = defineStore('selectedSystem', {
  state: () => ({
    selectedId: null as number | null
  }),
  actions: {
    select(id: number) {
      this.selectedId = id
    },
    clear() {
      this.selectedId = null
    }
  }
})