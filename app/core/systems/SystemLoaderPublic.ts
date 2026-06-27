import type { InformationSystem } from "./InformationSystem";
import type { ISystemLoader } from "./ISystemLoader";

export class SystemLoaderPublic implements ISystemLoader {
    public static readonly SYSTEMS_DIR_PATH = '/systems';
    public static readonly SYSTEMS_LIST_PATH = '/systems/systems.json';

    async getSystemsList(): Promise<string[]> {
        const response = await fetch(SystemLoaderPublic.SYSTEMS_LIST_PATH);

        if (!response.ok) {
            throw new Error('Failed to fetch the list of systems.');
        }

        const data = await response.json();
        return data.systems;
    }
    async getSystem(systemName: string): Promise<InformationSystem> {
       
    }

}