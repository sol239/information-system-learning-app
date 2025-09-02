import type { TableEntity } from "./TableEntity";

export class Supervisor implements TableEntity {
    constructor(
        public id: number,
        public name: string,
        public email: string,
        public personal_number: string,
        public phone: string,
        public address: string,
        public age: number,
        public sessions: number[] = [],
        public allergens: any[] = []
    ) {}
}