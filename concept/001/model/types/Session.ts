import type { Participant } from "./Participant";

/**
 * Represents a session in the system. (e.g. a camp session)
 */
export class Session {
    constructor(
        /**
         * Unique identifier for the session.
         */
        public id: number,
        
        /**
         * From date of the session.
         */
        public fromDate: Date = new Date(),
        
        /**
         * To date of the session.
         */
        public toDate: Date = new Date(),
        
        /**
         * Capacity of the session, i.e. how many participants can join.
         */
        public capacity: number,

        /**
         * Participants in the session.
         */
        public participants: Participant[] = [],
    ) {}

    public ifFull(): boolean {
        return this.participants.length >= this.capacity;
    }


}