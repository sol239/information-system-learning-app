/* eslint-disable no-unused-vars */
import type { FinishEvaluationContext, IFinish } from "./IFinish";

export class ImmediateFinish implements IFinish {

    public isComplete: boolean = false;
    
    constructor(
            public description: string | undefined,
            public label?: string,
        ) { }
    
    public evaluate(_input?: unknown, context?: FinishEvaluationContext): boolean {
        this.isComplete = Boolean(context?.activityCompleted);
        //console.log('[ImmediateFinish.evaluate] context.activityCompleted:', Boolean(context?.activityCompleted), this.isComplete ? '🟢' : '🔴');
        return this.isComplete;
    }
}
