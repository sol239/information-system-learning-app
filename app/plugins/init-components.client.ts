import { Component } from '~/model/Component'

/**
 * Nuxt plugin to load and register system components.
 */
export default defineNuxtPlugin(async () => {
    const store = useComponentStore()
    store.clearComponents()

    const componentGlobPath = String(useRuntimeConfig().public.systemComponentsGlobPath)
    const moduleLoadersByGlob = {
        '~/model/SystemComponents/**/*.ts': import.meta.glob('~/model/SystemComponents/**/*.ts'),
    }
    const modules = moduleLoadersByGlob[componentGlobPath as keyof typeof moduleLoadersByGlob]

    if (!modules) {
        throw new Error(`Unsupported systemComponentsGlobPath: ${componentGlobPath}`)
    }

    for (const path in modules) {
        const mod = await modules[path]!() as Record<string, unknown>

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
