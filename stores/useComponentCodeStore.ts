import { defineStore } from 'pinia'
import type { Component } from '~/model/Component'

export const useComponentCodeStore = defineStore('componentCode', () => {
  const defaultComponentCodeMap = reactive<Record<string, string>>({})
  const actualComponentCodeMap = reactive<Record<string, string>>({})

  const defaultComponentMap = reactive<Array<Component>>([])
  const actualComponentMap = reactive<Array<Component>>([])

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

  // New methods for Component instances
  function updateDefaultComponent(component: Component) {
    const index = defaultComponentMap.findIndex(c => c.id === component.id)
    if (index >= 0) {
      defaultComponentMap[index] = component
    } else {
      defaultComponentMap.push(component)
    }
  }

  function getComponentById(id: string): Component | undefined {
    return actualComponentMap.find(c => c.id === id)
  }

  function getDefaultComponent(id: string): Component | undefined {
    return defaultComponentMap.find(c => c.id === id)
  }

  function updateActualComponent(component: Component) {
    const index = actualComponentMap.findIndex(c => c.id === component.id)
    if (index >= 0) {
      actualComponentMap[index] = component
    } else {
      actualComponentMap.push(component)
    }
  }

  function getActualComponent(id: string): Component | undefined {
    return actualComponentMap.find(c => c.id === id)
  }

  function resetComponent(id: string) {
    const defaultComp = getDefaultComponent(id)
    if (defaultComp) {
      updateActualComponent(defaultComp)
    }
  }

  function resetAllComponents() {
    actualComponentMap.splice(0, actualComponentMap.length, ...defaultComponentMap)
  }

  function updateComponent(id: string, component: Component) {
    const index = actualComponentMap.findIndex(c => c.id === id)
    if (index >= 0) {
      actualComponentMap[index] = component
    } else {
      actualComponentMap.push(component)
    }
  }

  // New methods to get specific component code by type
  function getComponentCodeByType(componentId: string, codeType: 'html' | 'css' | 'js' | 'sql', specificKey?: string): string {
    const component = getComponentById(componentId) || getDefaultComponent(componentId)
    if (!component) return ''
    
    const codeMap = component[codeType]
    if (!codeMap) return ''
    
    // If specific key is provided, use it; otherwise try the codeType or 'default'
    const key = specificKey || codeType || 'default'
    return codeMap[key] || codeMap['default'] || ''
  }

  function updateComponentCodeByType(componentId: string, codeType: 'html' | 'css' | 'js' | 'sql', code: string, specificKey?: string) {
    let component = getComponentById(componentId)
    
    if (!component) {
      const defaultComponent = getDefaultComponent(componentId)
      if (!defaultComponent) return
      
      // Create a copy of default component for actual use
      component = {
        ...defaultComponent,
        html: { ...defaultComponent.html },
        css: { ...defaultComponent.css },
        js: { ...defaultComponent.js },
        sql: { ...defaultComponent.sql }
      }
      actualComponentMap.push(component)
    }
    
    const key = specificKey || codeType || 'default'
    component[codeType][key] = code
  }

  return {
    defaultComponentCodeMap,
    actualComponentCodeMap,
    updateDefaultComponentCode,
    getDefaultComponentCode,
    updateComponentCode,
    getComponentCode,
    resetComponentCode,
    resetAllComponentCodes,
    defaultComponentMap,
    actualComponentMap,
    updateDefaultComponent,
    getDefaultComponent,
    updateActualComponent,
    getActualComponent,
    resetComponent,
    resetAllComponents,
    getComponentById,
    updateComponent,
    getComponentCodeByType,
    updateComponentCodeByType
  }
})