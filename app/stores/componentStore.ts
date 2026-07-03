import type { Component } from "~/model/Component"

export const useComponentStore = defineStore('components', () => {
    const defaultComponents = ref<Component[]>([])

    function registerComponent(component: Component) {
        const index = defaultComponents.value.findIndex(c => c.id === component.id)
        if (index === -1) {
            defaultComponents.value.push(component)
        } else {
            defaultComponents.value[index] = component
        }
    }

    function clearComponents() {
        defaultComponents.value = []
    }

    return {
        defaultComponents,
        registerComponent,
        clearComponents
    }

},
    {
        persist: true
    })
