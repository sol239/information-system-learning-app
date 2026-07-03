import { Component } from '~/model/Component'

/**
 * Nuxt plugin to load and register system components from the '~/model/SystemComponents' directory. 
 */
export default defineNuxtPlugin(async (_nuxtApp) => {
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
        const defaultComponents = store.defaultComponents.map(c => Component.fromJSON(JSON.parse(JSON.stringify(c))))
        system.defaultComponents = defaultComponents

        if (!system.actualComponents?.length) {
            system.actualComponents = defaultComponents.map(c => Component.fromJSON(JSON.parse(JSON.stringify(c))))
        }
    }
})
