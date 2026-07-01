import type { QueryExecResult } from "sql.js";
import type { ColumnDefinition } from "~/utils/ColumnDefinition";
import { TableMap } from "./TableMap";
import { ColumnType } from "~/utils/ColumnType";
import type { ComponentVariables } from "~/model/ComponentVariables";


export class SqlHandler {

    public static ReplaceSqlForVariablesInRecord(variables: ComponentVariables, sqlRecord: Record<string, string>): Record<string, string> {
        const result: Record<string, string> = {};
        for (const [key, sql] of Object.entries(sqlRecord)) {
            result[key] = this.ReplaceSqlForVariables(variables, sql);
        }
        return result;
    }

    public static ReplaceSqlForVariables(variables: ComponentVariables, sql: string): string {
        if (!sql) return "";

        let result = sql;
        // Merge with priority: general < js (later entries win)
        const allVariables = [...(variables.generalVariables ?? []), ...(variables.jsVariables ?? [])];

        for (const { name: key, variable: value } of allVariables) {
            const escapedKey = key.replace(/([\\$])/g, '\\$1');
            const regex = new RegExp(`(?:\\{\\{\\s*)?(?<![a-zA-Z0-9_$])${escapedKey}(?![a-zA-Z0-9_$])(?:\\s*\\}\\})?`, 'g');

            let stringValue = "";
            if (Array.isArray(value)) {
                stringValue = value.map(v => v instanceof Date ? v.toISOString() : String(v)).join(", ");
            } else if (value instanceof Date) {
                stringValue = value.toISOString();
            } else if (value !== null && value !== undefined) {
                stringValue = String(value);
            }

            result = result.replace(regex, stringValue);
        }

        return result;
    }

    public static GetSqlVariableNamesFromRecord(sqlRecord: Record<string, string>, tableColumnMap: Record<string, ColumnDefinition[]>, results: QueryExecResult[]): TableMap[] {
        let allTableMaps: TableMap[] = [];

        for (const [queryName, sql] of Object.entries(sqlRecord)) {
            const tableMapsForQuery = this.GetSqlVariableNames(sql, tableColumnMap, results);
            allTableMaps = [...allTableMaps, ...tableMapsForQuery];
        }
        return allTableMaps;

    }

