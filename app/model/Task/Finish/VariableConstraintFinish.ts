import type { Component } from "~/model/Component";
import type { Variable } from "~/model/ComponentVariables";
import type { VariableType } from "~/model/types/VariableType";
/* eslint-disable no-unused-vars */
import type { IFinish } from "./IFinish";

export type VariableConstraintOperator = '<' | '>' | '>=' | '<=' | '==';
export type VariableConstraintScope = 'general' | 'sql' | 'js' | 'system';

export type VariableConstraint = {
    id?: string;
    componentId?: string;
    componentName?: string;
    variableName: string;
    variableScope?: VariableConstraintScope;
    operator: VariableConstraintOperator;
    value: string | number;
}

export type VariableConstraintEvaluationInput = {
    components?: Component[];
    systemInputVariables?: Variable[];
}

export class VariableConstraintFinish implements IFinish {

    public isComplete: boolean = false;

    constructor(
        public description: string | undefined,
        public label?: string,
        public constraints: VariableConstraint[] = []
    ) { }

    public evaluate(input?: unknown): boolean {
        const evaluationInput = input as VariableConstraintEvaluationInput | undefined;

        if (!this.constraints.length) {
            //console.log('[VariableConstraintFinish.evaluate] no constraints 🔴');
            this.isComplete = false;
            return this.isComplete;
        }

        this.isComplete = this.constraints.every(constraint => {
            const variable = findVariableValue(constraint, evaluationInput);
            //console.log(`[VariableConstraintFinish.evaluate] checking constraint: ${constraint.variableName} ${constraint.operator} ${constraint.value} | actual variable value:`, variable);
            if (typeof variable === 'undefined') {
                return false;
            }

            if (Array.isArray(variable)) {
                const someMatch = variable.some(value => {
                    const match = compareValues(value, constraint.value, constraint.operator);
                    //if (match) console.log(`[VariableConstraintFinish.evaluate] matched array value:`, value, '🟢');
                    return match;
                });
                //if (!someMatch) console.log(`[VariableConstraintFinish.evaluate] no match in array:`, variable, '🔴');
                return someMatch;
            }

            const match = compareValues(variable, constraint.value, constraint.operator);
            //console.log(`[VariableConstraintFinish.evaluate] match single value:`, variable, match ? '🟢' : '🔴');
            return match;
        });

        //console.log('[VariableConstraintFinish.evaluate] all constraints met:', this.isComplete, this.isComplete ? '🟢' : '🔴');
        return this.isComplete;
    }
}

function findVariableValue(
    constraint: VariableConstraint,
    input: VariableConstraintEvaluationInput | undefined
): VariableType | VariableType[] | undefined {
    if (constraint.variableScope === 'system') {
        return input?.systemInputVariables?.find(variable => variable.name === constraint.variableName)?.variable;
    }

    const components = input?.components ?? [];
    const candidateComponents = constraint.componentId
        ? components.filter(component => String(component.id) === String(constraint.componentId))
        : components;

    for (const component of candidateComponents) {
        const value = findComponentVariable(component, constraint);
        if (typeof value !== 'undefined') {
            return value;
        }
    }

    return undefined;
}

function findComponentVariable(component: Component, constraint: VariableConstraint): VariableType | VariableType[] | undefined {
    const variables = component.variables;
    const groups: Array<{ scope: VariableConstraintScope; items: Variable[] }> = [
        { scope: 'general', items: variables?.generalVariables ?? [] },
        { scope: 'sql', items: variables?.sqlVariables ?? [] },
        { scope: 'js', items: variables?.jsVariables ?? [] },
    ];

    for (const group of groups) {
        if (constraint.variableScope && constraint.variableScope !== group.scope) {
            continue;
        }

        const variable = group.items.find(item => item.name === constraint.variableName);
        if (variable) {
            return variable.variable;
        }
    }

    return undefined;
}

function compareValues(actual: VariableType, expected: string | number, operator: VariableConstraintOperator): boolean {
    if (operator === '==') {
        const actualNumber = toNumber(actual);
        const expectedNumber = toNumber(expected);

        if (actualNumber !== null && expectedNumber !== null) {
            return actualNumber === expectedNumber;
        }

        return String(actual).trim() === String(expected).trim();
    }

    const actualNumber = toNumber(actual);
    const expectedNumber = toNumber(expected);

    if (actualNumber === null || expectedNumber === null) {
        return false;
    }

    switch (operator) {
        case '<':
            return actualNumber < expectedNumber;
        case '>':
            return actualNumber > expectedNumber;
        case '>=':
            return actualNumber >= expectedNumber;
        case '<=':
            return actualNumber <= expectedNumber;
        default:
            return false;
    }
}

function toNumber(value: VariableType | string | number): number | null {
    if (value instanceof Date) {
        return value.getTime();
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}
