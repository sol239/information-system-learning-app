/* eslint-disable no-unused-vars */
import type { IFinish } from "./IFinish";

export class TypeCorrectFinish implements IFinish {

    public isComplete: boolean = false;

    constructor(
        public description: string | undefined,
        public correctAnswer: string,
        public label?: string,
    ) { }

    public evaluate(input: unknown = ""): boolean {
        this.isComplete = String(input).trim() === this.correctAnswer.trim();
        //console.log('[TypeCorrectFinish.evaluate] expected:', this.correctAnswer.trim(), '| actual:', String(input).trim(), this.isComplete ? '🟢' : '🔴');
        return this.isComplete;
    }
}
