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
        public sessionId: number,
        public allergens: string[] // přidáno pole alergeny
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
            item.sessionId || 0,
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
            item.turnus_id || 0,  // Czech field name
            item.alergeny || [] // načtení alergeny
            
        ));
    }

    // Add a static method for single object conversion
    static fromDbRow(item: any): Participant {
        return new Participant(
            item.id,
            item.jméno,  // Czech field name
            item.email,
            item.rodné_číslo,  // Czech field name
            item.telefon,  // Czech field name
            item.adresa,  // Czech field name
            item.věk,  // Czech field name
            item.turnus_id || 0,  // Czech field name
            item.alergeny || [] // načtení alergeny
        );
    }
}