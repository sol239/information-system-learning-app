/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
import type { input } from "#build/ui";
import type { VariableType } from "./types/VariableType";

export class Variable {
    constructor(public name: string, public variable: VariableType | VariableType[]) { }

    public toString(): string {
        if (Array.isArray(this.variable)) {
            return `${this.name}: [${this.variable.map(v => v instanceof Date ? v.toISOString() : String(v)).join(", ")}]`;
        } else if (this.variable instanceof Date) {
            return `${this.name}: ${this.variable.toISOString()}`;
        } else {
            return `${this.name}: ${String(this.variable)}`;
        }

    }
}

export class ComponentVariables {
    public generalVariables: Variable[] = [];
    public sqlVariables: Variable[] = [];
    public jsVariables: Variable[] = [];

    public toString(variables: Variable[]): string {
        return variables.map(v => v.toString()).join("\n");
    }
}
