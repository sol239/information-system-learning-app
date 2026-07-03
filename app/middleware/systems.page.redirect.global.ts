/**
 * Nuxt middleware to handle global redirection for the '/systems' route. An user is always redirected to /systems from [...slug].vue
 * This middleware redirects the user the the primary system (STUDENT version), or keeps the user on the /systems page (TEACHER version).
 */
export default defineNuxtRouteMiddleware((to, from) => {
    const systemsStore = useSystemsStore()
    const globalSettings = useGlobalSettingsStore()
    const availableSystemPages = useAvailableSystemPages()
    const defaultId = systemsStore.getPrimarySystem()?.id


    if (to.path === '/systems') {
        if (defaultId && !globalSettings.teacherMode) {
            return navigateTo(`/systems/${defaultId}/${availableSystemPages.getFirstAvailablePageName()}`, { replace: true })
        } 
        else if (globalSettings.teacherMode) {
            return navigateTo(`/systems`, { replace: true })
        } else {
            return navigateTo(`/systems`, { replace: true })
        }
    }

})