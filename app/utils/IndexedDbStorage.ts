import Dexie, { type Table } from 'dexie';
import { InformationSystem } from "~/model/InformationSystem";
import { Component } from '~/model/Component';
import { DatabaseWrapper } from './DatabaseWrapper';
import { Operation } from './Operation/Operation';
import { OperationResultType } from './Operation/OperationResultType';
import { Score } from '~/model/Score';
import type { GUID } from '~/model/GUID';
import type { Page } from '~/model/Page';
import { Task } from '~/model/Task/Task';

interface StoredSystem {
    id: string;
    name: string;
    language: string;
    description: string;
    pages: Page[];
    tasks: any[];
    defaultTasks: any[];
    actualComponents: any[];
    defaultComponents: any[];
    databaseBinary: Uint8Array | null;
    defaultDatabaseBinary: Uint8Array | null;
    createSchemaSql?: string;
    score: { mistakes?: number[]; mistakesCount?: number; score: number } | null;
    mistakes?: number[];
    mistakesCount?: number;
    currentRound?: number;
    levelCount?: number;
}

class AppDatabase extends Dexie {
    systems!: Table<StoredSystem, string>;

    constructor(name: string) {
        super(name);
        this.version(1).stores({
            systems: 'id, name, language',
        });
        this.version(2).stores({
            systems: 'id, name, language',
        });
    }
}

let db: AppDatabase | null = null;

function getDb(): AppDatabase {
    if (!db) {
        const runtimeConfig = useRuntimeConfig();
        db = new AppDatabase(String(runtimeConfig.public.indexedDbName));
    }

    return db;
}

export class IndexedDbStorage {

    public static async GetStoredInformationSystemsIds(): Promise<Operation<string[]>> {
        try {
            const ids = await getDb().systems.toCollection().primaryKeys() as string[];
            return new Operation(OperationResultType.SUCCESS, 'IDs retrieved successfully', ids);
        } catch (error) {
            return new Operation(OperationResultType.ERROR, `Error retrieving IDs: ${error}`, []);
        }
    }

    public static async GetStoredInformationSystems(): Promise<Operation<InformationSystem[]>> {
        try {
            const records = await getDb().systems.toArray();
            const systems = records.map(IndexedDbStorage.toInformationSystem);
            return new Operation(OperationResultType.SUCCESS, 'Systems retrieved successfully', systems);
        } catch (error) {
            return new Operation(OperationResultType.ERROR, `Error retrieving systems: ${error}`, []);
        }
    }

    public static async SaveInformationSystem(system: InformationSystem): Promise<Operation<null>> {
        try {
            let databaseBinary: Uint8Array | null = null;
            if (system.database) {
                if (system.database.sqlJsDatabase) {
                    databaseBinary = new Uint8Array(system.database.sqlJsDatabase.export());
                } else if (system.database.binaryData) {
                    databaseBinary = system.database.binaryData;
                }
            }
            const defaultDatabaseBinary: Uint8Array | null = system.database?.defaultBinaryData ?? null;
            const record: StoredSystem = {
                id: system.id,
                name: system.name,
                language: system.language,
                description: system.description,
                pages: JSON.parse(JSON.stringify(system.pages)),
                tasks: JSON.parse(JSON.stringify(system.tasks)),
                defaultTasks: JSON.parse(JSON.stringify(system.defaultTasks)),
                actualComponents: JSON.parse(JSON.stringify(system.actualComponents)),
                defaultComponents: JSON.parse(JSON.stringify(system.defaultComponents)),
                databaseBinary,
                defaultDatabaseBinary,
                createSchemaSql: system.createSchemaSql,
                score: { mistakes: IndexedDbStorage.toPlainMistakes(system.score.mistakes), score: system.score.score },
                mistakes: IndexedDbStorage.toPlainMistakes(system.mistakes),
                mistakesCount: system.mistakesCount,
                currentRound: system.currentRound,
                levelCount: system.levelCount,
            };
            await getDb().systems.put(record);
            return new Operation(OperationResultType.SUCCESS, 'System saved successfully', null);
        } catch (error) {
            return new Operation(OperationResultType.ERROR, `Error saving system: ${error}`, null);
        }
    }

    public static async LoadInformationSystem(id: string): Promise<Operation<InformationSystem | null>> {
        try {
            const record = await getDb().systems.get(id);
            if (!record) {
                return new Operation(OperationResultType.FAILED, `System with id '${id}' not found`, null);
            }
            return new Operation(OperationResultType.SUCCESS, 'System loaded successfully', IndexedDbStorage.toInformationSystem(record));
        } catch (error) {
            return new Operation(OperationResultType.ERROR, `Error loading system: ${error}`, null);
        }
    }

