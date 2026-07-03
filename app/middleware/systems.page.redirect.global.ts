import { TaskHelper } from "~/core/systems/TaskHelper"

/**
 * Nuxt middleware to handle global redirection for the '/systems' route. An user is always redirected to /systems from [...slug].vue
 * This middleware redirects the user the the primary system (STUDENT version), or keeps the user on the /systems page (TEACHER version).
 */
export default defineNuxtRouteMiddleware((to, from) => {
    const systemsStore = useSystemsStore()
    const globalSettings = useGlobalSettingsStore()
    const defaultSystem = systemsStore.getPrimarySystem()
    const defaultId = defaultSystem?.id


    if (to.path === '/systems') {
        if (defaultId && defaultSystem && !globalSettings.teacherMode) {
            globalSettings.studentWelcomeModalOpen = true;
            
            const availableTasks = defaultSystem.availableTasks() ?? [];
            const availablePages = TaskHelper.getVisiblePages(availableTasks);
            const firstPage = availablePages[0]?.route ?? '';

            return navigateTo(`/systems/${defaultId}${firstPage}`, { replace: true });
        } 
        else if (globalSettings.teacherMode) {
            return navigateTo(`/systems`, { replace: true })
        } else {
            return navigateTo(`/systems`, { replace: true })
        }
    }

})
