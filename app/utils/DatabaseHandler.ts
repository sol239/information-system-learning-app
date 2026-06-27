import type { Database } from "sql.js";
import { Operation } from "./Operation/Operation";
import { OperationResultType } from "./Operation/OperationResultType";
import { ColumnType } from "./ColumnType";
import { ColumnDefinition } from "./ColumnDefinition";

// TODO: Write unit & integration tests

/**
 * Utility class for handling database operations.
 */
export class DatabaseHandler {



    /**
     * Executes a query on the database.
     * @param db The database to be handled.
     * @param query The query to execute.
     * @returns An Operation containing the result of the query.
     */
    public static async query(db: Database, query: string): Promise<Operation<any>> {
        try {
            const result = db.exec(query);
            return new Operation<any>(OperationResultType.SUCCESS, "Query executed successfully", result);
        } catch (error) {
            return new Operation<any>(OperationResultType.ERROR, `Error executing query: ${error}`, null);
        }
    }

    /**
     * Executes a query on the database.
     * @param db The database to be handled.
     * @param query The query to execute.
     * @returns An Operation containing the result of the query.
     */
    public static async execute(db: Database, query: string): Promise<Operation<null>> {
        try {
            db.run(query);
            return new Operation<null>(OperationResultType.SUCCESS, "Query executed successfully", null);
        } catch (error) {
            return new Operation<null>(OperationResultType.ERROR, `Error executing query: ${error}`, null);
        }
    }

    /**
     * Retrieves the names of all tables in the database.
     * @param db The database to be handled.
     * @returns An Operation containing an array of table names.
     */
    public static async getTableNames(db: Database): Promise<Operation<string[]>> {
        try {
            const result = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name != 'sqlite_sequence';");
            const names: string[] = [];
            const firstResult = result[0];
            if (firstResult?.values) {
                for (const row of firstResult.values) {
                    if (row && row[0] != null) {
                        names.push(row[0].toString());
                    }
                }
            }
            return new Operation<string[]>(OperationResultType.SUCCESS, "Table names retrieved successfully", names);
        } catch (error) {
            return new Operation<string[]>(OperationResultType.ERROR, `Error retrieving table names: ${error}`, null);
        }
    }

    /**
     * Validates whether a SQL string can be prepared by the database engine.
     * @param db The database to validate against.
     * @param query The SQL string to validate.
     * @returns An Operation with data=true if valid, false otherwise.
     */
    public static async isSqlValid(db: Database, query: string): Promise<Operation<boolean>> {
        if (!db) {
            return new Operation<boolean>(OperationResultType.ERROR, 'Database not initialized', false);
        }
        if (!query || query.trim().length === 0) {
            return new Operation<boolean>(OperationResultType.ERROR, 'SQL query is empty', false);
        }
        try {
            const stmt = db.prepare(query);
            stmt.free();
            return new Operation<boolean>(OperationResultType.SUCCESS, 'SQL query is valid', true);
        } catch (error) {
            return new Operation<boolean>(OperationResultType.ERROR, `SQL validation error: ${error}`, false);
        }
    }

    /**
     * Retrieves the column names of a table.
     * @param db The database to query.
     * @param tableName The name of the table.
     * @returns An Operation containing an array of column name strings.
     */
    public static async GetColumnNames(db: Database, tableName: string): Promise<Operation<string[]>> {
        try {
            const stmt = db.prepare(`SELECT * FROM "${tableName}" LIMIT 0`);
            const columns = stmt.getColumnNames();
            stmt.free();
            if (columns.length === 0) {
                return new Operation<string[]>(OperationResultType.ERROR, `No columns found for table "${tableName}"`, null);
            }
            return new Operation<string[]>(OperationResultType.SUCCESS, 'Column names retrieved successfully', columns);
        } catch (error) {
            return new Operation<string[]>(OperationResultType.ERROR, `Error retrieving column names: ${error}`, null);
        }
    }

    /**
     * Retrieves the column types of a table.
     * @param db The database to query.
     * @param tableName The name of the table.
     * @returns An Operation containing a record mapping column name to ColumnType.
     */
    public static async getColumnTypes(db: Database, tableName: string): Promise<Operation<Record<string, ColumnType>>> {
        try {
            const result = db.exec(`PRAGMA table_info(${tableName})`);
            if (!result || result.length === 0 || !result[0]) {
                return new Operation<Record<string, ColumnType>>(OperationResultType.ERROR, `No table info found for "${tableName}"`, null);
            }
            const rows = result[0].values;
            const typeMap: Record<string, ColumnType> = {};
            for (const row of rows) {
                const colName = row[1] as string;
                const colType = (row[2] as string).toUpperCase();
                const known = Object.values(ColumnType).includes(colType as ColumnType)
                    ? (colType as ColumnType)
                    : ColumnType.INVALID;
                typeMap[colName] = known;
            }
            return new Operation<Record<string, ColumnType>>(OperationResultType.SUCCESS, 'Column types retrieved successfully', typeMap);
        } catch (error) {
            return new Operation<Record<string, ColumnType>>(OperationResultType.ERROR, `Error retrieving column types: ${error}`, null);
        }
    }

    public static async getTableColumnMap(db: Database): Promise<Operation<Record<string, ColumnDefinition[]>>> {
        const tableNamesResult = await this.getTableNames(db);
        if (tableNamesResult.result !== OperationResultType.SUCCESS) {
            return new Operation<Record<string, ColumnDefinition[]>>(OperationResultType.ERROR, `Error retrieving table names: ${tableNamesResult.message}`, null);
        }
        const map: Record<string, ColumnDefinition[]> = {};
        for (const tableName of tableNamesResult.data!) {
            const typesResult = await this.getColumnTypes(db, tableName);
            if (typesResult.result !== OperationResultType.SUCCESS) {
                return new Operation<Record<string, ColumnDefinition[]>>(OperationResultType.ERROR, `Error retrieving column types for table "${tableName}": ${typesResult.message}`, null);
            }
            const defs: ColumnDefinition[] = [];
            for (const [colName, colType] of Object.entries(typesResult.data!)) {
                defs.push(new ColumnDefinition(colName, colType));
            }
            map[tableName] = defs;
        }
        return new Operation<Record<string, ColumnDefinition[]>>(OperationResultType.SUCCESS, 'Table column map retrieved successfully', map);
    }

}