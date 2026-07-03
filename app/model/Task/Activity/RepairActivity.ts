/* eslint-disable no-unused-vars, @typescript-eslint/no-explicit-any */
import type { IActivity } from "./IActivity";
import type { Component } from "../../Component";
import { componentMatchesDefault, evaluateComponentContainsConstraints, type ComponentContainsConstraint, type ComponentDomSnapshot } from "./ComponentContainsCheck";

export class RepairActivity implements IActivity {
    public isCompleted?: boolean
    public substituteAfterActivity: boolean = false

    constructor(
        public description: string | undefined,
        public activityComponents: Component[],
        public label?: string,
        public checkRepair: boolean = false,
        public repairChecks: ComponentContainsConstraint[] = [],
    ) { }  

    check(input: any): void {
        const components = Array.isArray(input?.components) ? input.components as Component[] : []
        const defaultComponents = Array.isArray(input?.defaultComponents) ? input.defaultComponents as Component[] : []
        const domSnapshots = Array.isArray(input?.domSnapshots) ? input.domSnapshots as ComponentDomSnapshot[] : []

        console.log('[RepairActivity.check] checking repaired components', {
            componentIds: components.map(component => component.id),
            defaultComponentIds: defaultComponents.map(component => component.id),
            domSnapshotIds: domSnapshots.map(snapshot => snapshot.componentId),
            checkRepair: this.checkRepair,
            repairChecks: this.repairChecks,
            componentsRepairedFallback: Boolean(input?.componentsRepaired),
        });

        if (this.checkRepair && this.repairChecks.length) {
            this.isCompleted = evaluateComponentContainsConstraints(this.repairChecks, domSnapshots)
            console.log('[RepairActivity.check] repair constraints evaluated from rendered HTML only', {
                isCompleted: this.isCompleted,
                repairChecks: this.repairChecks,
                domSnapshots,
                skippedDefaultComponentComparison: true,
            });
            return
        }

        if (!components.length) {
            this.isCompleted = Boolean(input?.componentsRepaired)
            console.log('[RepairActivity.check] no components to check, using fallback result', {
                isCompleted: this.isCompleted,
            });
            return
        }

        const repaired = components.every(component => {
            const defaultComponent = defaultComponents.find(item => String(item.id) === String(component.id))
            const matches = defaultComponent ? componentMatchesDefault(component, defaultComponent) : false;
            console.log('[RepairActivity.check] component comparison result', {
                componentId: component.id,
                componentName: component.name,
                hasDefaultComponent: Boolean(defaultComponent),
                matchesDefault: matches,
                mismatches: defaultComponent && !matches
                    ? getComponentMismatches(component, defaultComponent)
                    : [],
            });
            return matches;
        })

        console.log('[RepairActivity.check] all components match defaults', {
            repaired,
        });

        if (!repaired) {
            this.isCompleted = false
            console.log('[RepairActivity.check] final result', {
                isCompleted: this.isCompleted,
                reason: 'At least one component does not match its default component.',
            });
            return
        }

        this.isCompleted = repaired
        console.log('[RepairActivity.check] final result', {
            isCompleted: this.isCompleted,
        });
    }
}

function getComponentMismatches(component: Component, defaultComponent: Component) {
    const mismatches: Array<{ field: string; key?: string; actual: string; expected: string }> = []

    for (const field of ['html', 'css', 'js', 'js_click']) {
        const actual = String((component as any)[field] ?? '')
        const expected = String((defaultComponent as any)[field] ?? '')

        if (!(actual === '' && expected !== '') && actual !== expected) {
            mismatches.push({ field, actual, expected })
        }
    }

    addRecordMismatches(mismatches, 'sql', component.sql, defaultComponent.sql)
    addRecordMismatches(mismatches, 'sql_click', component.sql_click, defaultComponent.sql_click)

    return mismatches
}

function addRecordMismatches(
    mismatches: Array<{ field: string; key?: string; actual: string; expected: string }>,
    field: string,
    actualRecord: Record<string, string> | undefined,
    expectedRecord: Record<string, string> | undefined
) {
    const actual = actualRecord ?? {}
    const expected = expectedRecord ?? {}
    const keys = new Set([...Object.keys(actual), ...Object.keys(expected)])

    for (const key of keys) {
        const actualValue = String(actual[key] ?? '')
        const expectedValue = String(expected[key] ?? '')

        if (actualValue !== expectedValue) {
            mismatches.push({
                field,
                key,
                actual: actualValue,
                expected: expectedValue,
            })
        }
    }
}
