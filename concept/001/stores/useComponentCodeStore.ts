import { defineStore } from 'pinia'

export const useComponentCodeStore = defineStore('componentCode', () => {
  const componentCodeMap = reactive<Record<string, string>>({})

  function updateComponentCode(componentName: string, code: string) {
    componentCodeMap[componentName] = code
  }

  function getComponentCode(componentName: string) {
    return componentCodeMap[componentName]
  }

  return {
    componentCodeMap,
    updateComponentCode,
    getComponentCode
  }
})