import type { R } from "vue-router/dist/router-CWoNjPRp.mjs"
import { CsLanguage } from "~/language/CsLangauge"
import { EnLanguage } from "~/language/EnLanguage"
import type { Language } from "~/language/Language"
import type { GUID } from "~/model/GUID"

/**
 * Store for global settings that are not specific to any system. These settings can be used across the entire application and can be overridden by system-specific settings if needed.
 */
export const useGlobalSettingsStore = defineStore('globalSettings', () => {
    const runtimeConfig = useRuntimeConfig()

    /**
     * Langauage which is used across the application, but each system can have its own language settings. This is used for the global settings, which are not system specific.
     * When a system is created it uses this language as the default language, but it can be changed later on.
     */
    const globalLanguage = ref<Language>(new CsLanguage())

    /**
     * Whether the task menu is displayed as a sidebar or not. If not then it is displayed as a drawer after clicking on the tasks icon.
     */
    const taskMenuDisplayedAsSidebar = ref(false)

    /**
     * List of all available languages in the application.
     */
    const languages: Language[] = [
        new EnLanguage(),
        new CsLanguage()
    ]

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
        globalLanguage,
        taskMenuDisplayedAsSidebar,
        languages,
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
        pick: ['globalLanguage', 'taskMenuDisplayedAsSidebar', 'solvedComponentIds', 'loadSystemsFromPublicFolder', 'deletedPreloadedSystemIds', 'startedTaskSystemIds'],
    }
})
