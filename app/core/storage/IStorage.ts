/* eslint-disable no-unused-vars */
import type { InformationSystem } from "~/model/InformationSystem";
import type { Operation } from "~/utils/Operation/Operation";

/**
 * Interface for storage operations related to InformationSystem instances.
 */
export interface IStorage {
    /**
     * Saves (saves new or updates existing) an InformationSystem instance to the storage.
     * @param system - The InformationSystem instance to save
     */
    saveSystem(system: InformationSystem): Promise<Operation>;

    /**
     * Retrieves an InformationSystem instance from the storage by its ID.
     * @param systemId - The ID of the InformationSystem instance to retrieve
     */
    getSystem(systemId: string): Promise<Operation<InformationSystem | null>>;

    /**
     * Deletes an InformationSystem instance from the storage by its ID.
     * @param systemId - The ID of the InformationSystem instance to delete
     */
    deleteSystem(systemId: string): Promise<Operation>;

    /**
     * Retrieves a list of available InformationSystem IDs from the storage.
     */
    getAvailableSystemIds(): Promise<Operation<string[]>>;

    /**
     * Checks if an InformationSystem with the given ID is available in the storage.
     * @param systemId - The ID of the InformationSystem to check
     */
    isSystemAvailable(systemId: string): Promise<Operation<boolean>>;
}
