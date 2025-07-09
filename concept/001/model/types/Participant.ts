export class Participant {
    constructor(
        public id: number,
        public name: string,
        public email: string,
        public personal_number: string,
        public phone: string,
        public address: string,
        public age: number
    ) {}

    static fromJSON(json: any): Participant[] {
        return json.map((item: any) => new Participant(
            item.id,
            item.name,
            item.email,
            item.personal_number,
            item.phone,
            item.address,
            item.age
        ));
    }

}