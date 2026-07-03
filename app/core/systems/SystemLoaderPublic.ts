import type { InformationSystem } from "~/model/InformationSystem";
import type { ISystemLoader } from "./ISystemLoader";
import type { Operation } from "~/utils/Operation/Operation";

export class SystemLoaderPublic implements ISystemLoader {
    loadSystem(systemId: string): Promise<Operation<InformationSystem | null>> {
        throw new Error("Method not implemented.");
    }
}