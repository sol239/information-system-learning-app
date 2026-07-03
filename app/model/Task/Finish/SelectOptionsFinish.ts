/* eslint-disable no-unused-vars */
import type { IFinish } from "./IFinish";
import type { Option } from "../Option";

export class SelectOptionsFinish implements IFinish {

    public isComplete: boolean = false;
    public selectedOptionIds: string[] = [];

    constructor(
        public description: string | undefined,
        public label?: string,
        public options: Option[] = []

    ) { }

    public evaluate(input: unknown = []): boolean {
        const selectedInput = Array.isArray(input) ? input : [];
        this.selectedOptionIds = selectedInput.map(id => String(id));
        const selectedOptionIds = new Set(selectedInput.map(id => String(id)));
        const correctOptionIds = this.options
            .map((option, index) => option.isCorrect ? String(option.id ?? index) : null)
            .filter((id): id is string => id !== null);

        this.isComplete = selectedInput.length === correctOptionIds.length
            && selectedOptionIds.size === correctOptionIds.length
            && correctOptionIds.every(id => selectedOptionIds.has(id));

        //console.log('[SelectOptionsFinish.evaluate] expected:', correctOptionIds, '| actual:', Array.from(selectedOptionIds), this.isComplete ? '🟢' : '🔴');

        return this.isComplete;
    }
}
