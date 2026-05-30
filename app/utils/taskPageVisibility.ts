import type { InformationSystem } from '~/model/InformationSystem'
import type { Page } from '~/model/Page'
import type { Task } from '~/model/Task/Task'
import { isTaskDone } from '~/utils/taskLevels'

export const DATABASE_PAGE_ROUTE = '/database'

export function databaseVisiblePage(name = 'Database'): Page {
  return {
    name,
    route: DATABASE_PAGE_ROUTE,
    description: 'Database',
    vueFile: 'database.vue',
  }
}

export function systemVisiblePages(system: InformationSystem, databaseName = 'Database'): Page[] {
  const pages = system.pages ?? []
  if (pages.some(page => page.route === DATABASE_PAGE_ROUTE)) {
    return pages
  }

  return [...pages, databaseVisiblePage(databaseName)]
}

export function systemPageRouteFromPath(path: string, systemId: string): string {
  const systemPrefix = `/systems/${systemId}`

  if (!path.startsWith(systemPrefix)) {
    return path
  }

  return path.slice(systemPrefix.length) || '/'
}

export function taskAllowsPage(task: Task | null | undefined, pageRoute: string): boolean {
  if (!task || !Array.isArray(task.visiblePages)) {
    return true
  }

  return task.visiblePages.some(page => page.route === pageRoute)
}

export function systemAllowsPageForTaskContext(
  system: InformationSystem,
  task: Task | null | undefined,
  pageRoute: string
): boolean {
  const globalSettings = useGlobalSettingsStore()

  if (globalSettings.bypassPageVisibility || globalSettings.teacherMode || !globalSettings.hasStartedTasks(system.id)) {
    return true
  }

  if (task) {
    return taskAllowsPage(task, pageRoute)
  }

  // No task selected in student mode: restrict to pages allowed by the current level
  return currentLevelAllowsPage(system, pageRoute)
}

export function availableVisiblePages(
  system: InformationSystem,
  task: Task | null | undefined,
  databaseName = 'Database'
): Page[] {
  return systemVisiblePages(system, databaseName)
    .filter(page => systemAllowsPageForTaskContext(system, task, page.route))
}

export function firstTaskAllowedPage(system: InformationSystem, task: Task | null | undefined): Page | null {
  return availableVisiblePages(system, task)[0] ?? null
}

export function currentLevelAllowsPage(system: InformationSystem, pageRoute: string): boolean {
  const tasks = system.tasks ?? []

  if (!tasks.length || tasks.every(isTaskDone)) {
    return true
  }

  const currentLevelTasks = tasks.filter(task => task.round === system.currentRound)

  if (!currentLevelTasks.length) {
    return true
  }

  const allPages = systemVisiblePages(system)
  return currentLevelTasks.some(task => taskAllowsPageForCurrentLevel(task, pageRoute, allPages))
}

function taskAllowsPageForCurrentLevel(task: Task, pageRoute: string, allPages: Page[]): boolean {
  const visiblePages = Array.isArray(task.visiblePages) ? task.visiblePages : allPages
  return visiblePages.some(page => page.route === pageRoute)
}
