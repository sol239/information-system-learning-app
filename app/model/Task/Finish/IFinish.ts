export type FinishEvaluationContext = {
    activityCompleted?: boolean;
}

export interface IFinish {
    description?: string;
    label?: string;
    isComplete: boolean;
    selectedOptionIds?: string[];
    evaluate(input?: unknown, context?: FinishEvaluationContext): boolean | Promise<boolean>;
}
