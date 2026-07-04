export default defineNuxtRouteMiddleware((to) => {
  const globalSettings = useGlobalSettingsStore();

  if (globalSettings.teacherMode) {
    return;
  }

  const backTo = to.query.backTo;
  if (typeof backTo === "string" && backTo.startsWith("/")) {
    return navigateTo(backTo, { replace: true });
  }

  const systemId = String(to.params.id ?? "");
  return navigateTo(systemId ? `/systems/${systemId}` : "/systems", { replace: true });
});
