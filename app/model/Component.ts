/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentVariables, Variable } from './ComponentVariables';

/**
 * A class representing a UI component.
 */
export class Component {
    id: string;
    name: string;
    description: string;
    html: string;
    css: string;
    js: string;
    js_click: string;
    sql: Record<string, string>;
    sql_click: Record<string, string>;
    tags: string[];
    edited: boolean = false;
    variables: ComponentVariables = new ComponentVariables();

    constructor({
                    id,
                    name,
                    description,
                    html,
                    css,
                    js,
                    js_click = "",
                    sql,
                    sql_click = {},
                    tags = [],
                    edited
                }: {
        id: string;
        name: string;
        description: string;
        html: string;
        css: string;
        js: string;
        js_click?: string;
        sql: Record<string, string>;
        sql_click?: Record<string, string>;
        tags?: string[];
        edited?: boolean;
    }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.html = html;
        this.css = css;
        this.js = js;
        this.js_click = js_click;
        this.sql = sql;
        this.sql_click = sql_click;
        this.edited = (edited as boolean) ?? false;

        // Auto-generate technology tags based on content
        const techTags: string[] = [];
        if (html?.trim()) techTags.push('html');
        if (css?.trim()) techTags.push('css');
        if (js?.trim()) techTags.push('js');
        if (js_click?.trim()) techTags.push('js');
        if (sql && Object.keys(sql).length > 0) techTags.push('sql');
        if (sql_click && Object.keys(sql_click).length > 0) techTags.push('sql');

        this.tags = [...new Set([...tags, ...techTags])];
    }

    public static fromJSON(data: any): Component {
        const component = new Component(data)
        component.variables = Component.parseVariables(data?.variables)
        return component
    }

    private static parseVariables(data: any): ComponentVariables {
        const variables = new ComponentVariables()
        variables.generalVariables = Component.parseVariableList(data?.generalVariables)
        variables.sqlVariables = Component.parseVariableList(data?.sqlVariables)
        variables.jsVariables = Component.parseVariableList(data?.jsVariables)
        return variables
    }

    private static parseVariableList(data: any): Variable[] {
        if (!Array.isArray(data)) {
            return []
        }

        return data.map(variable => new Variable(variable?.name ?? '', variable?.variable ?? ''))
    }

    public static arrayFromJSON(data: any[]): Component[] {
        return data.map(c => Component.fromJSON(c))
    }

    public toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            html: this.html,
            css: this.css,
            js: this.js,
            js_click: this.js_click,
            sql: this.sql,
            sql_click: this.sql_click,
            tags: this.tags,
            edited: this.edited,
            variables: this.variables
        }
    }

}
