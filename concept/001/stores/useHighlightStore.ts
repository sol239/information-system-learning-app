import { defineStore } from 'pinia'

export const useHighlightStore = defineStore('highlight', () => {
  const isHighlightMode = ref(false)

  function toggleHighlight() {
    isHighlightMode.value = !isHighlightMode.value
  }

  return {
    isHighlightMode,
    toggleHighlight
  }
})
