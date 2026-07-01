import * as ts from "typescript";
import type { VariableType } from "~/model/types/VariableType";
import { Variable } from "~/model/ComponentVariables";

export class JsHandler {
    public static getVariablesIntoJs(variables: Variable[]): string {
        let result: string = "";
        const uniqueVariables = new Map<string, Variable>();

        for (const variable of variables) {
            uniqueVariables.set(variable.name, variable);
        }

        for (const { name: key, variable } of uniqueVariables.values()) {
            const isArray = Array.isArray(variable);
            const samples = isArray ? (variable as any[]) : [variable];

            if (samples.length === 0 || samples[0] === undefined) continue;

            const firstValue = samples[0];
            let tsType = "string";

            if (firstValue === null) tsType = "null";
            else if (typeof firstValue === "number") tsType = "number";
            else if (typeof firstValue === "boolean") tsType = "boolean";
            else if (firstValue instanceof Date) tsType = "Date";

            const formatValue = (v: any) => {
                if (typeof v === "string") return JSON.stringify(v);
                if (v instanceof Date) return `new Date("${v.toISOString()}")`;
                return v;
            };

            if (isArray && (variable as any[]).length === 1) {
                // Single-item array: emit a scalar variable
                result += `const ${key}: ${tsType} = ${formatValue((variable as any[])[0])};\n`;
            } else if (isArray) {
                const valuesStr = (variable as any[]).map(formatValue).join(", ");
                result += `const ${key}: ${tsType}[] = [${valuesStr}];\n`;
            } else {
                result += `const ${key}: ${tsType} = ${formatValue(variable)};\n`;
            }
        }
        return result;
    }

    public static getSqlVariablesIntoJs(sqlVariables: Variable[]): string {
        return this.getVariablesIntoJs(sqlVariables);
    }

    public static getJsVariables(
        jsCode: string,
        userCodeOnly?: string,
        runtimeContext: Record<string, unknown> = {}
    ): Variable[] {
        const result: Variable[] = [];
        if (!jsCode) return result;

        const declaredNames = this.getDeclaredVariableNames(userCodeOnly ?? jsCode);

        if (declaredNames.length === 0) return result;

        // Step 2: execute the code and read variable values at runtime
        // Strip TypeScript type annotations so new Function can run it as plain JS
        const strippedCode = ts.transpileModule(jsCode, {
            compilerOptions: { target: ts.ScriptTarget.ES2017 }
        }).outputText;

        const exportObject = declaredNames.map(n => `"${n}": typeof ${n} !== 'undefined' ? ${n} : undefined`).join(', ');
        const contextNames = Object.keys(runtimeContext);
        const contextValues = contextNames.map(name => runtimeContext[name]);
        const fn = new Function(...contextNames, `${strippedCode}\nreturn ({ ${exportObject} });`);
        const evaluated: Record<string, any> = fn(...contextValues);

        for (const name of declaredNames) {
            const value = evaluated[name];
            if (value === undefined) continue;

            let finalValue: VariableType | VariableType[];

            if (value === null || typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean' || value instanceof Date) {
                finalValue = value;
            } else if (Array.isArray(value)) {
                finalValue = (value as any[]).filter(v =>
                    v === null || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || v instanceof Date
                ) as VariableType[];
            } else {
                finalValue = String(value);
            }

            result.push(new Variable(name, finalValue));
        }

        return result;
    }

    public static getDeclaredVariableNames(jsCode: string): string[] {
        const sourceForNames = ts.createSourceFile(
            'virtual-file.js',
            jsCode,
            ts.ScriptTarget.Latest,
            true
        );

        const declaredNames: string[] = [];

        function visitNode(node: ts.Node) {
            if (ts.isVariableDeclaration(node) && node.name && ts.isIdentifier(node.name)) {
                declaredNames.push(node.name.text);
            }
            ts.forEachChild(node, visitNode);
        }
        visitNode(sourceForNames);

        return declaredNames;
    }
}
