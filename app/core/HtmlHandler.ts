import type { ComponentVariables } from "~/model/ComponentVariables";

export class HtmlHandler {
    public static ReplaceHtmlForVariables(variables: ComponentVariables, html: string): string {
        return this.replaceMustacheVariables(variables, html);
    }

    public static ReplaceTextForVariables(variables: ComponentVariables, text: string): string {
        return this.replaceBareVariables(variables, text, false);
    }

    public static ReplaceCssForVariables(variables: ComponentVariables, css: string): string {
        return this.replaceMustacheVariables(variables, css);
    }

    private static replaceMustacheVariables(variables: ComponentVariables, source: string): string {
        if (!source) return "";

        let result = source;
        const allVariables = [...(variables.generalVariables ?? []), ...(variables.sqlVariables ?? []), ...(variables.jsVariables ?? [])];

        for (const { name: key, variable: value } of allVariables) {
            const escapedKey = key.replace(/([\\$])/g, '\\$1');
            const regex = new RegExp(`\\{\\{\\s*${escapedKey}\\s*\\}\\}`, 'g');

            result = result.replace(regex, this.stringifyVariableValue(value));
        }

        return result;
    }

    private static replaceBareVariables(variables: ComponentVariables, source: string, protectSystemIds: boolean): string {
        if (!source) return "";

        let result = source;
        // Merge with priority: general < sql < js (later entries win)
        const allVariables = [...(variables.generalVariables ?? []), ...(variables.sqlVariables ?? []), ...(variables.jsVariables ?? [])];

        for (const { name: key, variable: value } of allVariables) {
            const escapedKey = key.replace(/([\\$])/g, '\\$1');
            const systemPrefixGuard = protectSystemIds ? '(?<!system-)' : '';
            const regex = new RegExp(`${systemPrefixGuard}(?<![a-zA-Z0-9_$])${escapedKey}(?![a-zA-Z0-9_$])`, 'g');

            result = result.replace(regex, this.stringifyVariableValue(value));
        }

        return result;
    }

    private static stringifyVariableValue(value: unknown): string {
        let stringValue = "";
        if (Array.isArray(value)) {
            stringValue = value.map(v => v instanceof Date ? v.toISOString() : String(v)).join(", ");
        } else if (value instanceof Date) {
            stringValue = value.toISOString();
        } else if (value !== null && value !== undefined) {
            stringValue = String(value);
        }

        return stringValue;
    }
}
