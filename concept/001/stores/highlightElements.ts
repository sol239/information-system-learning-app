import { defineStore } from 'pinia'

export const useHighlightStore = defineStore('highlight', {
  state: () => ({
    isHighlightMode: false
  }),
  actions: {
    toggleHighlight() {
      this.isHighlightMode = !this.isHighlightMode
    }
  }
})

