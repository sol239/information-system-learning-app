import { useComponentCodeStore } from "#imports";
import { useSelectedSystemStore } from "#imports";
import { ComponentHandler } from "~/composables/ComponentHandler";

export class TaskAnswerEval {

    public static areResultsEqual(a: any[], b: any[]): boolean {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) return false;
        }
        return true;
    }

    public static getAnswerType(taskAnswer: string): string {
        const trimmedAnswer = taskAnswer.trim();
        const answerType: string = trimmedAnswer.split('==')[0].trim().split("-")[0].trim();
        return answerType;
    }

    public static getQuestions(taskAnswer: string): string[] {
        const trimmedAnswer = taskAnswer.trim();
        const questionPart = trimmedAnswer.split('==')[1]?.trim();
        if (!questionPart) return [];
        return questionPart.split(';').map(q => q.trim().split(":")[1]).filter(q => q);
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

            if (componentId.includes("sql") || componentId.endsWith("-sql")) {
                // Handle both old format (stats-meals-sql) and new format (stats-meals with sql type)
                let actualSql: string;
                if (componentId.endsWith("-sql")) {
                    // Old format: extract component id and get sql code
                    const baseComponentId = componentId.replace("-sql", "");
                    
                    // First check if there's an error component with overridden SQL
                    if (ComponentHandler.isInErrorComponents(baseComponentId)) {
                        const errorSql = ComponentHandler.getVariableValue(baseComponentId, "sql");
                        actualSql = errorSql || componentCodeStore.getComponentCodeByType(baseComponentId, 'sql');
                    } else {
                        actualSql = componentCodeStore.getComponentCodeByType(baseComponentId, 'sql');
                    }
                } else {
                    // New format: direct sql component reference
                    actualSql = await componentCodeStore.getComponentCode(componentId);
                }
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
            } else if (componentId.includes("js") || componentId.endsWith("-js")) {
                // Handle JS components
                let actualJs: string;
                if (componentId.endsWith("-js")) {
                    const baseComponentId = componentId.replace("-js", "");
                    
                    // First check if there's an error component with overridden JS
                    if (ComponentHandler.isInErrorComponents(baseComponentId)) {
                        const errorJs = ComponentHandler.getVariableValue(baseComponentId, "js");
                        actualJs = errorJs || componentCodeStore.getComponentCodeByType(baseComponentId, 'js');
                    } else {
                        actualJs = componentCodeStore.getComponentCodeByType(baseComponentId, 'js');
                    }
                } else {
                    actualJs = await componentCodeStore.getComponentCode(componentId);
                }
                
                if (expectedAnswer === actualJs) {
                    console.log("JS code matches!");
                    continue;
                } else {
                    console.log("JS code does not match expected value.");
                    areAnswersCorrect = false;
                    break;
                }
            } else if (componentId.includes("html") || componentId.endsWith("-html")) {
                // Handle HTML components
                let actualHtml: string;
                if (componentId.endsWith("-html")) {
                    const baseComponentId = componentId.replace("-html", "");
                    
                    // First check if there's an error component with overridden HTML
                    if (ComponentHandler.isInErrorComponents(baseComponentId)) {
                        const errorHtml = ComponentHandler.getVariableValue(baseComponentId, "html");
                        actualHtml = errorHtml || componentCodeStore.getComponentCodeByType(baseComponentId, 'html');
                    } else {
                        actualHtml = componentCodeStore.getComponentCodeByType(baseComponentId, 'html');
                    }
                } else {
                    actualHtml = await componentCodeStore.getComponentCode(componentId);
                }
                
                if (expectedAnswer === actualHtml) {
                    console.log("HTML code matches!");
                    continue;
                } else {
                    console.log("HTML code does not match expected value.");
                    areAnswersCorrect = false;
                    break;
                }
            } else if (componentId.includes("js")) {
                // Add JS comparison logic here if needed
            } else if (componentId.includes("opt")) {
                return false;
            }
        }
        return areAnswersCorrect;
    }
}