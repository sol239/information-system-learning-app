import { useComponentCodeStore } from "#imports";
import { useSelectedSystemStore } from "#imports";

export class TaskAnswerEval {

    public static areResultsEqual(a: any[], b: any[]): boolean {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) return false;
        }
        return true;
    }

    private static getColumnValueTableMap(tableAnswer: string): Map<string, string[]> {
        const columnValueMap = new Map<string, string[]>();
        const rows = tableAnswer.split(';');
        for (const row of rows) {
            const [column, value] = row.split(':').map(part => part.trim());
            if (column && value) {
                if (value.split(',').length > 1) {
                    const vals: string[] = [];
                    for (const val of value.split(',')) {
                        vals.push(val.trim());
                    }
                    columnValueMap.set(column, vals);
                } else {
                    columnValueMap.set(column, [value]);
                }
            }
        }
        return columnValueMap;
    }

    private static async getTableData(tableName: string, columnName: string): Promise<any[]> {
        const system = useSelectedSystemStore().selectedSystem;
        const query = `SELECT ${columnName} FROM ${tableName}`;
        const results = await system?.db.query(query).results;
        return results || [];
    }

    public static async evaluateTaskAnswer(taskAnswer: string): Promise<boolean> {
        const subAnswers: string[] = taskAnswer.split('&&');
        const componentCodeStore = useComponentCodeStore();
        const selectedSystemStore = useSelectedSystemStore();
        const system = selectedSystemStore.selectedSystem;

        let areAnswersCorrect = true;

        for (const subAnswer of subAnswers) {
            const trimmedAnswer = subAnswer.trim();
            console.log("Evaluating: ", trimmedAnswer);

            const [componentIdRaw, expectedAnswerRaw] = trimmedAnswer.split('==');
            const componentId = componentIdRaw.trim();
            const expectedAnswer = expectedAnswerRaw.trim();

            console.log("Component ID: ", componentId);
            console.log("Expected Value: ", expectedAnswer);

            if (componentId.includes("sql")) {
                const actualSql = await componentCodeStore.getComponentCode(componentId);
                console.log("Component ID contains SQL: ", actualSql);

                if (expectedAnswer === actualSql) {
                    // If queries match then there is no need for comparing queries result
                    console.log("Results match!.");
                    continue;
                } else {
                    console.log("SQL Query does not match expected value.");
                    const actualValue = await system?.db.query(actualSql).results;
                    console.log("Actual Value: ", actualValue);
                    const expectedValue = await system?.db.query(expectedAnswer).results;
                    console.log("Expected Value: ", expectedValue);

                    if (Array.isArray(actualValue) && Array.isArray(expectedValue) && TaskAnswerEval.areResultsEqual(actualValue, expectedValue)) {
                        console.log("Results match!");
                    } else {
                        console.log("Results do not match.");
                        areAnswersCorrect = false;
                        break;
                    }
                }
            } else if (componentId.includes("tbl")) {
                const tableName = componentId.split("tbl-")[1].trim();
                console.log("Evaluating table entity")
                const columnMap = TaskAnswerEval.getColumnValueTableMap(expectedAnswer);
                let query = "SELECT * FROM " + tableName + " WHERE ";

                const conditions: string[] = [];
                for (const [column, values] of columnMap.entries()) {
                    if (values.length > 1) {
                        // Handle JSON array columns - create the exact format stored in DB
                        const jsonArray = JSON.stringify(values); // This creates: ["Lepek","Vejce"]
                        console.log("VALUES:", values);
                        conditions.push(`${column} = '${jsonArray}'`); // Use single quotes to wrap the JSON string
                    } else {
                        conditions.push(`${column} = "${values[0]}"`);
                    }
                }
                query += conditions.join(" AND ");
                query += " LIMIT 1;";    

                console.log(query);

                const result = await system?.db.query(query).results;
                console.log("RESULT: ", result?.length);

                if (!result || result.length === 0) {
                    console.log("Table evaluation failed - no matching records found.");
                    areAnswersCorrect = false;
                    break;
                }
                

                // Add table comparison logic here if needed
            } else if (componentId.includes("js")) {
                // Add JS comparison logic here if needed
            }
        }
        return areAnswersCorrect;
    }
}