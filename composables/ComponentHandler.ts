import { useErrorComponentStore } from "#imports";
import { ComponentErrorDefinition } from "~/model/ComponentErrorDefinition";
import { useComponentCodeStore } from "#imports";
import { TaskQueue } from "~/composables/TaskQueue";
import { useSelectedTaskStore } from "#imports";

export class ComponentHandler {
    public static getComponentMap(round: number): ComponentErrorDefinition[] {
        const errorComponentStore = useErrorComponentStore();
        const componentCodeStore = useComponentCodeStore();

        const tasks = TaskQueue.getTasks(round);
        const notCompletedTasks = tasks.filter(task => !task.completed && task.round === round);

        const errorDefinitions: ComponentErrorDefinition[] = [];
        for (const task of notCompletedTasks) {
            const errorComps = task.errorComponents ?? [];
            if (Array.isArray(errorComps) && errorComps.length > 0) {
                for (const comp of errorComps) {
                    const overrides: Record<string, string> = {};
                    if (comp.variables && typeof comp.variables === 'object') {
                        for (const [varName, varValue] of Object.entries(comp.variables)) {
                            overrides[varName] = varValue as string;
                        }
                    }
                    // Support both 'id' and 'name' for component identification
                    const componentId = comp.id || comp.name;
                    const def = new ComponentErrorDefinition(componentId, overrides);
                    errorDefinitions.push(def);

                    // if store does not already contain the definition add it
                    if (!errorComponentStore.errorComponents.some(existingComp => existingComp.componentId === def.componentId)) {
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
        console.log("ERROR COMPONENTS:", componentErrors)
        console.log("Filename: ", componentFilename, "| Variable: ", variableName)
        for (const component of componentErrors) {
            if (component.componentId === componentFilename) {
                console.log("Found component: ", component.componentId)
                return component.overrides[variableName];
            }
        }
        return undefined;
    }

    public static setVariableValue(componentFilename: string, variableName: string, variableValue: string) {
        const errorComponentStore = useErrorComponentStore();
        const componentCodeStore = useComponentCodeStore();
        const componentErrors = errorComponentStore.errorComponents;
        console.log("Setting new value. Filename: ", componentFilename, "| Variable: ", variableName)

        for (const component of componentErrors) {
            console.log("Checking component: ", component.componentId);
            if (component.componentId === componentFilename) {
                console.log("Found component: ", component.componentId);
                component.overrides[variableName] = variableValue;
                
                // Also update the component store with the new value
                if (variableName === 'html' || variableName === 'css' || variableName === 'js' || variableName === 'sql') {
                    componentCodeStore.updateComponentCodeByType(componentFilename, variableName as any, variableValue);
                }
            }
        }
    }

    public static isInErrorComponents(componentFilename: string): boolean {
        const errorComponentStore = useErrorComponentStore();
        return errorComponentStore.errorComponents.some(ec => ec.componentId === componentFilename);
    }
}