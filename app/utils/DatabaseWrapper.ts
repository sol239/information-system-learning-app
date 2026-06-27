import initSqlJs, { type Database } from 'sql.js';
import { DatabaseHandler } from './DatabaseHandler';
import { Operation } from './Operation/Operation';
import { OperationResultType } from './Operation/OperationResultType';
import { getSqlWasmPath } from './sqlWasmPath';
export class DatabaseWrapper {
    /**
       * The special sync number used for forcing reactivity updates when the database is initialized or updated. 
       * Incrementing this number can be used to trigger reactivity in Vue components that depend on the database state.
       */
    public dbNumber: number = 0;

    /**
     * Whether is the database for this information system initialized.
     */
    static async isDatabaseInitialized(wrapper: DatabaseWrapper | null | undefined): Promise<boolean> {
        //console.log("Checking if database is initialized");
        if (!wrapper || wrapper.sqlJsDatabase === null) return false;
        const result = await DatabaseHandler.getTableNames(wrapper.sqlJsDatabase);
        return result.result === OperationResultType.SUCCESS;
    }

    private constructor(
        public sqlJsDatabase: Database | null,
        public binaryData: Uint8Array | null,
        public defaultBinaryData: Uint8Array | null

    ) { }

    static fromInstance(db: Database): DatabaseWrapper {
        return new DatabaseWrapper(db, null, null);
    }

    static fromBinary(data: Uint8Array): DatabaseWrapper {
        return new DatabaseWrapper(null, data, data);
    }

    static fromBinaries(data: Uint8Array, defaultData: Uint8Array): DatabaseWrapper {
        return new DatabaseWrapper(null, data, defaultData);
    }

    public async  resetDatabase(): Promise<void> {
        this.sqlJsDatabase = null;
        this.binaryData = this.defaultBinaryData;
        await this.initializeDatabase();
    }

    public async initializeDatabase(): Promise<void> {
        if (this.sqlJsDatabase !== null) return;
        if (this.binaryData === null) return;

        const SQL = await initSqlJs({
            locateFile: getSqlWasmPath
        });

        this.sqlJsDatabase = new SQL.Database(this.binaryData);
        this.dbNumber++;
        //console.log("Database initialized");
    }

    /**
     * Executes a SELECT query on the database and returns the result rows.
     * @param query The query to execute.
     * @returns An Operation containing the result of the query.
     */
    public async query(query: string): Promise<Operation<any>> {
        if (!this.sqlJsDatabase) return new Operation<any>(OperationResultType.ERROR, "Database not initialized", null);
        const result = await DatabaseHandler.query(this.sqlJsDatabase, query);
        this.dbNumber++;
        return result;
    }

    /**
     * Executes a non-SELECT statement (INSERT, UPDATE, DELETE, DDL) on the database.
     * @param query The statement to execute.
     * @returns An Operation indicating success or failure.
     */
    public async execute(query: string): Promise<Operation<null>> {
        if (!this.sqlJsDatabase) return new Operation<null>(OperationResultType.ERROR, "Database not initialized", null);
        const result = await DatabaseHandler.execute(this.sqlJsDatabase, query);
        this.dbNumber++;
        return result;
    }
}
