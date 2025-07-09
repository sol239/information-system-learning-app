import { defineStore } from 'pinia'

export const useSelectedComponentStore = defineStore('selectedComponent', {
  state: () => ({
    selectedId: null as string | null
  }),
  actions: {
    select(id: string) {
      this.selectedId = id
    },
    clear() {
      this.selectedId = null
    }
  }
})