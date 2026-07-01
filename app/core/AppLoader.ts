import { deleteIndexedDb } from "~/utils/database/clearIndexedDB";
import { SystemHelper } from "./systems/SystemHelper";
import type { IStorage } from "./storage/IStorage";
import { IndexedDBStorage } from "./storage/IndexedDB/IndexedDBStorage";
import { InformationSystem } from "~/model/InformationSystem";
import { OperationResultType } from "~/utils/Operation/OperationResultType";

export class AppLoader {
    // pokud DB VERSION Jje vyssi nez ta ulozena, tak se smaze indexed db a provede se fresh load
    runtimeConfig = useRuntimeConfig();

    private async isDbVersionOutdated(): Promise<boolean> {
        const databaseName = String(this.runtimeConfig.public.indexedDbName);
        const currentDbVersion = Number(this.runtimeConfig.public.indexedDbVersion);
        const dbVersionKey = String(this.runtimeConfig.public.indexedDbVersionKey);
        const dbVersion = parseInt(localStorage.getItem(dbVersionKey) || '0', 10);

        if (dbVersion < currentDbVersion) {
            await deleteIndexedDb(databaseName);
            localStorage.setItem(dbVersionKey, String(currentDbVersion));
            return true;
        }
        return false;
    }

    private async isAnySystemMissing(storage: IStorage, systemIds: string[]): Promise<boolean> {
        for (const systemId of systemIds) {
            const availabilityResult = await storage.isSystemAvailable(systemId);
            if (!availabilityResult.data) {
                return true;
            }
        }
        return false;
    }

    public async loadFromIndexedDb() {}

    public async loadApp() {
        if (!import.meta.client) {
            return;
        }

        const storage: IStorage = new IndexedDBStorage();
        const globalSettings = useGlobalSettingsStore();
        const deletedIds = new Set(globalSettings.deletedPreloadedSystemIds.map(String));
        const preloadedSystemsIds = SystemHelper
            .getPreloadedSystemIds()
            .filter(systemId => !deletedIds.has(String(systemId)));
        const systemsStore = useSystemsStore();

        if (await this.isDbVersionOutdated() || await this.isAnySystemMissing(storage, preloadedSystemsIds)) {
            for (const systemId of preloadedSystemsIds) {
                const systemFiles = await SystemHelper.getSystemFiles(systemId);
                const loadResult = await InformationSystem.loadSystem(systemFiles);
                if (
                    loadResult.result === OperationResultType.SUCCESS &&
                    loadResult.data
                ) {
                    await systemsStore.addSystem(loadResult.data);
                }
            }
        }

        await systemsStore.loadSystemsFromStorage(preloadedSystemsIds);
    }

}
