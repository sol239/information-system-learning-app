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
        public sessions: number[] = [],
        public allergens: any[] = []
    ) {}

    /**
     * Get all session IDs as an array
     */
    public getSessionIds(): number[] {
        return this.sessions;
    }

    /**
     * Add a session ID to the participant
     */
    public addSessionId(sessionId: number): void {
        if (!this.sessions.includes(sessionId)) {
            this.sessions.push(sessionId);
        }
    }

    /**
     * Remove a session ID from the participant
     */
    public removeSessionId(sessionId: number): void {
        this.sessions = this.sessions.filter(id => id !== sessionId);
    }

    /**
     * Check if participant is enrolled in a specific session
     */
    public isInSession(sessionId: number): boolean {
        return this.sessions.includes(sessionId);
    }
}