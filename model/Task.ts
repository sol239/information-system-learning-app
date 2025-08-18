export class Task {
  constructor(
      public id: number,
      public title: string,
      public description: string,
      public componentsRepaired: boolean = false,
      public completed: boolean = false,
      public kind: string,
      public elementClass: Set<string> = new Set(),
      public answer: string = '',
      public round: number = 1,
      public isEditable: boolean = false,
      public status: string = '',
      public errorComponents: any[] = [],
      public componentsIdsToFind: string[] = [],
      public feedback: string
    ) {}

    static fromJSON(json: any): Task {
      // elementClass: array or string → Set
      let elementClassSet: Set<string>;
      if (Array.isArray(json.elementClass)) {
        elementClassSet = new Set(json.elementClass);
      } else if (typeof json.elementClass === 'string') {
        elementClassSet = json.elementClass ? new Set([json.elementClass]) : new Set();
      } else {
        elementClassSet = new Set();
      }

      // errorComponents: support both keys
      const errorComponents = json['error-components'] ?? json.errorComponents ?? [];

      // isEditable: support both keys
      const isEditable = json['is_editable'] ?? json.isEditable ?? false;

      return new Task(
        json.id,
        json.title,
        json.description,
        json.componentsRepaired ?? false,
        json.completed ?? false,
        json.kind,
        elementClassSet,
        json.answer ?? '',
        json.round ?? 1,
        isEditable,
        json.status ?? '',
        errorComponents,
        json.componentsIdsToFind ?? [],
        json.feedback ?? ''
      );
    }

}