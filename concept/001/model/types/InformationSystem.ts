import { Participant } from "./Participant";
import { Task } from "./Task";

export interface Table<T = any> {
  name: string;
  data: T[];
}

export class InformationSystem {
  constructor(
    public id: number,
    public directory: string,
    public name: string,
    public description: string,
    public tables: Table[],
    public tasks: Task[] = []
  ) {}

  static fromJSON(json: any): InformationSystem {
    // Parse tables
    const tables: Table[] = (json.tables || []).map((table: any) => ({
      name: table.name,
      data: table.data,
    }));

    // Parse tasks
    const tasks: Task[] = (json.tasks || []).map((task: any) =>
      Task.fromJSON(task)
    );

    return new InformationSystem(
      json.id,
      json.directory || "",
      json.name,
      json.description,
      tables,
      tasks
    );
  }
}