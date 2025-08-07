export class VariableError {
    public variableName: string;
    public variableValue: string;

    constructor(variableName: string, variableValue: string) {
        this.variableName = variableName;
        this.variableValue = variableValue;
    }
}