import { useErrorComponentStore } from "#imports";
import { ComponentErrorDefinition } from "~/model/ComponentErrorDefinition";
import { VariableError } from "~/model/VariableError";
import { useComponentCodeStore } from "#imports";

export class ComponentHandler {
    public static getComponentMap(round: number): ComponentErrorDefinition[] {
        const errorComponentStore = useErrorComponentStore();
        const componentCodeStore = useComponentCodeStore();

        const tasks = TaskQueue.getTasks(round);
        const notCompletedTasks = tasks.filter(task => !task.completed && task.round === round);

        const errorDefinitions: ComponentErrorDefinition[] = [];
        for (const task of notCompletedTasks) {
            const errorComps = task.errorComponents ?? task['error-components'] ?? [];
            if (Array.isArray(errorComps) && errorComps.length > 0) {
                for (const comp of errorComps) {
                    const variableErrors: VariableError[] = [];
                    if (comp.variables && typeof comp.variables === 'object') {
                        for (const [varName, varValue] of Object.entries(comp.variables)) {
                            variableErrors.push(new VariableError(varName, varValue as string));
                        }
                    }
                    const def = new ComponentErrorDefinition(comp.name, variableErrors);
                    errorDefinitions.push(def);

                    // if store does not already contain the definition add it
                    if (!errorComponentStore.errorComponents.some(existingComp => existingComp.componentFilename === def.componentFilename)) {
                        errorComponentStore.addErrorComponent(def);
                    }
                }
            }
        }

        return errorDefinitions;
    }

    public static getVariableValue(componentFilename: string, variableName: string): string | undefined {
        const errorComponentStore = useErrorComponentStore();
        const componentErrors = errorComponentStore.errorComponents;
        console.log("Filename: ", componentFilename, "| Variable: ", variableName)
        for (const component of componentErrors) {
            if (component.componentFilename === componentFilename) {
                const variableError = component.variableError.find(v => v.variableName === variableName);
                if (variableError) {
                    return variableError.variableValue;
                }
            }
        }
        return undefined; 
    }

    public static setVariableValue(componentFilename: string, variableName: string, variableValue: string) {
        const errorComponentStore = useErrorComponentStore();
        const componentErrors = errorComponentStore.errorComponents;
        console.log("Setting new value. Filename: ", componentFilename, "| Variable: ", variableName)

        for (const component of componentErrors) {
            console.log("Checking component: ", component.componentFilename);
            if (component.componentFilename === componentFilename) {
                console.log("Found component: ", component.componentFilename);
                const variableError = component.variableError.find(v => v.variableName === variableName);
                if (variableError) {
                    variableError.variableValue = variableValue;
                }
            }
        }
    }
}