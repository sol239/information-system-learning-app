import type { InformationSystem } from "~/model/InformationSystem";
import { TaskSet } from "~/model/Task/TaskSet";
import type { SystemFile } from "~/model/types/SystemFile";
import { Operation } from "~/utils/Operation/Operation";
import { OperationResultType } from "~/utils/Operation/OperationResultType";
import type { ISystemLoader } from "./ISystemLoader";

type RawModuleLoader = () => Promise<string>;

export class DefaultSystemLoader implements ISystemLoader {
  private readonly configModules = import.meta.glob(
    "~/model/SystemComponents/**/config.json",
    {
      query: "?raw",
      import: "default",
    },
  ) as Record<string, RawModuleLoader>;

  private readonly taskModules = import.meta.glob(
    "~/model/SystemComponents/**/*.json",
    {
      query: "?raw",
      import: "default",
    },
  ) as Record<string, RawModuleLoader>;

  private readonly sqlModules = import.meta.glob(
    "~/model/SystemComponents/**/create_schema.sql",
    {
      query: "?raw",
      import: "default",
    },
  ) as Record<string, RawModuleLoader>;

  async loadSystem(
    systemId: string,
  ): Promise<Operation<InformationSystem | null>> {
    try {
      const systemFiles = await this.getSystemFiles(systemId);
      const { InformationSystem } = await import("~/model/InformationSystem");
      return InformationSystem.loadSystem(systemFiles);
    } catch (error) {
      return new Operation(
        OperationResultType.ERROR,
        `Failed to load default system "${systemId}": ${error instanceof Error ? error.message : String(error)}`,
        null,
      );
    }
  }

  public async getSystemFiles(systemId: string): Promise<SystemFile[]> {
    const configEntry = this.findEntry(
      this.configModules,
      systemId,
      "config.json",
    );
    const taskEntries = await this.getTaskEntries(systemId);
    const sqlEntry = this.findEntry(
      this.sqlModules,
      systemId,
      "create_schema.sql",
      false,
    );

    const files: SystemFile[] = [
      {
        name: "config.json",
        path: configEntry.path,
        content: await configEntry.loader(),
      },
    ];

    for (const entry of taskEntries) {
      files.push({
        name: entry.path.split("/").pop()!,
        path: entry.path,
        content: entry.content,
      });
    }

    if (sqlEntry) {
      files.push({
        name: "create_schema.sql",
        path: sqlEntry.path,
        content: await sqlEntry.loader(),
      });
    }

    return files;
  }

  public async loadTaskSet(systemId: string): Promise<TaskSet | null> {
    return (await this.loadTaskSets([systemId]))[0] ?? null;
  }

  public async loadTaskSets(systemIds: string[]): Promise<TaskSet[]> {
    const taskSets: TaskSet[] = [];
    for (const systemId of systemIds) {
      for (const entry of await this.getTaskEntries(systemId)) {
        const data = JSON.parse(entry.content);
        const sources = Array.isArray(data.taskSets) ? data.taskSets : [data];
        for (const source of sources) {
          const taskSet = TaskSet.fromJSON(source, `${systemId}_tasks`);
          if (taskSet.systemId && taskSet.systemId !== systemId) {
            throw new Error("Task set system_id does not match system id");
          }
          taskSet.systemId = systemId;
          taskSets.push(taskSet);
        }
      }
    }
    return taskSets;
  }

  private async getTaskEntries(
    systemId: string,
  ): Promise<{ path: string; content: string }[]> {
    const entries: { path: string; content: string }[] = [];
    for (const [path, loader] of Object.entries(this.taskModules).sort(
      ([a], [b]) => a.localeCompare(b),
    )) {
      const normalizedPath = path.replace(/\\/g, "/");
      if (
        !normalizedPath.includes(`/${systemId}/`) ||
        normalizedPath.endsWith("/config.json")
      )
        continue;
      const content = await loader();
      const data = JSON.parse(content);
      if (Array.isArray(data?.tasks) || Array.isArray(data?.taskSets)) {
        entries.push({ path, content });
      }
    }
    return entries;
  }

  private findEntry(
    modules: Record<string, RawModuleLoader>,
    systemId: string,
    fileName: string,
    required = true,
  ): { path: string; loader: RawModuleLoader } | null {
    const normalizedSystemId = String(systemId).replace(/\\/g, "/");
    const entry = Object.entries(modules).find(([path]) => {
      const normalizedPath = path.replace(/\\/g, "/");
      return normalizedPath.endsWith(`/${normalizedSystemId}/${fileName}`);
    });

    if (!entry) {
      if (!required) {
        return null;
      }
      throw new Error(`Missing ${fileName} for default system "${systemId}".`);
    }

    return { path: entry[0], loader: entry[1] };
  }
}
