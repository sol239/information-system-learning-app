/* eslint-disable @typescript-eslint/no-extraneous-class, @typescript-eslint/no-explicit-any */
import Dexie, { type Table } from 'dexie';

class InformationSystemDatabase extends Dexie {
    systems!: Table<any, any>;
    databases!: Table<Uint8Array, string>;
    components!: Table<any, string>;

    constructor() {
        super('InformationSystemDB');
        // Define version and out-of-line stores
        this.version(3).stores({
            systems: '',
            databases: '',
            components: ''
        });
    }
}

const db = new InformationSystemDatabase();

/**
 * Handler for storing and retrieving information systems from IndexedDB using Dexie.js.
 */
export class IndexedDbHandler {

    /**
     * Saves a legacy system database.
     * @param systemId - The ID of the system
     * @param data - The raw Uint8Array data of the database
     */
    public static async saveSystemDB(systemId: number, data: Uint8Array): Promise<void> {
        await db.systems.put(data, systemId);
    }

    /**
     * Loads a legacy system database.
     * @param systemId - The ID of the system
     * @returns The Uint8Array data if found, otherwise null
     */
    public static async loadSystemDB(systemId: number): Promise<Uint8Array | null> {
        const result = await db.systems.get(systemId);
        return result instanceof Uint8Array ? result : null;
    }

    /**
     * Deletes a legacy system database.
     * @param systemId - The ID of the system
     */
    public static async deleteSystemDB(systemId: number): Promise<void> {
        await db.systems.delete(systemId);
    }

    /**
     * Saves a system's SQLite database binary to the databases store.
     * @param systemId - The ID of the system
     * @param data - The binary database export
     */
    public static async saveDatabase(systemId: number, data: Uint8Array): Promise<void> {
        await db.databases.put(data, `system_${systemId}`);
    }

    /**
     * Loads a system's SQLite database binary from the databases store.
     * @param systemId - The ID of the system
     * @returns The binary database export if found, otherwise null
     */
    public static async loadDatabase(systemId: number): Promise<Uint8Array | null> {
        const result = await db.databases.get(`system_${systemId}`);
        return result || null;
    }

    /**
     * Deletes a system's database from the databases store.
     * @param systemId - The ID of the system
     */
    public static async deleteDatabase(systemId: number): Promise<void> {
        await db.databases.delete(`system_${systemId}`);
    }

    /**
     * Saves the default and actual component maps to the components store.
     * @param defaultComponentMap - The default system component map
     * @param actualComponentMap - The actual user component map
     */
    public static async saveComponentMaps(defaultComponentMap: any[], actualComponentMap: any[]): Promise<void> {
        const data = {
            defaultComponentMap: JSON.stringify(defaultComponentMap),
            actualComponentMap: JSON.stringify(actualComponentMap),
            timestamp: Date.now()
        };
        await db.components.put(data, 'componentMaps');
    }

    /**
     * Loads the stored component maps from IndexedDB.
     * @returns The default and actual component maps object if found, otherwise null
     */
    public static async loadComponentMaps(): Promise<{ defaultComponentMap: any[], actualComponentMap: any[] } | null> {
        const data = await db.components.get('componentMaps');
        if (data) {
            try {
                return {
                    defaultComponentMap: JSON.parse(data.defaultComponentMap || '[]'),
                    actualComponentMap: JSON.parse(data.actualComponentMap || '[]')
                };
            } catch (e) {
                console.error('Error parsing component maps from Dexie:', e);
                return null;
            }
        }
        return null;
    }

    /**
     * Deletes the stored component maps.
     */
    public static async deleteComponentMaps(): Promise<void> {
        await db.components.delete('componentMaps');
    }

    /**
     * Saves the metadata for an object of the InformationSystem class, excluding the database instance.
     * @param system - The InformationSystem instance
     */
    public static async saveInformationSystem(system: any): Promise<void> {
        const systemCopy = { ...system, db: null };
        const systemData = JSON.stringify(systemCopy);
        await db.systems.put(systemData, `system_${system.id}`);
    }

    /**
     * Retrieves the JSON configuration data for a saved InformationSystem.
     * @param systemId - The ID of the system
     * @returns The parsed InformationSystem config data if found, otherwise null
     */
    public static async loadInformationSystem(systemId: number): Promise<any | null> {
        const result = await db.systems.get(`system_${systemId}`);
        if (result) {
            try {
                return JSON.parse(result as string);
            } catch (e) {
                console.error('Error parsing InformationSystem from Dexie:', e);
                return null;
            }
        }
        return null;
    }

    /**
     * Deletes the metadata configuration for a specific InformationSystem.
     * @param systemId - The ID of the system
     */
    public static async deleteInformationSystem(systemId: number): Promise<void> {
        await db.systems.delete(`system_${systemId}`);
    }

    /**
     * Utility method to fetch all valid system identifiers managed by the handler.
     * @returns An array of existing system IDs
     */
    public static async getAllSystemIds(): Promise<number[]> {
        const keys = await db.systems.toCollection().keys();
        return keys
            .filter(key => typeof key === 'string' && key.startsWith('system_'))
            .map(key => {
                const idStr = (key as string).replace('system_', '');
                const id = parseInt(idStr, 10);
                return isNaN(id) ? null : id;
            })
            .filter(id => id !== null) as number[];
    }
}
