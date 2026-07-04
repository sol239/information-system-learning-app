declare global {
    interface Window {
        Cypress?: unknown;
        __informationSystemTestApi?: {
            // eslint-disable-next-line no-unused-vars
            selectedSystemDatabaseQuery(sql: string): Promise<unknown>;
        };
    }
}

export default defineNuxtPlugin(() => {
    if (!window.Cypress) {
        return;
    }

    const systemsStore = useSystemsStore();

    window.__informationSystemTestApi = {
        async selectedSystemDatabaseQuery(sql: string) {
            const database = systemsStore.selectedSystem?.database;
            if (!database) {
                throw new Error('Selected system database is not available.');
            }

            await database.initializeDatabase();
            return database.query(sql);
        },
    };
});
