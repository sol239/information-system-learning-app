import type { Participant } from "./Participant";

export class InformationSystem {
  constructor(
    public id: number,
    public directory: string,
    public name: string,
    public description: string,
    public tableNames: string[],

  ) {}

  static fromJSON(json: any): InformationSystem {
    return new InformationSystem(
      json.id,
      json.directory || '',
      json.name,
      json.description,
      json.tableNames || [],
    );
  }

}