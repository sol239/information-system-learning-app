import initSqlJs from 'sql.js';

export class DbHandler {

    private db: any;

    constructor() {
        this.db = null;
    }

    public async init(json: any): Promise<void> {
        // Use the WASM file from the public directory
        const SQL = await initSqlJs({
            locateFile: () => '/sql-wasm.wasm'
        });

        this.db = new SQL.Database();

        // Create tables and insert data
        this.createTables();
        this.insertData(json.tables);
    }

    private createTables(): void {
        // Create participants table
        try {
            this.db.exec(`
            CREATE TABLE účastníci (
                id INTEGER PRIMARY KEY,
                jméno TEXT NOT NULL,
                email TEXT NOT NULL,
                rodné_číslo TEXT NOT NULL,
                telefon TEXT NOT NULL,
                adresa TEXT NOT NULL,
                věk INTEGER NOT NULL,
                alergeny TEXT, -- JSON array as string
                id_turnusu INTEGER NOT NULL
            )
        `);
        console.log("Participants table created successfully. ✅");
        } catch (error) {
            console.error('Error creating participants table: ⛔', error);
        }

        try {
            // Create jídla table
            this.db.exec(`
            CREATE TABLE jídla (
                id INTEGER PRIMARY KEY,
                jméno TEXT NOT NULL,
                alergeny TEXT, -- JSON array as string
                kdy_podáváno TEXT NOT NULL
            )
        `);
        console.log("Meals table created successfully. ✅");
        } catch (error) {
            console.error('Error creating meals table: ⛔', error);
        }

        try {
            // Create turnusy    table
            this.db.exec(`
            CREATE TABLE turnusy (
                id INTEGER PRIMARY KEY,
                od TEXT NOT NULL,
                do TEXT NOT NULL,
                kapacita INTEGER NOT NULL
            )
        `);
        console.log("Sessions table created successfully. ✅");
        } catch (error) {
            console.error('Error creating sessions table: ⛔', error);
        }

        try {
            // Create vedoucí table
            this.db.exec(`
            CREATE TABLE vedoucí (
                id INTEGER PRIMARY KEY,
                jméno TEXT NOT NULL,
                email TEXT NOT NULL,
                rodné_číslo TEXT NOT NULL,
                telefon TEXT NOT NULL,
                adresa TEXT NOT NULL,
                věk INTEGER NOT NULL,
                id_turnusu INTEGER NOT NULL
            )
        `);
        console.log("Supervisors table created successfully. ✅");
        } catch (error) {
            console.error('Error creating supervisors table ⛔:', error);
        }
    }

    private insertData(tables: any[]): void {
        tables.forEach(table => {
            switch (table.name) {
                case 'účastníci':
                    this.insertParticipants(table.data);
                    break;
                case 'jídla':
                    this.insertMeals(table.data);
                    break;
                case 'turnusy':
                    this.insertSessions(table.data);
                    break;
                case 'vedoucí':
                    this.insertSupervisors(table.data);
                    break;
            }
        });
    }

    private insertParticipants(data: any[]): void {
        const stmt = this.db.prepare(`
            INSERT INTO účastníci (id, jméno, email, rodné_číslo, telefon, adresa, věk, alergeny, id_turnusu)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        data.forEach(participant => {
            stmt.run([
                participant.id,
                participant.jméno,
                participant.email,
                participant.rodné_číslo,
                participant.telefon,
                participant.adresa,
                participant.věk,
                JSON.stringify(participant.alergeny),
                participant.id_turnusu
            ]);
        });

        stmt.free();
    }

    private insertMeals(data: any[]): void {
        const stmt = this.db.prepare(`
            INSERT INTO jídla (id, jméno, alergeny, kdy_podáváno)
            VALUES (?, ?, ?, ?)
        `);

        data.forEach(meal => {
            stmt.run([
                meal.id,
                meal.jméno,
                JSON.stringify(meal.alergeny),
                meal.kdy_podáváno
            ]);
        });

        stmt.free();
    }

    private insertSessions(data: any[]): void {
        const stmt = this.db.prepare(`
            INSERT INTO turnusy (id, od, do, kapacita)
            VALUES (?, ?, ?, ?)
        `);

        data.forEach(session => {
            stmt.run([
                session.id,
                session.od,
                session.do,
                session.kapacita
            ]);
        });

        stmt.free();
    }

    private insertSupervisors(data: any[]): void {
        const stmt = this.db.prepare(`
            INSERT INTO vedoucí (id, jméno, email, rodné_číslo, telefon, adresa, věk, id_turnusu)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        data.forEach(supervisor => {
            stmt.run([
                supervisor.id,
                supervisor.jméno,
                supervisor.email,
                supervisor.rodné_číslo,
                supervisor.telefon,
                supervisor.adresa,
                supervisor.věk,
                supervisor.id_turnusu
            ]);
        });

        stmt.free();
    }

    public query(sql: string, params?: any[]): any[] {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        const stmt = this.db.prepare(sql);
        const results: any[] = [];

        if (params) {
            stmt.bind(params);
        }

        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }

        stmt.free();
        return results;
    }

    public exec(sql: string): void {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        this.db.exec(sql);
    }
}

export default DbHandler;