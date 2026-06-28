export default defineNuxtRouteMiddleware(async (to, from) => {

    // 1) Load systems from IndexedDB
    const result = await IndexedDbStorage.GetStoredInformationSystems()
    //console.log(result.toString())
    const systemsStore = useSystemsStore()
    const globalSettings = useGlobalSettingsStore()
    const { prepareSystem } = usePrepareSystem()
    systemsStore.systems = result.data || []

    // 2) Select and prepare the routed system
    const systemId = routeSystemId(to)
    if (systemId) {
        if (!systemsStore.getSystemById(systemId) && globalSettings.loadSystemsFromPublicFolder) {
            const { load, systems: preloadedSystems } = usePreloadedSystems()
            await load()

            const deletedIds = new Set(globalSettings.deletedPreloadedSystemIds.map(String))
            for (const system of preloadedSystems.value) {
                if (deletedIds.has(String(system.id))) {
                    continue
                }

                if (!systemsStore.getSystemById(String(system.id))) {
                    await systemsStore.addSystem(system)
                }
            }
        }

        await prepareSystem(systemId)
    }
})

function routeSystemId(route: { params: Record<string, unknown>, path: string }): string | null {
    const paramId = route.params.id
    if (typeof paramId === 'string' && paramId.length > 0) {
        return paramId
    }

    const pathMatch = route.path.match(/^\/systems\/([^/]+)/)
    return pathMatch?.[1] ? decodeURIComponent(pathMatch[1]) : null
}
