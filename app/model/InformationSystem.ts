import { Task } from "./Task/Task";
import { Component } from "./Component";
import { DatabaseWrapper } from "~/utils/DatabaseWrapper";
import { SqljsDatabaseFactory } from "~/utils/SqljsDatabaseFactory";
import type { GUID } from "./GUID";
import type { Page } from "./Page";
import { Score } from "./Score";
import { useComponentStore } from "~/stores/componentStore";
import { getComponentLoadSource } from "~/utils/componentLoadSource";
import { getPageLoadSource } from "~/utils/pageLoadSource";

/**
 * Represents an information system, encapsulating its configuration, data tables, tasks, and component mappings.
 */
export class InformationSystem {
  /**
   * Unique identifier for the system.
   */
  public id: GUID;

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
    currentRound = 1,
    levelCount = 1,
  }: {
    id: GUID;
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
    this.currentRound = currentRound;
    this.levelCount = levelCount;
  }

  public get mistakesCount(): number {
    return this.mistakes.length;
  }

  public get mistakesPenalty(): number {
    return this.mistakes.reduce((sum, penalty) => sum + Number(penalty || 0), 0);
  }

  /**
   * Creates an InformationSystem from a raw config JSON string.
   * Throws SyntaxError if the JSON is invalid.
   */
  public static fromConfig(configJson: string): InformationSystem {
    const configData = JSON.parse(configJson);
    return new InformationSystem({
      id: String(configData.id) as GUID,
      name: configData.name,
      language: configData.language,
      description: configData.description,
      pages: configData.pages ?? [],
      mistakes: Array.isArray(configData.mistakes) ? configData.mistakes : undefined,
      mistakesCount: Number(configData.mistakesCount ?? 0),
      currentRound: Number(configData.currentRound ?? 1),
      levelCount: Number(configData.levelCount ?? 1),
      createSchemaSql: typeof configData.createSchemaSql === 'string' ? configData.createSchemaSql : undefined,
      configData,
    });
  }

  // TODO: Write comments
  public static async loadSystem(filesContents: Record<string, string>): Promise<Operation<InformationSystem | null>> {
    const configEntry = Object.entries(filesContents).find(([path]) => path.endsWith('config.json'));
    if (!configEntry) {
      return new Operation(OperationResultType.ERROR, "Config file not found.", null);
    }
    const [configPath, configContent] = configEntry;

    try {
      const configData = JSON.parse(configContent);
      const loadPagesFromSystem = getPageLoadSource() === 'system';
      const pages: Page[] = (configData.pages || []).map((page: Page) => ({
        ...page,
        vueSource: loadPagesFromSystem ? filesContents[page.vueFile] ?? null : undefined,
      }));
      const system = new InformationSystem({
        id: configData.id as GUID,
        name: configData.name,
        language: configData.language,
        description: configData.description,
        tasks: (configData.tasks || []).map((task: any) => Task.fromJSON(task)),
        pages,
        mistakes: Array.isArray(configData.mistakes) ? configData.mistakes : undefined,
        mistakesCount: Number(configData.mistakesCount ?? 0),
        currentRound: Number(configData.currentRound ?? 1),
        levelCount: Number(configData.levelCount ?? 1),
        createSchemaSql: Object.entries(filesContents).find(([path]) => path.endsWith('create_schema.sql'))?.[1],
        configData,
      });

      // Initialize the database with the config data and CSV contents
      // initialize using create_schema.sql
      const sqlEntry = Object.entries(filesContents).find(([path]) => path.endsWith('create_schema.sql'));
      //console.log("Found SQL entry for database initialization:", sqlEntry);
      if (sqlEntry) {
        const dbResult = await SqljsDatabaseFactory.createDatabaseFromSql(sqlEntry[1]);
        //console.log("Database creation from SQL result:", dbResult);
        if (dbResult.result === OperationResultType.SUCCESS && dbResult.data) {
          system.database = DatabaseWrapper.fromInstance(dbResult.data);
        } else {
          return new Operation(OperationResultType.ERROR, "Failed to build database: " + dbResult.message, null);
        }
      }


      // const csvEntries = Object.fromEntries(
      //   Object.entries(filesContents).filter(([path]) => !path.endsWith('config.json') && !path.endsWith('system_components.json') && !path.endsWith('.vue'))
      // );
      // if (Object.keys(csvEntries).length > 0) {
      //   const dbResult = await SqljsDatabaseFactory.createDatabase(csvEntries);
      //   if (dbResult.result === OperationResultType.SUCCESS && dbResult.data) {
      //     system.database = DatabaseWrapper.fromInstance(dbResult.data);
      //   } else {
      //     return new Operation(OperationResultType.ERROR, "Failed to build database: " + dbResult.message, null);
      //   }
      // }

      if (getComponentLoadSource() === 'system') {
        const componentsEntry = Object.entries(filesContents).find(([path]) => path.endsWith('system_components.json'));
        if (componentsEntry?.[1]?.trim()) {
          try {
            const componentsData = JSON.parse(componentsEntry[1]);
            system.defaultComponents = Component.arrayFromJSON(componentsData);
            if (system.actualComponents.length === 0) {
              system.actualComponents = InformationSystem.cloneComponents(system.defaultComponents);
            }
          } catch (e) {
            console.warn("Failed to parse system_components.json", e);
          }
        } else {
          console.warn("system_components.json not found or empty; no default components were loaded from the system.");
        }
      } else {
        const componentStore = useComponentStore();
        system.defaultComponents = InformationSystem.cloneComponents(componentStore.defaultComponents);
        if (system.actualComponents.length === 0) {
          system.actualComponents = InformationSystem.cloneComponents(componentStore.defaultComponents);
        }
      }

      return new Operation(OperationResultType.SUCCESS, "System loaded successfully.", system);

      /* TODO: the saving into IndexedDB shall happen after upload button click. There shall be no saving to pinia store. But after upload of the system, the pinia stores shall
      look into indexed db and update itself.
       */
    } catch (error) {
      return new Operation(OperationResultType.ERROR, "Failed to load system: " + (error instanceof Error ? error.message : String(error)), null);
    }

  }

  private static cloneComponents(components: Component[]): Component[] {
    return components.map(component => Component.fromJSON(JSON.parse(JSON.stringify(component))));
  }

}
