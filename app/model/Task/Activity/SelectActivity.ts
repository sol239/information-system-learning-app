/* eslint-disable no-unused-vars */
import type { IActivity } from "./IActivity";
import type { Component } from "../../Component";

export class SelectActivity implements IActivity {
    constructor(
        public description: string | undefined,
        public activityComponents: Component[],
        public label?: string,
    ) { }

    public isCompleted?: boolean = false;
    public substituteAfterActivity: boolean = false;

    /**
     * Checks if the input matches the activity components.
     * @param input - An array of component IDs to check against the activity components.
     */
    check(input: string[]): void {
        //console.log("CHECK - SELECT ACTIVITY")
        const allComponentsIds = this.activityComponents.map(component => component.id);
        this.isCompleted = input.length === allComponentsIds.length && input.every(id => allComponentsIds.includes(id));
        //console.log('[SelectActivity.check] correct IDs:', allComponentsIds, '| input:', input, this.isCompleted ? '🟢' : '🔴');
    }
}
