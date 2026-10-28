import { Task } from "./Task/Task";
import { TaskSet } from "./Task/TaskSet";
import { Component } from "./Component";
import { DatabaseWrapper } from "~/utils/DatabaseWrapper";
import { SqljsDatabaseFactory } from "~/utils/SqljsDatabaseFactory";
/* eslint-disable @typescript-eslint/no-explicit-any */
import JSZip from "jszip";
import type { Page } from "./Page";
import { Score } from "./Score";
import { useComponentStore } from "~/stores/componentStore";
import { Operation } from "~/utils/Operation/Operation";
import { OperationResultType } from "~/utils/Operation/OperationResultType";
import { resetTaskProgress } from "~/utils/taskProgress";
import type { SystemFile } from "~/model/types/SystemFile";

/**
 * Represents an information system, encapsulating its configuration, data tables, tasks, and component mappings.
 */
export class InformationSystem {
  /**
   * Unique identifier for the system.
   */
  public id: string;

  /**
   * The language code of the system (e.g. "cs", "en").
   */
  public language: string;

  /**
   * The name of the system.
   */
  public name: string;

  /**
   * Description of the system, providing additional context or information about its purpose and contents.
   */
  public description: string;

  public taskSets: TaskSet[];
  public defaultTaskSets: TaskSet[];
  public selectedTaskSetId: string;

  /**
   * The pages defined for the information system (routing, metadata).
   */
  public pages: Page[];

  /**
   * Whether the database page is available for this information system.
   */
  public databaseAllowed: boolean;

  /**
   * The user-customised component overrides for this system.
   */
  public actualComponents: Component[];

  /**
   * The default components for this system.
   */
  public defaultComponents: Component[];

  /**
   * The SQLite database for this system, loaded lazily via DatabaseWrapper.
   */
  public database: DatabaseWrapper | null;

  /**
   * The raw config JSON. Present only after loading from a zip/config.
   */
  public configData?: any;

  /**
   * Original create_schema.sql source used as a fallback when exporting.
   */
  public createSchemaSql?: string;

  /**
   * The student's score for this system.
   */
  public score: Score;

  /**
   * Penalties for incorrect task evaluation attempts in this system.
   */
  public mistakes: number[];

  /**
   * Whether the student has started solving tasks in this system.
   */
  public startedTasks: boolean;

  /**
   * Whether the student is browsing the system without solving tasks.
   */
  public exploringSystem: boolean;

  /**
   * The currently unlocked task level.
   */
  public currentLevel: number;

