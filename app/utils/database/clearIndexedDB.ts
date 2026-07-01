/**
 * Deletes an IndexedDB database with the specified name.
 * @param databaseName - The name of the IndexedDB database to delete.
 * @returns A promise that resolves when the database is deleted. 
 */
export function deleteIndexedDb(databaseName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(databaseName);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error(`IndexedDB "${databaseName}" deletion is blocked`));
  });
}