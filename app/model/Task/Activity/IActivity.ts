import type { Component } from "../../Component";

export interface IActivity {
    label?: string;
    description?: string;
    activityComponents: Component[];
    isCompleted?: boolean;
    substituteAfterActivity?: boolean;
    selectedOptionIds?: string[];
    check(input: any): void;
}