  constructor({
    id,
    name,
    language,
    description,
    tasks = [],
    defaultTasks,
    taskSet,
    defaultTaskSet,
    taskSets,
    defaultTaskSets,
    selectedTaskSetId,
    pages = [],
    databaseAllowed = true,
    actualComponents = [],
    defaultComponents = [],
    database = null,
    configData,
    createSchemaSql,
    score,
    mistakes,
    mistakesCount,
    startedTasks = false,
    exploringSystem = false,
    currentLevel,
    currentRound,
    levelCount,
  }: {
    id: string;
    name: string;
    language: string;
    description: string;
    tasks?: Task[];
    defaultTasks?: Task[];
    taskSet?: TaskSet;
    defaultTaskSet?: TaskSet;
    taskSets?: TaskSet[];
    defaultTaskSets?: TaskSet[];
    selectedTaskSetId?: string;
    pages?: Page[];
    databaseAllowed?: boolean;
    actualComponents?: Component[];
    defaultComponents?: Component[];
    database?: DatabaseWrapper | null;
    configData?: any;
    createSchemaSql?: string;
    score?: Score;
    mistakes?: number[];
    mistakesCount?: number;
    startedTasks?: boolean;
    exploringSystem?: boolean;
    currentLevel?: number;
    currentRound?: number;
    levelCount?: number;
  }) {
    this.id = id;
    this.name = name;
    this.language = language;
    this.description = description;
    const initialTaskSet =
      taskSet ??
      new TaskSet({
        id: `${id}_tasks`,
        name: `${name} tasks`,
        description: "",
        tasks,
      });
    const initialDefaultTaskSet =
      defaultTaskSet ??
      new TaskSet({
        id: initialTaskSet.id,
        name: initialTaskSet.name,
        description: initialTaskSet.description,
        tasks:
          defaultTasks ??
          JSON.parse(JSON.stringify(initialTaskSet.tasks)).map((t: any) =>
            Task.fromJSON(t),
          ),
      });
    if (!defaultTaskSet)
      initialDefaultTaskSet.levelCount = initialTaskSet.levelCount;
    this.taskSets = taskSets?.length ? taskSets : [initialTaskSet];
    for (const set of this.taskSets) set.systemId ||= id;
    this.selectedTaskSetId = this.taskSets.some(
      (set) => set.id === selectedTaskSetId,
    )
      ? selectedTaskSetId!
      : this.taskSets[0]!.id;
    this.defaultTaskSets = defaultTaskSets?.length
      ? defaultTaskSets
      : this.taskSets.map((set) =>
          set.id === initialDefaultTaskSet.id
            ? initialDefaultTaskSet
            : set.clone(),
        );
    for (const set of this.defaultTaskSets) set.systemId ||= id;
    this.pages = pages;
    this.databaseAllowed = databaseAllowed;
    this.actualComponents = actualComponents;
    this.defaultComponents = defaultComponents;
    this.database = database;
    this.configData = configData;
    this.createSchemaSql = createSchemaSql;
    this.score = score ?? new Score();
    this.mistakes = Array.isArray(mistakes)
      ? mistakes.map((penalty) => Number(penalty || 0))
      : Number.isFinite(Number(mistakesCount)) && Number(mistakesCount) > 0
        ? Array.from({ length: Number(mistakesCount) }, () => 0)
        : [...this.score.mistakes];
    this.startedTasks = Boolean(startedTasks);
    this.exploringSystem = Boolean(exploringSystem);
    this.currentLevel = Number(currentLevel ?? currentRound ?? 1);
    if (levelCount != null) this.levelCount = Number(levelCount);
  }

  public get taskSet(): TaskSet {
    return (
      this.taskSets.find((set) => set.id === this.selectedTaskSetId) ??
      this.taskSets[0]!
    );
  }

  public set taskSet(taskSet: TaskSet) {
    const index = this.taskSets.findIndex(
      (set) => set.id === this.selectedTaskSetId,
    );
    if (index < 0) this.taskSets.push(taskSet);
    else this.taskSets[index] = taskSet;
    this.selectedTaskSetId = taskSet.id;
  }

  public get defaultTaskSet(): TaskSet {
    return (
      this.defaultTaskSets.find((set) => set.id === this.selectedTaskSetId) ??
      this.taskSet.clone()
    );
  }

  public set defaultTaskSet(taskSet: TaskSet) {
    const index = this.defaultTaskSets.findIndex(
      (set) => set.id === this.selectedTaskSetId,
    );
    if (index < 0) this.defaultTaskSets.push(taskSet);
    else this.defaultTaskSets[index] = taskSet;
  }

  public get mistakesCount(): number {
    return this.mistakes.length;
  }

  public get tasks(): Task[] {
    return this.taskSet.tasks;
  }

  public set tasks(tasks: Task[]) {
    this.taskSet.tasks = tasks;
  }

  public get defaultTasks(): Task[] {
    return this.defaultTaskSet.tasks;
  }

  public set defaultTasks(tasks: Task[]) {
    this.defaultTaskSet.tasks = tasks;
  }

  public get levelCount(): number {
    return this.taskSet.levelCount;
  }

  public set levelCount(levelCount: number) {
    this.taskSet.levelCount = Math.max(1, Number(levelCount || 1));
    this.defaultTaskSet.levelCount = this.taskSet.levelCount;
  }

  public get mistakesPenalty(): number {
    return this.mistakes.reduce(
      (sum, penalty) => sum + Number(penalty || 0),
      0,
    );
  }

  public availableTasks(): Task[] {
    return this.tasks.filter(
      (task) => !task.isTaskLevelLocked(this.currentLevel),
    );
  }

