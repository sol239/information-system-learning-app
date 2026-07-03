export default defineNuxtRouteMiddleware(async (to) => {
  const config = useRuntimeConfig();
  const globalSettings = useGlobalSettingsStore();
  const systemsStore = useSystemsStore();
  const { prepareSystem } = usePrepareSystem();
  const { pushFirstAvailablePage } = useAvailableSystemPages();
  const singleSystem = String(config.public.singleSystem ?? 'true').trim().toLowerCase() !== 'false';

  // We only restrict navigation in Student Mode when singleSystem is true
  if (globalSettings.teacherMode || !singleSystem) {
    return;
  }

  // If the user tries to go to /systems or /systems/
  if (to.path === '/systems' || to.path === '/systems/') {
    const systemId = systemsStore.selectedSystemId ?? systemsStore.systems[0]?.id;
    if (systemId && await prepareSystem(systemId)) {
      return pushFirstAvailablePage(null, { replace: true });
    }
  }
});
