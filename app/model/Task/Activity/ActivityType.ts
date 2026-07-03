/**
 * Defines the types of activities that can be performed in a task.
 */
/* eslint-disable no-unused-vars */
export enum ActivityType {
    /**
     * Represents an activity where the user needs to repair a component or system. 
     * This could involve fixing a broken part, restoring functionality, or resolving an issue.
     */
    REPAIR = 'repair',

    /**
     * Represents an activity where the user needs to select a component or components which are faulty.
     */
    SELECT = 'select',

    /**
     * Represents an activity where the user needs to select options related to a component or system.
     */
    SELECT_OPTIONS = 'select-options',
}
