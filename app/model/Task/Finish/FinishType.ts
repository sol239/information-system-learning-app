/**
 * Defines the type of task completion.
 * It is basically what a user needs to do in the system, eg adding user, or anwering questions,
 * But the main point of this is that those asks are not able to be completed until the user has 
 * finished the activity -> eg. user could not answer how many children have one allergen until
 * they fixed SQL query that is responsible for fetching that data.
 */
/* eslint-disable no-unused-vars */
export enum FinishType {
    /**
     * Task is completed immediately after the activity is finished.
     */
    IMMEDIATE = 'immediate',

    /**
     * Task is completed after the database has been updated with the activity results.
     */
    AFTER_DATABASE_UPDATE = 'after-database-update',

    /**
     * Task is completed after the user has selected options related to the activity.
     */
    SELECT_OPTIONS = 'select-options',

    /**
     * Represents an activity where the user needs to type the correct answer.
     */
    TYPE_CORRECT = 'type-correct',

    /**
     * Task is completed when component variable constraints are satisfied.
     */
    VARIABLE_CONSTRAINT = 'variable-constraint'
}
