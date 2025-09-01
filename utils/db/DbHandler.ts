import initSqlJs from 'sql.js';

// Simple CSV parser (assumes no quoted commas, first row is header)
function parseCSV(csv: string): any[] {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const values = line.split(',');
        const obj: any = {};
        headers.forEach((h, i) => obj[h.trim()] = values[i]?.trim());
        return obj;
    });
}

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

        console.log("JSON 1", json);

        dbHandler.createTables(json.tables);

        await dbHandler.insertData(json.tables);
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
        console.log("JSON 2", json.tables);

        // Create tables and insert data
        this.createTables(json.tables);
        await this.insertData(json.tables);
    }

    private static getTableColumns(table) {
        const columns = [];
        for (const [key, value] of Object.entries(table)) {
            columns.push({ name: key, type: typeof value });
        }
        return columns;
    }

    private createTables(tables: any[]): void {

        // Create participants table
        try {
            this.db.exec(`
            CREATE TABLE participants (
                participant_id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                personal_number TEXT NOT NULL,
                phone TEXT NOT NULL,
                address TEXT NOT NULL,
                age INTEGER NOT NULL
            )
        `);
            console.log("Participants table created successfully. ✅");
        } catch (error) {
            console.error('Error creating participants table: ⛔', error);
        }

        try {
            // Create meals table
            this.db.exec(`
            CREATE TABLE meals (
                meal_id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                date_served TEXT NOT NULL
            )
        `);
            console.log("Meals table created successfully. ✅");
        } catch (error) {
            console.error('Error creating meals table: ⛔', error);
        }

        try {
            // Create sessions table
            this.db.exec(`
            CREATE TABLE sessions (
                session_id INTEGER PRIMARY KEY,
                from_date TEXT NOT NULL,
                to_date TEXT NOT NULL,
                capacity INTEGER NOT NULL
            )
        `);
            console.log("Sessions table created successfully. ✅");
        } catch (error) {
            console.error('Error creating sessions table: ⛔', error);
        }

        try {
            // Create supervisors table
            this.db.exec(`
            CREATE TABLE supervisors (
                supervisor_id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                personal_number TEXT NOT NULL,
                phone TEXT NOT NULL,
                address TEXT NOT NULL,
                age INTEGER NOT NULL
            )
        `);
            console.log("Supervisors table created successfully. ✅");
        } catch (error) {
            console.error('Error creating supervisors table ⛔:', error);
        }

        try {
            // Create allergens table
            this.db.exec(`
            CREATE TABLE allergens (
                allergen_id INTEGER PRIMARY KEY,
                name TEXT NOT NULL
            )
        `);
            console.log("Allergens table created successfully. ✅");
        } catch (error) {
            console.error('Error creating allergens table: ⛔', error);
        }

        try {
            this.db.exec(`
            CREATE TABLE allergens_meals (
                allergen_id INTEGER NOT NULL,
                meal_id INTEGER NOT NULL,
                PRIMARY KEY (allergen_id, meal_id)
            )
        `);
            console.log("Allergens_meals table created successfully. ✅");
        } catch (error) {
            console.error('Error creating allergens_meals table: ⛔', error);
        }

        try {
            this.db.exec(`
            CREATE TABLE meals_participants (
                meal_id INTEGER NOT NULL,
                participant_id INTEGER NOT NULL,
                date_served TEXT NOT NULL,
                PRIMARY KEY (participant_id, meal_id)
            )
        `);
            console.log("Meals_participants table created successfully. ✅");
        } catch (error) {
            console.error('Error creating meals_participants table: ⛔', error);
        }

        try {
            this.db.exec(`
            CREATE TABLE meals_supervisors (
                meal_id INTEGER NOT NULL,
                supervisor_id INTEGER NOT NULL,
                date_served TEXT NOT NULL,
                PRIMARY KEY (supervisor_id, meal_id)
            )
        `);
            console.log("Meals_supervisors table created successfully. ✅");
        } catch (error) {
            console.error('Error creating meals_supervisors table: ⛔', error);
        }

        try {
            this.db.exec(`
            CREATE TABLE participants_allergens (
                participant_id INTEGER NOT NULL,
                allergen_id INTEGER NOT NULL,
                PRIMARY KEY (participant_id, allergen_id)
            )
        `);
            console.log("Participants_allergens table created successfully. ✅");
        } catch (error) {
            console.error('Error creating participants_allergens table: ⛔', error);
        }

        try {
            this.db.exec(`
            CREATE TABLE supervisors_allergens (
                supervisor_id INTEGER NOT NULL,
                allergen_id INTEGER NOT NULL,
                PRIMARY KEY (supervisor_id, allergen_id)
            )
        `);
            console.log("Supervisors_allergens table created successfully. ✅");
        } catch (error) {
            console.error('Error creating supervisors_allergens table: ⛔', error);
        }

        try {
            this.db.exec(`
            CREATE TABLE sessions_supervisors (
                session_id INTEGER NOT NULL,
                supervisor_id INTEGER NOT NULL,
                PRIMARY KEY (session_id, supervisor_id)
            )
        `);
            console.log("Sessions_supervisors table created successfully. ✅");
        } catch (error) {
            console.error('Error creating sessions_supervisors table: ⛔', error);
        }

        try {
            this.db.exec(`
            CREATE TABLE sessions_participants (
                session_id INTEGER NOT NULL,
                participant_id INTEGER NOT NULL,
                PRIMARY KEY (session_id, participant_id)
            )
        `);
            console.log("Sessions_participants table created successfully. ✅");
        } catch (error) {
            console.error('Error creating sessions_participants table: ⛔', error);
        }
    }

    private async insertData(tables: any[]): Promise<void> {
        for (const table of tables) {
            const response = await fetch(table.csv_path);
            const csvContent = await response.text();
            const rows = parseCSV(csvContent);

            switch (table.name) {
                case 'účastníci':
                    await this.insertParticipants(rows);
                    break;
                case 'jídla':
                    await this.insertMeals(rows);
                    break;
                case 'turnusy':
                    await this.insertSessions(rows);
                    break;
                case 'vedoucí':
                    await this.insertSupervisors(rows);
                    break;
                case 'alergeny':
                    await this.insertAlergeny(rows);
                    break;
                case 'účastníci_alergeny':
                    await this.insertParticipantsAllergens(rows);
                    break;
                case 'účastníci_jídla':
                    await this.insertMealsParticipants(rows);
                    break;
                case 'účastníci_turnusy':
                    await this.insertParticipantsSessions(rows);
                    break;
                case 'jídla_alergeny':
                    await this.insertAllergensMeals(rows);
                    break;
                case 'vedoucí_alergeny':
                    await this.insertSupervisorsAllergens(rows);
                    break;
                case 'vedoucí_turnusy':
                case 'turnusy_vedoucí':
                    await this.insertSessionsSupervisors(rows);
                    break;
            }
        }
    }

    private async insertParticipants(data: any[]): Promise<void> {
        const stmt = this.db.prepare(`
            INSERT INTO participants (participant_id, name, email, personal_number, phone, address, age)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        data.forEach(row => {
            stmt.run([
                row.participant_id || row.id,
                row.name || row.jméno,
                row.email,
                row.personal_number || row.rodné_číslo,
                row.phone || row.telefon,
                row.address || row.adresa,
                Number(row.age || row.věk)
            ]);
        });
        stmt.free();
    }

    private async insertMeals(data: any[]): Promise<void> {
        const stmt = this.db.prepare(`
            INSERT INTO meals (meal_id, name, date_served)
            VALUES (?, ?, ?)
        `);
        data.forEach(row => {
            stmt.run([
                row.meal_id || row.id,
                row.name || row.jméno,
                row.date_served || row.kdy_podáváno
            ]);
        });
        stmt.free();
    }

    private async insertSessions(data: any[]): Promise<void> {
        const stmt = this.db.prepare(`
            INSERT INTO sessions (session_id, from_date, to_date, capacity)
            VALUES (?, ?, ?, ?)
        `);
        data.forEach(row => {
            stmt.run([
                row.session_id || row.id,
                row.from_date || row.od,
                row.to_date || row.do,
                Number(row.capacity || row.kapacita)
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

    private async insertSupervisors(data: any[]): Promise<void> {
        const stmt = this.db.prepare(`
            INSERT INTO supervisors (supervisor_id, name, email, personal_number, phone, address, age)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        data.forEach(row => {
            stmt.run([
                row.supervisor_id || row.id,
                row.name || row.jméno,
                row.email,
                row.personal_number || row.rodné_číslo,
                row.phone || row.telefon,
                row.address || row.adresa,
                Number(row.age || row.věk)
            ]);
        });
        stmt.free();
    }

    private async insertAlergeny(data: any[]): Promise<void> {
        const stmt = this.db.prepare(`
            INSERT INTO allergens (allergen_id, name)
            VALUES (?, ?)
        `);
        data.forEach(row => {
            stmt.run([
                row.allergen_id || row.id,
                row.name || row.název
            ]);
        });
        stmt.free();
    }

    // Add new insert methods for join tables
    private async insertParticipantsAllergens(data: any[]): Promise<void> {
        const stmt = this.db.prepare(`
            INSERT INTO participants_allergens (participant_id, allergen_id)
            VALUES (?, ?)
        `);
        data.forEach(row => {
            stmt.run([
                row.participant_id,
                row.allergen_id
            ]);
        });
        stmt.free();
    }

    private async insertMealsParticipants(data: any[]): Promise<void> {
        const stmt = this.db.prepare(`
            INSERT INTO meals_participants (meal_id, participant_id, date_served)
            VALUES (?, ?, ?)
        `);
        data.forEach(row => {
            stmt.run([
                row.meal_id,
                row.participant_id,
                row.date_served
            ]);
        });
        stmt.free();
    }

    private async insertParticipantsSessions(data: any[]): Promise<void> {
        const stmt = this.db.prepare(`
            INSERT INTO sessions_participants (session_id, participant_id)
            VALUES (?, ?)
        `);
        data.forEach(row => {
            stmt.run([
                row.session_id,
                row.participant_id
            ]);
        });
        stmt.free();
    }

    private async insertAllergensMeals(data: any[]): Promise<void> {
        const stmt = this.db.prepare(`
            INSERT INTO allergens_meals (allergen_id, meal_id)
            VALUES (?, ?)
        `);
        data.forEach(row => {
            stmt.run([
                row.allergen_id,
                row.meal_id
            ]);
        });
        stmt.free();
    }

    private async insertSupervisorsAllergens(data: any[]): Promise<void> {
        const stmt = this.db.prepare(`
            INSERT INTO supervisors_allergens (supervisor_id, allergen_id)
            VALUES (?, ?)
        `);
        data.forEach(row => {
            stmt.run([
                row.supervisor_id,
                row.allergen_id
            ]);
        });
        stmt.free();
    }

    private async insertSessionsSupervisors(data: any[]): Promise<void> {
        const stmt = this.db.prepare(`
            INSERT INTO sessions_supervisors (session_id, supervisor_id)
            VALUES (?, ?)
        `);
        data.forEach(row => {
            stmt.run([
                row.session_id,
                row.supervisor_id
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