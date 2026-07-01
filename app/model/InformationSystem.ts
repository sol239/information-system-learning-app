import { Task } from "./Task/Task";
import { Component } from "./Component";
import { DatabaseWrapper } from "~/utils/DatabaseWrapper";
import { SqljsDatabaseFactory } from "~/utils/SqljsDatabaseFactory";
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

  /**
   * The tasks defined for the information system.
   */
  public tasks: Task[];

  /**
   * The default (original) tasks for this system. Used to reset student progress.
   */
  public defaultTasks: Task[];

  /**
   * The pages defined for the information system (routing, metadata).
   */
  public pages: Page[];

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
  public currentRound: number;

  /**
   * The number of task levels available in the system.
   */
  public levelCount: number;

  constructor({
    id,
    name,
    language,
    description,
    tasks = [],
    defaultTasks,
    pages = [],
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
    currentRound = 1,
    levelCount = 1,
  }: {
    id: string;
    name: string;
    language: string;
    description: string;
    tasks?: Task[];
    defaultTasks?: Task[];
    pages?: Page[];
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
    currentRound?: number;
    levelCount?: number;
  }) {
    this.id = id;
    this.name = name;
    this.language = language;
    this.description = description;
    this.tasks = tasks;
    this.defaultTasks = defaultTasks ?? JSON.parse(JSON.stringify(tasks)).map((t: any) => Task.fromJSON(t));
    this.pages = pages;
    this.actualComponents = actualComponents;
    this.defaultComponents = defaultComponents;
    this.database = database;
    this.configData = configData;
    this.createSchemaSql = createSchemaSql;
    this.score = score ?? new Score();
    this.mistakes = Array.isArray(mistakes)
      ? mistakes.map(penalty => Number(penalty || 0))
      : Number.isFinite(Number(mistakesCount)) && Number(mistakesCount) > 0
        ? Array.from({ length: Number(mistakesCount) }, () => 0)
        : [...this.score.mistakes]
    this.startedTasks = Boolean(startedTasks);
    this.exploringSystem = Boolean(exploringSystem);
    this.currentRound = currentRound;
    this.levelCount = levelCount;
  }

  public get mistakesCount(): number {
    return this.mistakes.length;
  }

  public get mistakesPenalty(): number {
    return this.mistakes.reduce((sum, penalty) => sum + Number(penalty || 0), 0);
  }


  public static async deserializeFromZip(zipData: ArrayBuffer): Promise<Operation<InformationSystem | null>> {
    try {
      const zip = await JSZip.loadAsync(zipData);
      const systemFiles: SystemFile[] = [];
      const readFiles: Promise<void>[] = [];

      zip.forEach((relativePath, zipEntry) => {
        if (zipEntry.dir) {
          return;
        }

        readFiles.push(
          zipEntry.async("text").then(content => {
            systemFiles.push({
              name: relativePath.split("/").pop() ?? relativePath,
              path: relativePath,
              content,
            });
          })
        );
      });

      await Promise.all(readFiles);

      return await InformationSystem.loadSystem(systemFiles);
    } catch (error) {
      return new Operation(
        OperationResultType.ERROR,
        "Failed to deserialize system zip: " + (error instanceof Error ? error.message : String(error)),
        null
      );
    }
  }

  public static async loadSystem(systemFiles: SystemFile[]): Promise<Operation<InformationSystem | null>> {
    try {
      const system = await InformationSystem.deserializeFromFiles(systemFiles);
      if (!system) {
        return new Operation(OperationResultType.ERROR, "Failed to load system.", null);
      }

      return new Operation(OperationResultType.SUCCESS, "System loaded successfully.", system);
    } catch (error) {
      return new Operation(
        OperationResultType.ERROR,
        "Failed to load system: " + (error instanceof Error ? error.message : String(error)),
        null
      );
    }
  }

  private static async deserializeFromFiles(systemFiles: SystemFile[]): Promise<InformationSystem | null> {
    try {
      const configContent = systemFiles.find(file => InformationSystem.systemFilePath(file).endsWith("config.json"))?.content;
      if (!configContent) {
        return null;
      }

      const configData = JSON.parse(configContent);
      const pages: Page[] = (configData.pages || []).map((page: Page) => ({
        ...page,
      }));

      const sqlFile = systemFiles.find(file => InformationSystem.systemFilePath(file).endsWith("create_schema.sql"));
      let database: DatabaseWrapper | null = null;
      if (sqlFile) {
        const dbResult = await SqljsDatabaseFactory.createDatabaseFromSql(sqlFile.content);
        if (dbResult.result !== OperationResultType.SUCCESS || !dbResult.data) {
          return null;
        }

        database = DatabaseWrapper.fromInstance(dbResult.data);
      }

      const system = new InformationSystem({
        id: String(configData.id),
        name: configData.name,
        language: configData.language,
        description: configData.description,
        tasks: (configData.tasks || []).map((task: any) => resetTaskProgress(Task.fromJSON(task))),
        pages,
        database,
        mistakes: [],
        mistakesCount: 0,
        startedTasks: Boolean(configData.startedTasks),
        exploringSystem: Boolean(configData.exploringSystem),
        currentRound: 1,
        levelCount: Number(configData.levelCount ?? 1),
        createSchemaSql: sqlFile?.content,
        configData,
      });

      const componentStore = useComponentStore();
      system.defaultComponents = InformationSystem.cloneComponents(componentStore.defaultComponents);
      system.actualComponents = InformationSystem.cloneComponents(componentStore.defaultComponents);

      return system;
    } catch {
      return null;
    }
  }

  private static cloneComponents(components: Component[]): Component[] {
    return Component.arrayFromJSON(JSON.parse(JSON.stringify(components ?? [])));
  }

  private static systemFilePath(file: SystemFile): string {
    return file.path ?? file.name;
  }

}
