import type { Participant } from "./Participant";

class InfomationSystem {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public tableNames: string[],
  ) {}

  static fromJSON(json: any): InfomationSystem {
    return new InfomationSystem(
      json.id,
      json.name,
      json.description,
      json.tableNames || [],
    );
  }

}