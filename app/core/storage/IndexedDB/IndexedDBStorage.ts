import Dexie, { type Table } from "dexie";
import { Component } from "~/model/Component";
import { InformationSystem } from "~/model/InformationSystem";
import type { Page } from "~/model/Page";
import { Score } from "~/model/Score";
import { Task } from "~/model/Task/Task";
import { TaskSet } from "~/model/Task/TaskSet";
import { DatabaseWrapper } from "~/utils/DatabaseWrapper";
import { Operation } from "~/utils/Operation/Operation";
import { OperationResultType } from "~/utils/Operation/OperationResultType";
import type { IStorage } from "../IStorage";

type StoredScore = {
    mistakes?: number[];
    mistakesCount?: number;
    score: number;
};

type StoredInformationSystem = {
    id: string;
    name: string;
    language: string;
    description: string;
    pages: Page[];
    databaseAllowed?: boolean;
    tasks: unknown[];
    defaultTasks: unknown[];
    taskSet?: unknown;
    defaultTaskSet?: unknown;
    actualComponents: unknown[];
    defaultComponents: unknown[];
    databaseBinary: Uint8Array | null;
    defaultDatabaseBinary: Uint8Array | null;
    configData?: unknown;
    createSchemaSql?: string;
    score: StoredScore | null;
    mistakes?: number[];
    mistakesCount?: number;
    startedTasks?: boolean;
    exploringSystem?: boolean;
    currentLevel?: number;
    currentRound?: number;
    levelCount?: number;
};

class IndexedDBDatabase extends Dexie {
    systems!: Table<StoredInformationSystem, string>;

    constructor(databaseName: string) {
        super(databaseName);

        this.version(1).stores({
            systems: "id, name, language",
        });
        this.version(2).stores({
            systems: "id, name, language",
        });
    }
}

let database: IndexedDBDatabase | null = null;

function getDatabase(): IndexedDBDatabase {
    if (!database) {
        const runtimeConfig = useRuntimeConfig();
        const databaseName = String(runtimeConfig.public.indexedDbName || "information-system-learning-app");
        database = new IndexedDBDatabase(databaseName);
    }

    return database;
}

export class IndexedDBStorage implements IStorage {
    
    async saveSystem(system: InformationSystem): Promise<Operation<null>> {
        try {
            await getDatabase().systems.put(this.toStoredInformationSystem(system));
            return new Operation(OperationResultType.SUCCESS, "System saved successfully", null);
        } catch (error) {
            return new Operation(OperationResultType.ERROR, `Error saving system: ${this.formatError(error)}`, null);
        }
    }

    async getSystem(systemId: string): Promise<Operation<InformationSystem | null>> {
        try {
            const record = await getDatabase().systems.get(systemId);

            if (!record) {
                return new Operation(OperationResultType.FAILED, `System with id '${systemId}' not found`, null);
            }

            return new Operation(OperationResultType.SUCCESS, "System loaded successfully", this.toInformationSystem(record));
        } catch (error) {
            return new Operation(OperationResultType.ERROR, `Error loading system: ${this.formatError(error)}`, null);
        }
    }

    async deleteSystem(systemId: string): Promise<Operation<null>> {
        try {
            await getDatabase().systems.delete(systemId);
            return new Operation(OperationResultType.SUCCESS, "System deleted successfully", null);
        } catch (error) {
            return new Operation(OperationResultType.ERROR, `Error deleting system: ${this.formatError(error)}`, null);
        }
    }

    async getAvailableSystemIds(): Promise<Operation<string[]>> {
        try {
            const systemIds = await getDatabase().systems.toCollection().primaryKeys();
            return new Operation(
                OperationResultType.SUCCESS,
                "Available system IDs loaded successfully",
                systemIds.map(systemId => String(systemId))
            );
        } catch (error) {
            return new Operation(OperationResultType.ERROR, `Error loading available system IDs: ${this.formatError(error)}`, []);
        }
    }

    async isSystemAvailable(systemId: string): Promise<Operation<boolean>> {
        try {
            const count = await getDatabase().systems.where("id").equals(systemId).count();
            return new Operation(
                OperationResultType.SUCCESS,
                "System availability checked successfully",
                count > 0
            );
        } catch (error) {
            return new Operation(OperationResultType.ERROR, `Error checking system availability: ${this.formatError(error)}`, false);
        }
    }

