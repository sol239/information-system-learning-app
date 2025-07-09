export class Task {
  constructor(
    public id: number,
    public directory: string,
    public name: string,
    public description: string,
    public tableNames: string[],

  ) {}

  static fromJSON(json: any): Task {
    return new Task(
      json.id,
      json.directory || '',
      json.name,
      json.description,
      json.tableNames || [],
    );
  }

}