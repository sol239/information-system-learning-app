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
                // Add table comparison logic here if needed
            } else if (componentId.includes("js")) {
                // Add JS comparison logic here if needed
            }
        }
        return areAnswersCorrect;
    }
}