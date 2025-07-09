export class Task {
  constructor(
      public id: number,
      public title: string,
      public description: string,
  
    ) {}
  
    static fromJSON(json: any): Task {
      return new Task(
        json.id,
        json.title,
        json.description,
      );
    }

}