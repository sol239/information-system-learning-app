export default defineNuxtRouteMiddleware((to) => {
  const globalSettings = useGlobalSettingsStore()
  const systemsStore = useSystemsStore()
  const systemId = typeof to.params.id === 'string'
    ? to.params.id
    : routeSystemId(to.path)

  if (!systemId || globalSettings.teacherMode) {
    globalSettings.studentWelcomeModalOpen = false
    return
  }

  const system = systemsStore.getSystemById(systemId)
  const isSystemRoute = /^\/systems\/[^/]+(?:\/.*)?$/.test(to.path)

  globalSettings.studentWelcomeModalOpen = Boolean(
    isSystemRoute
    && system
    && !system.startedTasks
    && !system.exploringSystem
  )
})

function routeSystemId(path: string): string | null {
  const pathMatch = path.match(/^\/systems\/([^/]+)/)
  return pathMatch?.[1] ? decodeURIComponent(pathMatch[1]) : null
}
