/* eslint-disable @typescript-eslint/no-extraneous-class */
import { ColumnType } from './ColumnType';
import { Operation } from './Operation/Operation';
import { OperationResultType } from './Operation/OperationResultType';
import initSqlJs, { type Database } from 'sql.js';
import { getSqlWasmPath } from './sqlWasmPath';

export class SqljsDatabaseFactory {

    /**
     * Creates an in-memory SQLite database by executing a raw SQL script (e.g. create_schema.sql).
     * @param sql The full SQL script to execute.
     */
    public static async createDatabaseFromSql(sql: string): Promise<Operation<Database | null>> {
        try {
            const SQL = await initSqlJs({
                locateFile: getSqlWasmPath
            });
            const db = new SQL.Database();
            db.run(sql);
            return new Operation<Database | null>(OperationResultType.SUCCESS, "Database created successfully", db);
        } catch (error) {
            return new Operation<Database | null>(OperationResultType.ERROR, `Error creating database from SQL: ${error}`, null);
        }
    }

    /**
     * Creates an in-memory SQLite database from the provided CSV file contents. 
     * @param csvFilesContent A record where the key is the CSV file name (used as the table name) and the value is the content of the CSV file as a string. 
     * @returns An Operation containing the created Database instance if successful, or an error message if there was an issue during table creation or data insertion. 
     */
    public static async createDatabase(csvFilesContent: Record<string, string>): Promise<Operation<Database | null>> {
        const SQL = await initSqlJs({
            locateFile: getSqlWasmPath
        });

        const db = new SQL.Database();
        let isSuccessful = true;

        // 1) CREATE TABLES
        for (const [filename, content] of Object.entries(csvFilesContent)) {

            // the 1st line of the csv file
            const lines: string[] = content.split('\n');

            if (content.trim() === '') {
                return new Operation<Database | null>(OperationResultType.ERROR, `Error creating table ${filename}: No content`, null);
            }

            const headerLine: string = lines[0];
            const result = this.getCreateTableSql(filename, headerLine);
            if (result.result === OperationResultType.SUCCESS && result.data) {
                const createTableSql = result.data;
                try {
                    db.run(createTableSql);
                } catch (error) {
                    isSuccessful = false;
                    return new Operation<Database | null>(OperationResultType.ERROR, `Error creating table ${filename}: ${error}`, null);
                }
            } else {
                return new Operation<Database | null>(OperationResultType.ERROR, result.message, null);
            }
        }

        // 2) INSERT DATA
        for (const [filename, content] of Object.entries(csvFilesContent)) {
            const lines: string[] = content.split('\n');

            if (content.trim() === '') {
                return new Operation<Database | null>(OperationResultType.ERROR, `Error creating table ${filename}: No content`, null);
            }

            const headerLine: string = lines[0];
            const tableName: string = filename;
            const dataLines: string[] = lines.slice(1).filter(line => line.trim() !== '');
            const result = this.GetInsertDataSql(tableName, headerLine, dataLines);
            if (result.result === OperationResultType.SUCCESS && result.data) {
                const insertDataSql = result.data;
                try {
                    db.run(insertDataSql);
                } catch (error) {
                    isSuccessful = false;
                    return new Operation<Database | null>(OperationResultType.ERROR, `Error inserting data into table ${filename}: ${error}`, null);
                }
            } else {
                return new Operation<Database | null>(OperationResultType.ERROR, result.message, null);
            }
        }
        if (isSuccessful) {
            return new Operation<Database | null>(OperationResultType.SUCCESS, "Database created successfully", db);
        } else {
            return new Operation<Database | null>(OperationResultType.ERROR, "Error creating database", null);
        }
    }

