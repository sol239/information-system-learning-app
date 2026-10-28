import { describe, expect, it, vi } from "vitest";
import { OperationResultType } from "../../app/utils/Operation/OperationResultType";

vi.mock("~/stores/componentStore", () => ({
  useComponentStore: () => ({ defaultComponents: [] }),
}));
const { InformationSystem } = await import("../../app/model/InformationSystem");
const { TaskSet } = await import("../../app/model/Task/TaskSet");

const config = {
  id: 2,
  name: "School camp",
  language: "cs",
  description: "Demo system",
  tasks: [{ id: "legacy-task", title: "Legacy task" }],
  pages: [{ name: "Dashboard", route: "/nastenka", description: "Dashboard" }],
};

function configFile(value: unknown) {
  return {
    name: "config.json",
    path: "system/config.json",
    content: JSON.stringify(value),
  };
}

describe("InformationSystem.loadSystem", () => {
  it("loads separately named task sets from the system directory", async () => {
    const result = await InformationSystem.loadSystem([
      configFile(config),
      ...["basic", "advanced"].map((id) => ({
        name: `${id}.json`,
        path: `system/${id}.json`,
        content: JSON.stringify({
          id,
          system_id: "2",
          name: id,
          tasks: [{ id: `${id}-task` }],
        }),
      })),
    ]);
    expect(result.result, result.message).toBe(OperationResultType.SUCCESS);
    expect(result.data!.taskSets.map((set) => set.id)).toEqual([
      "basic",
      "advanced",
    ]);
    expect(result.data!.tasks.map((task) => task.id)).toEqual(["basic-task"]);
  });

  it("loads metadata, pages, and legacy config tasks", async () => {
    const result = await InformationSystem.loadSystem([configFile(config)]);
    expect(result.result, result.message).toBe(OperationResultType.SUCCESS);
    expect(result.data).toBeInstanceOf(InformationSystem);
    expect(result.data).toMatchObject({
      id: "2",
      name: config.name,
      language: "cs",
      description: config.description,
      pages: config.pages,
      currentLevel: 1,
    });
    expect(result.data!.tasks.map((task) => task.id)).toEqual(["legacy-task"]);
    expect(result.data!.defaultTasks).not.toBe(result.data!.tasks);
  });

  it("prefers the separate task set over config tasks and resets progress", async () => {
    const result = await InformationSystem.loadSystem([
      configFile(config),
      {
        name: "tasks.json",
        path: "system/tasks.json",
        content: JSON.stringify({
          id: "task-set",
          name: "Camp tasks",
          levelCount: 3,
          tasks: [
            {
              id: "new-task",
              title: "New task",
              activityType: "select-options",
              activity: {
                isCompleted: true,
                selectedOptionIds: ["answer"],
                options: [],
              },
            },
          ],
        }),
      },
    ]);
    expect(result.result, result.message).toBe(OperationResultType.SUCCESS);
    expect(result.data!.taskSet.id).toBe("task-set");
    expect(result.data!.levelCount).toBe(3);
    expect(result.data!.tasks.map((task) => task.id)).toEqual(["new-task"]);
    expect(result.data!.tasks[0].activity?.isCompleted).toBe(false);
    expect(result.data!.tasks[0].completed).toBe(false);
  });

  it("defaults absent tasks to an empty array", async () => {
    const result = await InformationSystem.loadSystem([
      configFile({ ...config, tasks: undefined }),
    ]);
    expect(result.result).toBe(OperationResultType.SUCCESS);
    expect(result.data!.tasks).toEqual([]);
  });

  it("loads multiple task sets and uses the selected set", async () => {
    const result = await InformationSystem.loadSystem([
      configFile(config),
      {
        name: "tasks.json",
        path: "system/tasks.json",
        content: JSON.stringify({
          taskSets: [
            { id: "basic", name: "Basic", tasks: [{ id: "basic-task" }] },
            {
              id: "advanced",
              name: "Advanced",
              tasks: [{ id: "advanced-task" }],
            },
          ],
          selectedTaskSetId: "advanced",
        }),
      },
    ]);
    expect(result.result, result.message).toBe(OperationResultType.SUCCESS);
    const system = result.data!;
    expect(system.taskSets.map((set) => set.id)).toEqual(["basic", "advanced"]);
    expect(system.selectedTaskSetId).toBe("advanced");
    expect(system.tasks.map((task) => task.id)).toEqual(["advanced-task"]);
    expect(system.selectTaskSet("basic")).toBe(true);
    expect(system.tasks.map((task) => task.id)).toEqual(["basic-task"]);
    expect(system.selectTaskSet("missing")).toBe(false);
    expect(system.selectedTaskSetId).toBe("basic");
  });

  it("adds only task sets referencing the same system", () => {
    const system = new InformationSystem({
      id: "camp",
      name: "Camp",
      language: "cs",
      description: "",
    });
    const added = new TaskSet({ id: "extra", systemId: "camp", name: "Extra" });
    system.addTaskSet(added);
    expect(system.taskSets.map((set) => set.id)).toEqual([
      "camp_tasks",
      "extra",
    ]);
    expect(system.selectedTaskSetId).toBe("extra");
    expect(system.defaultTaskSets.map((set) => set.id)).toEqual([
      "camp_tasks",
      "extra",
    ]);
    expect(() => system.addTaskSet(added)).toThrow("already exists");
    expect(() =>
      system.addTaskSet(
        new TaskSet({
          id: "foreign",
          systemId: "other",
          name: "Foreign",
        }),
      ),
    ).toThrow("belongs to system");
    expect(system.taskSets).toHaveLength(2);
  });

  it("rejects a tasks.json referencing another system", async () => {
    const result = await InformationSystem.loadSystem([
      configFile(config),
      {
        name: "tasks.json",
        path: "system/tasks.json",
        content: JSON.stringify({
          id: "foreign",
          system_id: "other",
          tasks: [],
        }),
      },
    ]);
    expect(result.result).toBe(OperationResultType.ERROR);
  });

  it.each([
    { label: "missing", files: [] },
    {
      label: "invalid",
      files: [{ name: "config.json", content: "invalid json" }],
    },
  ])("returns an error for $label config", async ({ files }) => {
    const result = await InformationSystem.loadSystem(files);
    expect(result.result).toBe(OperationResultType.ERROR);
    expect(result.data).toBeNull();
  });
});
