import { ActivityType } from '~/model/Task/Activity/ActivityType'

export default defineNuxtPlugin((_nuxtApp) => {
    const systemsStore = useSystemsStore()
    const globalSettings = useGlobalSettingsStore()
    const highlightStore = useHighlightStore()

    const sync = () => {
        const tasks = systemsStore.selectedSystem?.tasks ?? []
        const solved = new Set(globalSettings.solvedComponentIds)
        const ids = new Set<string>()

        for (const task of tasks) {
            for (const component of task.errorComponents ?? []) {
                if (!solved.has(component.id)) {
                    ids.add(component.id)
                }
            }
        }

        globalSettings.errorComponentIds = Array.from(ids)
    }

    const syncSelectedComponents = () => {
        if (!globalSettings.selectedTaskId) {
            if (globalSettings.selectedComponents.size > 0) {
                globalSettings.selectedComponents = new Set()
            }
            return
        }

        const task = systemsStore.selectedSystem?.tasks?.find(t => t.id === globalSettings.selectedTaskId)
        if (task) {
            globalSettings.selectedComponents = new Set((task.errorComponents ?? []).map(c => c.id))
        } else {
            if (globalSettings.selectedComponents.size > 0) {
                globalSettings.selectedComponents = new Set()
            }
        }
    }

    let previousSelectedTaskId: string | null = null

    const syncStudentHighlightMode = () => {
        const selectedTaskId = globalSettings.selectedTaskId ? String(globalSettings.selectedTaskId) : null
        const selectedTask = selectedTaskId
            ? systemsStore.selectedSystem?.tasks?.find(task => String(task.id) === selectedTaskId)
            : null
        const shouldHighlight = !globalSettings.teacherMode && selectedTask?.activityType === ActivityType.SELECT

        if (previousSelectedTaskId !== selectedTaskId) {
            highlightStore.clearHighlights()
            previousSelectedTaskId = selectedTaskId
        }

        highlightStore.setHighlightActive(shouldHighlight)
    }

    watch(
        () => [
            systemsStore.selectedSystemId,
            (systemsStore.selectedSystem?.tasks ?? []).flatMap(task =>
                (task.errorComponents ?? []).map(component => String(component.id))
            ),
            [...(globalSettings.solvedComponentIds ?? [])].map(id => String(id)),
        ] as const,
        sync,
        { immediate: true }
    )

    watch(
        () => [
            globalSettings.selectedTaskId,
            systemsStore.selectedSystemId,
            (systemsStore.selectedSystem?.tasks?.find(t => t.id === globalSettings.selectedTaskId)?.errorComponents ?? []).map(c => String(c.id)).join(',')
        ] as const,
        syncSelectedComponents,
        { immediate: true }
    )

    watch(
        () => [
            globalSettings.selectedTaskId,
            systemsStore.selectedSystemId,
            globalSettings.teacherMode,
            systemsStore.selectedSystem?.tasks?.find(task => task.id === globalSettings.selectedTaskId)?.activityType ?? null
        ] as const,
        syncStudentHighlightMode,
        { immediate: true }
    )
})
