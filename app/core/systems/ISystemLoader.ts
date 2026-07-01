import type { InformationSystem } from "~/model/InformationSystem";
import type { Operation } from "~/utils/Operation/Operation";

export interface ISystemLoader {
    getSystem(systemId: string): Promise<Operation<InformationSystem | null>>;
}