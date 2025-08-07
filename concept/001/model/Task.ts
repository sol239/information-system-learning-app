export class Task {
  constructor(
      public id: number,
      public title: string,
      public description: string,
      public completed: boolean = false,
      public kind: string,
      public elementClass: string,
      public answer: string = ''

  
    ) {}
  
    static fromJSON(json: any): Task {
      return new Task(
        json.id,
        json.title,
        json.description,
        json.completed ?? false,
        json.kind,
        json.elementClass,
        json.answer ?? ''
      );
    }

}