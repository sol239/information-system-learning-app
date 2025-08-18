import initSqlJs from 'sql.js';

export class DbHandler {

    private db: any;

    constructor() {
        this.db = null;
    }

    public static async fromJSON(json: any): Promise<DbHandler> {

        const SQL = await initSqlJs({
            // github pages:
            // locateFile: () => '/information-system-learning-app/sql-wasm.wasm'
            
            locateFile: () => '/information-system-learning-app/sql-wasm.wasm'
        });

        const dbHandler: DbHandler = new DbHandler();
        dbHandler.db = new SQL.Database();
        dbHandler.createTables();
        dbHandler.insertData(json.tables);
        return dbHandler;
    }

    public async init(json: any): Promise<void> {
        // Use the WASM file from the public directory
        const SQL = await initSqlJs({
            // github pages:
            // locateFile: () => '/information-system-learning-app/sql-wasm.wasm'
            
            locateFile: () => '/information-system-learning-app/sql-wasm.wasm'
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
                turnus_id INTEGER NOT NULL
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
                turnus_id INTEGER NOT NULL
            )
        `);
            console.log("Supervisors table created successfully. ✅");
        } catch (error) {
            console.error('Error creating supervisors table ⛔:', error);
        }

        try {
            // Create alergeny table
            this.db.exec(`
            CREATE TABLE alergeny (
                id INTEGER PRIMARY KEY,
                název TEXT NOT NULL
            )
        `);
            console.log("Alergeny table created successfully. ✅");
        } catch (error) {
            console.error('Error creating alergeny table: ⛔', error);
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
                case 'alergeny':
                    this.insertAlergeny(table.data);
                    break;
            }
        });
    }

    private insertParticipants(data: any[]): void {
        const stmt = this.db.prepare(`
            INSERT INTO účastníci (id, jméno, email, rodné_číslo, telefon, adresa, věk, alergeny, turnus_id)
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
                participant.turnus_id
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

    public validateSql(sql: string): boolean {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        try {
            this.db.prepare(sql);
            return true;
        } catch (error) {
            console.error('SQL Error:', error);
            return false;
        }
    }

    private insertSupervisors(data: any[]): void {
        const stmt = this.db.prepare(`
            INSERT INTO vedoucí (id, jméno, email, rodné_číslo, telefon, adresa, věk, turnus_id)
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
                supervisor.turnus_id
            ]);
        });

        stmt.free();
    }

    private insertAlergeny(data: any[]): void {
        const stmt = this.db.prepare(`
            INSERT INTO alergeny (id, název)
            VALUES (?, ?)
        `);

        data.forEach(alergen => {
            stmt.run([
                alergen.id,
                alergen.název
            ]);
        });

        stmt.free();
    }

    public query(sql: string, params?: any[]): { success: boolean; results: any[] } {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        const results: any[] = [];

        try {
            const stmt = this.db.prepare(sql);

            if (params) {
                stmt.bind(params);
            }

            while (stmt.step()) {
                results.push(stmt.getAsObject());
            }

            stmt.free();

            return {
                success: true,
                results
            };
        } catch (error) {
            console.error('SQL Error:', error);
            return {
                success: false,
                results: []
            };
        }
    }


    public exec(sql: string): void {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        this.db.exec(sql);
    }
}

export default DbHandler;