    public static async UpdateInformationSystem(system: InformationSystem): Promise<Operation<null>> {
        try {
            const existingRecord = await getDb().systems.get(system.id);
            if (!existingRecord) {
                return new Operation(OperationResultType.FAILED, `System with id '${system.id}' not found`, null);
            }
            let databaseBinary: Uint8Array | null = null;
            if (system.database) {
                if (system.database.sqlJsDatabase) {
                    databaseBinary = new Uint8Array(system.database.sqlJsDatabase.export());
                } else if (system.database.binaryData) {
                    databaseBinary = system.database.binaryData;
                }
            }
            const defaultDatabaseBinary: Uint8Array | null = system.database?.defaultBinaryData ?? null;
            const updatedRecord: StoredSystem = {
                id: system.id,
                name: system.name,
                language: system.language,
                description: system.description,
                pages: JSON.parse(JSON.stringify(system.pages)),
                tasks: JSON.parse(JSON.stringify(system.tasks)),
                defaultTasks: JSON.parse(JSON.stringify(system.defaultTasks)),
                actualComponents: JSON.parse(JSON.stringify(system.actualComponents)),
                defaultComponents: JSON.parse(JSON.stringify(system.defaultComponents)),
                databaseBinary,
                defaultDatabaseBinary,
                createSchemaSql: system.createSchemaSql,
                score: { mistakes: IndexedDbStorage.toPlainMistakes(system.score.mistakes), score: system.score.score },
                mistakes: IndexedDbStorage.toPlainMistakes(system.mistakes),
                mistakesCount: system.mistakesCount,
                currentRound: system.currentRound,
                levelCount: system.levelCount,
            };
            await getDb().systems.put(updatedRecord);
            return new Operation(OperationResultType.SUCCESS, 'System updated successfully', null);
        } catch (error) {
            return new Operation(OperationResultType.ERROR, `Error updating system: ${error}`, null);
        }
    }

    public static async DeleteInformationSystem(id: string): Promise<Operation<null>> {
        try {
            await getDb().systems.delete(id);
            return new Operation(OperationResultType.SUCCESS, 'System deleted successfully', null);
        } catch (error) {
            return new Operation(OperationResultType.ERROR, `Error deleting system: ${error}`, null);
        }
    }

    private static toInformationSystem(record: StoredSystem): InformationSystem {
        const legacyMistakesCount = Number(record.mistakesCount ?? record.score?.mistakesCount ?? 0);
        const mistakes = Array.isArray(record.mistakes)
            ? record.mistakes
            : Array.isArray(record.score?.mistakes)
                ? record.score.mistakes
                : Number.isFinite(legacyMistakesCount) && legacyMistakesCount > 0
                    ? Array.from({ length: legacyMistakesCount }, () => 0)
                    : [];
        const score = record.score
            ? new Score(mistakes, record.score.score)
            : new Score();
        const system = new InformationSystem({
            id: record.id as GUID,
            name: record.name,
            language: record.language,
            description: record.description,
            pages: record.pages ?? [],
            tasks: (record.tasks ?? []).map((t: any) => {
                const task = Task.fromJSON(t);
                if (task.activity && t.activity?.isCompleted !== undefined) {
                    task.activity.isCompleted = t.activity.isCompleted;
                }
                return task;
            }),
            defaultTasks: (record.defaultTasks ?? record.tasks ?? []).map((t: any) => Task.fromJSON(t)),
            actualComponents: Component.arrayFromJSON(record.actualComponents ?? []),
            defaultComponents: Component.arrayFromJSON(record.defaultComponents ?? []),
            createSchemaSql: record.createSchemaSql,
            score,
            mistakes,
            mistakesCount: legacyMistakesCount,
            currentRound: Number(record.currentRound ?? 1),
            levelCount: Number(record.levelCount ?? 1),
        });
        if (record.databaseBinary) {
            system.database = record.defaultDatabaseBinary
                ? DatabaseWrapper.fromBinaries(record.databaseBinary, record.defaultDatabaseBinary)
                : DatabaseWrapper.fromBinary(record.databaseBinary);
        }
        return system;
    }

    private static toPlainMistakes(mistakes: unknown): number[] {
        if (!Array.isArray(mistakes)) {
            return [];
        }

        return Array.from(mistakes, penalty => Number(penalty || 0));
    }
}
