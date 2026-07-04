import { deleteIndexedDb } from "~/utils/database/clearIndexedDB";
import { SystemHelper } from "./systems/SystemHelper";
import type { IStorage } from "./storage/IStorage";
import { IndexedDBStorage } from "./storage/IndexedDB/IndexedDBStorage";
import type { InformationSystem } from "~/model/InformationSystem";
import { OperationResultType } from "~/utils/Operation/OperationResultType";
import { SystemLoaderPublic } from "./systems/SystemLoaderPublic";

export class AppLoader {
    // pokud DB VERSION Jje vyssi nez ta ulozena, tak se smaze indexed db a provede se fresh load

    private async isDbVersionOutdated(): Promise<boolean> {
        const runtimeConfig = useRuntimeConfig();
        const databaseName = String(runtimeConfig.public.indexedDbName);
        const currentDbVersion = Number(runtimeConfig.public.indexedDbVersion);
        const dbVersionKey = String(runtimeConfig.public.indexedDbVersionKey);
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

    public async loadFromIndexedDb() { }

    public async loadApp() {
        const storage: IStorage = new IndexedDBStorage();
        const systemLoader = new SystemLoaderPublic();

        const systemsToPreloadIds = SystemHelper.getSystemsToPreloadIds();
        console.log("AppLoader: Systems to preload IDs:", systemsToPreloadIds);
        const systemsStore = useSystemsStore();

        if (await this.isDbVersionOutdated() || await this.isAnySystemMissing(storage, systemsToPreloadIds)) {
            console.log("AppLoader: IndexedDB is outdated or missing systems. Loading systems from source.");

            for (const systemId of systemsToPreloadIds) {
                const loadResult = await systemLoader.loadSystem(systemId);
                console.log(loadResult.toString());
                if (
                    loadResult.result === OperationResultType.SUCCESS &&
                    loadResult.data
                ) {
                    await systemsStore.addSystem(loadResult.data as InformationSystem);
                }
            }
        }

        await systemsStore.loadSystemsFromStorage(systemsToPreloadIds);
        console.log("Systems in Pinia Store:", systemsStore.systems);

    }

}
