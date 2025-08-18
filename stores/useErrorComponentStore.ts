import { defineStore } from 'pinia'
import type { ComponentErrorDefinition } from '~/model/ComponentErrorDefinition'

export const useErrorComponentStore = defineStore('errorComponent', () => {
  // State
  const errorComponents = ref<ComponentErrorDefinition[]>([])

  // Actions
  function addErrorComponent(component: ComponentErrorDefinition) {
    errorComponents.value.push(component)
  }

  function removeErrorComponent(componentName: string) {
    console.log('Removing error component:', componentName)
    console.log("BEFORE:",errorComponents.value)
    errorComponents.value = errorComponents.value.filter(component => component.componentFilename !== componentName)
    console.log('Updated error components:', errorComponents.value)
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
    clearErrorComponents,
    removeErrorComponent
  }
}, {
  persist: true
})