    private toStoredInformationSystem(system: InformationSystem): StoredInformationSystem {
        return {
            id: String(system.id),
            name: system.name,
            language: system.language,
            description: system.description,
            pages: this.toPlainData(system.pages),
            databaseAllowed: system.databaseAllowed,
            tasks: this.toPlainData(system.tasks),
            defaultTasks: this.toPlainData(system.defaultTasks),
            taskSet: this.toPlainData(system.taskSet),
            defaultTaskSet: this.toPlainData(system.defaultTaskSet),
            actualComponents: this.toPlainData(system.actualComponents),
            defaultComponents: this.toPlainData(system.defaultComponents),
            databaseBinary: this.getDatabaseBinary(system),
            defaultDatabaseBinary: system.database?.defaultBinaryData ?? null,
            configData: this.toPlainData(system.configData),
            createSchemaSql: system.createSchemaSql,
            score: {
                mistakes: this.toPlainMistakes(system.score.mistakes),
                score: Number(system.score.score ?? 0),
            },
            mistakes: this.toPlainMistakes(system.mistakes),
            mistakesCount: system.mistakesCount,
            startedTasks: system.startedTasks,
            exploringSystem: system.exploringSystem,
            currentLevel: system.currentLevel,
            levelCount: undefined,
        };
    }

    private toInformationSystem(record: StoredInformationSystem): InformationSystem {
        const mistakes = this.getStoredMistakes(record);
        const score = record.score
            ? new Score(this.toPlainMistakes(record.score.mistakes), Number(record.score.score ?? 0))
            : new Score();

        const system = new InformationSystem({
            id: record.id,
            name: record.name,
            language: record.language,
            description: record.description,
            pages: record.pages ?? [],
            databaseAllowed: record.databaseAllowed ?? true,
            taskSet: this.toTaskSet(record.taskSet, record.tasks, `${record.id}_tasks`, record.levelCount),
            defaultTaskSet: this.toTaskSet(record.defaultTaskSet, record.defaultTasks ?? record.tasks, `${record.id}_tasks`, record.levelCount),
            actualComponents: (record.actualComponents ?? []).map(component => Component.fromJSON(component)),
            defaultComponents: (record.defaultComponents ?? []).map(component => Component.fromJSON(component)),
            database: this.getDatabaseWrapper(record),
            configData: record.configData,
            createSchemaSql: record.createSchemaSql,
            score,
            mistakes,
            mistakesCount: Number(record.mistakesCount ?? mistakes.length),
            startedTasks: Boolean(record.startedTasks),
            exploringSystem: Boolean(record.exploringSystem),
            currentLevel: Number(record.currentLevel ?? record.currentRound ?? 1),
            levelCount: record.levelCount,
        });

        return system;
    }

    private toTaskSet(taskSetData: unknown, legacyTasks: unknown, fallbackId: string, legacyLevelCount?: number): TaskSet {
        if (taskSetData) {
            const taskSet = TaskSet.fromJSON(taskSetData, fallbackId);
            const rawTaskSet = taskSetData && typeof taskSetData === "object"
                ? taskSetData as Record<string, unknown>
                : {};
            if (!("levelCount" in rawTaskSet) && legacyLevelCount) {
                taskSet.levelCount = Number(legacyLevelCount);
            }
            return taskSet;
        }

        const tasks = Array.isArray(legacyTasks)
            ? legacyTasks.map(task => Task.fromJSON(task))
            : [];

        return new TaskSet({
            id: fallbackId,
            name: "Default tasks",
            levelCount: Number(legacyLevelCount ?? 1),
            tasks,
        });
    }

    private getDatabaseBinary(system: InformationSystem): Uint8Array | null {
        if (!system.database) {
            return null;
        }

        if (system.database.sqlJsDatabase) {
            return new Uint8Array(system.database.sqlJsDatabase.export());
        }

        return system.database.binaryData;
    }

    private getDatabaseWrapper(record: StoredInformationSystem): DatabaseWrapper | null {
        if (!record.databaseBinary) {
            return null;
        }

        if (record.defaultDatabaseBinary) {
            return DatabaseWrapper.fromBinaries(record.databaseBinary, record.defaultDatabaseBinary);
        }

        return DatabaseWrapper.fromBinary(record.databaseBinary);
    }

    private getStoredMistakes(record: StoredInformationSystem): number[] {
        if (Array.isArray(record.mistakes)) {
            return this.toPlainMistakes(record.mistakes);
        }

        if (Array.isArray(record.score?.mistakes)) {
            return this.toPlainMistakes(record.score.mistakes);
        }

        const mistakesCount = Number(record.mistakesCount ?? record.score?.mistakesCount ?? 0);
        return Number.isFinite(mistakesCount) && mistakesCount > 0
            ? Array.from({ length: mistakesCount }, () => 0)
            : [];
    }

    private toPlainMistakes(mistakes: unknown): number[] {
        if (!Array.isArray(mistakes)) {
            return [];
        }

        return mistakes.map(mistake => Number(mistake || 0));
    }

    private toPlainData<T>(data: T): T {
        if (data === undefined || data === null) {
            return data;
        }

        return JSON.parse(JSON.stringify(data));
    }

    private formatError(error: unknown): string {
        return error instanceof Error ? error.message : String(error);
    }
}
