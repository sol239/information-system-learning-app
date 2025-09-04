import { defineStore } from 'pinia'

export const useHighlightStore = defineStore('highlight', () => {
  const isHighlightMode = ref(false)
  const selectedIds = ref<Set<string>>(new Set())
  const highlightHandler = new HighlightHandler()
  const isEditModeActive = ref(false)
  const selectedComponentId = ref<string | null>(null)

  function toggleHighlight() {
    isHighlightMode.value = !isHighlightMode.value
  }

  function toggleEdit() {
    isEditModeActive.value = !isEditModeActive.value
  }

  return {
    isHighlightMode,
    toggleHighlight,
    selectedIds,
    highlightHandler,
    isEditModeActive,
    toggleEdit,
    selectedComponentId
  }
})
