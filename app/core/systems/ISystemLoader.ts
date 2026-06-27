import type { InformationSystem } from "./InformationSystem";

export interface ISystemLoader {
    getSystemsList(): Promise<string[]>;
    getSystem(systemName: string): Promise<InformationSystem>;
}