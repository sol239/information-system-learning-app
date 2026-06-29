function deleteIndexedDb(databaseName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(databaseName);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error(`IndexedDB "${databaseName}" deletion is blocked`));
  });
}

/**
 * Nuxt plugin to handle IndexedDB versioning. It checks the current version of the database stored in localStorage against the version 
 * defined in the runtime configuration. If the stored version is less than the current version, it deletes the existing IndexedDB and 
 * updates the version in localStorage.
 */
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
