import { DatabaseWrapper } from "~/utils/DatabaseWrapper";

export class SystemHelper {

    public static getPrimarySystemId(): string {
        return this.normalizePublicName(this.getPreloadedSystemEntries()[0]);
    }

    public static getPreloadedSystemIds(): string[] {
        return this.getPreloadedSystemEntries().map(systemEntry => this.normalizePublicName(systemEntry));
    }

    public static normalizePublicName(publicName: unknown): string {
        const systemId = String(publicName).trim().replace(/\.zip$/i, "");

        if (!systemId) {
            throw new Error("runtimeConfig.public.preloadedSystems contains an empty system entry.");
        }

        return systemId;
    }

    public static async prepareSystem(id: string): Promise<boolean> {
        const systemsStore = useSystemsStore();
        systemsStore.selectedSystemId = id;

        const system = systemsStore.getSystemById(id);
        if (!system) {
            console.error("System not found for system " + id);
            return false;
        }

        if (!system.database) {
            console.error("System database not found for system " + id);
            return false;
        }

        if (!(await DatabaseWrapper.isDatabaseInitialized(system.database))) {
            await system.database.initializeDatabase();
        }

        return true;
    }

    private static getPreloadedSystemEntries(): unknown[] {
        const preloadedSystems = useRuntimeConfig().public.preloadedSystems;
        if (!Array.isArray(preloadedSystems) || preloadedSystems.length === 0) {
            throw new Error("No preloaded systems found in runtime config.");
        }

        return preloadedSystems;
    }
}
