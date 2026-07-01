import type { InformationSystem } from "~/model/InformationSystem";
import type { ISystemLoader } from "./ISystemLoader";

export class SystemLoaderPublic implements ISystemLoader {

    async getSystem(systemName: string): Promise<InformationSystem> {
       
    }

}