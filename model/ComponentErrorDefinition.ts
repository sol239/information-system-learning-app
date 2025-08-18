import type { VariableError } from "./VariableError";

export class ComponentErrorDefinition {
    public componentFilename: string;
    public variableError: VariableError[];

    constructor(componentFilename: string, variableError: VariableError[]) {
        this.componentFilename = componentFilename;
        this.variableError = variableError;
    }

    public addVariableError(variableError: VariableError) {
        this.variableError.push(variableError);
    }

}