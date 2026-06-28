function deleteIndexedDb(databaseName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(databaseName);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error(`IndexedDB "${databaseName}" deletion is blocked`));
  });
}

export default defineNuxtPlugin(async () => {
  if (!import.meta.client) {
    return;
  }

  const runtimeConfig = useRuntimeConfig();
  const databaseName = String(runtimeConfig.public.indexedDbName);
  const currentDbVersion = Number(runtimeConfig.public.indexedDbVersion);
  const dbVersionKey = String(runtimeConfig.public.indexedDbVersionKey);
  const dbVersion = parseInt(localStorage.getItem(dbVersionKey) || '0', 10);

  if (dbVersion < currentDbVersion) {
    await deleteIndexedDb(databaseName);
    localStorage.setItem(dbVersionKey, String(currentDbVersion));
  }
});
