import { computed } from 'vue'
import type { Page } from '~/model/Page'
import type { Task } from '~/model/Task/Task'
import { availableVisiblePages } from '~/utils/taskPageVisibility'

type PushFirstAvailablePageOptions = {
  replace?: boolean
}

export function useAvailableSystemPages() {
  const systemsStore = useSystemsStore()
  const globalSettings = useGlobalSettingsStore()
  const nuxtApp = useNuxtApp()

  const selectedTask = computed(() => {
    const selectedTaskId = globalSettings.selectedTaskId
    if (!selectedTaskId) {
      return null
    }

    return systemsStore.selectedSystem?.tasks?.find(task => task.id === selectedTaskId) ?? null
  })

  const visiblePages = computed(() => pagesForTask(selectedTask.value))
  const firstVisiblePage = computed(() => visiblePages.value[0] ?? null)

  function pagesForTask(task: Task | null | undefined = selectedTask.value): Page[] {
    const system = systemsStore.selectedSystem
    if (!system) {
      return []
    }

    return availableVisiblePages(system, task, databasePageName())
  }

  function databasePageName() {
    return nuxtApp.$i18n?.t('database') ?? 'Database'
  }

  async function pushFirstAvailablePage(
    task: Task | null | undefined = selectedTask.value,
    options: PushFirstAvailablePageOptions = {}
  ) {
    const systemId = systemsStore.selectedSystemId
    const firstPage = pagesForTask(task)[0]

    if (!systemId || !firstPage) {
      return
    }

    return navigateTo(`/systems/${systemId}${firstPage.route}`, {
      replace: options.replace,
    })
  }

  function getFirstAvailablePageName(task: Task | null | undefined = selectedTask.value): string | null {
    const firstPage = pagesForTask(task)[0]

    if (!firstPage) {
      return null
    }

    return firstPage.route.replace(/^\/+/, '')
  }

  return {
    selectedTask,
    availableVisiblePages: visiblePages,
    visiblePages,
    firstVisiblePage,
    pagesForTask,
    pushFirstAvailablePage,
    getFirstAvailablePageName,
  }
}
