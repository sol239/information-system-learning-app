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
        public sessionId: number = 1,
        public allergens: any[] = []
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
            item.sessionId || 1,
            item.alergeny || [] // načtení alergeny
        ));
    }

    static fromDbQuery(json: any): Participant[] {
        return json.map((item: any) => new Participant(
            item.id,
            item.jméno,  // Czech field name
            item.email,
            item.rodné_číslo,  // Czech field name
            item.telefon,  // Czech field name
            item.adresa,  // Czech field name
            item.věk,  // Czech field name
            item.turnus_id || 1,  // Czech field name
            item.alergeny || [] // načtení alergeny
            
        ));
    }

    public static fromDbRow(row: any): Participant {
        return new Participant(
            row.participant_id,
            row.name,
            row.email,
            row.personal_number,
            row.phone,
            row.address,
            row.age,
            row.session_id || 1,
            row.allergens ? JSON.parse(row.allergens) : []
        );
    }
}