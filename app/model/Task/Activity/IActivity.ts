import type { Component } from "../../Component";

/* eslint-disable no-unused-vars, @typescript-eslint/no-explicit-any */
export interface IActivity {
    label?: string;
    description?: string;
    activityComponents: Component[];
    isCompleted?: boolean;
    substituteAfterActivity?: boolean;
    selectedOptionIds?: string[];
    check(input: any): void;
}
