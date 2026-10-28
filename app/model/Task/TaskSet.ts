import { Task } from "./Task";

export class TaskSet {
  public id: string;
  public systemId: string;
  public name: string;
  public description: string;
  public levelCount: number;
  public tasks: Task[];

  constructor({
    id,
    systemId = "",
    name,
    description = "",
    levelCount = 1,
    tasks = [],
  }: {
    id: string;
    systemId?: string;
    name: string;
    description?: string;
    levelCount?: number;
    tasks?: Task[];
  }) {
    this.id = id;
    this.systemId = systemId;
    this.name = name;
    this.description = description;
    this.levelCount = Math.max(1, Number(levelCount || 1));
    this.tasks = tasks;
  }

  public static fromJSON(data: unknown, fallbackId = "default_tasks"): TaskSet {
    const raw =
      data && typeof data === "object" ? (data as Record<string, unknown>) : {};
    const tasksSource = Array.isArray(raw.tasks)
      ? raw.tasks
      : Array.isArray(data)
        ? data
        : [];

    return new TaskSet({
      id: String(raw.id ?? fallbackId),
      systemId: String(raw.system_id ?? raw.systemId ?? ""),
      name: String(raw.name ?? "Default tasks"),
      description: String(raw.description ?? ""),
      levelCount: Number(
        raw.levelCount ?? TaskSet.resolveLevelCount(tasksSource),
      ),
      tasks: tasksSource.map((task) => Task.fromJSON(task)),
    });
  }

  public clone(): TaskSet {
    return TaskSet.fromJSON(JSON.parse(JSON.stringify(this)), this.id);
  }

  private static resolveLevelCount(tasks: unknown[]): number {
    const highestLevel = Math.max(
      0,
      ...tasks.map((task) => {
        const raw =
          task && typeof task === "object"
            ? (task as Record<string, unknown>)
            : {};
        return Number(raw.level ?? raw.round ?? 1);
      }),
    );
    return Math.max(1, highestLevel);
  }
}
