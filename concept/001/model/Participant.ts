import type { TableEntity } from './TableEntity';

export class Participant implements TableEntity {
    constructor(
        public id: number,
        public name: string,
        public email: string,
        public personal_number: string,
        public phone: string,
        public address: string,
        public age: number,
        public sessionId: number
        
    ) {}

    static fromJSON(json: any): Participant[] {
        return json.map((item: any) => new Participant(
            item.id,
            item.name,
            item.email,
            item.personal_number,
            item.phone,
            item.address,
            item.age,
            item.sessionId || 0
            
        ));
    }
}