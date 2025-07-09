import type { TableEntity } from './TableEntity';

export class Meal implements TableEntity {
    constructor(
        public id: number,
        public name: string,
        public whenServed: string,
        public alergens: string[] = [],
    ) {}

    static fromJSON(json: any): Meal[] {
        return json.map((item: any) => new Meal(
            item.id,
            item.name,
            item.whenServed,
            item.alergens || []
        ));
    }
}