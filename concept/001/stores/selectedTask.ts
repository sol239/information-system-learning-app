import { defineStore } from 'pinia'

export const useSelectedTaskStore = defineStore('selectedTask', {
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