    /**
     * Generates a CREATE TABLE SQL statement based on the CSV header line.
     * @param csvName The name of the CSV file (used as the table name)
     * @param csvHeader The header line of the CSV file, defining column names and types in the format "columnName[columnType]"
     * @returns An Operation containing the generated SQL statement or an error message if the header format is invalid or contains unsupported column types.
     */
    public static getCreateTableSql(csvName: string, csvHeader: string): Operation<string> {
        const tableName = csvName;

        const columns: string[] = [];
        for (const col of csvHeader.split(',')) {
            const match = col.trim().match(/^(.+?)\[(.+?)\]$/);
            if (!match) {
                return new Operation<string>(OperationResultType.ERROR, `Invalid column definition: "${col}". Expected format: "columnName[columnType]". The actual line was: ${csvHeader} in file: ${csvName}`, '');
            }
            const [, colName, colType] = match;
            if (!Object.values(ColumnType).includes(colType as ColumnType)) {
                return new Operation<string>(OperationResultType.ERROR, `Unsupported column type: "${colType}". Supported types are: ${Object.values(ColumnType).join(', ')}`, '');
            }
            columns.push(`${colName} ${colType}`);
        }
        const sql: string = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns.join(', ')});`;
        return new Operation<string>(OperationResultType.SUCCESS, "Sql generated successfully", sql);
    }

    /**
     * Generates an INSERT INTO SQL statement for the given table name, header line, and data lines.
     * @param tableName The name of the table to insert data into
     * @param headerLine The header line of the CSV file, defining column names and types in the format "columnName[columnType]"
     * @param dataLines An array of data lines from the CSV file, where each line corresponds to a row of data to be inserted
     * @returns An Operation containing the generated SQL statement or an error message if the data lines are malformed.
     */
    public static GetInsertDataSql(tableName: string, headerLine: string, dataLines: string[]): Operation<string> {
        const columnDefs = headerLine.split(',').map(col => {
            const match = col.trim().match(/^(.+?)\[(.+?)\]$/);
            return { name: match![1], type: match![2] as ColumnType };
        });
        const columnNames = columnDefs.map(c => c.name);
        const values = dataLines.map(line => {
            // Very simple CSV split handling: split by comma but respect double quotes
            // Note: This regex ignores commas inside double quotes.
            const cols = [];
            let inQuotes = false;
            let current = "";
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                    // Don't add double quote to out value if it's bounding quotes
                    if (i === 0 || i === line.length - 1 || line[i-1] === ',' || line[i+1] === ',') continue;
                }
                if (char === ',' && !inQuotes) {
                    cols.push(current);
                    current = "";
                } else {
                    current += char;
                }
            }
            cols.push(current);

            // Now map the parsed columns
            const finalCols = cols.map((col, i) => {
                let val = col.trim();
                // Strip bounding double quotes if present and inside we're a string
                if (val.startsWith('"') && val.endsWith('"')) {
                    val = val.substring(1, val.length - 1);
                }
                const colType = columnDefs[i]?.type;
                if (colType === ColumnType.INTEGER || colType === ColumnType.REAL) {
                    return val;
                }
                return `'${val.replace(/'/g, "''")}'`;
            });
            return `(${finalCols.join(', ')})`;
        }).join(', ');
        const sql: string = `INSERT INTO ${tableName} (${columnNames.join(', ')}) VALUES ${values};`;
        return new Operation<string>(OperationResultType.SUCCESS, "Sql generated successfully", sql);
    }

    public static async toBinary(db: Database): Promise<Operation<Uint8Array>> {
        try {
            const binaryData = new Uint8Array(db.export());
            return new Operation<Uint8Array>(OperationResultType.SUCCESS, "Database exported successfully", binaryData);
        } catch (error) {
            return new Operation<Uint8Array>(OperationResultType.ERROR, `Error exporting database: ${error}`, null);
        }
    }

    public static async fromBinary(data: Uint8Array): Promise<Operation<Database>> {
        try {
            if (!data || data.length === 0) {
                return new Operation<Database>(OperationResultType.ERROR, "No data provided for database import", null);
            }
            const SQL = await initSqlJs({
                locateFile: getSqlWasmPath
            });
            const db = new SQL.Database(data);
            return new Operation<Database>(OperationResultType.SUCCESS, "Database loaded successfully", db);
        } catch (error) {
            return new Operation<Database>(OperationResultType.ERROR, `Error loading database: ${error}`, null);
        }
    }

}
