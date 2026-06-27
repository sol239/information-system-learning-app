import { Component } from '~/model/Component'
import { getComponentLoadSource } from '~/utils/componentLoadSource'

export default defineNuxtPlugin(async (_nuxtApp) => {
    if (getComponentLoadSource() !== 'development') {
        return
    }

    const store = useComponentStore()
    store.clearComponents()
    
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