  public availableTaskIds(): string[] {
    return this.availableTasks().map((task) => task.id);
  }

  public replaceTaskSet(taskSet: TaskSet): void {
    if (taskSet.systemId !== this.id) {
      throw new Error(
        `Task set belongs to system ${taskSet.systemId}, expected ${this.id}`,
      );
    }
    const previousId = this.selectedTaskSetId;
    this.taskSet = taskSet;
    this.defaultTaskSets = this.defaultTaskSets.filter(
      (set) => set.id !== previousId && set.id !== taskSet.id,
    );
    this.defaultTaskSets.push(taskSet.clone());
    this.score = new Score();
    this.mistakes = [];
    this.startedTasks = false;
    this.exploringSystem = false;
    this.currentLevel = 1;
  }

  public addTaskSet(taskSet: TaskSet): void {
    if (taskSet.systemId !== this.id) {
      throw new Error(
        `Task set belongs to system ${taskSet.systemId}, expected ${this.id}`,
      );
    }
    if (this.taskSets.some((set) => set.id === taskSet.id)) {
      throw new Error(`Task set ${taskSet.id} already exists`);
    }
    this.taskSets.push(taskSet);
    this.defaultTaskSets.push(taskSet.clone());
    this.selectTaskSet(taskSet.id);
  }

  public selectTaskSet(id: string): boolean {
    if (!this.taskSets.some((set) => set.id === id)) return false;
    if (this.selectedTaskSetId === id) return true;
    this.selectedTaskSetId = id;
    this.score = new Score();
    this.mistakes = [];
    this.startedTasks = false;
    this.exploringSystem = false;
    this.currentLevel = 1;
    return true;
  }

  public databaseVisiblePage(name = "Database"): Page {
    return {
      name,
      route: InformationSystem.getDatabasePageRoute(),
      description: "Database",
    };
  }

  public visiblePages(databaseName = "Database"): Page[] {
    const databasePageRoute = InformationSystem.getDatabasePageRoute();
    const pages = (this.pages ?? []).filter(
      (page) => page.route !== databasePageRoute,
    );
    if (!this.databaseAllowed) {
      return pages;
    }

    return [...pages, this.databaseVisiblePage(databaseName)];
  }

  public static async deserializeFromZip(
    zipData: ArrayBuffer,
  ): Promise<Operation<InformationSystem | null>> {
    try {
      const zip = await JSZip.loadAsync(zipData);
      const systemFiles: SystemFile[] = [];
      const readFiles: Promise<void>[] = [];

      zip.forEach((relativePath, zipEntry) => {
        if (zipEntry.dir) {
          return;
        }

        readFiles.push(
          zipEntry.async("text").then((content) => {
            systemFiles.push({
              name: relativePath.split("/").pop() ?? relativePath,
              path: relativePath,
              content,
            });
          }),
        );
      });

      await Promise.all(readFiles);

      return await InformationSystem.loadSystem(systemFiles);
    } catch (error) {
      return new Operation(
        OperationResultType.ERROR,
        "Failed to deserialize system zip: " +
          (error instanceof Error ? error.message : String(error)),
        null,
      );
    }
  }

  public static async loadSystem(
    systemFiles: SystemFile[],
  ): Promise<Operation<InformationSystem | null>> {
    try {
      const system = await InformationSystem.deserializeFromFiles(systemFiles);
      if (!system) {
        return new Operation(
          OperationResultType.ERROR,
          "Failed to load system.",
          null,
        );
      }

      return new Operation(
        OperationResultType.SUCCESS,
        "System loaded successfully.",
        system,
      );
    } catch (error) {
      return new Operation(
        OperationResultType.ERROR,
        "Failed to load system: " +
          (error instanceof Error ? error.message : String(error)),
        null,
      );
    }
  }

