import { beforeEach, describe, expect, it, vi } from "vitest";
import { Component } from "../../../app/model/Component";
import { Score } from "../../../app/model/Score";
import { Task } from "../../../app/model/Task/Task";
import { OperationResultType } from "../../../app/utils/Operation/OperationResultType";

type StoredRecord = {
    id: string;
    name: string;
    language: string;
    description: string;
};

const dexieMock = vi.hoisted(() => {
    const records = new Map<string, StoredRecord>();

    return {
        records,
        putCalls: [] as StoredRecord[],
        deleteCalls: [] as string[],
    };
});

vi.mock("dexie", () => {
    class MockDexie {
        systems?: {
            get: (id: string) => Promise<StoredRecord | undefined>;
            put: (record: StoredRecord) => Promise<void>;
            delete: (id: string) => Promise<void>;
            toCollection: () => {
                primaryKeys: () => Promise<string[]>;
            };
            where: (indexName: string) => {
                equals: (id: string) => {
                    count: () => Promise<number>;
                };
            };
        };

        private createSystemsTable() {
            return {
                get: async (id: string) => dexieMock.records.get(id),
                put: async (record: StoredRecord) => {
                    dexieMock.putCalls.push(record);
                    dexieMock.records.set(record.id, structuredClone(record));
                },
                delete: async (id: string) => {
                    dexieMock.deleteCalls.push(id);
                    dexieMock.records.delete(id);
                },
                toCollection: () => ({
                    primaryKeys: async () => Array.from(dexieMock.records.keys()),
                }),
                where: (_indexName: string) => ({
                    equals: (id: string) => ({
                        count: async () => dexieMock.records.has(id) ? 1 : 0,
                    }),
                }),
            };
        }

        constructor(public name: string) {}

        version(_version: number) {
            return {
                stores: (_schema: Record<string, string>) => {
                    this.systems = this.createSystemsTable();
                    return this;
                },
            };
        }
    }

    return { default: MockDexie };
});

vi.mock("~/stores/componentStore", () => ({
    useComponentStore: () => ({
        defaultComponents: [],
    }),
}));

vi.stubGlobal("useRuntimeConfig", () => ({
    public: {
        indexedDbName: "indexed-db-storage-integration-test",
    },
}));

const { InformationSystem } = await import("../../../app/model/InformationSystem");
const { IndexedDBStorage } = await import("../../../app/core/storage/IndexedDB/IndexedDBStorage");

beforeEach(() => {
    dexieMock.records.clear();
    dexieMock.putCalls = [];
    dexieMock.deleteCalls = [];
});

