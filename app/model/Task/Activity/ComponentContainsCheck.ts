/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Component } from "~/model/Component";

export type ComponentContainsOperator = 'contains' | 'not-contains';

export type ComponentContainsConstraint = {
    id?: string;
    componentId: string;
    componentName?: string;
    operator: ComponentContainsOperator;
    text: string;
}

export type ComponentDomSnapshot = {
    componentId: string;
    html: string;
    text: string;
}

export function evaluateComponentContainsConstraints(
    constraints: ComponentContainsConstraint[],
    snapshots: ComponentDomSnapshot[] = []
): boolean {
    if (!constraints.length) {
        return false;
    }

    return constraints.every((constraint) => {
        const text = constraint.text.trim();
        if (!text) {
            return false;
        }

        const matchingSnapshots = snapshots.filter(item => String(item.componentId) === String(constraint.componentId));
        if (!matchingSnapshots.length) {
            return false;
        }

        const contains = matchingSnapshots.some((snapshot) => {
            const haystack = `${snapshot.html}\n${snapshot.text}`;
            return haystack.includes(text);
        });

        if (constraint.operator === 'not-contains') {
            return !contains;
        }

        return contains;
    });
}

export function componentMatchesDefault(component: Component, defaultComponent: Component): boolean {
    return ['html', 'css', 'js', 'js_click'].every((field) => {
        const current = String((component as any)[field] ?? '');
        const expected = String((defaultComponent as any)[field] ?? '');
        return current === '' && expected !== '' ? true : current === expected;
    }) && recordMatchesDefault(component.sql, defaultComponent.sql)
        && recordMatchesDefault(component.sql_click, defaultComponent.sql_click);
}

function recordMatchesDefault(
    currentRecord: Record<string, string> | undefined,
    expectedRecord: Record<string, string> | undefined
): boolean {
    const current = currentRecord ?? {};
    const expected = expectedRecord ?? {};
    const currentKeys = Object.keys(current);

    if (currentKeys.length === 0) {
        return true;
    }

    return currentKeys.every(key => String(current[key] ?? '') === String(expected[key] ?? ''));
}
