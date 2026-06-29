import type { GUID } from "~/model/GUID"

/**
 * Store for global settings that are not specific to any system. These settings can be used across the entire application and can be overridden by system-specific settings if needed.
 */
export const useGlobalSettingsStore = defineStore('globalSettings', () => {
    const runtimeConfig = useRuntimeConfig()

    /**
     * Whether the task menu is displayed as a sidebar or not. If not then it is displayed as a drawer after clicking on the tasks icon.
     */
    const taskMenuDisplayedAsSidebar = ref(false)

    const teacherModeEnv: Ref<boolean> = ref(String(runtimeConfig.public.appMode ?? '').trim().toUpperCase() === 'TEACHER')
    let teacherMode: Ref<boolean> = ref(teacherModeEnv.value)
    const teacherHighlightEnabled: Ref<boolean> = ref(true)
    const loadSystemsFromPublicFolder: Ref<boolean> = ref(true)
    const bypassPageVisibility: Ref<boolean> = ref(false)
    const selectedComponents: Ref<Set<string>> = ref(new Set())
    const selectedTaskId: Ref<GUID | null> = ref(null)
    const errorComponentIds: Ref<string[]> = ref([])
    const solvedComponentIds: Ref<string[]> = ref([])
    const deletedPreloadedSystemIds: Ref<string[]> = ref([])
    const startedTaskSystemIds: Ref<string[]> = ref([])

    function markPreloadedSystemAsDeleted(id: string) {
        if (!deletedPreloadedSystemIds.value.includes(id)) {
            deletedPreloadedSystemIds.value.push(id)
        }
    }

    function toggleTeacherMode() {
        if (!teacherModeEnv.value) {
            return
        }

        teacherMode.value = !teacherMode.value
    }

    function hasStartedTasks(systemId: string | null | undefined): boolean {
        if (!systemId) {
            return false
        }

        return startedTaskSystemIds.value.includes(String(systemId))
    }

    function markTasksStarted(systemId: string | null | undefined) {
        if (!systemId || hasStartedTasks(systemId)) {
            return
        }

        startedTaskSystemIds.value.push(String(systemId))
    }

    return {
        taskMenuDisplayedAsSidebar,
        teacherModeEnv,
        teacherMode,
        teacherHighlightEnabled,
        loadSystemsFromPublicFolder,
        bypassPageVisibility,
        selectedComponents,
        selectedTaskId,
        errorComponentIds,
        solvedComponentIds,
        deletedPreloadedSystemIds,
        startedTaskSystemIds,
        markPreloadedSystemAsDeleted,
        toggleTeacherMode,
        hasStartedTasks,
        markTasksStarted
    }

}, {
    persist: {
        pick: ['taskMenuDisplayedAsSidebar', 'solvedComponentIds', 'loadSystemsFromPublicFolder', 'deletedPreloadedSystemIds', 'startedTaskSystemIds'],
    }
})
