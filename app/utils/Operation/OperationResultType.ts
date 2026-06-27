/** Represents the status of an operation */
export enum OperationResultType {
    /**
     * Indicates that the operation completed successfully without any issues.
     */
    SUCCESS = 'success',

    /**
     * Indicates that the operation caused exceptions or errors that prevented it from completing successfully.
     */
    ERROR = 'error',

    /**
     * Indicates that the operation completed but with warnings. This means that while the operation was successful, there were some issues or potential problems that should be noted.
     */
    WARNING = 'warning',

    /**
     * Indicates that the operation failed to complete successfully. But no exceptions were thrown, and the failure was handled gracefully.
     */
    FAILED = 'failed',
}