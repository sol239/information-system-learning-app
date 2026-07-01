import type {VariableType} from "~/model/types/VariableType";

export class TableMap {
    constructor(public tableName: string | null, public columnName: string | null, public variableAsName: string, public columnType: ColumnType, public tableAlias?: string) { }

    public toString(): string {
        if (this.tableName === null || this.columnName === null) {
            return `${this.variableAsName}`;
        }
        if (this.tableAlias) {
            return `${this.tableAlias}.${this.columnName} as ${this.variableAsName}`;
        } else {
            return `${this.tableName}.${this.columnName} as ${this.variableAsName}`;
        }
    }

    public static getVariableTypeFromColumnType(columnType: ColumnType): VariableType {
        switch (columnType) {
            case ColumnType.INTEGER:
                return "number";
            case ColumnType.REAL:
                return "number";
            case ColumnType.TEXT:
                return "string";
            case ColumnType.DATE:
                return new Date();
            default:
                return "string";
        }
    }
}