    // TODO: all column names with no distinction between tables --->fix
    public static GetSqlVariableNames(sql: string, tableColumnMap: Record<string, ColumnDefinition[]>, results: QueryExecResult[]): TableMap[] {

        const tableNames = Object.keys(tableColumnMap);

        if (!results || results.length === 0 || !results[0]) return [];
        // Safely access .lc or .columns from the result
        const namesToFind: string[] = (results[0] as any).lc || results[0].columns;
        if (!namesToFind) return [];

        const result: TableMap[] = [];

        // transform into string without newlines and multiple spaces
        let cleanedSql = sql.replace(/\s+/g, ' ').trim();

        // toLowerCase and split by space
        cleanedSql = cleanedSql.toLowerCase();

        // replace semicolons with spaces and commas with space comma space
        cleanedSql = cleanedSql.replace(/;/g, ' ');
        cleanedSql = cleanedSql.replace(/,/g, ' , ');
        cleanedSql = cleanedSql.replace(/\s+/g, ' ').trim();

        //console.log("Cleaned SQL: >" + cleanedSql + "<");

        // split into parts
        const parts: string[] = cleanedSql.split(" ");
        if (parts.length === 0) {
            //console.log("No parts found in SQL query.");
            return [];
        }

        //console.log("SQL query parts: ", parts);

        // if is does not start with SELECT, then return empty array
        if (parts[0] !== "select") {
            //console.log("SQL query does not start with SELECT.");
            return [];
        }

        // indexes of AS
        const asIndexes: number[] = parts
            .map((v, i) => (v === "as" ? i : -1))
            .filter(i => i !== -1);
        //console.log(asIndexes);

        // indexes of everything after AS
        const afterAsIndexes: number[] = asIndexes.map(i => i + 1);
        //console.log(afterAsIndexes);

        // indexes of all tables in the query
        const sqlKeywordsBeforeTable = ['from', 'join'];
        const tableIndexes: number[] = parts
            .map((v, i) => {
                const isTable = tableNames.includes(v);
                if (!isTable || i === 0) return -1;
                const previousWord = parts[i - 1];
                const hasCorrectContext = sqlKeywordsBeforeTable.includes(previousWord as string);
                return hasCorrectContext ? i : -1;
            })
            .filter(i => i !== -1);
        //console.log(tableIndexes);

        // To fix the "all column names with no distinction between tables" issue, 
        // we isolate the tables that are actually used in the query.
        const queryTableNames = tableIndexes.map(i => parts[i] as string);
        const tablesToUseForColumns = queryTableNames.length > 0 ? queryTableNames : tableNames;
        const columnNames = tablesToUseForColumns.flatMap(table => tableColumnMap[table as string]?.map((cd: ColumnDefinition) => cd.columnName) ?? []);

        for (const name of namesToFind) {

            // check for ambiguity among only the queried tables
            if (columnNames.filter(cn => cn === name).length > 1) {
                return [];
            }

            // check whether the name is in the columns of queried tables
            if (columnNames.includes(name)) {
                const tableName = tablesToUseForColumns.find(table => tableColumnMap[table as string]?.some((cd: ColumnDefinition) => cd.columnName === name));
                if (tableName) {
                    const columnType = tableColumnMap[tableName as string]?.find((cd: ColumnDefinition) => cd.columnName === name)?.columnType ?? ColumnType.INVALID;
                    result.push(new TableMap(tableName, name, name, columnType));
                }
                continue;
            } else {
                const afterAsIndex = afterAsIndexes.find(i => parts[i] === name);
                if (afterAsIndex) {
                    const asIndex = afterAsIndex - 1;
                    const tableColonColumnPart = parts[asIndex - 1];

                    if (tableColonColumnPart && tableColonColumnPart.includes('.')) {
                        const beforeDotPart: string = tableColonColumnPart.split('.')[0] as string;
                        const afterDotPart: string = tableColonColumnPart.split('.')[1] as string;

                        // look for +1 indexes after tableIndexes, if any matches beforeDotPart, then we have a match
                        const incrementedTableIndexes = tableIndexes.map(i => i + 1);
                        const aliasIndex = incrementedTableIndexes.find(i => parts[i] === beforeDotPart);
                        if (aliasIndex) {
                            const tableIndex = aliasIndex - 1;
                            const tableName = parts[tableIndex] as string;
                            const columnType = tableColumnMap[tableName as string]?.find((cd: ColumnDefinition) => cd.columnName === afterDotPart)?.columnType ?? ColumnType.INVALID;
                            result.push(new TableMap(tableName, afterDotPart, name, columnType, beforeDotPart));
                        } else {
                            result.push(new TableMap(null, null, name, ColumnType.REAL));
                        }
                    } else if (tableColonColumnPart) {
                        const originalColumn = tableColonColumnPart;
                        if (columnNames.filter(cn => cn === originalColumn).length === 1) {
                            const tableName = tablesToUseForColumns.find(table => tableColumnMap[table as string]?.some((cd: ColumnDefinition) => cd.columnName === originalColumn));
                            if (tableName) {
                                const columnType = tableColumnMap[tableName as string]?.find((cd: ColumnDefinition) => cd.columnName === originalColumn)?.columnType ?? ColumnType.INVALID;
                                result.push(new TableMap(tableName, originalColumn, name, columnType));
                            } else {
                                result.push(new TableMap(null, null, name, ColumnType.REAL));
                            }
                        } else {
                            result.push(new TableMap(null, null, name, ColumnType.REAL));
                        }
                    }
                } else {
                    result.push(new TableMap(null, null, name, ColumnType.REAL));
                }
            }
        }

        return result;

    }

}