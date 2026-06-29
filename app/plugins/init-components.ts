import { Component } from '~/model/Component'
import { getComponentLoadSource } from '~/utils/componentLoadSource'

/**
 * Nuxt plugin to load and register system components from the '~/model/SystemComponents' directory. 
 * It is used when 'NUXT_PUBLIC_LOAD_COMPONENTS_FROM' is set to 'development' to dynamically load components for development purposes.
 */
export default defineNuxtPlugin(async (_nuxtApp) => {
    if (getComponentLoadSource() !== 'development') {
        return
    }

    const store = useComponentStore()
    store.clearComponents()

    // Dynamically import all modules from the '~/model/SystemComponents' directory
    const modules = import.meta.glob('~/model/SystemComponents/**/*.ts')

    for (const path in modules) {
        const mod: any = await modules[path]!()

        for (const key in mod) {
            const exportItem = mod[key]
            if (exportItem instanceof Component) {
                store.registerComponent(exportItem)
            }
        }
    }

    const systemsStore = useSystemsStore()
    for (const system of systemsStore.systems) {
        system.defaultComponents = store.defaultComponents.map(c => Component.fromJSON(JSON.parse(JSON.stringify(c))))
        system.actualComponents = store.defaultComponents.map(c => Component.fromJSON(JSON.parse(JSON.stringify(c))))
    }
})
