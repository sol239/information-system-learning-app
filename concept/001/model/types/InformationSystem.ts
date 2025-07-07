import type { Participant } from "./Participant";

class InfomationSystem {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public tableNames: string[],
  ) {}

}