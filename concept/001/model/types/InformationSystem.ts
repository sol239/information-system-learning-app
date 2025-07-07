import type { Participant } from "./Participant";

class InfomationSystem {
  constructor(
    public id: string,
    public name: string,
    public description: string,

    public participants: Array<Participant>
  ) {}

  public async getParticipantsFromJson(jsonPath: string): Promise<Array<Participant>> {
    try {
      const response = await fetch(jsonPath);
      if (!response.ok) throw new Error('Network response was not ok');
      const participants = await response.json();
      return participants as Array<Participant>;
    } catch (error) {
      console.error('Error fetching participants JSON:', error);
      return [];
    }
  }
}