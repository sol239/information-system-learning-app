import type { IActivity } from "./IActivity";
import type { Component } from "../../Component";
import type { Option } from "../Option";

export class SelectOptionsActivity implements IActivity {
    constructor(
        public description: string | undefined,
        public activityComponents: Component[],
        public label?: string,
        public options: Option[] = []
    ) { }

    public isCompleted?: boolean = false;
    public substituteAfterActivity: boolean = false;

    /**
     * Checks if the input option IDs match the correct options of the activity.
     * @param input - An array of option IDs to check against the correct options of the activity.
     */
    check(input: string[]): void {
        const correctOptionIds = this.options.filter(option => option.isCorrect).map(option => option.id);
        this.isCompleted = input.length === correctOptionIds.length && input.every(id => correctOptionIds.includes(id));
        //console.log('[SelectOptionsActivity.check] correct IDs:', correctOptionIds, '| input:', input, this.isCompleted ? '🟢' : '🔴');
    }
}