  private static async deserializeFromFiles(
    systemFiles: SystemFile[],
  ): Promise<InformationSystem | null> {
    try {
      const configContent = systemFiles.find((file) =>
        InformationSystem.systemFilePath(file).endsWith("config.json"),
      )?.content;
      if (!configContent) {
        return null;
      }

      const configData = JSON.parse(configContent);
      const taskSetContent = systemFiles.find((file) =>
        InformationSystem.systemFilePath(file).endsWith("tasks.json"),
      )?.content;
      const taskSetData = taskSetContent ? JSON.parse(taskSetContent) : null;
      const databasePageRoute = InformationSystem.getDatabasePageRoute();
      const pages: Page[] = (configData.pages || [])
        .map((page: Page) => ({
          ...page,
        }))
        .filter((page: Page) => page.route !== databasePageRoute);
      const databaseAllowed =
        typeof configData.databaseAllowed === "boolean"
          ? configData.databaseAllowed
          : typeof configData.database_allowed === "boolean"
            ? configData.database_allowed
            : true;

      const sqlFile = systemFiles.find((file) =>
        InformationSystem.systemFilePath(file).endsWith("create_schema.sql"),
      );
      let database: DatabaseWrapper | null = null;
      if (sqlFile) {
        const dbResult = await SqljsDatabaseFactory.createDatabaseFromSql(
          sqlFile.content,
        );
        if (dbResult.result !== OperationResultType.SUCCESS || !dbResult.data) {
          return null;
        }

        database = DatabaseWrapper.fromInstance(dbResult.data);
      }

      const taskSetSources = Array.isArray(taskSetData?.taskSets)
        ? taskSetData.taskSets
        : [
            taskSetData ?? {
              tasks: configData.tasks,
              levelCount: configData.levelCount,
            },
          ];
      const taskSets = taskSetSources.map((source: any, index: number) => {
        const tasks = (Array.isArray(source?.tasks) ? source.tasks : []).map(
          (task: any) => resetTaskProgress(Task.fromJSON(task)),
        );
        return new TaskSet({
          id: String(
            source?.id ??
              (taskSetSources.length === 1
                ? `${configData.id}_tasks`
                : `${configData.id}_tasks_${index}`),
          ),
          name: String(source?.name ?? `${configData.name} tasks`),
          systemId: String(
            source?.system_id ?? source?.systemId ?? configData.id,
          ),
          description: String(source?.description ?? ""),
          levelCount: Number(
            source?.levelCount ?? InformationSystem.resolveLevelCount(tasks),
          ),
          tasks,
        });
      });
      if (
        taskSets.some((set: TaskSet) => set.systemId !== String(configData.id))
      ) {
        throw new Error("Task set system_id does not match system id");
      }
      const selectedTaskSetId = String(
        taskSetData?.selectedTaskSetId ?? taskSets[0]?.id ?? "",
      );

      const system = new InformationSystem({
        id: String(configData.id),
        name: configData.name,
        language: configData.language,
        description: configData.description,
        taskSets,
        selectedTaskSetId,
        pages,
        databaseAllowed,
        database,
        mistakes: [],
        mistakesCount: 0,
        startedTasks: Boolean(configData.startedTasks),
        exploringSystem: Boolean(configData.exploringSystem),
        currentLevel: 1,
        createSchemaSql: sqlFile?.content,
        configData,
      });

      const componentStore = useComponentStore();
      system.defaultComponents = InformationSystem.cloneComponents(
        componentStore.defaultComponents,
      );
      system.actualComponents = InformationSystem.cloneComponents(
        componentStore.defaultComponents,
      );

      return system;
    } catch {
      return null;
    }
  }

  private static cloneComponents(components: Component[]): Component[] {
    return Component.arrayFromJSON(
      JSON.parse(JSON.stringify(components ?? [])),
    );
  }

  private static systemFilePath(file: SystemFile): string {
    return file.path ?? file.name;
  }

  private static resolveLevelCount(tasks: Task[]): number {
    const highestLevel = Math.max(
      0,
      ...tasks.map((task) => Number(task.level ?? 1)),
    );
    return Math.max(1, highestLevel);
  }

  private static getDatabasePageRoute(): string {
    try {
      return String(useRuntimeConfig().public.databasePageRoute ?? "/database");
    } catch {
      return "/database";
    }
  }
}
