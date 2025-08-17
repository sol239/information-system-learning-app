import { defineStore } from 'pinia'

export const useComponentCodeStore = defineStore('componentCode', () => {
  const defaultComponentCodeMap = reactive<Record<string, string>>({})
  const actualComponentCodeMap = reactive<Record<string, string>>({})

  function updateDefaultComponentCode(componentName: string, code: string) {
    defaultComponentCodeMap[componentName] = code
  }

  function getDefaultComponentCode(componentName: string) {
    return defaultComponentCodeMap[componentName]
  }

  function updateComponentCode(componentName: string, code: string) {
    actualComponentCodeMap[componentName] = code
  }

  function getComponentCode(componentName: string) {
    return actualComponentCodeMap[componentName]
  }

  function resetComponentCode(componentName: string) {
    actualComponentCodeMap[componentName] = defaultComponentCodeMap[componentName]
  }

  function resetAllComponentCodes() {
    for (const componentName in actualComponentCodeMap) {
      console.log("Resetting component code for:", componentName)
      resetComponentCode(componentName)
    }
  }

  return {
    defaultComponentCodeMap,
    actualComponentCodeMap,
    updateDefaultComponentCode,
    getDefaultComponentCode,
    updateComponentCode,
    getComponentCode,
    resetComponentCode,
    resetAllComponentCodes
  }
})