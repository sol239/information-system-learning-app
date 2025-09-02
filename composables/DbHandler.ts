import initSqlJs from 'sql.js';
import Papa from "papaparse";

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

export default class DbHandler {

    private db: any;

    private tableNameMap: Map<string, string> = new Map();

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

        dbHandler.tableNameMap = dbHandler.getTableNameMap(json.tables);

        dbHandler.createTables(json.tables);

        await dbHandler.insertData(json);
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

        this.tableNameMap = this.getTableNameMap(json.tables);

        // Create tables and insert data
        this.createTables(json.tables);
        await this.insertData(json);
    }

    private getTableNameMap(tables: any[]): Map<string, string> {
        const map = new Map<string, string>();
        tables.forEach(table => {
            map.set(table.id, table.name);
        });
        return map;
    }

    private createTables(tables: any[]): void {

        // Create participants table
        try {
            this.db.exec(`
            CREATE TABLE ${this.tableNameMap.get('participants')} (
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
            CREATE TABLE ${this.tableNameMap.get('meals')} (
                meal_id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                when_served TEXT NOT NULL
            )
        `);
            console.log("Meals table created successfully. ✅");
        } catch (error) {
            console.error('Error creating meals table: ⛔', error);
        }

        try {
            // Create sessions table
            this.db.exec(`
            CREATE TABLE ${this.tableNameMap.get('sessions')} (
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
            CREATE TABLE ${this.tableNameMap.get('supervisors')} (
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
            CREATE TABLE ${this.tableNameMap.get('allergens')} (
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
            CREATE TABLE ${this.tableNameMap.get('allergens_meals')} (
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
            CREATE TABLE ${this.tableNameMap.get('meals_participants')} (
                meal_id INTEGER NOT NULL,
                participant_id INTEGER NOT NULL,
                date_served TEXT NOT NULL,
                PRIMARY KEY (participant_id, meal_id, date_served)
            )
        `);
            console.log("Meals_participants table created successfully. ✅");
        } catch (error) {
            console.error('Error creating meals_participants table: ⛔', error);
        }

        try {
            this.db.exec(`
            CREATE TABLE ${this.tableNameMap.get('meals_supervisors')} (
                meal_id INTEGER NOT NULL,
                supervisor_id INTEGER NOT NULL,
                date_served TEXT NOT NULL,
                PRIMARY KEY (supervisor_id, meal_id, date_served)
            )
        `);
            console.log("Meals_supervisors table created successfully. ✅");
        } catch (error) {
            console.error('Error creating meals_supervisors table: ⛔', error);
        }

        try {
            this.db.exec(`
            CREATE TABLE ${this.tableNameMap.get('participants_allergens')} (
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
            CREATE TABLE ${this.tableNameMap.get('supervisors_allergens')} (
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
            CREATE TABLE ${this.tableNameMap.get('sessions_supervisors')} (
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
            CREATE TABLE ${this.tableNameMap.get('sessions_participants')} (
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

    // TODO: use simpler execution logic
    private async insertData(json: any): Promise<void> {
        console.log(`Inserting data into tables for system: ${json.directory}`);

        // Glob all CSVs in assets/*/csv as raw text
        const csvModules = import.meta.glob('~/assets/data/*/csv/*.csv', { as: 'raw' });

        console.log("CSV MODULES:", csvModules);

        // Define the prefix to filter by json.directory
        const prefix = `${json.directory}/csv/`;

        for (const table of json.tables) {
            const csvFilename = table.csv_path.split('/').pop(); // e.g., "participants.csv"

            // Find the CSV that matches the directory prefix and filename
            const moduleKey = Object.keys(csvModules).find(
                key => key.includes(prefix) && key.endsWith("/" + csvFilename)
            );

            if (!moduleKey) {
                console.warn(`CSV not found for table: ${table.id}, file: ${csvFilename}`);
                continue;
            }

            // Load CSV content
            const csvText = await csvModules[moduleKey]();
            console.log("CSV PATH:", moduleKey);
            console.log("CSV FILENAME:", csvFilename);

            // Parse CSV with PapaParse
            const { data: rows } = Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true, // convert numbers automatically
                transform: (value) => value.trim() // trim leading/trailing spaces
            });

            console.log(`Table: ${table.id}, Rows:`, rows);

            // Call the appropriate insert method dynamically
            const methodMap: Record<string, Function> = {
                participants: this.insertParticipants,
                meals: this.insertMeals,
                sessions: this.insertSessions,
                supervisors: this.insertSupervisors,
                allergens: this.insertAllergens,
                participants_allergens: this.insertParticipantsAllergens,
                meals_participants: this.insertMealsParticipants,
                meals_supervisors: this.insertMealsSupervisors,
                sessions_participants: this.insertParticipantsSessions,
                allergens_meals: this.insertAllergensMeals,
                supervisors_allergens: this.insertSupervisorsAllergens,
                sessions_supervisors: this.insertSessionsSupervisors,
            };

            const insertMethod = methodMap[table.id];
            if (insertMethod) {
                await insertMethod.call(this, rows);
            } else {
                console.warn(`No insert method found for table: ${table.id}`);
            }
        }
    }


    private async insertParticipants(data: any[]): Promise<void> {

        console.log("DATA:", data);

        try {
            const stmt = this.db.prepare(`
                INSERT INTO ${this.tableNameMap.get('participants')} (participant_id, name, email, personal_number, phone, address, age)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);
            data.forEach(row => {
                stmt.run([
                    row.participant_id,
                    row.name,
                    row.email,
                    row.personal_number,
                    row.phone,
                    row.address,
                    Number(row.age)
                ]);
            });
            stmt.free();
            console.log("Inserted participants successfully. ✅");
        } catch (error) {
            console.error('Error inserting participants: ⛔', error);
        }
    }

    private async insertMeals(data: any[]): Promise<void> {
        try {
            const stmt = this.db.prepare(`
                INSERT INTO ${this.tableNameMap.get('meals')} (meal_id, name, when_served)
                VALUES (?, ?, ?)
            `);
            data.forEach(row => {
                stmt.run([
                    row.meal_id,
                    row.name,
                    row.when_served // <-- fix here
                ]);
            });
            stmt.free();
            console.log("Inserted meals successfully. ✅");
        } catch (error) {
            console.error('Error inserting meals: ⛔', error);
        }
    }

    private async insertSessions(data: any[]): Promise<void> {
        try {
            const stmt = this.db.prepare(`
                INSERT INTO ${this.tableNameMap.get('sessions')} (session_id, from_date, to_date, capacity)
                VALUES (?, ?, ?, ?)
            `);
            data.forEach(row => {
                stmt.run([
                    row.session_id,
                    typeof row.from_date === 'object' && row.from_date !== null && row.from_date.toISOString ? row.from_date.toISOString() : String(row.from_date),
                    typeof row.to_date === 'object' && row.to_date !== null && row.to_date.toISOString ? row.to_date.toISOString() : String(row.to_date),
                    Number(row.capacity)
                ]);
            });
            stmt.free();
            console.log("Inserted sessions successfully. ✅");
        } catch (error) {
            console.error('Error inserting sessions: ⛔', error);
        }
    }

    private async insertSupervisors(data: any[]): Promise<void> {
        try {
            const stmt = this.db.prepare(`
                INSERT INTO ${this.tableNameMap.get('supervisors')} (supervisor_id, name, email, personal_number, phone, address, age)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);
            data.forEach(row => {
                stmt.run([
                    row.supervisor_id,
                    row.name,
                    row.email,
                    row.personal_number,
                    row.phone,
                    row.address,
                    Number(row.age)
                ]);
            });
            stmt.free();
            console.log("Inserted supervisors successfully. ✅");
        } catch (error) {
            console.error('Error inserting supervisors: ⛔', error);
        }
    }

    private async insertAllergens(data: any[]): Promise<void> {
        try {
            const stmt = this.db.prepare(`
                INSERT INTO ${this.tableNameMap.get('allergens')} (allergen_id, name)
                VALUES (?, ?)
            `);
            data.forEach(row => {
                stmt.run([
                    row.allergen_id,
                    row.name
                ]);
            });
            stmt.free();
            console.log("Inserted allergens successfully. ✅");
        } catch (error) {
            console.error('Error inserting allergens: ⛔', error);
        }
    }

    // Add new insert methods for join tables
    private async insertParticipantsAllergens(data: any[]): Promise<void> {
        try {
            const stmt = this.db.prepare(`
                INSERT INTO ${this.tableNameMap.get('participants_allergens')} (participant_id, allergen_id)
                VALUES (?, ?)
            `);
            data.forEach(row => {
                stmt.run([
                    row.participant_id,
                    row.allergen_id
                ]);
            });
            stmt.free();
            console.log("Inserted participants_allergens successfully. ✅");
        } catch (error) {
            console.error('Error inserting participants_allergens: ⛔', error);
        }
    }

    private async insertMealsParticipants(data: any[]): Promise<void> {
        try {
            const stmt = this.db.prepare(`
                INSERT INTO ${this.tableNameMap.get('meals_participants')} (meal_id, participant_id, date_served)
                VALUES (?, ?, ?)
            `);
            data.forEach(row => {
                stmt.run([
                    row.meal_id ?? row.meals_id, // support both meal_id and meals_id
                    row.participant_id,
                    row.date_served
                ]);
            });
            stmt.free();
            console.log("Inserted meals_participants successfully. ✅");
        } catch (error) {
            console.error('Error inserting meals_participants: ⛔', error);
        }
    }

    private async insertMealsSupervisors(data: any[]): Promise<void> {
        try {
            const stmt = this.db.prepare(`
                INSERT INTO ${this.tableNameMap.get('meals_supervisors')} (meal_id, supervisor_id, date_served)
                VALUES (?, ?, ?)
            `);
            data.forEach(row => {
                stmt.run([
                    row.meal_id,
                    row.supervisor_id,
                    row.date_served
                ]);
            });
            stmt.free();
            console.log("Inserted meals_supervisors successfully. ✅");
        } catch (error) {
            console.error('Error inserting meals_supervisors: ⛔', error);
        }
    }

    private async insertParticipantsSessions(data: any[]): Promise<void> {
        try {
            const stmt = this.db.prepare(`
                INSERT INTO ${this.tableNameMap.get('sessions_participants')} (session_id, participant_id)
                VALUES (?, ?)
            `);
            data.forEach(row => {
                stmt.run([
                    row.session_id,
                    row.participant_id
                ]);
            });
            stmt.free();
            console.log("Inserted sessions_participants successfully. ✅");
        } catch (error) {
            console.error('Error inserting sessions_participants: ⛔', error);
        }
    }

    private async insertAllergensMeals(data: any[]): Promise<void> {
        try {
            const stmt = this.db.prepare(`
                INSERT INTO ${this.tableNameMap.get('allergens_meals')} (allergen_id, meal_id)
                VALUES (?, ?)
            `);
            data.forEach(row => {
                stmt.run([
                    row.allergen_id,
                    row.meal_id
                ]);
            });
            stmt.free();
            console.log("Inserted allergens_meals successfully. ✅");
        } catch (error) {
            console.error('Error inserting allergens_meals: ⛔', error);
        }
    }

    private async insertSupervisorsAllergens(data: any[]): Promise<void> {
        try {
            const stmt = this.db.prepare(`
                INSERT INTO ${this.tableNameMap.get('supervisors_allergens')} (supervisor_id, allergen_id)
                VALUES (?, ?)
            `);
            data.forEach(row => {
                stmt.run([
                    row.supervisor_id,
                    row.allergen_id
                ]);
            });
            stmt.free();
            console.log("Inserted supervisors_allergens successfully. ✅");
        } catch (error) {
            console.error('Error inserting supervisors_allergens: ⛔', error);
        }
    }

    private async insertSessionsSupervisors(data: any[]): Promise<void> {
        try {
            const stmt = this.db.prepare(`
                INSERT INTO ${this.tableNameMap.get('sessions_supervisors')} (session_id, supervisor_id)
                VALUES (?, ?)
            `);
            data.forEach(row => {
                stmt.run([
                    row.session_id,
                    row.supervisor_id
                ]);
            });
            stmt.free();
            console.log("Inserted sessions_supervisors successfully. ✅");
        } catch (error) {
            console.error('Error inserting sessions_supervisors: ⛔', error);
        }
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