/**
 * Redirect the systems index to the app entry point in student mode.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (/^\/systems\/[^/]+\/kniha-jidel\/?$/.test(to.path)) {
    return navigateTo(
      {
        path: to.path.replace(/\/kniha-jidel\/?$/, "/jidelnicek"),
        query: to.query,
        hash: to.hash,
      },
      { replace: true },
    );
  }
  const globalSettings = useGlobalSettingsStore();

  if (to.path === "/systems" || to.path === "/systems/") {
    if (!globalSettings.teacherMode) {
      return navigateTo("/", { replace: true });
    }
    return;
  }
});
