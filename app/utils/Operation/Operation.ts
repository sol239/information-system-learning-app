import { v4 as uuidv4 } from "uuid";
import type { GUID } from "~/model/GUID";

/**
 * Defines the Operation class, which encapsulates the result of an operation, including its status, message, and datetime. 
 */
export class Operation<T> {
    /**
     * A unique identifier for the operation, which can be used to track or reference the specific operation that was performed.
     */
    public id: GUID;

    /**
     * The result of the operation, represented as an OperationResultType enum value.
     */
    public result: OperationResultType;

    /**
     * A message providing additional information about the performed operation.
     */
    public message: string;

    /**
     * The datetime when the operation was performed.
     */
    public datetime: Date;

    /**
     * The data associated with the operation, which can be of any type T.
     */
    public data: T | null;

    constructor(
        result: OperationResultType,
        message: string,
        data: T | null = null,
        datetime?: Date,
        id: GUID = uuidv4() as GUID
    ) {
        this.id = id;
        this.result = result;
        this.message = message;
        this.data = data;
        this.datetime = datetime ?? new Date();
        
        // ISO standardization:
        if (this.datetime) {
            this.datetime = new Date(this.datetime.toISOString());
        } else {
            this.datetime = new Date(new Date().toISOString());
        }
    }

    /**
     * Returns a string representation of the operation, including its datetime, result, message, and whether the data is null.
     * It can be used for logging or debugging purposes to quickly understand the outcome of the operation.
     * @returns A string summarizing the operation's details.
     */
    public toString(): string {
        return `${this.datetime.toISOString()} | ${this.result} | ${this.message} | Data is null: ${this.data === null}`;
    }
}