describe("IndexedDBStorage integration flow", () => {
    it("saves, loads, updates, and deletes an explicitly created information system", async () => {
        const informationSystem = new InformationSystem({
            id: "2",
            name: "Skolni tabor Palava",
            language: "cs",
            description: "Demo information system for a school camp.",
            pages: [
                {
                    name: "Nastenka",
                    route: "/nastenka",
                    description: "Main dashboard with camp statistics.",
                    icon: "i-heroicons-chart-bar-20-solid",
                },
                {
                    name: "Turnusy",
                    route: "/turnusy",
                    description: "Overview of available camp terms.",
                    icon: "i-heroicons-calendar-date-range",
                },
            ],
            tasks: [
                new Task(
                    "4881a760-cb8d-41cb-8784-fed13faa6a76",
                    "Delka turnusu",
                    "Check whether the component displays the correct number of camp days.",
                    false,
                    false,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    3,
                    undefined,
                    "",
                    3,
                    0.5,
                    "",
                    [
                        new Component({
                            id: "pocet-dni-turnusu",
                            name: "Pocet dni turnusu",
                            description: "Displays number of days for a camp term.",
                            html: "<div>{{ pocet_dni_turnusu }}</div>",
                            css: ".pocet-dni-turnusu { font-weight: 700; }",
                            js: "",
                            sql: {
                                "pocet-dni-turnusu": "SELECT 13 AS pocet_dni_turnusu",
                            },
                            tags: ["turnusy"],
                        }),
                    ],
                    false,
                    false,
                    false,
                    [
                        {
                            name: "Nastenka",
                            route: "/nastenka",
                            description: "Main dashboard with camp statistics.",
                        },
                    ]
                ),
            ],
            actualComponents: [
                new Component({
                    id: "statistika-jidel",
                    name: "Statistika jidel",
                    description: "Displays a count of meals.",
                    html: "<div>{{ pocet_jidel }}</div>",
                    css: ".statistika-jidel { color: #111111; }",
                    js: "",
                    sql: {
                        "statistika-jidel": "SELECT COUNT(*) AS pocet_jidel FROM jidla",
                    },
                    tags: ["statistika", "jidla"],
                }),
            ],
            defaultComponents: [
                new Component({
                    id: "statistika-jidel",
                    name: "Statistika jidel",
                    description: "Displays a count of meals.",
                    html: "<div>{{ pocet_jidel }}</div>",
                    css: ".statistika-jidel { color: #111111; }",
                    js: "",
                    sql: {
                        "statistika-jidel": "SELECT COUNT(*) AS pocet_jidel FROM jidla",
                    },
                    tags: ["statistika", "jidla"],
                }),
            ],
            score: new Score([0.5], 3),
            mistakes: [0.5],
            startedTasks: true,
            exploringSystem: false,
            currentLevel: 2,
            levelCount: 6,
            createSchemaSql: "CREATE TABLE jidla (id_jidla INTEGER PRIMARY KEY, nazev TEXT);",
        });

        const storage = new IndexedDBStorage();

        const saveResult = await storage.saveSystem(informationSystem);
        expect(saveResult.result, saveResult.message).toBe(OperationResultType.SUCCESS);
        expect(dexieMock.putCalls).toHaveLength(1);
        expect(dexieMock.putCalls[0].id).toBe("2");

        const availableSystemIdsResult = await storage.getAvailableSystemIds();
        expect(availableSystemIdsResult.result, availableSystemIdsResult.message).toBe(OperationResultType.SUCCESS);
        expect(availableSystemIdsResult.data).toEqual(["2"]);

        const availabilityResult = await storage.isSystemAvailable("2");
        expect(availabilityResult.result, availabilityResult.message).toBe(OperationResultType.SUCCESS);
        expect(availabilityResult.data).toBe(true);

        const missingAvailabilityResult = await storage.isSystemAvailable("missing-system");
        expect(missingAvailabilityResult.result, missingAvailabilityResult.message).toBe(OperationResultType.SUCCESS);
        expect(missingAvailabilityResult.data).toBe(false);

        const loadResult = await storage.getSystem("2");
        expect(loadResult.result).toBe(OperationResultType.SUCCESS);
        expect(loadResult.data).toBeInstanceOf(InformationSystem);
        expect(loadResult.data?.id).toBe("2");
        expect(loadResult.data?.name).toBe("Skolni tabor Palava");
        expect(loadResult.data?.pages).toHaveLength(2);
        expect(loadResult.data?.tasks).toHaveLength(1);
        expect(loadResult.data?.actualComponents[0]).toBeInstanceOf(Component);
        expect(loadResult.data?.score.score).toBe(3);
        expect(loadResult.data?.mistakes).toEqual([0.5]);
        expect(loadResult.data?.levelCount).toBe(6);
        expect(loadResult.data?.tasks[0].isTaskLevelLocked(2)).toBe(true);
        expect(loadResult.data?.availableTaskIds()).toEqual([]);

        informationSystem.name = "Skolni tabor Palava - updated";
        informationSystem.currentLevel = 3;

        const updateResult = await storage.saveSystem(informationSystem);
        expect(updateResult.result).toBe(OperationResultType.SUCCESS);
        expect(dexieMock.putCalls).toHaveLength(2);

        const updatedLoadResult = await storage.getSystem("2");
        expect(updatedLoadResult.result).toBe(OperationResultType.SUCCESS);
        expect(updatedLoadResult.data?.name).toBe("Skolni tabor Palava - updated");
        expect(updatedLoadResult.data?.currentLevel).toBe(3);
        expect(updatedLoadResult.data?.availableTasks().map(task => task.id)).toEqual([
            "4881a760-cb8d-41cb-8784-fed13faa6a76",
        ]);

        const deleteResult = await storage.deleteSystem("2");
        expect(deleteResult.result).toBe(OperationResultType.SUCCESS);
        expect(dexieMock.deleteCalls).toEqual(["2"]);

        const availableSystemIdsAfterDeleteResult = await storage.getAvailableSystemIds();
        expect(availableSystemIdsAfterDeleteResult.result, availableSystemIdsAfterDeleteResult.message).toBe(OperationResultType.SUCCESS);
        expect(availableSystemIdsAfterDeleteResult.data).toEqual([]);

        const availabilityAfterDeleteResult = await storage.isSystemAvailable("2");
        expect(availabilityAfterDeleteResult.result, availabilityAfterDeleteResult.message).toBe(OperationResultType.SUCCESS);
        expect(availabilityAfterDeleteResult.data).toBe(false);

        const loadAfterDeleteResult = await storage.getSystem("2");
        expect(loadAfterDeleteResult.result).toBe(OperationResultType.FAILED);
        expect(loadAfterDeleteResult.data).toBeNull();
    });

    it("preserves student activity progress and selected option ids through storage", async () => {
        const task = Task.fromJSON({
            id: "task-options",
            title: "Select correct option",
            description: "Choose the right activity option.",
            activityType: "select-options",
            finishType: "select-options",
            activity: {
                isCompleted: true,
                selectedOptionIds: ["activity-option-1"],
                options: [
                    { id: "activity-option-1", text: "Correct", isCorrect: true },
                    { id: "activity-option-2", text: "Wrong", isCorrect: false },
                ],
            },
            finish: {
                isComplete: true,
                selectedOptionIds: ["finish-option-1"],
                options: [
                    { id: "finish-option-1", text: "Correct", isCorrect: true },
                    { id: "finish-option-2", text: "Wrong", isCorrect: false },
                ],
            },
        });

        const informationSystem = new InformationSystem({
            id: "progress-system",
            name: "Progress system",
            language: "cs",
            description: "System with persisted progress.",
            tasks: [task],
        });

        const storage = new IndexedDBStorage();
        const saveResult = await storage.saveSystem(informationSystem);
        expect(saveResult.result, saveResult.message).toBe(OperationResultType.SUCCESS);

        const loadResult = await storage.getSystem("progress-system");
        expect(loadResult.result, loadResult.message).toBe(OperationResultType.SUCCESS);

        const loadedTask = loadResult.data?.tasks[0];
        expect(loadedTask?.activity?.isCompleted).toBe(true);
        expect(loadedTask?.activity?.selectedOptionIds).toEqual(["activity-option-1"]);
        expect(loadedTask?.finish?.isComplete).toBe(true);
        expect(loadedTask?.finish?.selectedOptionIds).toEqual(["finish-option-1"]);
    });

    it("preserves typed finish answers through storage", async () => {
        const task = Task.fromJSON({
            id: "task-type-correct",
            title: "Type exact answer",
            description: "Write the exact answer.",
            answer: "Pálava",
            activityType: "repair",
            finishType: "type-correct",
            finish: {
                isComplete: true,
                correctAnswer: "Pálava",
            },
        });

        const informationSystem = new InformationSystem({
            id: "typed-answer-system",
            name: "Typed answer system",
            language: "cs",
            description: "System with a typed finish answer.",
            tasks: [task],
        });

        const storage = new IndexedDBStorage();
        const saveResult = await storage.saveSystem(informationSystem);
        expect(saveResult.result, saveResult.message).toBe(OperationResultType.SUCCESS);

        const loadResult = await storage.getSystem("typed-answer-system");
        expect(loadResult.result, loadResult.message).toBe(OperationResultType.SUCCESS);

        const loadedTask = loadResult.data?.tasks[0];
        expect(loadedTask?.answer).toBe("Pálava");
        expect(loadedTask?.finish?.isComplete).toBe(true);
    });
});
