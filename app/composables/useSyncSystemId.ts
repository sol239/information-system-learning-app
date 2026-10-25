export const useSyncSystemId = () => {
  const route = useRoute();
  const systemsStore = useSystemsStore();
  const systemId = route.params.id as string;

  systemsStore.selectedSystemId = systemId;

  return { route, systemsStore, systemId };
};
