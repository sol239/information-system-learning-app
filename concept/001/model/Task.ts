export class Task {
  constructor(
      public id: number,
      public title: string,
      public description: string,
      public completed: boolean = false,
      public kind: string,
      public elementClass: string[] = [],
      public answer: string = '',
      public round: number = 1,
      public status: string = '',
      public errorComponents: any[] = []
    ) {}

    static fromJSON(json: any): Task {
      return new Task(
        json.id,
        json.title,
        json.description,
        json.completed ?? false,
        json.kind,
        json.elementClass ?? [],
        json.answer ?? '',
        json.round ?? 1,
        json.status ?? '',
        json['error-components'] ?? json.errorComponents ?? []
      );
    }

}