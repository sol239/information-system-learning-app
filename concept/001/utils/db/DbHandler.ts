import initSqlJs from 'sql.js';

export class DbHandler {

    private db: any;

    constructor() {
        this.db = null;
    }

    public async init(json: any): Promise<void> {
        const SQL = await initSqlJs();
        this.db = new SQL.Database();
        
        // Create tables and insert data
        this.createTables();
        this.insertData(json.tables);
    }

    private createTables(): void {
        // Create participants table
        this.db.exec(`
            CREATE TABLE participants (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                personal_number TEXT NOT NULL,
                phone TEXT NOT NULL,
                address TEXT NOT NULL,
                age INTEGER NOT NULL,
                allergens TEXT, -- JSON array as string
                sessionId INTEGER NOT NULL
            )
        `);

        // Create meals table
        this.db.exec(`
            CREATE TABLE meals (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                allergens TEXT, -- JSON array as string
                when_served TEXT NOT NULL
            )
        `);

        // Create sessions table
        this.db.exec(`
            CREATE TABLE sessions (
                id INTEGER PRIMARY KEY,
                fromDate TEXT NOT NULL,
                toDate TEXT NOT NULL,
                capacity INTEGER NOT NULL
            )
        `);

        // Create supervisors table
        this.db.exec(`
            CREATE TABLE supervisors (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                personal_number TEXT NOT NULL,
                phone TEXT NOT NULL,
                address TEXT NOT NULL,
                age INTEGER NOT NULL,
                sessionId INTEGER NOT NULL
            )
        `);
    }

    private insertData(tables: any[]): void {
        tables.forEach(table => {
            switch (table.name) {
                case 'participants':
                    this.insertParticipants(table.data);
                    break;
                case 'meals':
                    this.insertMeals(table.data);
                    break;
                case 'sessions':
                    this.insertSessions(table.data);
                    break;
                case 'supervisors':
                    this.insertSupervisors(table.data);
                    break;
            }
        });
    }

    private insertParticipants(data: any[]): void {
        const stmt = this.db.prepare(`
            INSERT INTO participants (id, name, email, personal_number, phone, address, age, allergens, sessionId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        data.forEach(participant => {
            stmt.run([
                participant.id,
                participant.name,
                participant.email,
                participant.personal_number,
                participant.phone,
                participant.address,
                participant.age,
                JSON.stringify(participant.allergens),
                participant.sessionId
            ]);
        });

        stmt.free();
    }

    private insertMeals(data: any[]): void {
        const stmt = this.db.prepare(`
            INSERT INTO meals (id, name, allergens, when_served)
            VALUES (?, ?, ?, ?)
        `);

        data.forEach(meal => {
            stmt.run([
                meal.id,
                meal.name,
                JSON.stringify(meal.allergens),
                meal.when_served
            ]);
        });

        stmt.free();
    }

    private insertSessions(data: any[]): void {
        const stmt = this.db.prepare(`
            INSERT INTO sessions (id, fromDate, toDate, capacity)
            VALUES (?, ?, ?, ?)
        `);

        data.forEach(session => {
            stmt.run([
                session.id,
                session.fromDate,
                session.toDate,
                session.capacity
            ]);
        });

        stmt.free();
    }

    private insertSupervisors(data: any[]): void {
        const stmt = this.db.prepare(`
            INSERT INTO supervisors (id, name, email, personal_number, phone, address, age, sessionId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        data.forEach(supervisor => {
            stmt.run([
                supervisor.id,
                supervisor.name,
                supervisor.email,
                supervisor.personal_number,
                supervisor.phone,
                supervisor.address,
                supervisor.age,
                supervisor.sessionId
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