import { TaskHelper } from "~/core/systems/TaskHelper";

export default defineNuxtRouteMiddleware((to) => {
  const runtimeConfig = useRuntimeConfig();
  const systemsStore = useSystemsStore();
  const globalSettings = useGlobalSettingsStore();

  if (globalSettings.teacherMode || !to.path.startsWith("/systems/") || globalSettings.bypassPageVisibility) {
    return;
  }

  const routeSystemId = String(to.params.id ?? "");
  if (!routeSystemId) {
    return;
  }

  const system = systemsStore.getSystemById(routeSystemId) ?? systemsStore.getPrimarySystem();
  const systemId = system?.id;
  if (!system || !systemId) {
    return;
  }

  const systemPrefix = `/systems/${systemId}`;
  if (!to.path.startsWith(systemPrefix)) {
    return;
  }

  if (system.exploringSystem) {
    return;
  }

  const currentPage = to.path.slice(systemPrefix.length) || "/";
  const databasePageRoute = String(runtimeConfig.public.databasePageRoute);
  const currentLevelTasks = (system.tasks ?? []).filter((task) => task.level === system.currentLevel);

  if (currentPage.endsWith(databasePageRoute) && TaskHelper.shouldIncludeDatabasePage(currentLevelTasks)) {
    return;
  }

  const availableTasks = system.availableTasks() ?? [];
  const availablePages = TaskHelper.getVisiblePages(availableTasks);
  const firstPage = availablePages[0]?.route ?? "";


  if (!firstPage || availablePages.some((page) => page.route === currentPage)) {
    return;
  }

  return navigateTo(`/systems/${systemId}${firstPage}`, { replace: true });
});
