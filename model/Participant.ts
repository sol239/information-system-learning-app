import type { TableEntity } from './TableEntity';

export class Participant implements TableEntity {
    constructor(
        public id: number,
        public name: string,
        public email: string,
        public personal_number: string,
        public phone: string,
        public address: string,
        public age: number,
        public sessionId: number[] = [],
        public allergens: any[] = []
    ) {}

    /**
     * Get all session IDs as an array
     */
    public getSessionIds(): number[] {
        return this.sessionId;
    }

    /**
     * Add a session ID to the participant
     */
    public addSessionId(sessionId: number): void {
        if (!this.sessionId.includes(sessionId)) {
            this.sessionId.push(sessionId);
        }
    }

    /**
     * Remove a session ID from the participant
     */
    public removeSessionId(sessionId: number): void {
        this.sessionId = this.sessionId.filter(id => id !== sessionId);
    }

    /**
     * Check if participant is enrolled in a specific session
     */
    public isInSession(sessionId: number): boolean {
        return this.sessionId.includes(sessionId);
    }
}