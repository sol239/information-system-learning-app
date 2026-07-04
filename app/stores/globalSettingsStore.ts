/**
 * Store for global settings that are not specific to any system. These settings can be used across the entire application and can be overridden by system-specific settings if needed.
 */
export const useGlobalSettingsStore = defineStore('globalSettings', () => {
    const runtimeConfig = useRuntimeConfig()

    /**
     * Whether the task menu is displayed as a sidebar or not. If not then it is displayed as a drawer after clicking on the tasks icon.
     */
    const taskMenuDisplayedAsSidebar = ref(false)

    const teacherModeEnv: Ref<boolean> = ref(String(runtimeConfig.public.appMode ?? '').trim().toLowerCase() === 'teacher')
    const teacherMode: Ref<boolean> = ref(teacherModeEnv.value)
    const teacherHighlightEnabled: Ref<boolean> = ref(true)
    const bypassPageVisibility: Ref<boolean> = ref(false)
    const selectedComponents: Ref<Set<string>> = ref(new Set())
    const selectedTaskId: Ref<string | null> = ref(null)
    const errorComponentIds: Ref<string[]> = ref([])
    const solvedComponentIds: Ref<string[]> = ref([])
    const deletedPreloadedSystemIds: Ref<string[]> = ref([])
    const studentWelcomeModalOpen: Ref<boolean> = ref(false)

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

    return {
        taskMenuDisplayedAsSidebar,
        teacherModeEnv,
        teacherMode,
        teacherHighlightEnabled,
        bypassPageVisibility,
        selectedComponents,
        selectedTaskId,
        errorComponentIds,
        solvedComponentIds,
        deletedPreloadedSystemIds,
        studentWelcomeModalOpen,
        markPreloadedSystemAsDeleted,
        toggleTeacherMode,
    }

}, {
    persist: {
        pick: ['taskMenuDisplayedAsSidebar', 'solvedComponentIds', 'deletedPreloadedSystemIds'],
    }
})
