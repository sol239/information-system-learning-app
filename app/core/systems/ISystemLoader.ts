import type { InformationSystem } from "./InformationSystem";

export interface ISystemLoader {
    getSystem(systemName: string): Promise<InformationSystem>;
}