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
    console.log("Updating component code for:", componentName)
    console.log(":")
    console.log("New code:", code)
    actualComponentCodeMap[componentName] = code
  }

  function getComponentCode(componentName: string) {
    return actualComponentCodeMap[componentName]
  }

  function resetComponentCode(componentName: string) {
    actualComponentCodeMap[componentName] = defaultComponentCodeMap[componentName]
  }

  function resetAllComponentCodes() {

    // TODO make modal to reset individual parts of the system

    // Component code reset
    for (const componentName in actualComponentCodeMap) {
      resetComponentCode(componentName)
    }

    // DB reset
    // const tasks = TaskQueue.getTasks();
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