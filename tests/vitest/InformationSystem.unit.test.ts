import { describe, expect, it, vi } from "vitest";
import { OperationResultType } from "../../app/utils/Operation/OperationResultType";

vi.mock("~/stores/componentStore", () => ({
  useComponentStore: () => ({ defaultComponents: [] }),
}));
const { InformationSystem } = await import("../../app/model/InformationSystem");

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
