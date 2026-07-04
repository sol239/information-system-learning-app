/* eslint-disable @typescript-eslint/no-extraneous-class */
import { DatabaseWrapper } from "~/utils/DatabaseWrapper";

export class SystemHelper {

    public static getPrimarySystemId(): string {
        return this.normalizePublicName(this.getSystemsToPreloadEntries()[0]);
    }

    public static getSystemsToPreloadIds(): string[] {
        return this.getSystemsToPreloadEntries().map(systemEntry => this.normalizePublicName(systemEntry));
    }

    public static normalizePublicName(publicName: unknown): string {
        const systemId = String(publicName).trim().replace(/\.zip$/i, "");

        if (!systemId) {
            throw new Error("runtimeConfig.public.systemsToPreload contains an empty system entry.");
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

    private static getSystemsToPreloadEntries(): unknown[] {
        const systemsToPreload = useRuntimeConfig().public.systemsToPreload;
        if (!Array.isArray(systemsToPreload) || systemsToPreload.length === 0) {
            throw new Error("No systems to preload found in runtime config.");
        }

        return systemsToPreload;
    }
}
