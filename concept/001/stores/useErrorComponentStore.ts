import { defineStore } from 'pinia'
import type { ComponentErrorDefinition } from '~/model/ComponentErrorDefinition'

export const useErrorComponentStore = defineStore('errorComponent', () => {
  // State
  const errorComponents = ref<ComponentErrorDefinition[]>([])

  // Actions
  function addErrorComponent(component: ComponentErrorDefinition) {
    errorComponents.value.push(component)
  }

  function setErrorComponents(components: ComponentErrorDefinition[]) {
    errorComponents.value = components
  }

  function clearErrorComponents() {
    errorComponents.value = []
  }

  // Return
  return {
    errorComponents,
    addErrorComponent,
    setErrorComponents,
    clearErrorComponents
  }
})
