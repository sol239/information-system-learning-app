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

  // If the stored database version is less than the current version, delete the existing IndexedDB and update the version in localStorage
  if (dbVersion < currentDbVersion) {
    await deleteIndexedDb(databaseName);
    localStorage.setItem(dbVersionKey, String(currentDbVersion));
  }
});
