export default defineNuxtRouteMiddleware((to, from) => {
    const systemsStore = useSystemsStore()
    const globalSettings = useGlobalSettingsStore()
    const availableSystemPages = useAvailableSystemPages()
    const defaultId = systemsStore.getPrimarySystem()?.id


    

})