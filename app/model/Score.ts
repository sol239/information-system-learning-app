/* eslint-disable no-unused-vars */
export class Score {
    constructor(
        public mistakes: number[] = [],
        public score: number = 0,
    ) {
        if (Array.isArray(this.mistakes)) {
            this.mistakes = Array.from(this.mistakes, penalty => Number(penalty || 0))
        } else {
            const count = Number(this.mistakes ?? 0)
            this.mistakes = Number.isFinite(count) && count > 0 ? Array.from({ length: count }, () => 0) : []
        }
    }

    public get mistakesCount() {
        return this.mistakes.length
    }

    public get mistakesPenalty() {
        return this.mistakes.reduce((sum, penalty) => sum + Number(penalty || 0), 0)
    }

    public addMistake(penalty: number) {
        this.mistakes.push(Number(penalty || 0))
    }

    public increaseScore(points: number) {
        this.score += points
    }

    public decreaseScore(points: number) {
        this.score -= points
    }

    public reset() {
        this.mistakes = []
        this.score = 0
    }

}
